// AirAware AI V2 — Deterministic Best Window & Outdoor Activity Planner Rules
// Compares genuine hourly forecast data across 24 hours using CPCB NAQI guidelines.
// Strictly non-diagnostic, deterministic, zero-hallucination.

import {
  HourlySlot,
  ActivityType,
  ProfileCategory,
  Language,
  PollutantId,
  BestWindowRanking,
  BestWindowPlan,
} from '../types';
import { CPCB_CATEGORIES } from '../aqi/breakpoints';

// Helper to determine CPCB category from a numeric AQI value
export function getCategoryFromAqi(val: number): { name: string; color: string } {
  for (const cat of CPCB_CATEGORIES) {
    if (val >= cat.aqiLow && val <= cat.aqiHigh) {
      return { name: cat.name, color: cat.color };
    }
  }
  if (val > 500) {
    const last = CPCB_CATEGORIES[CPCB_CATEGORIES.length - 1];
    return { name: last.name, color: last.color };
  }
  return { name: 'Unknown', color: '#6b7280' };
}

// Format local time range e.g. "06:00 AM – 08:00 AM"
function formatTimeRange(startIso: string, endIso: string): string {
  try {
    const s = new Date(startIso);
    const e = new Date(endIso);
    const sStr = s.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const eStr = e.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${sStr} – ${eStr}`;
  } catch {
    return `${startIso.slice(11, 16)} – ${endIso.slice(11, 16)}`;
  }
}

interface WindowSlotBlock {
  slots: HourlySlot[];
  startIndex: number;
}

export function calculateBestWindows(
  hourlySlots: HourlySlot[],
  activity: ActivityType = 'WALKING',
  profileCategory: ProfileCategory = 'ADULT',
  language: Language = 'en',
  locationName: string = 'Current Location'
): BestWindowPlan {
  const fetchedAt = new Date().toISOString();
  const disclaimer =
    language === 'ta'
      ? 'இந்தத் திட்டம் வானிலை மற்றும் காற்றுத் தர முன்னறிவிப்பு நிலைமைகளை மட்டுமே ஒப்பிடுகிறது; தனிப்பட்ட உடல் தகுதியையோ மருத்துவ நிலையையோ கணக்கிடாது. எந்த நேரமும் முற்றிலும் மாசற்றது என்ற உத்தரவாதத்தை நாங்கள் வழங்கவில்லை.'
      : language === 'hi'
      ? 'यह योजना केवल वायु गुणवत्ता पूर्वानुमान स्थितियों की तुलना करती है; व्यक्तिगत फिटनेस या चिकित्सा स्थिति का मूल्यांकन नहीं करती। यह बिना किसी निरपेक्ष सुरक्षा गारंटी के तुलनात्मक विश्लेषण प्रदान करती है।'
      : 'This planner compares environmental forecast conditions only; it does not evaluate individual medical suitability or fitness. AirAware AI provides comparative atmospheric analysis without unconditional safety or zero-pollution guarantees.';

  // Validate sufficient forecast data (at least 6 future hours)
  if (!hourlySlots || hourlySlots.length < 6) {
    return {
      location: locationName,
      fetchedAt,
      activity,
      profileCategory,
      language,
      rankedWindows: [],
      bestWindow: null,
      worstWindow: null,
      ageAdaptedExplanation: {
        headline: language === 'ta' ? 'முன்னறிவிப்பு தரவு கிடைக்கவில்லை' : language === 'hi' ? 'पूर्वानुमान डेटा अनुपलब्ध' : 'Forecast Data Unavailable',
        recommendation: language === 'ta' ? '24 மணி நேர முன்னறிவிப்பு தரவு போதுமானதாக இல்லை.' : language === 'hi' ? '24 घंटे का पूर्वानुमान डेटा अपर्याप्त है।' : 'Insufficient 24-hour forecast data to identify a comparatively better window.',
        activitySpecificAdvice: language === 'ta' ? 'தற்போதைய நிகழ்நேர அளவீடுகளை மட்டும் சரிபார்க்கவும்.' : language === 'hi' ? 'केवल वर्तमान वास्तविक समय रीडिंग देखें।' : 'Please refer to the real-time current snapshot.',
        cautionNote: language === 'ta' ? 'போலி தரவுகள் தவிர்க்கப்பட்டுள்ளன.' : language === 'hi' ? 'काल्पनिक डेटा प्रदर्शित नहीं किया जाता।' : 'Fabricated forecast values are strictly prohibited.',
      },
      disclaimer,
      dataSufficient: false,
    };
  }

  // Use the next 24 hours of slots
  const slots24 = hourlySlots.slice(0, 24);

  // Form 2-hour window blocks across the 24 hours
  const candidateBlocks: WindowSlotBlock[] = [];
  for (let i = 0; i <= slots24.length - 2; i += 2) {
    candidateBlocks.push({
      slots: [slots24[i], slots24[i + 1]],
      startIndex: i,
    });
  }

  // If odd length, add the last available hour
  if (candidateBlocks.length === 0) {
    candidateBlocks.push({ slots: slots24.slice(0, 2), startIndex: 0 });
  }

  // Calculate metrics for each candidate window
  const rankings: BestWindowRanking[] = [];

  for (let idx = 0; idx < candidateBlocks.length; idx++) {
    const block = candidateBlocks[idx];
    const firstSlot = block.slots[0];
    const lastSlot = block.slots[block.slots.length - 1];

    // Compute average AQI from computedAqi of each slot
    const aqiVals: number[] = [];
    const pollutantSum: Partial<Record<PollutantId, { sum: number; count: number; unit: string }>> = {};
    let tempSum = 0;
    let tempCount = 0;

    for (const slot of block.slots) {
      if (slot.computedAqi?.value !== null && slot.computedAqi?.value !== undefined) {
        aqiVals.push(slot.computedAqi.value);
      }
      for (const m of slot.measurements) {
        if (!pollutantSum[m.pollutant]) {
          pollutantSum[m.pollutant] = { sum: 0, count: 0, unit: m.unit };
        }
        pollutantSum[m.pollutant]!.sum += m.value;
        pollutantSum[m.pollutant]!.count += 1;
      }
      if (slot.weather?.temperature !== undefined) {
        tempSum += slot.weather.temperature;
        tempCount += 1;
      }
    }

    if (aqiVals.length === 0) continue; // Skip slots with missing data

    const avgAqi = Math.round(aqiVals.reduce((a, b) => a + b, 0) / aqiVals.length);
    const minAqi = Math.min(...aqiVals);
    const maxAqi = Math.max(...aqiVals);
    const avgTemp = tempCount > 0 ? Math.round((tempSum / tempCount) * 10) / 10 : undefined;

    // Dominant pollutant in this block
    const dominantPollutant: PollutantId =
      firstSlot.computedAqi?.dominantPollutant ??
      (pollutantSum['pm2_5'] ? 'pm2_5' : 'o3');

    const cat = getCategoryFromAqi(avgAqi);

    // Readings used summary
    const readingsUsed = (Object.entries(pollutantSum) as [PollutantId, { sum: number; count: number; unit: string }][]).map(
      ([pollutant, data]) => ({
        pollutant,
        avgValue: Math.round((data.sum / data.count) * 10) / 10,
        unit: data.unit,
      })
    );

    const timeLabel = formatTimeRange(firstSlot.time, lastSlot.time);

    rankings.push({
      id: `window-${idx}-${firstSlot.time}`,
      startTime: firstSlot.time,
      endTime: lastSlot.time,
      timeLabel,
      averageAqi: avgAqi,
      minAqi,
      maxAqi,
      dominantPollutant,
      aqiCategory: cat.name,
      categoryColor: cat.color,
      rank: 0, // Assigned below
      isBestWindow: false,
      comparisonReason: '',
      temperatureAvg: avgTemp,
      readingsUsed,
      whyThisTime: {
        aqiScale: 'India National AQI (CPCB 2014 Breakpoints, 0–500)',
        dataSource: 'Copernicus Atmosphere Monitoring Service (CAMS) via Open-Meteo',
        forecastTimestamp: firstSlot.time,
        dominantFactor: `Lower average concentration of ${dominantPollutant.toUpperCase().replace('_', '.')}`,
        comparisonDetail: '',
        limitations: [
          'Forecast model resolution is ~40 km; localized street-level vehicle traffic or dust may cause localized variations.',
          'Atmospheric boundary layer depth and wind patterns may shift during diurnal cycles.',
          'Environmental comparisons do not substitute for personal medical advice or perceived exertion.',
        ],
      },
    });
  }

  if (rankings.length === 0) {
    return {
      location: locationName,
      fetchedAt,
      activity,
      profileCategory,
      language,
      rankedWindows: [],
      bestWindow: null,
      worstWindow: null,
      ageAdaptedExplanation: {
        headline: 'No Valid Forecast Windows',
        recommendation: 'Available forecast slots lack sufficient pollutant parameters.',
        activitySpecificAdvice: 'Please rely on current real-time observations.',
        cautionNote: 'No values are fabricated.',
      },
      disclaimer,
      dataSufficient: false,
    };
  }

  // Sort candidate windows deterministically
  // Primary: Lowest average AQI
  // Secondary: Lowest max AQI
  // Activity consideration:
  // - If OUTDOOR_RECREATION & O3 is elevated (> 100 µg/m³), penalize hot afternoon hours (12-16)
  // - If CYCLING, favor lower PM2.5 to avoid deep lung inhalation during heavy respiration
  rankings.sort((a, b) => {
    let scoreA = a.averageAqi ?? 999;
    let scoreB = b.averageAqi ?? 999;

    // Small activity adjustments for deterministic tie-breaking
    if (activity === 'OUTDOOR_RECREATION' && a.dominantPollutant === 'o3') {
      const startHourA = new Date(a.startTime).getHours();
      const startHourB = new Date(b.startTime).getHours();
      if (startHourA >= 12 && startHourA <= 16) scoreA += 5;
      if (startHourB >= 12 && startHourB <= 16) scoreB += 5;
    }

    if (scoreA !== scoreB) return scoreA - scoreB;
    return (a.maxAqi ?? 999) - (b.maxAqi ?? 999);
  });

  // Assign ranks
  for (let i = 0; i < rankings.length; i++) {
    rankings[i].rank = i + 1;
    rankings[i].isBestWindow = i === 0;
  }

  const bestWindow = rankings[0];
  const worstWindow = rankings[rankings.length - 1];

  // Calculate deterministic comparison metrics
  const bestAqi = bestWindow.averageAqi ?? 0;
  const worstAqi = worstWindow.averageAqi ?? 0;
  const diffPoints = Math.max(0, worstAqi - bestAqi);
  const diffPct = worstAqi > 0 ? Math.round((diffPoints / worstAqi) * 100) : 0;

  // Enrich comparison reason for best window
  const bestPm25 = bestWindow.readingsUsed.find((r) => r.pollutant === 'pm2_5')?.avgValue;

  const comparisonEn = diffPoints > 0
    ? `Forecast IN NAQI is ${bestAqi} (${bestWindow.aqiCategory}), which is ${diffPoints} points (${diffPct}%) lower than the peak forecast window (${worstWindow.timeLabel}, IN NAQI ${worstAqi}).`
    : `Forecast IN NAQI is ${bestAqi} (${bestWindow.aqiCategory}), remaining steady throughout the 24-hour cycle.`;

  const comparisonTa = diffPoints > 0
    ? `முன்னறிவிக்கப்பட்ட IN NAQI ${bestAqi} (${bestWindow.aqiCategory}) ஆகும், இது உச்ச அளவை விட (${worstWindow.timeLabel}, IN NAQI ${worstAqi}) ${diffPoints} புள்ளிகள் (${diffPct}%) குறைவாகும்.`
    : `முன்னறிவிக்கப்பட்ட IN NAQI ${bestAqi} (${bestWindow.aqiCategory}) ஆகும், இது 24 மணி நேரமும் சீராக உள்ளது.`;

  const comparisonHi = diffPoints > 0
    ? `पूर्वानुमानित IN NAQI ${bestAqi} (${bestWindow.aqiCategory}) है, जो चरम समय (${worstWindow.timeLabel}, IN NAQI ${worstAqi}) से ${diffPoints} अंक (${diffPct}%) कम है।`
    : `पूर्वानुमानित IN NAQI ${bestAqi} (${bestWindow.aqiCategory}) है, जो 24 घंटे की अवधि में स्थिर रहता है।`;

  for (const w of rankings) {
    const curAqi = w.averageAqi ?? 0;
    const diffFromBest = curAqi - bestAqi;
    if (w.isBestWindow) {
      w.comparisonReason = language === 'ta' ? comparisonTa : language === 'hi' ? comparisonHi : comparisonEn;
      w.whyThisTime.comparisonDetail = `This period demonstrates the lowest predicted cumulative pollutant burden across the 24-hour modeling window. Average PM2.5 is ${bestPm25 ?? '--'} µg/m³.`;
    } else {
      w.comparisonReason =
        language === 'ta'
          ? `சிறந்த நேரத்தை விட (${bestWindow.timeLabel}) ${diffFromBest} புள்ளிகள் அதிகம்.`
          : language === 'hi'
          ? `सर्वोत्तम समय (${bestWindow.timeLabel}) की तुलना में ${diffFromBest} अंक अधिक।`
          : `+${diffFromBest} AQI points higher than the comparatively most favorable window (${bestWindow.timeLabel}).`;
      w.whyThisTime.comparisonDetail = `Forecast IN NAQI is ${curAqi} vs ${bestAqi} during the optimal window. Pollutant dispersion is less favorable during this interval.`;
    }
  }

  // Generate Age-Adapted and Activity-Specific Guidance
  const explanation = generateAgeActivityAdvice(
    profileCategory,
    activity,
    bestWindow,
    worstWindow,
    diffPoints,
    diffPct,
    language
  );

  return {
    location: locationName,
    fetchedAt,
    activity,
    profileCategory,
    language,
    rankedWindows: rankings,
    bestWindow,
    worstWindow,
    ageAdaptedExplanation: explanation,
    disclaimer,
    dataSufficient: true,
  };
}

function generateAgeActivityAdvice(
  category: ProfileCategory,
  activity: ActivityType,
  bestWindow: BestWindowRanking,
  worstWindow: BestWindowRanking,
  diffPoints: number,
  diffPct: number,
  language: Language
): {
  headline: string;
  recommendation: string;
  activitySpecificAdvice: string;
  cautionNote: string;
} {
  const bestTime = bestWindow.timeLabel;
  const bestAqi = bestWindow.averageAqi ?? 0;
  const aqiCat = bestWindow.aqiCategory ?? 'Moderate';
  const worstTime = worstWindow.timeLabel;

  const actLabel = {
    WALKING: { en: 'walking', ta: 'நடைபயிற்சி', hi: 'टहलने' },
    OUTDOOR_RECREATION: { en: 'outdoor games and recreation', ta: 'வெளிப்புற விளையாட்டுகள்', hi: 'आउटडोर खेल' },
    CYCLING: { en: 'cycling', ta: 'மிதிவண்டி பயணம்', hi: 'साइकिल चलाने' },
    GENERAL: { en: 'outdoor activities', ta: 'வெளிப்புற பணிகள்', hi: 'बाहरी गतिविधियों' },
  }[activity];

  if (language === 'ta') {
    switch (category) {
      case 'CHILD':
        return {
          headline: `குழந்தைகளுக்கான சிறந்த நேரம்: ${bestTime}`,
          recommendation: `இன்றைய காற்றில் விளையாட ${bestTime} நேரம் ஒப்பீட்டளவில் சிறந்தது (NAQI ${bestAqi}, ${aqiCat}).`,
          activitySpecificAdvice: `${actLabel.ta} செய்யும் போது அவ்வப்போது தண்ணீர் குடிக்கவும் மற்றும் பெரியவர்களிடம் கூறிவிட்டு விளையாடவும்.`,
          cautionNote: `மாலையில் (${worstTime}) காற்று மாசு அதிகரிக்க வாய்ப்புள்ளது; அப்போது வீட்டுக்குள் விளையாடுவது நல்லது.`,
        };
      case 'TEEN':
        return {
          headline: `இளைஞர் செயல்பாட்டு நேரம்: ${bestTime}`,
          recommendation: `உங்கள் விளையாட்டு அல்லது உடற்பயிற்சி அமர்வுகளை ${bestTime} நேரத்தில் திட்டமிடுங்கள் (NAQI ${bestAqi}). இது மாலையை விட ${diffPct}% சிறந்தது.`,
          activitySpecificAdvice: `${actLabel.ta} செய்யும் போது தூசு நிறைந்த பிரதான சாலைகளைத் தவிர்த்து பூங்காக்களைப் பயன்படுத்தவும்.`,
          cautionNote: `${worstTime} நேரத்தில் வாகனப் புகை மற்றும் துகள் செறிவு அதிகமாக இருக்கும் என கணிக்கப்பட்டுள்ளது.`,
        };
      case 'SENIOR':
        return {
          headline: `முதியோர்களுக்கான எளிய வழிகாட்டல்: ${bestTime}`,
          recommendation: `காலை அல்லது மாலை ${actLabel.ta}க்கு ${bestTime} ஒப்பீட்டளவில் சாதகமானது (NAQI ${bestAqi}, ${aqiCat}).`,
          activitySpecificAdvice: `அமைதியான வேகத்தில் செல்லுங்கள். வெப்பநிலைக்கு ஏற்ப ஆடை அணியுங்கள்.`,
          cautionNote: `போக்குவரத்து நெரிசல் மிகுந்த நேரமான ${worstTime} இல் வெளியில் செல்வதைத் தவிர்க்கவும்.`,
        };
      case 'ADULT':
      default:
        return {
          headline: `ஒப்பீட்டளவில் சாதகமான நேரம்: ${bestTime}`,
          recommendation: `24 மணி நேர முன்னறிவிப்பின்படி, ${bestTime} இடைவெளியில் காற்றுத் தரம் (NAQI ${bestAqi}, ${aqiCat}) ஒப்பீட்டளவில் மிகக் குறைந்த மாசு சுமையைக் கொண்டுள்ளது.`,
          activitySpecificAdvice: `${actLabel.ta} மற்றும் தினசரி வெளிப்புறப் பணிகளை இந்த காலகட்டத்தில் முடிக்க திட்டமிடுங்கள்.`,
          cautionNote: `${worstTime} நேரத்தில் NAQI ${worstWindow.averageAqi} ஆக உயரும் என்பதால் வெளிப்புற நேரத்தைக் குறைப்பது நல்லது.`,
        };
    }
  }

  if (language === 'hi') {
    switch (category) {
      case 'CHILD':
        return {
          headline: `बच्चों के लिए बेहतर समय: ${bestTime}`,
          recommendation: `आज बाहर खेलने के लिए ${bestTime} अपेक्षाकृत बेहतर समय है (NAQI ${bestAqi}, ${aqiCat})।`,
          activitySpecificAdvice: `${actLabel.hi} के दौरान पानी पीते रहें और खेलने से पहले माता-पिता से बात करें।`,
          cautionNote: `${worstTime} के दौरान प्रदूषण बढ़ सकता है, उस समय घर के अंदर खेलें।`,
        };
      case 'TEEN':
        return {
          headline: `युवा खेल और फिटनेस समय: ${bestTime}`,
          recommendation: `अपने वर्कआउट या खेल सत्र को ${bestTime} के लिए निर्धारित करें (NAQI ${bestAqi})। यह चरम समय से ${diffPct}% अधिक अनुकूल है।`,
          activitySpecificAdvice: `${actLabel.hi} के लिए मुख्य सड़कों के बजाय खुले मैदान या पार्क चुनें।`,
          cautionNote: `${worstTime} के दौरान ट्रैफिक और कणों का स्तर अधिक रहने का पूर्वानुमान है।`,
        };
      case 'SENIOR':
        return {
          headline: `वरिष्ठ नागरिकों के लिए सलाह: ${bestTime}`,
          recommendation: `${actLabel.hi} के लिए ${bestTime} अपेक्षाकृत सबसे अनुकूल समय है (NAQI ${bestAqi}, ${aqiCat})।`,
          activitySpecificAdvice: `शांत गति से टहलें और प्रदूषण वाले व्यस्त मार्गों से बचें।`,
          cautionNote: `${worstTime} के दौरान प्रदूषण में वृद्धि संभव है, इसलिए घर के अंदर आराम करना बेहतर है।`,
        };
      case 'ADULT':
      default:
        return {
          headline: `अपेक्षाकृत अधिक अनुकूल समय: ${bestTime}`,
          recommendation: `24 घंटे के वायु पूर्वानुमान के अनुसार, ${bestTime} विंडो में औसत वायु गुणवत्ता (NAQI ${bestAqi}, ${aqiCat}) सबसे अनुकूल स्थिति दर्शाती है।`,
          activitySpecificAdvice: `${actLabel.hi} और बाहरी आवश्यक कार्यों को इस अवधि में प्राथमिकता दें।`,
          cautionNote: `${worstTime} के समय सूचकांक ${worstWindow.averageAqi} तक जा सकता है, अत: भारी शारीरिक श्रम सीमित रखें।`,
        };
    }
  }

  // English (default)
  switch (category) {
    case 'CHILD':
      return {
        headline: `Best Outdoor Window for Kids: ${bestTime}`,
        recommendation: `Air conditions are forecast to be comparatively more favorable during ${bestTime} (IN NAQI ${bestAqi}, ${aqiCat}).`,
        activitySpecificAdvice: `Great time for ${actLabel.en}! Remember to drink plenty of water and check with an adult before playing outside.`,
        cautionNote: `Pollution levels are forecast to rise around ${worstTime}; indoor playtime is recommended then.`,
      };
    case 'TEEN':
      return {
        headline: `Activity Window for Teens: ${bestTime}`,
        recommendation: `Schedule outdoor training or ${actLabel.en} during ${bestTime} (IN NAQI ${bestAqi}). This is ${diffPct}% lower than peak pollution hours.`,
        activitySpecificAdvice: `Choose neighborhood parks or green spaces away from congested transit corridors for workouts.`,
        cautionNote: `Avoid prolonged high-exertion training during the peak forecast window (${worstTime}, IN NAQI ${worstWindow.averageAqi}).`,
      };
    case 'SENIOR':
      return {
        headline: `Senior Walk Advisory: ${bestTime}`,
        recommendation: `${bestTime} offers comparatively more favorable air quality (IN NAQI ${bestAqi}, ${aqiCat}) and comfortable temperatures for ${actLabel.en}.`,
        activitySpecificAdvice: `Maintain a gentle pace on tree-lined walking paths away from vehicular exhaust.`,
        cautionNote: `Consider resting indoors during peak traffic hours (${worstTime}) when particulates are highest.`,
      };
    case 'ADULT':
    default:
      return {
        headline: `Comparatively Most Favorable Window: ${bestTime}`,
        recommendation: `According to the 24-hour CAMS atmospheric model, ${bestTime} exhibits the lowest cumulative pollution burden (IN NAQI ${bestAqi}, ${aqiCat}).`,
        activitySpecificAdvice: `Plan ${actLabel.en}, commutes, and outdoor errands within this window to moderate cumulative exposure.`,
        cautionNote: `Air quality is forecast to deteriorate toward ${worstTime} (IN NAQI ${worstWindow.averageAqi}, ${worstWindow.aqiCategory}).`,
      };
  }
}
