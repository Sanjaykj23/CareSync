import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, slotNumber, eventType, pillTaken } = body;

    if (!slotNumber) {
      return NextResponse.json({ error: 'Missing slotNumber' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // 1. Fetch medication associated with this slot
      const { data: med } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', patientId || 'a1111111-1111-1111-1111-111111111111')
        .eq('iot_slot_number', slotNumber)
        .single();

      if (med && pillTaken) {
        // 2. Mark today's dose as SENSOR_VERIFIED
        await supabase
          .from('dose_logs')
          .update({
            status: 'SENSOR_VERIFIED',
            verification_method: 'IOT_BOX',
            verified_at: new Date().toISOString(),
          })
          .eq('medication_id', med.id)
          .eq('status', 'SCHEDULED');

        // 3. Reset consecutive misses & decrement pill count
        await supabase
          .from('medications')
          .update({
            consecutive_misses: 0,
            remaining_pills: Math.max(0, med.remaining_pills - 1),
          })
          .eq('id', med.id);

        // 4. Log to immutable central audit ledger
        await supabase
          .from('central_audit_logs')
          .insert({
            patient_id: patientId || 'a1111111-1111-1111-1111-111111111111',
            actor_name: `IoT Pillbox (ESP32 Slot ${slotNumber})`,
            actor_role: 'IOT_DEVICE',
            action_type: 'SENSOR_DOSE_DISPENSED',
            description: `Compartment ${slotNumber} (${med.name}) opened and pill verified. Status marked SENSOR_VERIFIED.`,
            previous_value: { status: 'SCHEDULED' },
            new_value: { status: 'SENSOR_VERIFIED' },
          });
      }
    }

    return NextResponse.json({
      success: true,
      received: { slotNumber, eventType, pillTaken },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
