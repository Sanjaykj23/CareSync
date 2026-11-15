import { Language } from './types';

export interface Translations {
  // Navigation & General
  brandTitle: string;
  elderPortal: string;
  familyAdmin: string;
  caretakerDuty: string;
  clinicalDoctor: string;
  visitor: string;
  active: string;
  abdmLocker: string;
  auditLedger: string;
  simulateMiss: string;
  signOut: string;
  signIn: string;
  voiceActive: string;
  voiceMuted: string;
  
  // Elder Portal Greetings & Slots
  greeting: string;
  timeForPills: string;
  morning: string;
  noon: string;
  evening: string;
  night: string;
  morningPills: string;
  afternoonPills: string;
  eveningPills: string;
  nightPills: string;
  in25min: string;
  completed: string;
  dispenserSlot: string;
  iTookIt: string;
  later: string;
  pillsTakenOf: string;
  todayPills: string;
  
  // Vitals & Metrics
  heartRate: string;
  normalAllWeek: string;
  thisWeek: string;
  streakDays: string;
  pillsTakenOnTime: string;
  
  // SOS & Emergency
  sosCallingAmbulance: string;
  sosAlertSent: string;
  sosMedicalCardParamedics: string;
  callNow: string;
  cancelImOk: string;
  emergencyAlertActive: string;
  
  // Care Circle & Linking
  careCircleRequests: string;
  requestToJoinCircle: string;
  acceptRequest: string;
  decline: string;
  activeConnectedMembers: string;
  connectToElder: string;
  searchElderPhone: string;
  findElder: string;
  sendCareCircleRequest: string;
  
  // Hardware IoT Dispenser
  iotDispenserTitle: string;
  iotDispenserDesc: string;
  online: string;
  openAndLift: string;
  taken: string;
  loadCell: string;
  reedSwitch: string;
  sealed: string;
  unsealed: string;
  
  // ABDM Health Locker
  linkAbhaOptional: string;
  abhaActive: string;
  abdmHeadline: string;
  abdmSubhead: string;
  enterAbhaNumber: string;
  verifyOtp: string;
  unlinkAbha: string;
  
  // Food Instructions
  beforeFood: string;
  afterFood: string;
  withFood: string;
  anyTime: string;

  // Language display
  currentLanguage: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    brandTitle: 'CareSync',
    elderPortal: '👴 Elder Portal',
    familyAdmin: '👨‍👩‍👧 Family Admin',
    caretakerDuty: '🧑‍⚕️ Caretaker Duty',
    clinicalDoctor: '🩺 Clinical Doctor',
    visitor: 'Visitor',
    active: 'Active:',
    abdmLocker: 'ABDM Health Locker',
    auditLedger: 'Audit Ledger',
    simulateMiss: 'Simulate Miss',
    signOut: 'Sign Out',
    signIn: 'Sign In',
    voiceActive: 'Voice feedback active',
    voiceMuted: 'Voice muted',

    greeting: 'Hi',
    timeForPills: 'Time for your',
    morning: 'Morning',
    noon: 'Noon',
    evening: 'Evening',
    night: 'Night',
    morningPills: 'morning pills',
    afternoonPills: 'afternoon pills',
    eveningPills: 'evening pills',
    nightPills: 'night pills',
    in25min: 'In 25 min',
    completed: 'Completed',
    dispenserSlot: 'Dispenser Slot',
    iTookIt: '✓ I took it',
    later: 'Later',
    pillsTakenOf: 'pills taken today',
    todayPills: "Today's pills",

    heartRate: 'Heart rate',
    normalAllWeek: 'Normal all week',
    thisWeek: 'This week',
    streakDays: '6-day streak!',
    pillsTakenOnTime: 'pills taken on time',

    sosCallingAmbulance: 'Calling an ambulance in',
    sosAlertSent: 'Family and doctor will get your GPS location immediately.',
    sosMedicalCardParamedics: 'Medical card shared with paramedics',
    callNow: 'Call right now',
    cancelImOk: "Cancel, I'm OK",
    emergencyAlertActive: 'Emergency alert activated. Calling ambulance and notifying family.',

