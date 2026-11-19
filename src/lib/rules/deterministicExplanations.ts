// AirAware AI V2 — Deterministic Age-Adaptive Explanation Engine
// Grounded strictly in verified CPCB categories, live concentrations, and WHO guidance
// Supports English, Tamil, and Hindi for CHILD, TEEN, ADULT, and SENIOR

import { AirSnapshot, ProfileCategory, Language, AgeExplanation } from '../types';
import { POLLUTANT_METADATA } from '../normalize/units';

export function generateDeterministicExplanation(
  snapshot: AirSnapshot,
  category: ProfileCategory,
  language: Language = 'en'
): AgeExplanation {
  const aqiVal = snapshot.computedAqi?.value ?? null;
  const aqiCategory = snapshot.computedAqi?.category ?? 'Moderate';
  const dominant = snapshot.computedAqi?.dominantPollutant ?? 'pm2_5';
  const dominantMeta = POLLUTANT_METADATA[dominant];
  const dominantMeasurement = snapshot.current.find((m) => m.pollutant === dominant);
  const dominantValue = dominantMeasurement?.value;
  const dominantUnit = dominantMeasurement?.unit;

  // Determine caution level from CPCB category
  let cautionLevel: AgeExplanation['cautionLevel'] = 'MODERATE';
  if (aqiCategory === 'Good') cautionLevel = 'LOW';
  else if (aqiCategory === 'Satisfactory') cautionLevel = 'LOW';
  else if (aqiCategory === 'Moderate') cautionLevel = 'MODERATE';
  else if (aqiCategory === 'Poor') cautionLevel = 'HIGH';
  else if (aqiCategory === 'Very Poor' || aqiCategory === 'Severe') cautionLevel = 'VERY_HIGH';

  // Rule ID citation
  const deterministicRuleId = `CPCB-NAQI-2014-${aqiCategory.toUpperCase().replace(/\s+/g, '_')}`;
  const ruleCitation = `CPCB National Air Quality Index (2014) health category breakpoint: ${aqiCategory} (0–500 scale).`;

  const whyAdvice = {
    aqiValue: aqiVal,
    aqiCategory,
    dominantPollutant: dominant,
    dominantPollutantValue: dominantValue,
    dominantPollutantUnit: dominantUnit,
    scaleApplied: 'India National AQI (CPCB 2014 standard, 0–500)',
    dataSource: 'Copernicus Atmosphere Monitoring Service (CAMS) via Open-Meteo',
    dataType: 'MODEL_ESTIMATE' as const,
    observedAt: dominantMeasurement?.observedAt || snapshot.fetchedAt,
    ruleCitation,
    deterministicRuleId,
    dataLimitations: [
      'This reading is a ~40 km regional atmospheric model estimate, not an in-situ micro-sensor on your street.',
      'Weather conditions (wind shifts, sudden rainfall) can alter dispersion rapidly throughout the day.',
      'Indoor air quality may differ from outdoor readings depending on ventilation, cooking, and filtration.',
    ],
  };

  // Age-adapted explanations by language
  return buildExplanation(category, aqiVal, aqiCategory, dominantMeta?.formula || 'PM2.5', dominantValue, dominantUnit, cautionLevel, language, whyAdvice);
}

