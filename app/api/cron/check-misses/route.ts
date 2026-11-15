import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Vercel Cron Endpoint: executes periodically to detect missed doses
export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        message: 'Supabase credentials not configured. Cron ran in mock simulation mode.',
        checked_at: new Date().toISOString(),
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch overdue scheduled doses
    const now = new Date().toISOString();
    const { data: overdueDoses } = await supabase
      .from('dose_logs')
      .select('*, medications(*), patient_profiles(*)')
      .eq('status', 'SCHEDULED')
      .lt('scheduled_at', now);

    const alertsCreated: any[] = [];

    if (overdueDoses && overdueDoses.length > 0) {
      for (const dose of overdueDoses) {
        const med = dose.medications;
        const patient = dose.patient_profiles;

        // Skip if travel mode is active
        if (patient?.travel_mode_active) continue;

        // Increment consecutive misses
        const nextMissCount = (med?.consecutive_misses || 0) + 1;

        await supabase
          .from('dose_logs')
          .update({ status: 'MISSED' })
          .eq('id', dose.id);

        await supabase
          .from('medications')
          .update({ consecutive_misses: nextMissCount })
          .eq('id', med.id);

        // Check emergency threshold
        if (nextMissCount >= (patient?.emergency_threshold || 2)) {
          const alertMsg = `CODE-RED: ${patient.name} has missed ${nextMissCount} doses of ${med.name}!`;

          // Deduplicate alert insertion
          const { data: existingAlert } = await supabase
            .from('emergency_alerts')
            .select('id')
            .eq('patient_id', patient.id)
            .eq('medication_id', med.id)
            .is('resolved_at', null)
            .maybeSingle();

          if (!existingAlert) {
            const { data: newAlert } = await supabase
              .from('emergency_alerts')
              .insert({
                patient_id: patient.id,
                medication_id: med.id,
                consecutive_misses: nextMissCount,
                alert_message: alertMsg,
              })
              .select()
              .single();

            alertsCreated.push(newAlert);

            // Log Code-Red in immutable audit ledger
            await supabase
              .from('central_audit_logs')
              .insert({
                patient_id: patient.id,
                actor_name: 'Vercel Cron Escalation Engine',
                actor_role: 'SYSTEM',
                action_type: 'EMERGENCY_CODE_RED',
                description: alertMsg,
                previous_value: { consecutive_misses: med.consecutive_misses },
                new_value: { consecutive_misses: nextMissCount },
              });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      overdue_doses_processed: overdueDoses?.length || 0,
      emergency_alerts_dispatched: alertsCreated.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Cron execution failed' },
      { status: 500 }
    );
  }
}