    careCircleRequests: 'Care Circle Access Requests',
    requestToJoinCircle: 'wants to join your Care Circle to help manage medications.',
    acceptRequest: '✓ Accept Request',
    decline: 'Decline',
    activeConnectedMembers: 'Active Connected Members',
    connectToElder: '+ Connect to Elder',
    searchElderPhone: "Elder's Registered Mobile Number",
    findElder: 'Find Elder',
    sendCareCircleRequest: 'Send Care Circle Request',

    iotDispenserTitle: 'ESP32 Smart Dispenser Telemetry',
    iotDispenserDesc: 'Physical 4-slot hardware box with reed switches & load-cell weight telemetry',
    online: 'ONLINE',
    openAndLift: 'Open & Lift Pill',
    taken: '✓ Taken',
    loadCell: 'Load Cell',
    reedSwitch: 'Reed Switch',
    sealed: 'HIGH (Sealed)',
    unsealed: 'LOW (Open)',

    linkAbhaOptional: 'Link ABHA (Optional)',
    abhaActive: 'ABHA Active',
    abdmHeadline: 'Indian Digital Health Architecture in CareSync',
    abdmSubhead: 'CareSync implements India\'s NHA ABDM Sandbox M1–M3 APIs. Link your 14-digit ABHA ID to manage hospital records with full DPDP consent.',
    enterAbhaNumber: 'Enter 14-digit ABHA Number or address',
    verifyOtp: 'Verify with NHA Sandbox',
    unlinkAbha: 'Unlink ABHA',

    beforeFood: 'before food',
    afterFood: 'after food',
    withFood: 'with food',
    anyTime: 'any time',

