# Vitalis

> Scan with your camera. Understand your vitals in plain language, then turn the advice into reminders.

Vitalis is a web app that reads a person's pulse and breathing from a camera using the [Presage SmartSpectra SDK](https://smartspectra.presagetech.com/). Presage's language model explains the readings in everyday words, and each simple habit it suggests can be linked to a reminder. It gives **general wellness information**. It is not a medical device and it does not diagnose or recommend treatment.

*"Vitalis" is a working name.* Built for the [Presage SmartSpectra SDK Challenge](https://dev.to/challenges/presage-2026-11-04) on DEV.

See [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) for the plan and decisions, and [`docs/CONSENT_AND_DATA_HANDLING.md`](docs/CONSENT_AND_DATA_HANDLING.md) for exactly what data is handled.

## How it works

There is **no Vitalis backend, no database and no sign-in**. Each person uses their own free Presage account, and everything Vitalis remembers is stored in their own browser, on their own device.

```
Browser (React)                       Scan service (Node)             Presage
───────────────                       ───────────────────             ───────
1. Account page: paste your
   Presage API key (kept in
   this browser only)
2. Consent, then camera
3. Pictures + key (at start) ───────► 4. Runs the SDK with that key ─► measures vitals
                                      5. Sends readings back
6. Shows readings            ◄───────
                                      7. Asks for an insight       ─► Presage's LLM
8. Shows the explanation     ◄───────    (numbers only, no video)  ◄─
9. Each habit gets a "Remind me"
   control; reminders, key, profile
   and latest explanation stay on
   this device
```

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | React 19, Vite. State lives in `localStorage` |
| Scan service | Node.js, `@smartspectra/node-sdk`, WebSocket (`/scan-ws`), protobufjs to decode Presage's insight |
| Explanation | Presage LLM insight |
| Reminders | In-app alerts while a tab is open, plus a downloadable calendar file (`.ics`) for real alarms |

## Project structure

```
vitalis/
├── README.md
├── .env.example
├── docs/
├── frontend/
│   ├── src/
│   │   ├── account/apiKey.js        save, check and clear the Presage key
│   │   ├── profile/                 form helpers, fields, storage.js (profile on this device)
│   │   ├── insight/                 parse.js (text to safe blocks and habits), explanation.js (latest, saved)
│   │   ├── reminders/               model.js (rules), ics.js (calendar file), store.js, useAlerts.js
│   │   ├── scan/useScan.js          camera, key, streaming, insight messages
│   │   ├── lib/store.js             guarded localStorage with an in-memory fallback
│   │   ├── components/              page sections, InsightView, ReminderEditor, ReminderAlerts
│   │   ├── pages/                   Home, Account, Scan, Reminders, Profile, NotFound
│   │   └── content.js               all copy
│   └── test/                        node --test unit tests
└── sdk-service/                     Node service that runs the SDK (src/, test/)
```

## Setup: from clone to your first scan

### What you need

| Item | Details |
| --- | --- |
| Node.js | Version 20.12 or newer (`node --version`). Get it from <https://nodejs.org/> |
| Git | To clone the repository |
| Operating system | Linux needs glibc 2.35 or newer (Ubuntu 22.04+). macOS and Windows work with the SDK's bundled runtimes |
| Browser | A current Chrome, Edge, Firefox or Safari, with a front-facing camera |
| Presage account | Free, created in step 4 |
| Disk and network | The SDK install is large (several hundred MB), so allow time and space |

### 1. Clone the repository

```bash
git clone <your-repository-url> vitalis
cd vitalis
```

### 2. Create your settings file

```bash
cp .env.example .env
```

The defaults work for local use, so you do not need to edit anything. There is no key to put in `.env`: each person adds their own Presage key in the app (step 6). Restart the services after any change to `.env`.

### 3. Install and start the two services

Open **two terminal windows** in the project folder.

**Terminal 1: the scan service** (runs the Presage SDK)

```bash
cd sdk-service
npm install
npm start
```

Wait for `Scan service listening on http://127.0.0.1:8787`. Check it from another terminal with `curl http://localhost:8787/health`, which should answer `{"status":"ok","busy":false}`.

**Terminal 2: the website**

```bash
cd frontend
npm install
npm run dev
```

Open the address Vite prints, normally <http://localhost:5173>. Use `localhost`, not your computer's network address: browsers only allow camera access on `localhost` or on HTTPS pages. The site reaches the scan service through the built-in `/scan-ws` proxy, so nothing else needs configuring.

### 4. Get a Presage account and API key

1. Open <https://physiology.presagetech.com/auth/register> and create a free account. (The Account page in Vitalis has the same links.)
2. Sign in at <https://physiology.presagetech.com/auth/login>.
3. Find your API key in your account and copy the whole key.

### 5. Open the Account page and save your key

1. In Vitalis, choose **Account** in the top bar.
2. Paste the key into **Presage API key** and choose **Save key**. You should see "A key is saved on this device, ending in ...".

The key is stored in this browser only. It is sent to the scan service when a scan starts and is not saved on any server.

### 6. (Optional) Add a profile

Open **Profile**, fill in what you are comfortable sharing and save. It is stored on this device only. The health conditions question is required to save, and you can type `None`.

### 7. Run your first scan

1. Choose **Start a scan**.
2. Read the list under "Before the camera turns on", tick the agreement box, then choose **Allow camera and start scan**.
3. Choose **Allow** when the browser asks to use the camera.
4. Sit still, face a light, keep your face in view and stay relaxed. Pulse and breathing numbers appear and change from "Still settling" to "Steady".
5. The scan stops by itself when both are steady, after the time limit (60 seconds by default), or when you choose **Stop scan**. For a good explanation, let it run for about a minute (shorter than 15 seconds skips the explanation).
6. Wait a few seconds. The page shows **What your readings may mean** and the explanation, followed by **Everyday habits that may help**.
7. Choose **Remind me** under a habit, pick a time, and save. Manage reminders on the **Reminders** page.

Your terminal for the scan service also prints the readings and the explanation (a development printout).

### If something goes wrong

| What you see | What to do |
| --- | --- |
| "Add your Presage key first" | Save your key on the Account page |
| "Presage did not accept your API key" | Copy the key again from your Presage account and replace it on the Account page |
| "Your Presage account has no credit left" | Check your plan or credit with Presage |
| "We could not reach the measuring service" | Check that Terminal 1 is running and that `curl http://localhost:8787/health` works. Restart `npm run dev` if you changed `.env` |
| "The measuring service is busy" | Another scan is running. Wait a minute and try again (one scan at a time) |
| The camera is blocked or not found | Allow the camera for the site in your browser settings, close other apps that use it, and use `localhost` |
| The scan runs but no explanation appears | The scan was probably under 15 seconds, or Presage did not answer in time. Scan again for about a minute |
| `npm install` fails in `sdk-service` | Check `node --version` is 20.12 or newer and, on Linux, that glibc is 2.35 or newer (`ldd --version`) |
| The page works on your computer but not on your phone | Phones reach the site over your network address, which browsers treat as insecure and block the camera. Serve both over HTTPS (see Production) |

To check everything is installed correctly before a scan, run the tests: `cd sdk-service && npm test` and `cd frontend && npm test`. They need no key or network.

### Using it

1. **Account**: save your Presage key. It stays in this browser. "Delete everything" removes the key, profile, reminders and latest explanation.
2. **Profile** (optional): saved on this device only. The health conditions question is required when you save, as before.
3. **Scan**: agree, allow the camera, sit still. The scan stops by itself when pulse and breathing are steady, at `SCAN_MAX_SECONDS`, or when you press stop.
4. **Explanation**: after the scan, the page shows Presage's plain-language explanation. The habits list becomes one card per habit with **Remind me**.
5. **Reminders**: for each habit choose *once a day at a time* or *repeat every N minutes between two times*. Habits like water and movement breaks start on "repeat"; sleep starts on "once a day". Manage them on the Reminders page.

### Reminders: what works and what does not

- In-app alerts and browser notifications fire **only while a Vitalis tab is open**. Browsers do not let a web page run in the background without a server.
- For alarms when Vitalis is closed, download the **calendar file** (`.ics`) and open it in a phone or computer calendar. Times follow the device clock. A repeating reminder becomes one daily event per time, up to 48 events.

### The scan service

The SmartSpectra SDK is a Node package, so the browser streams small pictures (400 x 300 RGB, about 30 a second) to the service, which feeds them to the SDK.

- The browser sends `{"type":"start","width","height","apiKey"}`. The key is used for that scan only, never written to disk or logs, and not shared between scans. Presage error codes become friendly messages (bad key, no credit).
- One scan at a time, service-wide (`MAX_CONCURRENT_SCANS`). A second scan gets "busy". The SDK keeps process-wide state, so this is deliberate.
- The page origin must be in `ALLOWED_ORIGINS`. That check is the only access control, so put the service behind HTTPS and your own access rules before real use.
- After the scan the service asks Presage's LLM insight for an explanation (`requestInsight`), decodes it, sends it to the browser, and also prints it to its terminal.
- Presage telemetry is off by default (`SMARTSPECTRA_TELEMETRY`).

Tests (a stand-in replaces the SDK, so no key or network is needed):

```bash
cd sdk-service && npm test      # 59 tests
cd frontend && npm test         # 13 tests
```

### Production

Build with `npm run build` in `frontend/` and serve `dist/` with a fallback to `index.html` so links like `/account` work on refresh. Proxy `/scan-ws` to the scan service.

## Consent and data handling

- The camera starts only after the person confirms, shows an indicator, and can be stopped at any time.
- Camera frames pass through our scan service to Presage's SmartSpectra service. Nothing is recorded or stored by us.
- A summary of the numbers (never video, name or email) goes to Presage's language model for the explanation.
- The Presage key, profile, reminders and latest explanation are stored in this browser only. Anyone with access to the browser profile, or any script running on the site, can read them. Remove the key on shared computers.
- Nothing is sold. No diagnosis, no treatment or medicine suggestions, no covert monitoring.

## Credits

- [Presage Technologies](https://presagetech.com/) for the SmartSpectra SDK.
- Fonts: Bricolage Grotesque and Source Serif 4 (SIL Open Font License), loaded from Google Fonts.

## Disclaimer

Vitalis provides general wellness information. It is not a medical device and does not diagnose, treat or prevent any condition. If you have a health concern, talk to a qualified professional. In an emergency, contact your local emergency services.

## Licence

Not chosen yet. Add one before the repository goes public (the challenge needs a public repo).