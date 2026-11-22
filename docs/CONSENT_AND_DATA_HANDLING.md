# Consent and Data Handling

This is the "Consent and Data Handling" section the Presage SmartSpectra SDK Challenge requires with every submission. It describes what Vitalis collects, why, where it goes, how long it stays, and how people stay in control.

**It is a living document.** Update it in the same change as any code that collects, sends, stores or shows new data (see [Keeping this up to date](#10-keeping-this-up-to-date)). Last reviewed: 2026-11-21.

Sources: Presage's [SDK Telemetry & Privacy](https://smartspectra.presagetech.com/docs/telemetry-and-privacy/) page, the [Node.js SDK documentation](https://presagetech.com/docs/smartspectra-sdk/nodejs), and [Presage's Privacy Policy](https://presagetech.com/legal/privacy-policy/).

---

## 1. At a glance

Vitalis has **no backend, no database and no sign-in**. Everything it remembers is stored in the person's own browser, on their own device. Each person uses their own free Presage account.

| Data | Collected? | Stored by us? | Where it goes |
| --- | --- | --- | --- |
| Presage API key (the person's own) | Yes, typed or pasted by the person on the Account page | **On the person's device only** (browser `localStorage`). Not on any server | Sent to our scan service when a scan starts, used for that scan only, then forgotten. The service passes it to the Presage SDK |
| Profile answers (age, gender, location, lifestyle, health background) | Yes, only what the person chooses to enter | **On the person's device only** | Nowhere. Not sent to any server or service |
| Camera pictures during a scan | Yes, only after consent and while scanning | **No** | Browser, then our scan service (memory only), then Presage's SDK and service |
| Pulse, breathing and HRV readings | Yes, during a scan | Latest readings are kept on the device with the latest explanation. Not in any database. The scan service prints them to its terminal for now (see 3.4) | Browser screen; our scan service; **a summary of the numbers goes to Presage and its language model (see 5.2)** |
| AI explanation | Yes, after a scan | **On the person's device only** (latest one) | Comes from Presage's language model via the scan service |
| Reminders (habit text, times) | Yes, when the person sets one | **On the person's device only** | Nowhere, unless the person downloads a calendar file and opens it in their own calendar |

Vitalis gives **general wellness information**. It does not diagnose, treat or prevent any condition, and it is not a medical device.

---

## 2. How consent works

| Moment | What the person sees | What they agree to |
| --- | --- | --- |
| Adding a Presage key | The Account page explains where the key is stored (this browser), when it is sent (when a scan starts) and the risks on shared computers. | Saving the key on this device. Nothing is saved until they press **Save key**. |
| Setting up a profile | The profile page opens with a note that every question is optional except health conditions, saved on this device only, and deletable. The health section adds a second note that it is especially private. | Only what they type in and save. Nothing is saved until they press **Save profile**. |
| Starting a scan | A "Before the camera turns on" list that says the key is sent to start the scan, a summary of the numbers goes to Presage's language model, and the explanation and reminders stay on the device, a required checkbox ("I understand, and I agree to turn on my camera for this scan"), and a disabled start button until it is ticked. | Turning on the camera, sending pictures through our server to Presage, and, when the scan ends, asking Presage's language model what the numbers mean (a summary of the numbers and our prompt are sent; see 5.2). |
| Setting a reminder | A "Remind me" control under each habit, and a Reminders page that says in-app alerts work only while Vitalis is open and that a calendar file is needed for alarms when it is closed. | Saving the reminder on this device. |
| Browser permission | Pressing the start button makes the browser show its own camera prompt. | The browser's camera permission. |

Rules the code follows:

- The camera is never requested before the checkbox is ticked and the button pressed. (Checked in the browser tests.)
- Consent is per scan. "Scan again" returns to the unticked checkbox.
- A "Camera is on" badge shows for the whole scan.
- The camera turns off on Stop, time limit, leaving the page, switching tabs, losing the connection, or losing the camera.
- A blocked camera is respected. We show how to allow it and do not retry on our own.

---

## 3. What we collect, in detail

### 3.1 Presage API key

The person creates a free account at Presage and pastes their own key on the Account page. The key is checked for shape only (visible characters, 8 to 256 long). It is stored in `localStorage` in the person's browser. It is sent over the WebSocket in the `start` message of each scan, used to open the SDK session for that scan, redacted from our logs and error messages, and not written to disk. The person can remove it at any time, or remove everything with "Delete everything".

Risks to state plainly: any script that runs on the site's origin can read `localStorage`, and anyone who can use the browser profile can use the key. On a shared computer, remove the key when finished. Key use is billed to, or counted against, the person's own Presage account.

### 3.2 Profile data (entered by the person)

Every field is optional and can be left blank, except health conditions and recent discomfort. The form requires at least one entry there ("None" is accepted), so that the planned report step always has something to read. The profile is never sent to any server or service. A required free-text health field means a person must disclose something to save a profile, which is worth reviewing with legal advice. Saving replaces the whole profile. The person can change or delete it at any time. These answers are stored in the browser's `localStorage` on the person's device. There is no server copy.

**Sensitivity:** answers marked **Health** relate to a person's health and are the most sensitive. Answers marked **Personal** can reveal background or identity. We ask for nothing that identifies the person, and we do not collect a name or email at all.

| Profile section | Question we ask | Answer form | Sensitivity |
| --- | --- | --- | --- |
| About you | Age | Whole number, 0 to 120 | Personal |
| About you | Gender | Female or male (kept as two choices for now). Can be left blank | Personal |
| Where you are from and live | Where are you from? | Free text (120 characters) | Personal |
| | Where do you live now? | Free text (120 characters) | Personal |
| | Kind of area | Rural, semi-urban or urban | Personal |
| | Kind of home | Choice | Personal |
| | People in the home | Whole number, 1 to 30 | Personal |
| | Usual weather | Choice | Personal |
| | Air quality where they live | Choice | Personal |
| | Access to safe drinking water | Choice | Personal |
| Daily life | Who they spend most time with | Choices (up to 20) | Personal |
| | Note about people around them | Free text (300 characters) | Personal |
| | Support when things get hard | Choice | Health |
| | How quickly they get used to change | Scale, 1 to 5 | Personal |
| | Hobbies | Short tags (up to 20) | Personal |
| | Type of work | Choice | Personal |
| | Daily screen time | Hours, 0 to 24 | Health |
| | Recent stress | Scale, 1 to 5 | Health |
| Food and habits | Type of food they eat | Choices (up to 20) | Health |
| | What they usually eat | Free text (300 characters) | Health |
| | Sleep per night | Hours, 0 to 24 | Health |
| | Tobacco use | Choice | Health |
| | Alcohol use | Choice | Health |
| Health background | Allergies | Short tags (up to 20) | Health |
| | "I have no known allergies" | Yes or no | Health |
| | Health conditions and recent discomfort | Short tags (up to 20), typed by the person. Required in the form: at least one entry, or "None" if nothing applies | Health |
| | Family health history | Short tags (up to 20) | Health |

**Why we ask:** to let future reports fit the person's life (for example, mentioning habits that make sense for where they live). **Today these answers are only stored and shown back to the person. Nothing else reads them yet.**

**What we deliberately do not collect:** medications, physical activity, height and weight, exact address, phone number, government IDs, payment details. (Medications, activity and height/weight were offered as extra factors and not approved.)

Free-text and tag answers can contain anything the person types. The form tells them to share only what they are comfortable with, and the server limits lengths, but we cannot stop someone typing something sensitive into a free-text box.

### 3.3 Camera pictures (during a scan only)

- Collected only after the consent steps in section 2, and only while the scan is running.
- The browser shrinks each picture to 400 x 300 pixels and sends about 30 a second to our scan service over a WebSocket.
- The scan service checks the page origin, allows one scan at a time service-wide, and ends a scan after `SCAN_MAX_SECONDS` (60 by default).
- The service hands each picture straight to the Presage SDK in memory. **We do not write pictures or video to disk, to the database, or to logs.** We do not record video.
- The SDK processes the pictures to measure vitals. How and where Presage processes them is governed by Presage and its Privacy Policy (see section 5.2).

### 3.4 Vital readings

- Pulse, breathing and heart rate variability come back from the SDK and are sent to the browser.
- The scan page shows pulse and breathing. When the scan ends, the readings stay on screen until the person leaves or scans again.
- **We do not save readings in a database or a file.** The latest readings are kept with the latest explanation in the browser's `localStorage`.
- **Automatic stop:** when the SDK reports both pulse and breathing as steady, the scan stops by itself and the camera turns off. If the person stops early, or the time limit passes, the scan ends with whatever readings it had.
- **LLM insight (Presage):** when a scan ends and lasted at least 15 seconds with a reading, the scan service asks Presage's LLM insight what the readings mean, waits up to 20 seconds, and sends the answer to the browser, which shows it and keeps the latest one on the device. The service also prints it to its console for now. Section 5.2 lists what leaves our server for this.
- **Printed to the terminal (temporary):** the scan service prints the result and the insight to its console. These are development printouts. **Whoever can read that terminal or the logs captured from it can see the readings and the insight.** Before launch, remove the printouts or keep them out of persistent logs, and update this section.

### 3.5 Technical data

| Item | Detail |
| --- | --- |
| Browser storage | `localStorage` keys beginning `vitalis.`: the Presage key, profile, reminders, a record of which reminders already alerted today, and the latest explanation. No cookies. |
| Analytics and advertising | None. No tracking scripts. |
| Google Fonts | The page loads fonts from `fonts.googleapis.com` and `fonts.gstatic.com`. Google can see the visitor's IP address. (Planned: self-host the fonts to remove this.) |
| Hosting provider logs | Whatever host we choose will log ordinary request data such as IP address and time. Update this entry once a host is chosen. |

### 3.6 Our server logs

Our scan service logs operational events only, such as SDK error codes. The Presage key is redacted from every message. They do not log profile answers, camera pictures or tokens. **Exception for now:** the scan result and the insight are printed to the terminal, as described in 3.4. Errors shown to the browser are generic and never include SQL, values or SDK internals.

---

## 4. What we do with the data

| Data | Used for | Not used for |
| --- | --- | --- |
| Presage key | Starting a scan with the person's own Presage account | Any other purpose, storing it on a server |
| Profile answers | Showing them back for editing on the same device | Anything else. They are not sent anywhere |
| Camera pictures | Measuring vitals through the Presage SDK, live, during the scan | Recording, storage, training our own models, identifying the person |
| Reminders | Alerting the person in the app, and building a calendar file on request | Sending to any server |
| Readings | Showing on screen, keeping the latest on the device, and printing for now. The numbers also go, as a summary, to Presage's language model (5.2). Planned: the written report (section 8) | Storage, showing a diagnosis |

We do not sell personal data, and we do not share it with anyone except the services named in section 5.

---

## 5. Third parties

### 5.1 Google Fonts

Only for fonts (see 3.5). There is no Google sign-in.

### 5.2 Presage SmartSpectra (the SDK)

The SDK is the Node.js package `@smartspectra/node-sdk`, run by our scan service. What Presage says about its data practices, and what we do about it:

| Topic | What Presage's documentation says | Our choice or response |
| --- | --- | --- |
| Telemetry default | On by default. Session summaries (SDK build, platform, OS, device model, session type, outcome, performance counters, counts of validation warnings, coarse error codes) and device readiness reports (diagnostic details, which can include free text, file paths and platform context). | **We turn it off** (`enableTelemetry: false`). It is opt-in through `SMARTSPECTRA_TELEMETRY=true`. |
| What telemetry excludes | No raw video or image frames. No measured vital signs. | Unchanged. |
| Identity | Authentication can link telemetry to an account. Presage tells developers not to call it anonymous. | We never call it anonymous. If it is ever turned on, we will say so in the product and in this document. |
| When telemetry is off | "The SDK starts no telemetry session and transmits nothing" for telemetry. | In our own test run the SDK still contacted Presage to verify the API key and to fetch models, which authentication and model delivery require. Our copy says pictures go to Presage's service and does not claim Presage receives nothing. |
| Retention | Full readiness reports have no automatic expiry. Deletion follows Presage's policies. | Telemetry is off, so we do not send these. |
| Where video is processed | Not stated on the telemetry page. | **Open item:** confirm from Presage's Privacy Policy or support where and how long picture data is processed, and update this row. Until then we say only that pictures are sent to Presage's service for processing under Presage's policy. |
| Developer duties | Disclose the collection to users. Align with Presage's Privacy Policy. | This document, the scan consent screen and the Privacy and FAQ sections of the site. |

**LLM insights.** When a scan ends, our scan service calls the SDK's `requestInsight`. Presage's documentation says that when an insight is dispatched, the SDK sends the following off-device to Presage, which forwards it to the language model: an allowlisted subset of the computed metrics (pulse rate, heart-rate variability and breathing rate) as a columnar series; the prompt text we supply; and request metadata (a session ID, request origin and request ID). It also says raw video and facial imagery are never transmitted for this feature, and that insights "can be inaccurate, incomplete, or misleading" and are general wellness information, not medical advice.

Our prompt asks the model to explain the readings in plain language, flag anything unusual compared with typical resting ranges, suggest simple everyday habits, and not diagnose or recommend treatment. It contains no profile answers, name, email or account ID. The answer is sent to the person's browser (which keeps the latest on the device) and printed to the scan service's console. Presage also sends automatic insights about every 60 seconds while a session runs; we do not print those unless the requested one does not arrive.

**Open questions for Presage:** which language-model provider receives the data, how long Presage and that provider keep it, whether it is used for training, and where it is processed. The numbers are health data and are tied to our API key and a session ID. See open item 9.

The API key belongs to the person. It is sent from their browser to the scan service for each scan, used only to open that SDK session, and is not stored by us. Each scan is billed to their own Presage account.

### 5.3 Our hosting provider

Only the scan service and the static site need hosting. There is no database. The provider will be named here once chosen. The scan service sees the person's key and camera pictures in memory during a scan, so it must be served over HTTPS (so the key and pictures are encrypted in transit) and run on infrastructure we trust.

### 5.4 Infermedica and Isabel Healthcare (removed)

Both were removed on 2026-11-21. **Nothing is sent to either service.** The code, settings and tests for them are deleted.

- Infermedica was used for a condition list (`/conditions`), a symptom-checker request (`/parse`, `/triage`, `/diagnosis`) and patient-education text (`/patient_education`). A database that an earlier build created may still hold `probable_conditions`, `profiles` and `users` tables. Drop that database by hand.
- The whole backend has since been removed (section 3 and the change log). Patient-education files written by the earlier build are in `backend/output/patient_education/` on any machine that ran it. They tie conditions to an account ID. **Delete that folder by hand** (open item 10).
- Isabel Healthcare was never integrated. Its terms forbid automating its website and its API documentation is released only on request.

### 5.5 Language model (planned, not built)

See section 8.

---

## 6. Where data lives, and for how long

| Data | Where | How long | How it ends |
| --- | --- | --- | --- |
| Presage key | Browser `localStorage` | Until removed | "Remove key" or "Delete everything" on the Account page, or clearing browser data |
| Profile | Browser `localStorage` | Until the person deletes it | "Delete my profile" on the profile page, or "Delete everything" |
| Reminders and latest explanation | Browser `localStorage` | Until removed | Remove on the Reminders or Scan page, or "Delete everything" |
| Calendar file | Wherever the person saves it | Their choice | They delete it. It holds habit text and times, no name or key |
| Camera pictures | Browser memory, our service memory, then Presage | Seconds | Discarded as each picture is processed. Presage's handling follows its own policy |
| Readings | Browser screen and `localStorage` (latest), scan service memory | Until removed. Terminal printouts last as long as the terminal or any log capturing it | As above. Printouts: clear or stop capturing the logs |

Nothing is shared between devices. A different browser or device has its own, separate data.

---

## 7. How we protect it

- There is nothing to breach on our side: no accounts, no database. Each person's data sits on their own device.
- The scan service accepts connections only from our own pages (the origin check, which is its only access control), one scan at a time, with a frame-rate cap and a time limit.
- The Presage key is validated for shape, used for one scan, redacted from logs and errors, and never written to disk by us.
- Reminder and explanation text is drawn with React elements, never as raw HTML, so an unusual model reply cannot inject markup.
- Errors sent to the browser never include SDK internals.
- Limits: `localStorage` is not encrypted and is readable by any script on the site's origin (for example after a cross-site scripting flaw) and by anyone with access to the browser profile. Keep dependencies updated and use a strict Content Security Policy in production.

---

## 8. Planned and not yet built

These steps are in the plan and **do not exist yet**. When one is built, move it into sections 1 to 6 and update the consent copy before it ships.

| Planned step | Data involved | Rules we are committing to |
| --- | --- | --- |
| Look up general guidance from published health sources | Not built. Infermedica was removed (section 5.4) | Send only the minimum needed. Never send name, email or picture. |
| Write a plain-language report with a language model | Vital readings and selected profile answers sent to the model provider | Never include name, email or picture. Tell the person which profile answers are sent. The model must not diagnose, recommend treatments or medicines, or comment on specific conditions. Do not let the provider train on the data. Name the provider here. |
| Store reports on a server | The report | Today the latest explanation is kept only on the person's device. If a server copy is ever added, add a consent step and a deletion control first. |

---

## 9. Known gaps and open items

Resolve these before real users sign up:

1. **No accounts, so no account deletion.** The data is on each person's device. Deleting it means "Delete everything" or clearing browser data. An old PostgreSQL database from an earlier build (users, profiles) may still exist and should be dropped.
2. **Presage video handling is not documented on their telemetry page.** Confirm where and how long picture data is processed (section 5.2) and quote it here.
3. **Legal review of health data.** The profile's health answers are special-category data in many places (for example under GDPR). Get legal advice on lawful basis, a privacy policy, data-subject rights and any region limits before launch. This document is not legal advice.
4. **No published privacy policy page yet.** The site's Privacy and FAQ sections summarise this document. Add a full policy page and link it from the footer, the Account page and the scan consent screen.
5. **Google Fonts are loaded from Google.** Self-host them to stop sending visitors' IP addresses to Google.
6. **Hosting provider is not chosen.** Name it in sections 3.5 and 5.3, check its data-location terms, and serve the scan service over HTTPS.
7. **Key in the browser.** The Presage key in `localStorage` can be read by any script on the origin and by anyone using the browser profile. Add a Content Security Policy and warn users on shared computers (the Account page does).
8. **Terminal printouts and scan-service access.** The printouts of readings and the insight must go before launch (3.4). The scan service has no authentication beyond the origin check, and allows one scan at a time service-wide, so one person can keep others waiting. Add rate limiting or authentication before opening it to the public.
9. **Presage LLM insight terms.** The numbers go to Presage and on to a language model provider we have not identified. Confirm the provider, retention, training use and location, and sign any data-processing agreement needed. See 5.2.
10. **Old patient-education files.** Delete `backend/output/patient_education/` (the backend folder has been moved out of the project, to `vitalis-backend-removed`) on every machine that ran the earlier build.
11. **Insight wording.** The insight is now shown to people, so review its wording with a clinician. The model could still drift toward advice, and habit parsing is heuristic because the wording varies.
13. **Reminders only alert while Vitalis is open.** Calendar files are the way to get alarms when it is closed. Say so wherever reminders are offered (done on the Scan and Reminders pages).
12. **Real scan and insight not yet tested end to end** (the browser flow was tested against a stand-in scan service). Test with a real API key and confirm what leaves the server (for example by watching the service's network traffic).

---

## 10. Keeping this up to date

Update this document in the **same change** as the code, whenever you:

- add or remove a **profile question** (update the table in section 3.2, the sensitivity tag, and the "what we do not collect" list);
- start collecting any **new kind of data** (analytics, new scan output, device information);
- **store** something that was not stored before (for example saving readings or reports);
- add a **third party** (guidance source, language model, hosting, analytics, email);
- change a **consent step** or any consent wording;
- change **Presage settings** (telemetry, logging) or upgrade the SDK. Re-read Presage's Telemetry and Privacy page when you do;
- change **how long** data is kept, or how it is deleted.

Then check that the site's Privacy and FAQ copy (`frontend/src/content.js`), the profile page notes, and the scan consent text still say the same thing.

### Change log

| Date | Change |
| --- | --- |
| 2026-11-21 | **Local-first rework.** Removed the Python backend, the database and Google sign-in. People now add their own Presage API key on a new Account page. The key, profile, reminders and latest explanation are stored in the browser only. The key is sent to the scan service per scan. The AI explanation is shown in the app, with a reminder control per habit and a Reminders page with alerts and `.ics` export. Sections 1 to 9 rewritten. |
| 2026-11-21 | Removed all Infermedica and Isabel code and settings (section 5.4); health conditions are free text again. Added Presage LLM insight: when a scan ends, the scan service asks what the readings mean and prints the answer to its console (sections 3.4 and 5.2). Consent copy now says a summary of the numbers goes to an AI model. |
| 2026-11-19 | Removed the Infermedica `/parse`, `/triage` and `/diagnosis` calls: scan readings are no longer sent to Infermedica. Added `/patient_education`, called per listed condition after a scan; five sections are written to a file on the server (section 5.4). |
| 2026-11-19 | Health conditions are now picked from a list. A new button after the age question loads Infermedica's `/conditions` list for that age; the list is saved per person and fetched again only when the age changes (section 5.4). |
| 2026-11-18 | Health conditions made a required question in the profile form, with a note asking people to recall any slight discomfort in the past week. "None" and similar filler are not sent to Infermedica. |
| 2026-11-16 | First version. Covers Google sign-in, the profile (five sections of optional questions), the camera scan and the Presage SDK (telemetry off by default). Language-model steps listed as planned. |
| 2026-11-17 | Added section 5.5: Isabel Healthcare considered, not integrated. `HEALTH_PROVIDER` selects the service. |
| 2026-11-17 | Typed health conditions are now read by Infermedica's `/parse` (text leaves our server for this); the short alias list is the fallback only. Profile and scan wording updated. Breathing rule confirmed. |
| 2026-11-17 | Added the Infermedica health check (section 5.4). The profile's gender question is now Female or Male, and the free-text "describe it yourself" answer was removed; old answers are converted or cleared when the backend starts. Consent copy on the scan, profile and privacy pages updated. |
| 2026-11-16 | Scan now stops itself when pulse and breathing are steady. The result is sent to a new backend endpoint and printed to the scan service and backend terminals (temporary). Readings are no longer "screen only"; sections 1, 3.4, 3.6, 4 and 6 updated. |
