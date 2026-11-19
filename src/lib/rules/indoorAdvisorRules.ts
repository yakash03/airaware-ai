// AirAware AI V2 — Deterministic Indoor Air Advisor Engine
// Synthesizes verified outdoor data with user-provided indoor environment settings.
// Strictly non-sensor: never claims to measure indoor AQI or PM2.5.
// Strictly non-medical: general home environmental hygiene only.

import {
  IndoorEnvironmentSetup,
  IndoorSuggestion,
  IndoorAdvisorPlan,
  ProfileCategory,
  Language,
  PollutantId,
  DataType,
} from '../types';

export const DEFAULT_INDOOR_SETUP: IndoorEnvironmentSetup = {
  naturallyVentilated: null,
  windowsStatus: null,
  cookingNearby: null,
  visibleDustOrSmoke: null,
  airPurifierAvailable: null,
  roadFacingArea: null,
};

export function calculateIndoorGuidance(
  setup: IndoorEnvironmentSetup,
  outdoorAqi: number | null,
  outdoorCategory: string | null,
  dominantPollutant: PollutantId | null,
  profileCategory: ProfileCategory = 'ADULT',
  language: Language = 'en',
  locationName: string = 'Current Location'
): IndoorAdvisorPlan {
  const fetchedAt = new Date().toISOString();
  const hasSetup = Object.values(setup).some((v) => v !== null && v !== undefined);

  const disclaimer =
    language === 'ta'
      ? 'இவை வெளிப்புற காற்றுத் தரவு மற்றும் உங்கள் பதில்களின் அடிப்படையிலான பொதுவான உள்ளக ஆலோசனைகள் மட்டுமே. உண்மையான உள்ளக சென்சார் இல்லாமல் ஏர்அவேர் AI உள்ளக காற்றுத் தரத்தை அளவிடுவதில்லை.'
      : language === 'hi'
      ? 'ये उपलब्ध बाहरी वायु डेटा और आपके उत्तरों पर आधारित सामान्य इनडोर सुझाव हैं। एयरअवेयर एआई वास्तविक इनडोर सेंसर के बिना इनडोर वायु गुणवत्ता को नहीं मापता है।'
      : 'These are general indoor-air suggestions based on available outdoor data and your answers. AirAware AI does not measure indoor air quality without a compatible sensor.';

  const suggestions: IndoorSuggestion[] = [];

  const outdoorContextStr =
    outdoorAqi !== null
      ? `Outdoor IN NAQI is ${outdoorAqi} (${outdoorCategory ?? 'Moderate'}), with ${dominantPollutant?.toUpperCase().replace('_', '.') ?? 'particulates'} as the dominant factor.`
      : 'Outdoor air quality data is currently limited.';

  const cannotDetermineDefault = [
    'Actual indoor air change per hour (ACH) or ventilation rate.',
    'Presence of volatile organic compounds (VOCs) or carbon monoxide from unmonitored indoor sources.',
    'Room dimensions, ceiling height, and real-time localized particulate concentration.',
  ];

  // 1. Ventilation & Window Management Rule
  if (outdoorAqi !== null && outdoorAqi > 120) {
    if (setup.windowsStatus === 'OPEN') {
      suggestions.push({
        id: 'sug-vent-close',
        category: 'VENTILATION',
        title: language === 'ta' ? 'வெளிப்புற மாசு நேரத்தில் ஜன்னல்களை மூடி வைக்கவும்' : language === 'hi' ? 'उच्च बाहरी प्रदूषण के दौरान खिड़कियां बंद रखें' : 'Keep Windows Closed During High Outdoor Pollution',
        advice: language === 'ta'
          ? 'வெளிப்புறக் காற்று மாசு அதிகமாக இருப்பதால் (NAQI ' + outdoorAqi + '), வெளிப்புற துகள்கள் உள்ளே வருவதைத் தவிர்க்க ஜன்னல்களை மூடி வைக்கவும்.'
          : language === 'hi'
          ? 'बाहरी वायु प्रदूषण (NAQI ' + outdoorAqi + ') अधिक होने पर बाहरी कणों को घर में आने से रोकने के लिए खिड़कियां बंद रखें।'
          : `With outdoor air in the ${outdoorCategory ?? 'Moderate'} category (NAQI ${outdoorAqi}), keeping windows closed limits outdoor particulate infiltration into your living space.`,
        priority: 'HIGH',
        icon: '🪟',
        ageGuidance: getAgeSpecificWindowAdvice(profileCategory, 'CLOSE_WINDOWS', language),
        whySuggestion: {
          outdoorConditionContext: outdoorContextStr,
          indoorUserFactor: 'User reported windows are currently open.',
          reasoning: 'Outdoor particulate matter penetrates naturally ventilated structures when external concentrations exceed indoor levels.',
          outdoorSource: 'Copernicus Atmosphere Monitoring Service (CAMS) via Open-Meteo',
          dataType: 'MODEL_ESTIMATE',
          whatWeCannotDetermine: cannotDetermineDefault,
        },
      });
    } else {
      suggestions.push({
        id: 'sug-vent-timing',
        category: 'VENTILATION',
        title: language === 'ta' ? 'திட்டமிடப்பட்ட குறுகிய நேர காற்றோட்டம்' : language === 'hi' ? 'नियंत्रित और समयबद्ध वेंटिलेशन' : 'Controlled & Timed Ventilation',
        advice: language === 'ta'
          ? 'முற்றிலும் மூடி வைப்பது உள்ளக கார்பன் டை ஆக்சைடை அதிகரிக்கலாம்; எனவே சமையலுக்குப் பின் குறுகிய நேரம் மட்டும் எதிரெதிர் ஜன்னல்களைத் திறந்து காற்றோட்டம் ஏற்படுத்தவும்.'
          : language === 'hi'
          ? 'कमरे को पूरी तरह सील करने से इनडोर CO₂ बढ़ सकता है; अतः खाना पकाने के बाद केवल कुछ समय के लिए क्रॉस-वेंटिलेशन करें।'
          : 'Completely sealing rooms can trap indoor humidity and carbon dioxide. Use brief 5-minute cross-ventilation periods during hours with lower traffic.',
        priority: 'MEDIUM',
        icon: '💨',
        ageGuidance: getAgeSpecificWindowAdvice(profileCategory, 'TIMED_VENT', language),
        whySuggestion: {
          outdoorConditionContext: outdoorContextStr,
          indoorUserFactor: 'Windows are closed or managed by time.',
          reasoning: 'Balancing indoor oxygenation against outdoor particulate ingress requires controlled, intermittent airflow.',
          outdoorSource: 'Open-Meteo CAMS',
          dataType: 'MODEL_ESTIMATE',
          whatWeCannotDetermine: cannotDetermineDefault,
        },
      });
    }
  } else if (outdoorAqi !== null && outdoorAqi <= 100) {
    suggestions.push({
      id: 'sug-vent-open-favorable',
      category: 'VENTILATION',
      title: language === 'ta' ? 'வெளிப்புறக் காற்று சாதகமாக உள்ள போது ஜன்னல்களைத் திறக்கவும்' : language === 'hi' ? 'अनुकूल बाहरी मौसम में खिड़कियां खोलें' : 'Favorable Outdoor Air: Fresh Air Flush',
      advice: language === 'ta'
        ? 'வெளிப்புறக் காற்று திருப்திகரமாக உள்ளது (NAQI ' + outdoorAqi + '). உள்ளக காற்றை மாற்ற ஜன்னல்களைத் திறந்து புதிய காற்றோட்டம் பெறலாம்.'
        : language === 'hi'
        ? 'बाहरी हवा संतोषजनक स्थिति (NAQI ' + outdoorAqi + ') में है। घर के अंदर ताजी हवा लाने के लिए खिड़कियां खोलना अनुकूल है।'
        : `Outdoor air is currently in the ${outdoorCategory ?? 'Satisfactory'} range (NAQI ${outdoorAqi}). Opening windows allows natural replacement of stagnant indoor air.`,
      priority: 'MEDIUM',
      icon: '🍃',
      ageGuidance: getAgeSpecificWindowAdvice(profileCategory, 'OPEN_WINDOWS', language),
      whySuggestion: {
        outdoorConditionContext: outdoorContextStr,
        indoorUserFactor: 'Natural ventilation preference.',
        reasoning: 'When outdoor particulate levels are low, outdoor air exchange flushes out indoor accumulation of dust and moisture.',
        outdoorSource: 'Open-Meteo CAMS',
        dataType: 'MODEL_ESTIMATE',
        whatWeCannotDetermine: cannotDetermineDefault,
      },
    });
  }

  // 2. Cooking Exhaust & Kitchen Proximity Rule
  if (setup.cookingNearby === 'YES' || setup.cookingNearby === 'OCCASIONALLY') {
    suggestions.push({
      id: 'sug-cooking-exhaust',
      category: 'COOKING_EXHAUST',
      title: language === 'ta' ? 'சமையல் புகை மற்றும் வெளியேற்றும் விசிறி பயன்பாடு' : language === 'hi' ? 'रसोई का धुआं और एग्जॉस्ट फैन का उपयोग' : 'Kitchen Exhaust & Smoke Isolation',
      advice: language === 'ta'
        ? 'சமையல் செய்யும் போது எண்ணெய் புகை மற்றும் துகள்கள் உருவாகின்றன. வெளியேற்றும் விசிறியை (Exhaust Fan) இயக்கி, சமையலறை கதவை மூடி வைக்கவும்.'
        : language === 'hi'
        ? 'खाना पकाने से तेल के कण और महीन धुआं उत्पन्न होता है। एग्जॉस्ट फैन का प्रयोग करें और संभव हो तो रसोई का दरवाजा बंद रखें।'
        : 'Cooking oils and gas combustion release fine aerosols and PM2.5 indoors. Always engage the range hood/exhaust fan and isolate living areas during active cooking.',
      priority: 'HIGH',
      icon: '🍳',
      ageGuidance: getAgeSpecificCookingAdvice(profileCategory, language),
      whySuggestion: {
        outdoorConditionContext: outdoorContextStr,
        indoorUserFactor: 'Cooking activity reported nearby.',
        reasoning: 'Unvented high-heat frying and cooking can elevate indoor PM2.5 concentrations several-fold above baseline levels.',
        outdoorSource: 'Open-Meteo CAMS (for outdoor baseline reference)',
        dataType: 'MODEL_ESTIMATE',
        whatWeCannotDetermine: [
          'Kitchen ventilation cubic feet per minute (CFM) capacity.',
          'Type of cooking fuel (LPG, induction, solid biomass).',
        ],
      },
    });
  }

  // 3. Road-Facing Traffic Buffer Rule
  if (setup.roadFacingArea === 'YES') {
    suggestions.push({
      id: 'sug-road-buffer',
      category: 'ROAD_EXPOSURE',
      title: language === 'ta' ? 'சாலை நெரிசல் நேரங்களில் முன்னெச்சரிக்கை' : language === 'hi' ? 'सड़क किनारे रहने पर ट्रैफिक समय में सावधानी' : 'Traffic Rush-Hour Buffer',
      advice: language === 'ta'
        ? 'சாலை ஓரங்களில் வாகனப் புகை (NO₂ மற்றும் டீசல் துகள்கள்) காலை மற்றும் மாலை நேரங்களில் அதிகம் இருக்கும். அந்த நேரங்களில் சாலைப் பக்க ஜன்னல்களை மூடவும்.'
        : language === 'hi'
        ? 'सड़क किनारे सुबह और शाम के ट्रैफिक समय वाहनों का धुआं अधिक होता है। व्यस्ततम समय में सड़क की तरफ की खिड़कियां बंद रखें।'
        : 'Vehicular corridors generate localized spikes of nitrogen dioxide (NO2) and fine carbon particles during peak commute hours (08:00–10:00, 17:00–20:00). Keep road-facing apertures closed during rush hours.',
      priority: 'HIGH',
      icon: '🚗',
      ageGuidance: getAgeSpecificRoadAdvice(profileCategory, language),
      whySuggestion: {
        outdoorConditionContext: outdoorContextStr,
        indoorUserFactor: 'Room is connected to a busy road-facing area.',
        reasoning: 'Distance from active vehicular emission sources directly dictates local ultra-fine particle concentrations.',
        outdoorSource: 'Open-Meteo CAMS',
        dataType: 'MODEL_ESTIMATE',
        whatWeCannotDetermine: [
          'Exact distance from road centerline.',
          'Traffic volume, diesel vehicle percentage, and sound barriers.',
        ],
      },
    });
  }

  // 4. Dust & Particulate Management Rule
  if (setup.visibleDustOrSmoke === 'YES' || setup.visibleDustOrSmoke === 'SOMETIMES') {
    suggestions.push({
      id: 'sug-dust-wet-mop',
      category: 'DUST_MANAGEMENT',
      title: language === 'ta' ? 'ஈரத்துணி துடைப்பு மற்றும் துகள் கட்டுப்பாடு' : language === 'hi' ? 'गीले पोंछे से सफाई और धूल नियंत्रण' : 'Damp Wiping & Dust Settling',
      advice: language === 'ta'
        ? 'உலர் துடைப்பம் பயன்படுத்துவது தூசியை மீண்டும் காற்றில் கலக்கச் செய்யும்; எனவே ஈரத்துணியால் தரையைத் துடைத்து மேற்பரப்புகளைச் சுத்தம் செய்யவும்.'
        : language === 'hi'
        ? 'सूखा झाड़ू लगाने से धूल हवा में दोबारा उड़ती है; सतहों को नम कपड़े से पोंछें और गीला पोंछा लगाएं।'
        : 'Dry sweeping re-suspends settled coarse particles (PM10) and allergens into your breathing zone. Prioritize damp microfiber cloths and wet mopping.',
      priority: 'MEDIUM',
      icon: '🧹',
      ageGuidance: getAgeSpecificDustAdvice(profileCategory, language),
      whySuggestion: {
        outdoorConditionContext: outdoorContextStr,
        indoorUserFactor: 'Visible dust or smoke reported indoors.',
        reasoning: 'Mechanical agitation of dry dust resuspends particulates that gravity had previously removed from the air.',
        outdoorSource: 'Open-Meteo CAMS',
        dataType: 'MODEL_ESTIMATE',
        whatWeCannotDetermine: [
          'Indoor dust composition (mineral dust vs. organic pet dander vs. soot).',
        ],
      },
    });
  }

  // 5. Air Purifier Strategy Rule
  if (setup.airPurifierAvailable === 'YES') {
    suggestions.push({
      id: 'sug-purifier-opt',
      category: 'PURIFIER_USAGE',
      title: language === 'ta' ? 'காற்று சுத்திகரிப்பான் (Air Purifier) சரியான பயன்பாடு' : language === 'hi' ? 'एयर प्यूरीफायर का सही स्थान और उपयोग' : 'Air Purifier Positioning & Operation',
      advice: language === 'ta'
        ? 'சுத்திகரிப்பானை அதிகம் நேரம் செலவிடும் அறையில் வைக்கவும். இயங்கும் போது ஜன்னல்களை மூடி வைக்கவும்; மாதமொருமுறை ப்ரீ-ஃபில்டரை சுத்தம் செய்யவும்.'
        : language === 'hi'
        ? 'प्यूरीफायर को उस कमरे में रखें जहां परिवार सबसे अधिक समय बिताता है। संचालन के दौरान खिड़कियां बंद रखें और फिल्टर नियमित जांचें।'
        : 'Operate the purifier in occupied rooms with closed doors and windows to avoid attempting to filter continuous outdoor air. Keep intake vents clear of curtains and walls.',
      priority: 'MEDIUM',
      icon: '🌀',
      ageGuidance: getAgeSpecificPurifierAdvice(profileCategory, language),
      whySuggestion: {
        outdoorConditionContext: outdoorContextStr,
        indoorUserFactor: 'Air purifier is available.',
        reasoning: 'HEPA purifiers recirculate room air; opening doors or windows diminishes clean air delivery rate (CADR) efficiency.',
        outdoorSource: 'Open-Meteo CAMS',
        dataType: 'MODEL_ESTIMATE',
        whatWeCannotDetermine: [
          'Purifier CADR rating relative to room cubic volume.',
          'Filter age, saturation level, and maintenance history.',
        ],
      },
    });
  }

  // 6. Baseline General Practice Rule (Always included)
  suggestions.push({
    id: 'sug-general-clean',
    category: 'GENERAL_PRACTICE',
    title: language === 'ta' ? 'உள்ளக காற்றுத் தூய்மை பழக்கவழக்கங்கள்' : language === 'hi' ? 'इनडोर वायु स्वच्छता की सामान्य आदतें' : 'Indoor Air Cleanliness Practices',
    advice: language === 'ta'
      ? 'வீட்டுக்குள் சாம்பிராணி, ஊதுபத்தி அல்லது கொசு சுருள்கள் ஏற்றுவதைத் தவிர்க்கவும். இவை அதிக அளவு PM2.5 துகள்களை உருவாக்குகின்றன.'
      : language === 'hi'
      ? 'कमरे में अगरबत्ती या मच्छर भगाने वाली कॉइल जलाने से बचें; ये अत्यधिक मात्रा में महीन धुआं और PM2.5 उत्पन्न करती हैं।'
      : 'Avoid combustion sources indoors such as incense, mosquito coils, or scented candles, which emit substantial PM2.5 and fine hydrocarbons.',
    priority: 'LOW',
    icon: '🕯️',
    ageGuidance: getAgeSpecificGeneralAdvice(profileCategory, language),
    whySuggestion: {
      outdoorConditionContext: outdoorContextStr,
      indoorUserFactor: 'Universal indoor environmental principle.',
      reasoning: 'Indoor combustion produces fine particles that linger in enclosed spaces regardless of outdoor weather.',
      outdoorSource: 'WHO 2021 Indoor Air Quality Guidelines',
      dataType: 'MEASURED',
      whatWeCannotDetermine: [
        'Frequency of cultural or domestic incense/candle use.',
      ],
    },
  });

  // Family Summary
  const familySummary = generateFamilySummary(profileCategory, suggestions.length, outdoorAqi, language);

  return {
    location: locationName,
    fetchedAt,
    profileCategory,
    language,
    setup,
    hasSetup,
    outdoorAqi,
    outdoorCategory,
    dominantPollutant,
    suggestions,
    familySummary,
    disclaimer,
  };
}