function buildExplanation(
  category: ProfileCategory,
  aqiVal: number | null,
  aqiCategory: string,
  dominantFormula: string,
  dominantValue: number | undefined,
  dominantUnit: string | undefined,
  cautionLevel: AgeExplanation['cautionLevel'],
  language: Language,
  whyAdvice: AgeExplanation['whyAdvice']
): AgeExplanation {
  // ----------------------------------------------------
  // ENGLISH
  // ----------------------------------------------------
  if (language === 'en') {
    if (category === 'CHILD') {
      return {
        profileCategory: 'CHILD',
        headline: aqiVal && aqiVal > 150 ? 'Dusty Air Day: Play Carefully' : 'Good Day for Some Fun Outside',
        summary: `The air today is in the ${aqiCategory} zone. Tiny specks in the air (${dominantFormula}) are floating around. Check with a parent before running outside for a long time.`,
        activityGuidance: aqiVal && aqiVal > 150
          ? 'Enjoy indoor games, drawing, or reading during peak afternoon hours. If playing outdoors, take water breaks.'
          : 'You can play outdoor sports and games! Drink water regularly and take rests when tired.',
        pollutantBreakdown: `The main particle in the air is ${dominantFormula} at ${dominantValue ?? '--'} ${dominantUnit ?? 'µg/m³'}.`,
        cautionLevel,
        language: 'en',
        whyAdvice,
      };
    }

    if (category === 'TEEN') {
      return {
        profileCategory: 'TEEN',
        headline: aqiVal && aqiVal > 150 ? 'Moderate Haze: Plan Outdoor Sessions' : 'Clear Skies for Commutes & Sports',
        summary: `Today's AQI is ${aqiVal ?? '--'} (${aqiCategory}), driven mainly by ${dominantFormula}. It’s a good day to keep an eye on when you do high-intensity sports or outdoor runs.`,
        activityGuidance: aqiVal && aqiVal > 150
          ? 'Consider scheduling heavy soccer, cycling, or outdoor gym sessions earlier in the morning or indoors if the afternoon feels hazy.'
          : 'Great conditions for cycling, outdoor practice, and commuting. Standard hydration recommended.',
        pollutantBreakdown: `${dominantFormula} is currently measured at ${dominantValue ?? '--'} ${dominantUnit ?? 'µg/m³'}, determining the dominant sub-index.`,
        cautionLevel,
        language: 'en',
        whyAdvice,
      };
    }

    if (category === 'ADULT') {
      return {
        profileCategory: 'ADULT',
        headline: `Air Quality: ${aqiCategory} (IN NAQI ${aqiVal ?? '--'})`,
        summary: `Current regional readings indicate ${aqiCategory} atmospheric quality with ${dominantFormula} (${dominantValue ?? '--'} ${dominantUnit ?? 'µg/m³'}) as the prominent pollutant. Normal healthy adults generally tolerate this range with moderate caution.`,
        activityGuidance: aqiVal && aqiVal > 150
          ? 'Maintain routine activities. Sensitive individuals or those experiencing respiratory irritation should moderate prolonged heavy outdoor exertion.'
          : 'Favorable conditions for routine outdoor exercise, jogging, and natural home ventilation.',
        pollutantBreakdown: `Dominant pollutant is ${dominantFormula} at ${dominantValue ?? '--'} ${dominantUnit ?? 'µg/m³'}. General guidance aligns with CPCB ${aqiCategory} advisory.`,
        cautionLevel,
        language: 'en',
        whyAdvice,
      };
    }

    // SENIOR
    return {
      profileCategory: 'SENIOR',
      headline: `Air Status: ${aqiCategory} — Easy-to-Read Summary`,
      summary: `The air quality is ${aqiCategory} today with an index of ${aqiVal ?? '--'}. The main pollutant is ${dominantFormula}.`,
      activityGuidance: aqiVal && aqiVal > 100
        ? 'Best to take morning walks at a gentle pace. Avoid dusty roads and stay hydrated throughout the day.'
        : 'Good conditions for leisurely morning or evening walks in quiet parks. Keep your usual routine.',
      pollutantBreakdown: `Main reading: ${dominantFormula} is ${dominantValue ?? '--'} ${dominantUnit ?? 'µg/m³'}.`,
      cautionLevel,
      language: 'en',
      whyAdvice,
    };
  }

  // ----------------------------------------------------
  // TAMIL (தமிழ்)
  // ----------------------------------------------------
  if (language === 'ta') {
    if (category === 'CHILD') {
      return {
        profileCategory: 'CHILD',
        headline: aqiVal && aqiVal > 150 ? 'தூசி நிறைந்த காற்று: கவனமாக விளையாடுங்கள்' : 'வெளியில் விளையாட நல்ல நாள்',
        summary: `இன்றைய காற்று ${aqiCategory} பிரிவில் உள்ளது. காற்றில் நுண்ணிய துகள்கள் (${dominantFormula}) உள்ளன. நீண்ட நேரம் வெளியில் ஓடி விளையாடும் முன் பெற்றோரிடம் கேளுங்கள்.`,
        activityGuidance: aqiVal && aqiVal > 150
          ? 'வீட்டிற்குள் அமர்ந்து வரையும் அல்லது படிக்கும் விளையாட்டுகளை விளையாடுங்கள். நிறைய தண்ணீர் குடியுங்கள்.'
          : 'வெளியில் விளையாடலாம்! தாகம் எடுக்கும் போது நீர் அருந்தி சிறிது ஓய்வெடுங்கள்.',
        pollutantBreakdown: `முக்கிய மாசு துகள்: ${dominantFormula} (${dominantValue ?? '--'} ${dominantUnit ?? 'µg/m³'}).`,
        cautionLevel,
        language: 'ta',
        whyAdvice,
      };
    }

    if (category === 'TEEN') {
      return {
        profileCategory: 'TEEN',
        headline: aqiVal && aqiVal > 150 ? 'மிதமான காற்று மாசு: உடற்பயிற்சியை திட்டமிடுங்கள்' : 'விளையாட்டு மற்றும் பயணத்திற்கு உகந்த காற்று',
        summary: `இன்றைய காற்று குறியீடு ${aqiVal ?? '--'} (${aqiCategory}). இதில் முக்கிய பங்கு வகிப்பது ${dominantFormula}. தீவிர வெளிப்புற விளையாட்டுகளின் நேரத்தை கவனமாக தேர்வு செய்யுங்கள்.`,
        activityGuidance: aqiVal && aqiVal > 150
          ? 'கடுமையான உடற்பயிற்சி அல்லது கால்பந்து விளையாட்டுகளை அதிக வெப்பம் அல்லது மதிய வேளைகளில் குறைத்துக் கொள்ளுங்கள்.'
          : 'சைக்கிள் ஓட்டுதல், விளையாட்டுப் பயிற்சிக்கு உகந்த சூழல். வழக்கமான நீர் அருந்துதல் போதுமானது.',
        pollutantBreakdown: `${dominantFormula} அளவு: ${dominantValue ?? '--'} ${dominantUnit ?? 'µg/m³'}.`,
        cautionLevel,
        language: 'ta',
        whyAdvice,
      };
    }

    if (category === 'ADULT') {
      return {
        profileCategory: 'ADULT',
        headline: `காற்று தரம்: ${aqiCategory} (IN NAQI ${aqiVal ?? '--'})`,
        summary: `இன்றைய பிராந்திய அளவீடு ${aqiCategory} நிலையில் உள்ளது. இதில் முதன்மை காரணியாக ${dominantFormula} (${dominantValue ?? '--'} ${dominantUnit ?? 'µg/m³'}) உள்ளது. ஆரோக்கியமான நபர்களுக்கு அன்றாட பணிகளில் பெரிய தடையில்லை.`,
        activityGuidance: aqiVal && aqiVal > 150
          ? 'வழக்கமான பணிகளை தொடரலாம். சுவாச ஒவ்வாமை உள்ளவர்கள் நீண்ட நேர வெளிப்புற தீவிர உடற்பயிற்சியை குறைப்பது நல்லது.'
          : 'வெளிப்புற நடைப்பயிற்சி மற்றும் இயற்கையான காற்றோட்டத்திற்கு உகந்த நாள்.',
        pollutantBreakdown: `முதன்மை மாசு: ${dominantFormula} (${dominantValue ?? '--'} ${dominantUnit ?? 'µg/m³'}). CPCB தரநிலையின்படி வகைப்படுத்தப்பட்டது.`,
        cautionLevel,
        language: 'ta',
        whyAdvice,
      };
    }

    // SENIOR (TAMIL)
    return {
      profileCategory: 'SENIOR',
      headline: `காற்று நிலை: ${aqiCategory} — எளிய குறிப்பு`,
      summary: `இன்றைய காற்று குறியீடு ${aqiVal ?? '--'} (${aqiCategory}). காற்றில் முக்கியமாக இருப்பது ${dominantFormula}.`,
      activityGuidance: aqiVal && aqiVal > 100
        ? 'காலை நடைப்பயிற்சியை மிதமான வேகத்தில் மேற்கொள்ளுங்கள். தூசு அதிகம் உள்ள சாலைகளை தவிர்த்து, போதுமான நீர் அருந்துங்கள்.'
        : 'பூங்காக்களில் அமைதியான காலை நடைப்பயிற்சிக்கு உகந்த சூழல் நிலவுகிறது.',
      pollutantBreakdown: `முக்கிய அளவு: ${dominantFormula} = ${dominantValue ?? '--'} ${dominantUnit ?? 'µg/m³'}.`,
      cautionLevel,
      language: 'ta',
      whyAdvice,
    };
  }

  // ----------------------------------------------------
  // HINDI (हिन्दी)
  // ----------------------------------------------------
  if (category === 'CHILD') {
    return {
      profileCategory: 'CHILD',
      headline: aqiVal && aqiVal > 150 ? 'हवा में थोड़ी धूल: सावधानी से खेलें' : 'बाहर खेलने के लिए अच्छा दिन',
      summary: `आज हवा ${aqiCategory} श्रेणी में है। हवा में सूक्ष्म कण (${dominantFormula}) मौजूद हैं। बाहर अधिक समय तक खेलने से पहले बड़ों से पूछें।`,
      activityGuidance: aqiVal && aqiVal > 150
        ? 'दोपहर के समय घर के अंदर खेलें या चित्र बनाएं। समय-समय पर पानी पीते रहें।'
        : 'आप बाहर खेल सकते हैं! खेलते समय पानी पीते रहें और थकने पर थोड़ा आराम करें।',
      pollutantBreakdown: `हवा में मुख्य कण: ${dominantFormula} (${dominantValue ?? '--'} ${dominantUnit ?? 'µg/m³'}).`,
      cautionLevel,
      language: 'hi',
      whyAdvice,
    };
  }

  if (category === 'TEEN') {
    return {
      profileCategory: 'TEEN',
      headline: aqiVal && aqiVal > 150 ? 'मध्यम प्रदूषण: वर्कआउट का समय तय करें' : 'खेलकूद और यात्रा के लिए अनुकूल दिन',
      summary: `आज का AQI ${aqiVal ?? '--'} (${aqiCategory}) है, जिसमें मुख्य प्रदूषक ${dominantFormula} है। आउटडोर स्पोर्ट्स और दौड़ने के समय का ध्यान रखें।`,
      activityGuidance: aqiVal && aqiVal > 150
        ? 'भारी फुटबॉल प्रैक्टिस या साइकलिंग सुबह जल्दी या शाम को करें जब हवा तुलनात्मक रूप से स्थिर हो।'
        : 'साइकिल चलाने, खेल अभ्यास और सामान्य आउटडोर गतिविधियों के लिए उपयुक्त मौसम है।',
      pollutantBreakdown: `${dominantFormula} की सांद्रता ${dominantValue ?? '--'} ${dominantUnit ?? 'µg/m³'} है।`,
      cautionLevel,
      language: 'hi',
      whyAdvice,
    };
  }

  if (category === 'ADULT') {
    return {
      profileCategory: 'ADULT',
      headline: `वायु गुणवत्ता: ${aqiCategory} (IN NAQI ${aqiVal ?? '--'})`,
      summary: `वर्तमान वायु गुणवत्ता ${aqiCategory} स्तर पर है, जिसमें प्रमुख प्रदूषक ${dominantFormula} (${dominantValue ?? '--'} ${dominantUnit ?? 'µg/m³'}) है। सामान्य स्वस्थ वयस्कों के लिए यह स्थिति नियंत्रित सावधानी के साथ अनुकूल है।`,
      activityGuidance: aqiVal && aqiVal > 150
        ? 'सामान्य दिनचर्या जारी रख सकते हैं। संवेदनशील श्वसन तंत्र वाले व्यक्ति लंबे समय तक भारी आउटडोर व्यायाम सीमित करें।'
        : 'दैनिक व्यायाम, जॉगिंग और घर में प्राकृतिक वेंटिलेशन के लिए अनुकूल परिस्थितियां।',
      pollutantBreakdown: `प्रमुख प्रदूषक: ${dominantFormula} (${dominantValue ?? '--'} ${dominantUnit ?? 'µg/m³'})। CPCB मानकों पर आधारित।`,
      cautionLevel,
      language: 'hi',
      whyAdvice,
    };
  }

  // SENIOR (HINDI)
  return {
    profileCategory: 'SENIOR',
    headline: `वायु स्थिति: ${aqiCategory} — संक्षिप्त विवरण`,
    summary: `आज वायु सूचकांक ${aqiVal ?? '--'} (${aqiCategory}) है। हवा में मुख्य तत्व ${dominantFormula} है।`,
    activityGuidance: aqiVal && aqiVal > 100
      ? 'सुबह की सैर धीमी गति से करें। धूल भरी सड़कों से बचें और पर्याप्त पानी पिएं।'
      : 'पार्क में शांत सुबह या शाम की सैर के लिए सुखद स्थिति है।',
    pollutantBreakdown: `मुख्य रीडिंग: ${dominantFormula} = ${dominantValue ?? '--'} ${dominantUnit ?? 'µg/m³'}।`,
    cautionLevel,
    language: 'hi',
    whyAdvice,
  };
}
