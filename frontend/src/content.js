// All landing page copy lives here so it can be edited without touching layout code.

export const navLinks = [
  { label: 'How it works', href: '/#how' },
  { label: 'Signals', href: '/#signals' },
  { label: 'Privacy', href: '/#privacy' },
  { label: 'FAQ', href: '/#faq' },
]

export const hero = {
  title: 'Understand your vitals in plain language.',
  lede: 'Scan with your camera, and an AI model explains your pulse and breathing in everyday words. Turn its simple habit ideas into reminders. Everything you save stays on your own device.',
  profileLink: 'Add your Presage key',
  sampleNote: 'Illustrative sample, not a live reading.',
}

export const stepsIntro = 'Five steps, and you stay in control throughout.'

export const steps = [
  {
    title: 'Add your Presage key',
    body: 'Create a free Presage account, copy your API key and paste it into Vitalis. It stays in this browser, so the account is yours alone.',
    action: { label: 'Set up your key' },
  },
  {
    title: 'Optionally, add a profile',
    body: 'A few details about your life are saved on this device only. Most questions are optional, and you can delete them at any time.',
  },
  {
    title: 'You turn on the camera',
    body: 'Nothing starts until you agree. Sit still in good light for a short scan, and stop whenever you like.',
  },
  {
    title: 'The scan measures your signals',
    body: 'Presage SmartSpectra reads subtle changes in your face on video to estimate your pulse and breathing.',
  },
  {
    title: 'An AI model explains it simply',
    body: 'It rewrites your numbers in everyday words with simple habits to try. You can set a reminder for each habit. It never diagnoses, and it never suggests treatments or medicines.',
  },
]

export const signals = [
  {
    id: 'pulse',
    name: 'Pulse',
    body: 'How many times your heart beats each minute. One of the most familiar wellness numbers.',
  },
  {
    id: 'breathing',
    name: 'Breathing',
    body: 'How many breaths you take each minute, and how steady they are.',
  },
  {
    id: 'hrv',
    name: 'Heart rate variability',
    body: 'The small differences in time between heartbeats. People often follow it as a general sign of recovery and stress.',
  },
  {
    id: 'expressions',
    name: 'Expressions',
    body: 'Facial expression cues the camera picks up during your scan.',
  },
]

export const sample = {
  intro: [
    'Your numbers go in. A short report in plain words comes out.',
    'Every report follows the same shape: what we measured, what it can mean, and a few everyday habits worth trying.',
  ],
  readings: [
    { id: 'pulse', name: 'Pulse', value: '72', unit: 'beats per minute' },
    { id: 'breath', name: 'Breathing', value: '14', unit: 'breaths per minute' },
    { id: 'hrv', name: 'Variability', value: '48', unit: 'milliseconds' },
  ],
  meaning:
    'Your resting pulse and breathing sit in the range commonly seen in healthy adults at rest. Your heartbeat varied naturally from one beat to the next, which is expected.',
  habits: [
    'Keep a steady time for going to bed and waking up.',
    'Take a ten-minute walk after your biggest meal.',
    'When you feel tense, breathe slowly for two minutes.',
  ],
  foot: 'General wellness information. Not medical advice.',
}

export const privacy = {
  title: 'You decide when the camera is on.',
  lede: 'A camera scan is personal. Here is exactly what happens, and what we will not do.',
  does: [
    'The camera stays off until you press start and confirm.',
    'A clear indicator shows while it is on, and you can stop at any moment.',
    'Camera frames pass through our scan service to Presage’s SmartSpectra service, using your own Presage key, to calculate your vitals.',
    'When the scan finishes, Presage’s service sends a summary of your numbers (pulse, heart-rate variability and breathing rate, never your video, name or email) to an AI model, which writes a short explanation of what they mean.',
    'There is no Vitalis account and no sign-in. Your Presage key, your optional profile, your reminders and your latest explanation are saved in this browser on this device only.',
    'Your key is sent to our scan service only when a scan starts, is used for that scan, and is never saved on our server.',
  ],
  doesNot: [
    'Save your video.',
    'Scan anyone without their knowledge.',
    'Diagnose conditions, or recommend treatments or medicines.',
    'Sell your data.',
  ],
}