// Age-specific helpers for localized guidance
function getAgeSpecificWindowAdvice(category: ProfileCategory, type: string, lang: Language): string {
  if (lang === 'ta') {
    switch (category) {
      case 'CHILD': return 'குழந்தைகள் விளையாடும் அறையின் ஜன்னல்களைப் பெரியவர்கள் கவனித்து மூடவும்.';
      case 'TEEN': return 'படிக்கும் அறையில் புதிய காற்று தேவைப்பட்டால் உகந்த நேரத்தில் மட்டும் ஜன்னலைத் திறக்கவும்.';
      case 'SENIOR': return 'தூசு மற்றும் சளி தொந்தரவைத் தவிர்க்க குளிர்ந்த வெளிப்புறக் காற்று வீசும் போது ஜன்னல்களை மூடி வைக்கவும்.';
      default: return 'வெளிப்புற மாசு உச்சத்தில் இருக்கும் போது ஜன்னல்களை மூடி, உள்ளக துகள் சுமையை குறைக்கவும்.';
    }
  }
  if (lang === 'hi') {
    switch (category) {
      case 'CHILD': return 'बच्चों के खेलने के कमरे की खिड़कियां प्रदूषण के समय बंद रखें।';
      case 'TEEN': return 'पढ़ाई के कमरे में ताजी हवा के लिए केवल अनुकूल समय पर खिड़की खोलें।';
      case 'SENIOR': return 'धूल और ठंड से बचने के लिए उच्च प्रदूषण के समय खिड़कियां बंद रखें।';
      default: return 'उच्च बाहरी प्रदूषण के समय खिड़कियां बंद रखकर इनडोर वायु को सुरक्षित रखें।';
    }
  }
  switch (category) {
    case 'CHILD': return 'Keep children’s play and sleep spaces protected from outside dust drafts.';
    case 'TEEN': return 'Time study-room ventilation during forecast clean windows to maintain alertness.';
    case 'SENIOR': return 'Avoid cold, dusty drafts by keeping bedroom windows closed during rush hours.';
    default: return 'Balance indoor carbon dioxide levels against outdoor particulate entry with timed ventilation.';
  }
}

