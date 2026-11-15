# Contributing to CareSync (Noon)

Thank you for your interest in contributing to **CareSync**! We welcome open-source contributions from developers, healthcare researchers, accessibility advocates, and hardware engineers.

---

## 🌟 Code of Conduct

CareSync is dedicated to providing an inclusive, harassment-free environment for everyone. Please be respectful, constructive, and empathetic in all interactions across issues, pull requests, and discussions.

---

## 🛠️ Development Setup

### Prerequisites
* **Node.js**: v20 or v22 (LTS recommended)
* **Package Manager**: `npm` or `pnpm`
* **Git**: v2.30+
* **Supabase CLI** (optional for local PostgreSQL) or a free cloud [Supabase Project](https://supabase.com)

### 1. Fork & Clone
```bash
git clone https://github.com/<your-username>/CareSync.git
cd CareSync
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Configure your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

ABDM_CLIENT_ID=
ABDM_CLIENT_SECRET=
ABDM_GATEWAY_URL=https://dev.abdm.gov.in/gateway/v0.5

IOT_DEVICE_API_KEY=CARESYNC_IOT_KEY_99882
```

### 4. Initialize Database Schema
Run `supabase/schema_complete.sql` in your Supabase SQL Editor. This will set up:
* Core tables (`patient_profiles`, `care_role_access`, `care_linking_requests`, `medications`, `dose_logs`, `central_audit_logs`, etc.)
* Enums and triggers (including the append-only audit log immutability trigger `trg_immutable_audit_logs`).

### 5. Run the Local Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🌿 Git Branching & Commit Conventions

### Branch Naming Strategy
* `feat/<feature-name>`: New feature or capability
* `fix/<bug-description>`: Bug fix
* `docs/<doc-update>`: Documentation improvement
* `refactor/<cleanup>`: Code restructuring without behavior change
* `iot/<hardware-module>`: Firmware or IoT simulator enhancements

### Commit Messages
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
* `feat: add WhatsApp webhook dispatch for code-red alerts`
* `fix: prevent duplicate URI encoding on session cookies`
* `docs: update ABDM M1-M3 architectural sequence diagram`

---

## 🧪 Testing & Verification

Before submitting a Pull Request, verify that your changes pass linting and production build:
```bash
npm run lint
npm run build
```

---

## 📥 Submitting Pull Requests

1. Create your branch from `main`.
2. Ensure your changes are focused and documented.
3. Open a Pull Request against `main`.
4. Fill out the PR description template:
   * **What problem does this PR solve?**
   * **Which role(s) does this affect?** (`ELDER`, `CHILD`, `CARETAKER`, `DOCTOR`)
   * **Did you test database persistence & cookie rehydration?**
   * **Screenshots / GIF walkthrough** (if UI changes are made).

---

## 💡 Areas for Contribution
* **Multilingual Localization**: Adding Hindi (`hi`), Tamil (`ta`), Telugu (`te`), and Kannada (`kn`) audio prompts and translations.
* **BLE Smart Dispenser Sync**: Direct Bluetooth Low Energy communication between smartphone and ESP32 pillbox.
* **FHIR / ABDM Milestone M3**: Deep automated health information provider (HIP) bundle dispatching.
* **AI Medication OCR**: Enhancing handwriting recognition for prescription notes and pharmacy bills.