export const faqs = [
  {
    q: 'Is this medical advice?',
    a: 'No. Vitalis gives general wellness information. It does not diagnose conditions or recommend treatments or medicines, and it is not a medical device. If you are worried about your health, talk to a doctor or another qualified professional. In an emergency, call your local emergency number.',
  },
  {
    q: 'Do you save my video?',
    a: 'No. While you scan, your camera frames pass through our server to Presage’s SmartSpectra service to measure your vitals. We do not record or keep your video. Presage handles that data under its own policy, which we will link before you start a scan.',
  },
  {
    q: 'What do I need?',
    a: 'A device with a front-facing camera, a modern browser and a well-lit space. You sit still for a short scan.',
  },
  {
    q: 'How accurate are the numbers?',
    a: 'Camera-based readings are estimates. Lighting, movement and camera quality all affect them, so treat them as a wellness snapshot rather than a clinical measurement.',
  },
  {
    q: 'Where does the advice come from?',
    a: 'When a scan ends, Presage’s service passes a summary of your pulse, heart-rate variability and breathing numbers to an AI model, which explains in plain language what they mean. Your video, name and email are never part of that. It is instructed not to diagnose or prescribe.',
  },
  {
    q: 'Do I need an account?',
    a: 'You need a free Presage account, because Presage’s service does the measuring. Create one, copy your API key and paste it on the Account page. Vitalis itself has no sign-in, and each browser keeps its own key.',
  },
  {
    q: 'What do you store about me?',
    a: 'Nothing on a server. Your Presage key, optional profile, reminders and latest explanation are saved in this browser on your device. Clearing your browser data, or using Delete everything on the Account page, removes them. On a shared computer, remove your key when you finish.',
  },
  {
    q: 'Will reminders go off when Vitalis is closed?',
    a: 'In-app alerts appear only while a Vitalis tab is open. To be reminded when it is closed, download a calendar file from the Reminders page and open it in your phone or computer calendar.',
  },
]

export const profileSteps = {
  title: 'Set up in three steps',
  body: 'Your key and profile are saved on this device only, so the account is yours alone.',
  steps: [
    {
      title: 'Get a Presage account',
      body: 'Create a free account with Presage and copy your API key.',
    },
    {
      title: 'Paste your key',
      body: 'Open the Account page and save the key. It stays in this browser.',
    },
    {
      title: 'Optionally, add a profile',
      body: 'Tell us about your life. Skip anything you would rather not answer.',
    },
  ],
  openProfile: 'Open the Account page',
  done: 'Done',
}

export const profilePage = {
  title: 'Your profile',
  lede: 'Tell us a little about your life so your reports fit you. Only the health conditions question is required. Everything else is optional.',
  privacy:
    'Share only what you are comfortable with. Your answers are saved in this browser on this device only. They are not sent to any server or any other service. You can change or delete them at any time.',
  healthNote:
    'These questions are about your health, so they are especially private. You can skip any of them except the first, health conditions and recent discomfort, which is required.',
  conditionsHint:
    'Add each condition you already know about, and anything you have felt in the past week. Leave out your name and anything that identifies you.',
  conditionsNote:
    'Even if you have no symptoms, think carefully about the past week and report any slight feeling of discomfort you experienced, however small. If nothing at all applies, type None.',
  conditionsRequired:
    'Add at least one entry. Think back over the past week and note any slight discomfort. If nothing applies, type None.',
  lastSaved: (when) => `Last saved ${when}`,
  save: 'Save profile',
  saving: 'Saving...',
  saved: 'Profile saved.',
  
  fixErrors: 'Check the answers marked in red below.',
  deleteTitle: 'Delete your profile',
  deleteBody: 'This permanently removes everything on this page from this device.',
  deleteStart: 'Delete my profile',
  deleteSure: 'Delete your whole profile? This cannot be undone.',
  deleteConfirm: 'Yes, delete my profile',
  deleteCancel: 'Keep it',
  deleted: 'Your profile was deleted.',
}

