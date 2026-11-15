# CareSync (Noon) — Smart Elderly Care & Medication Management Platform

> Built for the **Makers Need More (MnM)** Hackathon — Round 2 Evaluation.

CareSync is a smart, interconnected healthcare management platform designed to help elderly individuals manage their daily medications, doctor appointments, and healthcare routines with complete dignity and accessibility, while keeping family members, caretakers, and clinicians proactively synchronized.

---

## 🌟 Hackathon Round 2 Evaluation Highlights

| Criteria | Weight | Implementation in CareSync |
| :--- | :---: | :--- |
| **Implementation** | **20%** | Full-stack Next.js 14 App Router, Supabase PostgreSQL, strict PostgreSQL triggers for append-only audit trail, Vercel serverless REST webhooks. |
| **Problem-Solution Alignment** | **20%** | Solves elderly loneliness and cognitive strain with giant vocal PIN pads, 1-click tactile action cards, and dot-matrix LED timers, while solving family anxiety with automated Code-Red escalations. |
| **Functionality** | **20%** | 4-role authenticated portals, interactive 4-slot ESP32 IoT pillbox simulator, ABDM sandbox Health ID integration, appointment scheduling, and receipt tracking. |
| **UI/UX Design** | **15%** | Faithful recreation of the **Noon** healthcare design language: high-contrast tactile cards, digital dot-matrix displays (`13:00`, `72 bpm`, `92%`), 5-second SOS ambulance countdown, and Web Speech API vocal feedback. |
| **Deployment & Completeness** | **10%** | Monorepo structure, 100% serverless Vercel-ready with no Docker required. Local mock fallbacks allow judges to test without configuring API keys. |
| **GitHub Repository** | **5%** | Clean monorepo structure: frontend, backend API routes, `/supabase/migrations/001_init.sql`, and `/iot-firmware/esp32_pillbox.ino`. |
| **LinkedIn Evaluation** | **10%** | Complete narrative on Ayushman Bharat Digital Mission (ABDM), India DPDP Act compliance, and tagging **Makers Need More (MnM)**. |

---

## 🔑 Judge Quick Demo Credentials

CareSync includes an instant **1-Click Role Switcher** at the top of the screen so hackathon judges can effortlessly test all 4 roles:

| Role | Persona | Passcode / PIN | Key Capabilities & Security Scope |
| :--- | :--- | :--- | :--- |
| 👴 **Elder** | Sundaram Iyer | **`1234`** (Giant 4-Digit PIN) | Vocal Web Speech feedback, 1-Click *"I took it"* tactile confirmation, Snooze, pulsating 5-second SOS Emergency screen. |
| 👨‍👩‍👧 **Child (Admin)** | Karthik Sundaram | **`654321`** (6-Digit Passcode) | Full admin access: ABDM ABHA Sync, Travel/Pocket Mode with auto-expiry, appointment booking, medical bill receipts. |
| 🧑‍⚕️ **Caretaker** | Ramesh Kumar | **`987654`** (Time-Bound PIN) | Valid until 18:00 today. Restricted strictly to today's medication routine & live photo 2FA upload. Financial bills and doctor Rx editing are strictly locked. |
| 🩺 **Doctor** | Dr. Priya Nair | **`DOC-4481`** (Clinical Token) | Adherence telemetry, consecutive-miss threshold adjustment (triggers Code-Red), prescription orders. |

---

## 🗄️ Database Architecture & Append-Only Audit Trigger

The database schema (`/supabase/migrations/001_init.sql`) defines:
- `patient_profiles` (ABHA ID, emergency thresholds, travel mode with auto-expiry `travel_mode_until`).
- `care_role_access` (Multi-role passcode hashes & time-bound shift expirations).
- `medications` (Mapped to 4 physical IoT slots, meal instructions, pill counts).
- `dose_logs` (Direct `patient_id` & `caretaker_id` foreign keys, verification methods: `IOT_BOX`, `PHOTO_2FA`, `MANUAL`).
- `appointments` (Specialties, confirmed statuses, doctor instructions).
- `medical_bills` (Healthcare receipts categorized by pharmacy, lab tests, consultation).
- `emergency_alerts` (Deduplicated alert dispatch tracker).
- `central_audit_logs` (**Append-only tamper-evident ledger** protected by PostgreSQL trigger `trg_immutable_audit_logs` that blocks any `UPDATE` or `DELETE` attempt).

---

## 💊 IoT Smart Pillbox & REST Webhook

- Interactive 4-slot hardware pillbox visualizer directly on screen.
- Ready-to-flash Arduino/ESP32 firmware in `/iot-firmware/esp32_pillbox.ino`.
- Communicates with `/api/iot/telemetry` via Vercel-compatible REST POST webhooks.
- Subscribes to real-time events via Supabase PostgreSQL CDC.

---

## 🚀 Local Development & Deployment

### Quick Start:
```bash
# Clone the repository
git clone https://github.com/your-username/caresync.git
cd caresync

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🏷️ Credits & Tags
Developed for the **Makers Need More (MnM)** Healthcare Hackathon Round 2.
Tag: `#MakersNeedMore #MnM #CareSync #ElderlyCare #ABDM #DigitalHealth`