function getAgeSpecificCookingAdvice(category: ProfileCategory, lang: Language): string {
  if (lang === 'ta') {
    switch (category) {
      case 'CHILD': return 'சமையல் செய்யும் போது குழந்தைகளை சமையலறை புகையிலிருந்து தள்ளி இருக்கச் செய்யவும்.';
      case 'SENIOR': return 'எண்ணெய் தாளிக்கும் காரமான புகையிலிருந்து விலகி காற்றோட்டமான அறையில் ஓய்வெடுக்கவும்.';
      default: return 'சமையலறை வெளியேற்றும் விசிறியை தவறாமல் இயக்கி வாழ்க்கை அறைகளை புகையிலிருந்து பிரிக்கவும்.';
    }
  }
  if (lang === 'hi') {
    switch (category) {
      case 'CHILD': return 'खाना बनते समय बच्चों को रसोई के धुएं से दूर रखें।';
      case 'SENIOR': return 'छौंक या तेल के धुएं से दूर हवादार कमरे में बैठें।';
      default: return 'रसोई का एग्जॉस्ट फैन अवश्य चलाएं और धुआं कमरों में न फैलने दें।';
    }
  }
  switch (category) {
    case 'CHILD': return 'Ensure kids remain in living rooms away from active frying or oil smoke.';
    case 'SENIOR': return 'Rest in well-ventilated rooms away from spicy cooking fumes and sputtering oil.';
    default: return 'Use kitchen extraction hoods to isolate cooking aerosols from living quarters.';
  }
}