    currentLanguage: 'English',
  },

  ta: {
    brandTitle: 'கேர்சிங்க் (CareSync)',
    elderPortal: '👴 முதியோர் தளம்',
    familyAdmin: '👨‍👩‍👧 குடும்ப நிர்வாகி',
    caretakerDuty: '🧑‍⚕️ பராமரிப்பாளர் பணி',
    clinicalDoctor: '🩺 மருத்துவர் தளம்',
    visitor: 'பார்வையாளர்',
    active: 'செயலில்:',
    abdmLocker: 'ABDM சுகாதார பெட்டகம்',
    auditLedger: 'தணிக்கை பதிவு',
    simulateMiss: 'மருந்து தவறவிடல்',
    signOut: 'வெளியேறு',
    signIn: 'உள்நுழை',
    voiceActive: 'குரல் வழிகாட்டல் இயக்கம்',
    voiceMuted: 'குரல் முடக்கப்பட்டது',

    greeting: 'வணக்கம்',
    timeForPills: 'உங்கள் நேரம்:',
    morning: 'காலை',
    noon: 'மதியம்',
    evening: 'மாலை',
    night: 'இரவு',
    morningPills: 'காலை மருந்துகள்',
    afternoonPills: 'மதிய மருந்துகள்',
    eveningPills: 'மாலை மருந்துகள்',
    nightPills: 'இரவு மருந்துகள்',
    in25min: 'இன்னும் 25 நிமிடத்தில்',
    completed: 'எடுக்கப்பட்டது',
    dispenserSlot: 'பெட்டி அறை',
    iTookIt: '✓ நான் எடுத்துக்கொண்டேன்',
    later: 'பிறகு',
    pillsTakenOf: 'மருந்துகள் எடுக்கப்பட்டன',
    todayPills: 'இன்றைய மருந்துகள்',

    heartRate: 'இதயத் துடிப்பு',
    normalAllWeek: 'வாரம் முழுவதும் சீரானது',
    thisWeek: 'இந்த வாரம்',
    streakDays: '6-நாள் தொடர்ச்சி!',
    pillsTakenOnTime: 'நேரத்திற்கு எடுத்த மருந்துகள்',

    sosCallingAmbulance: 'ஆம்புலன்ஸ் அழைக்கப்படுகிறது இன்னும்',
    sosAlertSent: 'குடும்பத்தினர் மற்றும் மருத்துவருக்கு உங்கள் இருப்பிடம் உடனடியாக அனுப்பப்படும்.',
    sosMedicalCardParamedics: 'மருத்துவ அட்டை அவசர சிகிச்சை பிரிவுக்கு பகிரப்பட்டது',
    callNow: 'உடனே அழைக்கவும்',
    cancelImOk: 'ரத்து செய், நான் நலம்',
    emergencyAlertActive: 'அவசர எச்சரிக்கை தொடங்கப்பட்டது. ஆம்புலன்ஸ் மற்றும் குடும்பத்தினருக்கு தகவல் அனுப்பப்படுகிறது.',

    careCircleRequests: 'பராமரிப்பு வட்ட இணைப்பு கோரிக்கைகள்',
    requestToJoinCircle: 'உங்கள் மருந்து நிர்வாகத்திற்கு உதவ உங்கள் வட்டத்தில் இணைய விரும்புகிறார்.',
    acceptRequest: '✓ ஏற்கவும்',
    decline: 'நிராகரி',
    activeConnectedMembers: 'இணைக்கப்பட்டுள்ள உறவினர்கள்',
    connectToElder: '+ முதியவருடன் இணையவும்',
    searchElderPhone: 'முதியவரின் பதிவுசெய்த அலைபேசி எண்',
    findElder: 'முதியவரைத் தேடு',
    sendCareCircleRequest: 'இணைப்பு கோரிக்கை அனுப்பவும்',

    iotDispenserTitle: 'ESP32 ஸ்மார்ட் மருந்து பெட்டி நிலவரம்',
    iotDispenserDesc: 'காந்த சுவிட்சுகள் மற்றும் எடை உணரி கொண்ட 4-அறை மின்னணு பெட்டி',
    online: 'இணைப்பில்',
    openAndLift: 'திறந்து மருந்தை எடுக்கவும்',
    taken: '✓ எடுக்கப்பட்டது',
    loadCell: 'எடை உணரி',
    reedSwitch: 'மூடி சுவிட்ச்',
    sealed: 'மூடப்பட்டுள்ளது (HIGH)',
    unsealed: 'திறந்துள்ளது (LOW)',

    linkAbhaOptional: 'ABHA இணைக்கவும் (விருப்பம்)',
    abhaActive: 'ABHA இணைக்கப்பட்டது',
    abdmHeadline: 'இந்திய டிஜிட்டல் சுகாதார இயக்கம் (ABDM)',
    abdmSubhead: 'கேர்சிங்க் இந்தியாவின் NHA ABDM Sandbox M1–M3 முறைகளை ஆதரிக்கிறது. உங்கள் 14-இலக்க ABHA எண்ணை இணைத்து முழு அனுமதியுடன் மருத்துவ ஆவணங்களை நிர்வகியுங்கள்.',
    enterAbhaNumber: '14-இலக்க ABHA எண் அல்லது முகவரியை உள்ளிடவும்',
    verifyOtp: 'NHA Sandbox உடன் சரிபார்க்கவும்',
    unlinkAbha: 'ABHA இணைப்பை நீக்கு',

    beforeFood: 'உணவுக்கு முன்',
    afterFood: 'உணவுக்குப் பின்',
    withFood: 'உணவுடன்',
    anyTime: 'எந்நேரமும்',

    currentLanguage: 'தமிழ்',
  },

  hi: {
    brandTitle: 'केयरसिंक (CareSync)',
    elderPortal: '👴 वरिष्ठ पोर्टल',
    familyAdmin: '👨‍👩‍👧 परिवार व्यवस्थापक',
    caretakerDuty: '🧑‍⚕️ देखभालकर्ता ड्यूटी',
    clinicalDoctor: '🩺 चिकित्सक पोर्टल',
    visitor: 'अतिथि',
    active: 'सक्रिय:',
    abdmLocker: 'ABDM स्वास्थ्य लॉकर',
    auditLedger: 'ऑडिट रिकॉर्ड',
    simulateMiss: 'चूक का अनुकरण',
    signOut: 'साइन आउट',
    signIn: 'साइन इन',
    voiceActive: 'आवाज़ मार्गदर्शन सक्रिय',
    voiceMuted: 'आवाज़ म्यूट',

    greeting: 'नमस्ते',
    timeForPills: 'समय हो गया आपकी',
    morning: 'सुबह',
    noon: 'दोपहर',
    evening: 'शाम',
    night: 'रात',
    morningPills: 'सुबह की दवाइयों का',
    afternoonPills: 'दोपहर की दवाइयों का',
    eveningPills: 'शाम की दवाइयों का',
    nightPills: 'रात की दवाइयों का',
    in25min: '25 मिनट में',
    completed: 'पूर्ण',
    dispenserSlot: 'डिस्पेंसर स्लॉट',
    iTookIt: '✓ मैंने ले ली',
    later: 'बाद में',
    pillsTakenOf: 'दवाइयाँ आज ली गईं',
    todayPills: 'आज की दवाइयाँ',

    heartRate: 'हृदय गति',
    normalAllWeek: 'पूरे सप्ताह सामान्य',
    thisWeek: 'इस सप्ताह',
    streakDays: '6-दिन लगातार!',
    pillsTakenOnTime: 'समय पर ली गई दवाइयाँ',

    sosCallingAmbulance: 'एम्बुलेंस को कॉल किया जा रहा है',
    sosAlertSent: 'परिवार और डॉक्टर को तुरंत आपका स्थान भेज दिया जाएगा।',
    sosMedicalCardParamedics: 'पैरामेडिक्स के साथ मेडिकल कार्ड साझा किया गया',
    callNow: 'अभी कॉल करें',
    cancelImOk: 'रद्द करें, मैं ठीक हूँ',
    emergencyAlertActive: 'आपातकालीन चेतावनी शुरू। एम्बुलेंस बुलाई जा रही है और परिवार को सूचित किया जा रहा है।',

    careCircleRequests: 'केयर सर्कल अनुरोध',
    requestToJoinCircle: 'दवाओं के प्रबंधन में सहायता के लिए आपके सर्कल में शामिल होना चाहते हैं।',
    acceptRequest: '✓ स्वीकार करें',
    decline: 'अस्वीकार करें',
    activeConnectedMembers: 'सक्रिय जुड़े सदस्य',
    connectToElder: '+ वरिष्ठ से जुड़ें',
    searchElderPhone: 'वरिष्ठ का पंजीकृत मोबाइल नंबर',
    findElder: 'वरिष्ठ को खोजें',
    sendCareCircleRequest: 'केयर सर्कल अनुरोध भेजें',

    iotDispenserTitle: 'ESP32 स्मार्ट डिस्पेंसर टेलीमेट्री',
    iotDispenserDesc: 'चुंबकीय स्विच और वजन सेंसर वाला 4-स्लॉट हार्डवेयर बॉक्स',
    online: 'ऑनलाइन',
    openAndLift: 'खोलें और दवा लें',
    taken: '✓ ली गई',
    loadCell: 'वजन सेंसर',
    reedSwitch: 'लिड स्विच',
    sealed: 'बंद (HIGH)',
    unsealed: 'खुला (LOW)',

    linkAbhaOptional: 'ABHA लिंक करें (वैकल्पिक)',
    abhaActive: 'ABHA सक्रिय',
    abdmHeadline: 'भारतीय डिजिटल स्वास्थ्य मिशन (ABDM)',
    abdmSubhead: 'केयरसिंक भारत के NHA ABDM Sandbox M1–M3 मानकों का पालन करता है। पूर्ण DPDP सहमति के साथ अपने 14-अंकीय ABHA नंबर को लिंक करें।',
    enterAbhaNumber: '14-अंकीय ABHA नंबर या पता दर्ज करें',
    verifyOtp: 'NHA Sandbox से सत्यापित करें',
    unlinkAbha: 'ABHA अनलिंक करें',

    beforeFood: 'खाने से पहले',
    afterFood: 'खाने के बाद',
    withFood: 'खाने के साथ',
    anyTime: 'किसी भी समय',

    currentLanguage: 'हिन्दी',
  },
};