export const scanPage = {
  title: 'Start a scan',
  lede: 'A short scan with your camera measures your pulse and breathing.',
  noKeyTitle: 'Add your Presage key first',
  noKeyBody: 'Scans use your own free Presage account. Add your API key on the Account page. It stays in this browser.',
  noKeyLink: 'Go to the Account page',
  noKeyError: 'Add your Presage API key on the Account page before you scan.',
  badKey: 'Presage did not accept your API key. Check it on the Account page.',
  noCredit: 'Your Presage account has no credit left. Check your account with Presage.',
  busy: 'The measuring service is busy with another scan. Please try again in a minute.',
  ending: 'Finishing your scan...',
  insightTitle: 'What your readings may mean',
  insightPending: 'Writing a plain-language explanation. This can take a few seconds.',
  insightUnavailable: 'We could not get an explanation this time. Your readings are shown above.',
  insightLost: 'The connection closed before the explanation arrived.',
  insightSkipped: 'The scan was too short to explain. A scan of about a minute works best.',
  lowConfidence: 'Readings that are still settling may not be reliable.',
  latestTitle: 'Your latest explanation',
  latestWhen: (when) => `From your scan on ${when}`,
  clearLatest: 'Remove it from this device',
  consentTitle: 'Before the camera turns on',
  consentPoints: [
    'Your camera stays off until you press the button below. Your browser will then ask you to allow it.',
    'While you scan, camera pictures are sent through our server to Presage’s SmartSpectra service to measure your pulse and breathing.',
    'We do not record or save your video.',
    'Your Presage API key is sent to our scan service to start this scan. It is used only for this scan and is not saved on our server.',
    'When the scan finishes, Presage’s service sends a summary of your pulse, breathing and heart-rate-variability numbers to an AI model, which writes a short explanation of what they mean. Your video, name, email and profile answers are not part of that.',
    'Your explanation and any reminders you set are saved on this device only.',
    'You can stop at any moment, and the camera turns off when you do.',
    'This gives general wellness information. It is not medical advice.',
  ],
  tips: 'For the best result, sit still facing a light, keep your face in view, and stay relaxed for about a minute.',
  agree: 'I understand, and I agree to turn on my camera for this scan.',
  startButton: 'Allow camera and start scan',
  requesting: 'Waiting for camera permission...',
  requestingHelp: 'Choose Allow when your browser asks to use the camera.',
  cameraBlocked: 'Camera access was blocked. Allow the camera for this site in your browser settings, then try again.',
  cameraMissing: 'We could not find a camera on this device.',
  cameraBusy: 'The camera could not be opened. Close other apps that use it, then try again.',
  cameraFailed: 'We could not start the camera. Please try again.',
  cameraLost: 'The camera was disconnected, so the scan stopped.',
  cannotConnect: 'We could not reach the measuring service. Check your connection, then try again.',
  connectionLost: 'The connection was lost, so the scan stopped.',
  serviceFailed: 'The scan stopped because of a problem with the measuring service.',
  tabHidden: 'The scan stopped because you switched to another tab.',
  complete: 'We have your readings, so the scan stopped by itself and the camera is off.',
  timeLimit: 'The scan reached its time limit.',
  previewLabel: 'Your camera preview',
  cameraOn: 'Camera is on',
  connecting: 'Connecting...',
  measuring: 'Measuring. Sit still and face the light.',
  progressLabel: 'Scan progress',
  pulse: 'Pulse',
  pulseUnit: 'beats per minute',
  breathing: 'Breathing',
  breathingUnit: 'breaths per minute',
  waiting: 'Waiting for a reading',
  settling: 'Still settling',
  steady: 'Steady',
  stopButton: 'Stop scan',
  endedTitle: 'Scan finished',
  disclaimer: 'General wellness information from a camera estimate. Not medical advice.',
  again: 'Scan again',
}