function getAgeSpecificRoadAdvice(category: ProfileCategory, lang: Language): string {
  if (lang === 'ta') {
    return 'சாலைப் பக்கமுள்ள அறைகளில் வாகன நெரிசல் நேரங்களில் கதவு ஜன்னல்களை மூடி வைக்கவும்.';
  }
  if (lang === 'hi') {
    return 'सड़क किनारे वाले कमरों में व्यस्त ट्रैफिक समय खिड़कियां बंद रखें।';
  }
  return 'Keep road-facing rooms buffered from vehicular exhaust during peak morning and evening traffic.';
}

function getAgeSpecificDustAdvice(category: ProfileCategory, lang: Language): string {
  if (lang === 'ta') {
    return 'குழந்தைகள் தரையில் விளையாடுவதால், ஈரத்துணியால் தரையை துடைத்து சுத்தமாக வைக்கவும்.';
  }
  if (lang === 'hi') {
    return 'बच्चे फर्श पर खेलते हैं, इसलिए सूखे झाड़ू के बजाय गीले पोंछे से सफाई करें।';
  }
  return 'Damp mopping prevents settling particles from being resuspended into floor-level breathing zones.';
}

function getAgeSpecificPurifierAdvice(category: ProfileCategory, lang: Language): string {
  if (lang === 'ta') {
    return 'சுத்திகரிப்பானை குழந்தைகள் மற்றும் முதியவர்கள் தூங்கும் அறைகளில் முன்னுரிமை கொடுத்து வைக்கவும்.';
  }
  if (lang === 'hi') {
    return 'प्यूरीफायर को बच्चों या वरिष्ठ नागरिकों के शयनकक्ष में प्राथमिकता दें।';
  }
  return 'Prioritize purifier operation in bedrooms where family members spend 7–8 continuous hours.';
}

