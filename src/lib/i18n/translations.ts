// AirAware AI V2 — Centralized Localization (English, Tamil, Hindi)
// Real, natural translations for UI strings and explanations

import { Language } from '../types';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  phaseBanner: string;
  subHeaderTitle: string;
  subHeaderSubtitle: string;
  familyDashboardTitle: string;
  familyDashboardSubtitle: string;
  scaleGuideBtn: string;
  refreshBtn: string;
  refreshing: string;
  quickSelect: string;
  searchPlaceholder: string;
  modelEstimateBadge: string;
  camsSourceAttribution: string;
  dominantPollutant: string;
  activeScale: string;
  cpcbScaleName: string;
  keyPollutantsTitle: string;
  keyPollutantsSubtitle: string;
  meteorologicalTitle: string;
  timelineTitle: string;
  timelineSubtitle: string;
  timelineScrollHint: string;
  temperature: string;
  humidity: string;
  windSpeed: string;
  windDirection: string;
  profilesTitle: string;
  profilesSubtitle: string;
  addMemberBtn: string;
  editProfile: string;
  deleteProfile: string;
  saveProfile: string;
  cancelBtn: string;
  nameLabel: string;
  ageCategoryLabel: string;
  childCat: string;
  childAge: string;
  teenCat: string;
  teenAge: string;
  adultCat: string;
  adultAge: string;
  seniorCat: string;
  seniorAge: string;
  whyAdviceBtn: string;
  askAiTitle: string;
  askAiSubtitle: string;
  chatPlaceholder: string;
  chatSendBtn: string;
  accessibilityTitle: string;
  highContrast: string;
  textSize: string;
  normalText: string;
  largeText: string;
  extraLargeText: string;
  dataLimitationsNotice: string;
  localStorageNotice: string;
  understoodBtn: string;
  plannerTitle: string;
  plannerSubtitle: string;
  activityLabel: string;
  actWalking: string;
  actRecreation: string;
  actCycling: string;
  actGeneral: string;
  bestWindowBadge: string;
  whyThisTimeBtn: string;
  peakWindowBadge: string;
  compareHoursTitle: string;
  compareHoursSubtitle: string;
  selectHourPrompt: string;
  forecastDisclaimer: string;
  favorableWindow: string;
  indoorAdvisorTitle: string;
  indoorAdvisorSubtitle: string;
  noSensorNotice: string;
  setupPrompt: string;
  editSetup: string;
  clearSetup: string;
  saveSetup: string;
  qVentilation: string;
  qWindows: string;
  qCooking: string;
  qDustSmoke: string;
  qPurifier: string;
  qRoadFacing: string;
  whySuggestionBtn: string;
  outdoorContextLabel: string;
  userReportedLabel: string;
  whatWeCannotDetermineLabel: string;
  noSensorWarning: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'AirAware AI',
    tagline: 'Same air. Different people. Personal answers.',
    phaseBanner: 'Live V2 · Production Ready',
    subHeaderTitle: 'Real-Time Environmental Conditions',
    subHeaderSubtitle: 'Verified model estimates from CAMS (Copernicus) with deterministic CPCB India NAQI calculations.',
    familyDashboardTitle: "What Does Today's Air Mean for My Family?",
    familyDashboardSubtitle: 'One verified air reading interpreted through 4 age-adapted perspectives.',
    scaleGuideBtn: 'Scale Guide',
    refreshBtn: 'Refresh',
    refreshing: 'Updating...',
    quickSelect: 'Quick Select:',
    searchPlaceholder: 'Search city (e.g. Pune, Jaipur)...',
    modelEstimateBadge: 'Model Estimate',
    camsSourceAttribution: 'CAMS Global (ECMWF) via Open-Meteo',
    dominantPollutant: 'Dominant Pollutant',
    activeScale: 'Active Scale',
    cpcbScaleName: 'India CPCB NAQI',
    keyPollutantsTitle: 'Key Pollutant Concentrations',
    keyPollutantsSubtitle: 'Real environmental parameters with CPCB sub-indices and national standard limits',
    meteorologicalTitle: 'Current Meteorological Conditions',
    timelineTitle: '24-Hour Forecast Timeline',
    timelineSubtitle: 'Hourly particulate levels and temperature projections (CAMS model estimate)',
    timelineScrollHint: 'Scroll horizontally for upcoming hours',
    temperature: 'Temperature',
    humidity: 'Relative Humidity',
    windSpeed: 'Wind Speed',
    windDirection: 'Wind Direction',
    profilesTitle: 'Family Air Profiles',
    profilesSubtitle: 'Add your household members to receive age-tailored environmental interpretations.',
    addMemberBtn: 'Add Family Member',
    editProfile: 'Edit Profile',
    deleteProfile: 'Delete Profile',
    saveProfile: 'Save Profile',
    cancelBtn: 'Cancel',
    nameLabel: 'Name / Nickname',
    ageCategoryLabel: 'Age Group',
    childCat: 'Child',
    childAge: 'Under 12 years',
    teenCat: 'Teen',
    teenAge: '13–17 years',
    adultCat: 'Adult',
    adultAge: '18–59 years',
    seniorCat: 'Senior',
    seniorAge: '60+ years',
    whyAdviceBtn: 'Why am I seeing this?',
    askAiTitle: 'Ask AirAware AI',
    askAiSubtitle: 'Grounded in today’s real measurements. Adapts to the selected family member.',
    chatPlaceholder: 'Ask a question about today’s air...',
    chatSendBtn: 'Ask',
    accessibilityTitle: 'Accessibility & Display',
    highContrast: 'High Contrast Mode',
    textSize: 'Text Size',
    normalText: 'Normal',
    largeText: 'Large',
    extraLargeText: 'Extra Large',
    dataLimitationsNotice: 'AirAware AI uses regional model simulations and deterministic rules. Not a substitute for personal medical consultation.',
    localStorageNotice: 'Family profiles are stored privately in your browser storage only.',
    understoodBtn: 'Understood',
    plannerTitle: 'Find a Better Time to Go Outside',
    plannerSubtitle: 'Compare 24-hour hourly forecast periods to identify comparatively more favorable outdoor windows.',
    activityLabel: 'Activity',
    actWalking: 'Walking',
    actRecreation: 'Outdoor Play',
    actCycling: 'Cycling',
    actGeneral: 'General Outdoor',
    bestWindowBadge: 'Comparatively Most Favorable Window',
    whyThisTimeBtn: 'Why This Time?',
    peakWindowBadge: 'Peak Pollution Window',
    compareHoursTitle: '24-Hour Forecast Comparison Curve',
    compareHoursSubtitle: 'Click any hour to compare its predicted index and pollutants against the optimal window',
    selectHourPrompt: 'Select any hour to inspect',
    forecastDisclaimer: 'This planner compares environmental forecast conditions only; it does not evaluate individual medical suitability or fitness. AirAware AI provides comparative atmospheric analysis without unconditional safety or zero-pollution guarantees.',
    favorableWindow: 'Favorable Window',
    indoorAdvisorTitle: 'Make Your Indoor Space More Air-Aware',
    indoorAdvisorSubtitle: 'Practical indoor air guidance synthesized from outdoor conditions and your living setup.',
    noSensorNotice: 'These are general indoor-air suggestions based on available outdoor data and your answers. AirAware AI does not measure indoor air quality without a compatible sensor.',
    setupPrompt: 'Configure your indoor space details (optional, non-sensitive)',
    editSetup: 'Edit Setup',
    clearSetup: 'Clear Setup',
    saveSetup: 'Save Setup',
    qVentilation: 'Is the room naturally ventilated?',
    qWindows: 'Are windows usually open or closed?',
    qCooking: 'Is there cooking activity nearby?',
    qDustSmoke: 'Is there visible dust or smoke?',
    qPurifier: 'Is an air purifier available?',
    qRoadFacing: 'Is the room facing a busy road or traffic area?',
    whySuggestionBtn: 'Why This Suggestion?',
    outdoorContextLabel: 'Outdoor Air Context',
    userReportedLabel: 'Your Space Setup',
    whatWeCannotDetermineLabel: 'What AirAware AI Cannot Determine',
    noSensorWarning: 'No Indoor Sensor Connected',
  },
  ta: {
    appName: 'ஏர்அவேர் AI (AirAware)',
    tagline: 'ஒரே காற்று. வெவ்வேறு மனிதர்கள். தனித்துவமான விடைகள்.',
    phaseBanner: 'நேரலை V2 · உற்பத்தி தயார்',
    subHeaderTitle: 'நிகழ்நேர காற்று சூழல் நிலவரம்',
    subHeaderSubtitle: 'CAMS மாதிரியிலிருந்து பெறப்பட்ட சரிபார்க்கப்பட்ட அளவீடுகள் மற்றும் இந்திய CPCB NAQI கணிப்புகள்.',
    familyDashboardTitle: 'இன்றைய காற்று என் குடும்பத்திற்கு என்ன உணர்த்துகிறது?',
    familyDashboardSubtitle: 'ஒரே காற்று அளவீடு, வயதுக்கு ஏற்ப 4 விதமாக விளக்கப்படுகிறது.',
    scaleGuideBtn: 'அளவீட்டு வழிகாட்டி',
    refreshBtn: 'புதுப்பி',
    refreshing: 'புதுப்பிக்கப்படுகிறது...',
    quickSelect: 'விரைவு தேர்வு:',
    searchPlaceholder: 'நகரத்தை தேடவும் (எ.கா. சென்னை, மதுரை)...',
    modelEstimateBadge: 'மாதிரி மதிப்பீடு',
    camsSourceAttribution: 'CAMS Global (ECMWF) Open-Meteo வழியாக',
    dominantPollutant: 'முக்கிய மாசு காரணி',
    activeScale: 'பயன்பாட்டில் உள்ள அளவு',
    cpcbScaleName: 'இந்திய CPCB NAQI',
    keyPollutantsTitle: 'முக்கிய காற்று மாசு அளவுகள்',
    keyPollutantsSubtitle: 'CPCB துணை குறியீட்டுடன் கூடிய துல்லியமான சுற்றுச்சூழல் அளவீடுகள்',
    meteorologicalTitle: 'தற்போதைய வானிலை சூழல்',
    timelineTitle: '24-மணி நேர முன்னறிவிப்பு',
    timelineSubtitle: 'மணிநேர மாசு அளவுகள் மற்றும் வெப்பநிலை முன்னறிவிப்பு (CAMS மாதிரி)',
    timelineScrollHint: 'அடுத்தடுத்த மணிநேரங்களை பார்க்க பக்கவாட்டில் நகர்த்தவும்',
    temperature: 'வெப்பநிலை',
    humidity: 'காற்றின் ஈரப்பதம்',
    windSpeed: 'காற்றின் வேகம்',
    windDirection: 'காற்றின் திசை',
    profilesTitle: 'குடும்ப காற்று சுயவிவரங்கள்',
    profilesSubtitle: 'வயதுக்கு ஏற்ற தனிப்பயன் விளக்கங்களைப் பெற குடும்ப உறுப்பினர்களைச் சேர்க்கவும்.',
    addMemberBtn: 'உறுப்பினரைச் சேர்க்க',
    editProfile: 'சுயவிவரத்தை திருத்து',
    deleteProfile: 'நீக்கு',
    saveProfile: 'சேமி',
    cancelBtn: 'ரத்து செய்',
    nameLabel: 'பெயர் / பட்டப்பெயர்',
    ageCategoryLabel: 'வயதுப் பிரிவு',
    childCat: 'குழந்தை',
    childAge: '12 வயதுக்கு உட்பட்டோர்',
    teenCat: 'இளம்பருவத்தினர்',
    teenAge: '13–17 வயது',
    adultCat: 'பெரியவர்',
    adultAge: '18–59 வயது',
    seniorCat: 'முதியவர்',
    seniorAge: '60+ வயது',
    whyAdviceBtn: 'இந்த விளக்கம் ஏன் காட்டப்படுகிறது?',
    askAiTitle: 'AirAware AI-யிடம் கேளுங்கள்',
    askAiSubtitle: 'இன்றைய உண்மைத் தரவுகளின் அடிப்படையில் பதிலளிக்கும். தேர்ந்தெடுக்கப்பட்ட சுயவிவரத்திற்கு ஏற்ப மாறும்.',
    chatPlaceholder: 'இன்றைய காற்று குறித்து கேள்வி கேளுங்கள்...',
    chatSendBtn: 'கேள்',
    accessibilityTitle: 'அணுகல்தன்மை & காட்சி',
    highContrast: 'உயர் மாறுபட்ட பயன்முறை (High Contrast)',
    textSize: 'எழுத்து அளவு',
    normalText: 'இயல்பான',
    largeText: 'பெரிய',
    extraLargeText: 'மிகப் பெரிய',
    dataLimitationsNotice: 'இது பிராந்திய மாதிரிகள் அடிப்படையிலான வழிகாட்டல் மட்டுமே. மருத்துவ ஆலோசனைக்கு மாற்றாகாது.',
    localStorageNotice: 'குடும்ப சுயவிவரங்கள் உங்கள் உலாவி சாதனத்தில் மட்டுமே பாதுகாப்பாக சேமிக்கப்படுகின்றன.',
    understoodBtn: 'புரிந்தது',
    plannerTitle: 'வெளியில் செல்ல உகந்த நேரத்தைக் கண்டறியுங்கள்',
    plannerSubtitle: '24 மணி நேர முன்னறிவிப்பை ஒப்பிட்டு ஒப்பீட்டளவில் சாதகமான வெளிப்புற நேரத்தைத் தேர்வு செய்யவும்.',
    activityLabel: 'செயல்பாடு',
    actWalking: 'நடைபயிற்சி',
    actRecreation: 'விளையாட்டு',
    actCycling: 'மிதிவண்டி',
    actGeneral: 'பொது வெளிப்புறம்',
    bestWindowBadge: 'ஒப்பீட்டளவில் மிகவும் சாதகமான நேரம்',
    whyThisTimeBtn: 'இந்த நேரம் ஏன்?',
    peakWindowBadge: 'அதிக மாசு நேரம்',
    compareHoursTitle: '24-மணி நேர முன்னறிவிப்பு ஒப்பீடு',
    compareHoursSubtitle: 'சிறந்த நேரத்துடன் ஒப்பிட எந்த மணிநேரத்தையும் கிளிக் செய்யவும்',
    selectHourPrompt: 'ஆராய ஒரு மணிநேரத்தைத் தேர்ந்தெடுக்கவும்',
    forecastDisclaimer: 'இது காற்று சூழல் முன்னறிவிப்பை மட்டுமே ஒப்பிடுகிறது; மருத்துவ தகுதியை அல்ல. எந்த நேரமும் முற்றிலும் மாசற்றது என்று நாங்கள் உறுதியளிக்கவில்லை.',
    favorableWindow: 'சாதகமான நேரம்',
    indoorAdvisorTitle: 'உங்கள் உள்ளக அறையை காற்று-விழிப்புணர்வுடன் மாற்றவும்',
    indoorAdvisorSubtitle: 'வெளிப்புறக் காற்று மற்றும் உங்கள் அறை அமைப்பைக் கொண்டு கணிக்கப்பட்ட நடைமுறை உள்ளக வழிகாட்டல்.',
    noSensorNotice: 'இவை வெளிப்புற காற்றுத் தரவு மற்றும் உங்கள் பதில்களின் அடிப்படையிலான பொதுவான உள்ளக ஆலோசனைகள் மட்டுமே. உண்மையான உள்ளக சென்சார் இல்லாமல் ஏர்அவேர் AI உள்ளக காற்றுத் தரத்தை அளவிடுவதில்லை.',
    setupPrompt: 'உங்கள் அறை அமைப்பை உள்ளிடவும் (விருப்பத்தேர்வு, பாதுகாப்பானது)',
    editSetup: 'அமைப்பை மாற்று',
    clearSetup: 'அமைப்பை நீக்கு',
    saveSetup: 'அமைப்பைச் சேமி',
    qVentilation: 'அறையில் இயற்கை காற்றோட்டம் உள்ளதா?',
    qWindows: 'ஜன்னல்கள் பெரும்பாலும் திறந்திருக்குமா அல்லது மூடியிருக்குமா?',
    qCooking: 'அருகில் சமையல் பணி நடைபெறுகிறதா?',
    qDustSmoke: 'கண்ணுக்குத் தெரியும் தூசு அல்லது புகை உள்ளதா?',
    qPurifier: 'காற்று சுத்திகரிப்பான் (Air Purifier) உள்ளதா?',
    qRoadFacing: 'அறை போக்குவரத்து மிகுந்த சாலையை நோக்கி உள்ளதா?',
    whySuggestionBtn: 'இந்த ஆலோசனை ஏன்?',
    outdoorContextLabel: 'வெளிப்புறக் காற்று சூழல்',
    userReportedLabel: 'உங்கள் அறை அமைப்பு',
    whatWeCannotDetermineLabel: 'ஏர்அவேர் AI தீர்மானிக்க முடியாதவை',
    noSensorWarning: 'உள்ளக சென்சார் இணைக்கப்படவில்லை',
  },
  hi: {
    appName: 'एयरअवेयर एआई (AirAware)',
    tagline: 'वही हवा। अलग-अलग लोग। व्यक्तिगत उत्तर।',
    phaseBanner: 'लाइव V2 · प्रोडक्शन रेडी',
    subHeaderTitle: 'वास्तविक समय पर्यावरणीय स्थिति',
    subHeaderSubtitle: 'CAMS (कोपरनिकस) मॉडल के प्रामाणिक डेटा और आधिकारिक CPCB NAQI गणना पर आधारित।',
    familyDashboardTitle: 'आज की हवा मेरे परिवार के लिए क्या मायने रखती है?',
    familyDashboardSubtitle: 'एक ही प्रमाणित वायु रीडिंग, आयु के अनुसार 4 अलग-अलग दृष्टिकोणों में स्पष्ट।',
    scaleGuideBtn: 'स्केल गाइड',
    refreshBtn: 'ताज़ा करें',
    refreshing: 'अपडेट हो रहा है...',
    quickSelect: 'त्वरित चयन:',
    searchPlaceholder: 'शहर खोजें (उदा. दिल्ली, मुंबई)...',
    modelEstimateBadge: 'मॉडल अनुमान',
    camsSourceAttribution: 'CAMS Global (ECMWF) Open-Meteo द्वारा',
    dominantPollutant: 'प्रमुख प्रदूषक',
    activeScale: 'सक्रिय पैमाना',
    cpcbScaleName: 'भारतीय CPCB NAQI',
    keyPollutantsTitle: 'प्रमुख प्रदूषक सांद्रता',
    keyPollutantsSubtitle: 'CPCB सब-इंडेक्स और राष्ट्रीय मानकों के साथ वास्तविक पर्यावरणीय आंकड़े',
    meteorologicalTitle: 'वर्तमान मौसम की स्थिति',
    timelineTitle: '24-घंटे का पूर्वानुमान टाइमलाइन',
    timelineSubtitle: 'प्रति घंटा कण स्तर और तापमान अनुमान (CAMS मॉडल)',
    timelineScrollHint: 'आने वाले घंटों को देखने के लिए स्क्रॉल करें',
    temperature: 'तापमान',
    humidity: 'सापेक्षिक आर्द्रता',
    windSpeed: 'हवा की गति',
    windDirection: 'हवा की दिशा',
    profilesTitle: 'पारिवारिक वायु प्रोफाइल',
    profilesSubtitle: 'आयु-विशिष्ट पर्यावरणीय मार्गदर्शन प्राप्त करने के लिए परिवार के सदस्यों को जोड़ें।',
    addMemberBtn: 'सदस्य जोड़ें',
    editProfile: 'प्रोफाइल संपादित करें',
    deleteProfile: 'हटाएं',
    saveProfile: 'सुरक्षित करें',
    cancelBtn: 'रद्द करें',
    nameLabel: 'नाम / उपनाम',
    ageCategoryLabel: 'आयु वर्ग',
    childCat: 'बच्चा',
    childAge: '12 वर्ष से कम',
    teenCat: 'किशोर',
    teenAge: '13–17 वर्ष',
    adultCat: 'वयस्क',
    adultAge: '18–59 वर्ष',
    seniorCat: 'वरिष्ठ नागरिक',
    seniorAge: '60+ वर्ष',
    whyAdviceBtn: 'यह सलाह क्यों दिख रही है?',
    askAiTitle: 'AirAware AI से पूछें',
    askAiSubtitle: 'आज के वास्तविक मापों पर आधारित। चुने गए परिवार के सदस्य के अनुसार अनुकूलित।',
    chatPlaceholder: 'आज की हवा के बारे में प्रश्न पूछें...',
    chatSendBtn: 'पूछें',
    accessibilityTitle: 'सुलभता एवं प्रदर्शन',
    highContrast: 'हाई कंट्रास्ट मोड',
    textSize: 'फ़ॉन्ट आकार',
    normalText: 'सामान्य',
    largeText: 'बड़ा',
    extraLargeText: 'अति बड़ा',
    dataLimitationsNotice: 'यह क्षेत्रीय मॉडल पूर्वानुमान पर आधारित सामान्य मार्गदर्शन है। यह व्यक्तिगत चिकित्सीय परामर्श का स्थान नहीं लेता।',
    localStorageNotice: 'पारिवारिक प्रोफाइल केवल आपके ब्राउज़र में सुरक्षित रूप से सहेजे जाते हैं।',
    understoodBtn: 'समझ गया',
    plannerTitle: 'बाहर जाने का बेहतर समय खोजें',
    plannerSubtitle: '24 घंटे के प्रति घंटा पूर्वानुमान की तुलना करके अपेक्षाकृत अधिक अनुकूल समय चुनें।',
    activityLabel: 'गतिविधि',
    actWalking: 'टहलना',
    actRecreation: 'खेल-कूद',
    actCycling: 'साइकिल चलाना',
    actGeneral: 'सामान्य बाहरी कार्य',
    bestWindowBadge: 'अपेक्षाकृत सबसे अनुकूल समय',
    whyThisTimeBtn: 'यही समय क्यों?',
    peakWindowBadge: 'उच्चतम प्रदूषण समय',
    compareHoursTitle: '24-घंटे का पूर्वानुमान तुलना चार्ट',
    compareHoursSubtitle: 'सर्वोत्तम समय से तुलना करने के लिए किसी भी घंटे पर क्लिक करें',
    selectHourPrompt: 'जांचने के लिए कोई भी घंटा चुनें',
    forecastDisclaimer: 'यह योजना केवल पर्यावरणीय पूर्वानुमान की तुलना करती है; चिकित्सीय फिटनेस का नहीं। कोई भी समय पूरी तरह प्रदूषण-मुक्त नहीं बताया जाता।',
    favorableWindow: 'अनुकूल समय',
    indoorAdvisorTitle: 'अपने इनडोर वातावरण को बनाएं वायु-सचेत',
    indoorAdvisorSubtitle: 'बाहरी वायु गुणवत्ता और आपके कमरे की स्थिति के आधार पर व्यावहारिक इनडोर मार्गदर्शन।',
    noSensorNotice: 'ये उपलब्ध बाहरी वायु डेटा और आपके उत्तरों पर आधारित सामान्य इनडोर सुझाव हैं। एयरअवेयर एआई वास्तविक इनडोर सेंसर के बिना इनडोर वायु गुणवत्ता को नहीं मापता है।',
    setupPrompt: 'अपने कमरे का विवरण दर्ज करें (वैकल्पिक, गैर-संवेदनशील)',
    editSetup: 'विवरण बदलें',
    clearSetup: 'विवरण हटाएं',
    saveSetup: 'विवरण सुरक्षित करें',
    qVentilation: 'क्या कमरे में प्राकृतिक वेंटिलेशन है?',
    qWindows: 'खिड़कियां आमतौर पर खुली रहती हैं या बंद?',
    qCooking: 'क्या पास में खाना पकाया जाता है?',
    qDustSmoke: 'क्या धूल या धुआं दिखाई देता है?',
    qPurifier: 'क्या एयर प्यूरीफायर उपलब्ध है?',
    qRoadFacing: 'क्या कमरा व्यस्त सड़क की ओर है?',
    whySuggestionBtn: 'यह सुझाव क्यों?',
    outdoorContextLabel: 'बाहरी वायु स्थिति',
    userReportedLabel: 'आपके कमरे की स्थिति',
    whatWeCannotDetermineLabel: 'एयरअवेयर एआई क्या निर्धारित नहीं कर सकता',
    noSensorWarning: 'कोई इनडोर सेंसर कनेक्टेड नहीं है',
  },
};