export const footer = {
  fine: 'Vitalis provides general wellness information. It is not a medical device and does not diagnose, treat or prevent any condition. If you have a health concern, talk to a qualified professional. In an emergency, contact your local emergency services.',
}

export const insightCopy = {
  habitsTitle: 'Everyday habits that may help',
  habitsHelp: 'Pick a time for each habit you want to be reminded about.',
  manage: 'See all your reminders on the',
  manageLink: 'Reminders page',
  aiNote: 'General wellness information written by an AI model. Not medical advice.',
}

export const reminderCopy = {
  add: 'Remind me',
  change: 'Change reminder',
  remove: 'Remove reminder',
  set: 'Reminder',
  paused: 'paused',
  how: 'How often?',
  daily: 'Once a day, at a time I choose',
  interval: 'Repeat through the day',
  time: 'Time',
  every: 'Repeat every',
  from: 'From',
  to: 'Until',
  save: 'Save reminder',
  cancel: 'Cancel',
  toastTitle: 'Reminder:',
  dismiss: 'Dismiss',
}

export const accountPage = {
  title: 'Your Presage account',
  lede: 'Vitalis uses Presage to measure your pulse and breathing. You use your own free Presage account, and your key stays on this device.',
  stepsTitle: 'Get your key',
  steps: [
    'Create a free account with Presage.',
    'Sign in and open your account to find your API key.',
    'Copy the key and paste it below.',
  ],
  register: 'Create a Presage account',
  login: 'Sign in to Presage',
  keyLabel: 'Presage API key',
  keyHelp: 'Pasted keys are hidden. Only you can see them on this device.',
  show: 'Show key',
  hide: 'Hide key',
  save: 'Save key',
  saved: 'Key saved on this device.',
  statusSet: (hint) => `A key is saved on this device${hint ? `, ${hint}` : ''}.`,
  statusNone: 'No key is saved yet.',
  replace: 'Replace key',
  remove: 'Remove key',
  removed: 'Key removed from this device.',
  safetyTitle: 'Where your key lives',
  safety: [
    'It is saved in this browser on this device. It is not stored on our server, and other people on other devices cannot use it.',
    'It is sent to our scan service only when a scan starts, and used for that scan only.',
    'Anyone who can use this browser profile can use your key. On a shared computer, remove it when you finish.',
    'Keep your browser up to date. A key stored in a browser can be read by any code that runs on this site.',
  ],
  dataTitle: 'Your data on this device',
  dataBody: 'Your key, profile, reminders and latest explanation are all stored in this browser. You can remove them all at once.',
  clear: 'Delete everything',
  clearSure: 'Delete your key, profile, reminders and latest explanation from this device? This cannot be undone.',
  clearConfirm: 'Yes, delete everything',
  clearCancel: 'Keep it',
  cleared: 'Everything was removed from this device.',
  next: 'Next: start a scan',
}

export const remindersPage = {
  title: 'Your reminders',
  lede: 'Reminders for the everyday habits from your explanations. They are saved on this device only.',
  empty: 'You have no reminders yet. Run a scan, then choose Remind me next to a habit.',
  emptyLink: 'Start a scan',
  next: (when) => `Next: ${when}`,
  enable: 'On',
  delete: 'Delete',
  notifyTitle: 'Alerts while Vitalis is open',
  notifyBody: 'Alerts appear on this page and, if you allow it, as browser notifications. They only work while a Vitalis tab is open.',
  notifyButton: 'Allow notifications',
  notifyOn: 'Notifications are allowed.',
  notifyOff: 'Notifications are blocked in your browser settings.',
  notifyNone: 'Your browser does not support notifications.',
  calendarTitle: 'Alarms when Vitalis is closed',
  calendarBody: 'Download a calendar file and open it in your phone or computer calendar. Your calendar then rings at the times you chose, even when Vitalis is closed. Long repeating reminders can create many calendar events.',
  download: 'Download calendar file',
  downloadOne: 'Calendar file',
  limited: (n) => `Only the first ${n} events were included.`,
}