function getAgeSpecificGeneralAdvice(category: ProfileCategory, lang: Language): string {
  if (lang === 'ta') {
    return 'வீட்டுக்குள் தூசு மற்றும் புகையை உண்டாக்கும் பொருட்களைத் தவிர்த்து தூய்மையை பராமரிக்கவும்.';
  }
  if (lang === 'hi') {
    return 'कमरे के अंदर धुआं उत्पन्न करने वाली चीजों से बचें और स्वच्छता बनाए रखें।';
  }
  return 'Eliminating indoor combustion sources is the simplest universal step to maintain baseline air purity.';
}

function generateFamilySummary(
  category: ProfileCategory,
  count: number,
  outdoorAqi: number | null,
  lang: Language
): { headline: string; overview: string; keyAction: string } {
  if (lang === 'ta') {
    return {
      headline: `${category} பயன்முறைக்கான உள்ளக வழிகாட்டல் (${count} பரிந்துரைகள்)`,
      overview: `வெளிப்புற NAQI ${outdoorAqi ?? '--'} மற்றும் உங்கள் உள்ளக சூழல் பதில்களை இணைத்து இப்பரிந்துரைகள் கணிக்கப்பட்டுள்ளன.`,
      keyAction: 'சமையல் வெளியேற்றும் விசிறியைப் பயன்படுத்துங்கள் மற்றும் ஈரத்துணியால் தூசியைக் கட்டுப்படுத்துங்கள்.',
    };
  }
  if (lang === 'hi') {
    return {
      headline: `${category} मोड के लिए इनडोर मार्गदर्शन (${count} सुझाव)`,
      overview: `बाहरी NAQI ${outdoorAqi ?? '--'} और आपके इनडोर उत्तरों के आधार पर ये सुझाव तैयार किए गए हैं।`,
      keyAction: 'रसोई में एग्जॉस्ट फैन का प्रयोग करें और गीले पोंछे से सफाई प्राथमिकता दें।',
    };
  }
  return {
    headline: `Indoor Strategy for ${category} Profile (${count} Actionable Insights)`,
    overview: `Grounded in outdoor conditions (NAQI ${outdoorAqi ?? '--'}) combined with your reported indoor layout.`,
    keyAction: 'Prioritize kitchen exhaust and damp microfiber wiping over dry sweeping.',
  };
}
