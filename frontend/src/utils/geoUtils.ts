/**
 * Geo Coordinates Resolution Utility
 * Provides accurate coordinates for Indian destinations and landmarks.
 * Resolves AI itinerary places, search results, and fallback coordinates with smart jitter offsets.
 */

import { SAMPLE_PLACES } from '@/data/sampleDatasets';

interface GeoCoord {
  lat: number;
  lng: number;
}

// Major Tourist Landmarks in India with exact GPS coordinates
export const KNOWN_LANDMARKS: Record<string, GeoCoord> = {
  // Jaipur
  'amber fort': { lat: 26.9855, lng: 75.8513 },
  'amer fort': { lat: 26.9855, lng: 75.8513 },
  'hawa mahal': { lat: 26.9239, lng: 75.8267 },
  'city palace jaipur': { lat: 26.9258, lng: 75.8237 },
  'city palace': { lat: 26.9258, lng: 75.8237 },
  'jantar mantar': { lat: 26.9248, lng: 75.8246 },
  'jal mahal': { lat: 26.9656, lng: 75.8457 },
  'nahargarh fort': { lat: 26.9372, lng: 75.8155 },
  'jaigarh fort': { lat: 26.9850, lng: 75.8450 },
  'chokhi dhani': { lat: 26.7663, lng: 75.8344 },
  'albert hall': { lat: 26.9116, lng: 75.8195 },
  'birla mandir jaipur': { lat: 26.8924, lng: 75.8154 },
  'johari bazaar': { lat: 26.9197, lng: 75.8265 },
  'bapu bazaar': { lat: 26.9180, lng: 75.8210 },
  'lassiwala': { lat: 26.9168, lng: 75.8115 },
  'rawat mishthan bhandar': { lat: 26.9213, lng: 75.7975 },

  // Udaipur
  'lake pichola': { lat: 24.5760, lng: 73.6800 },
  'city palace udaipur': { lat: 24.5764, lng: 73.6835 },
  'jagmandir': { lat: 24.5678, lng: 73.6775 },
  'saheliyon ki bari': { lat: 24.6047, lng: 73.6847 },
  'fatehsagar lake': { lat: 24.6045, lng: 73.6737 },
  'fateh sagar': { lat: 24.6045, lng: 73.6737 },
  'bagore ki haveli': { lat: 24.5797, lng: 73.6827 },
  'monsoon palace': { lat: 24.5904, lng: 73.6375 },
  'sajjangarh': { lat: 24.5904, lng: 73.6375 },
  'ambrai ghat': { lat: 24.5786, lng: 73.6804 },
  'jagdish temple': { lat: 24.5795, lng: 73.6840 },

  // Varanasi
  'kashi vishwanath': { lat: 25.3109, lng: 83.0107 },
  'dashashwamedh ghat': { lat: 25.3069, lng: 83.0104 },
  'assi ghat': { lat: 25.2891, lng: 83.0069 },
  'manikarnika ghat': { lat: 25.3108, lng: 83.0139 },
  'sarnath': { lat: 25.3811, lng: 83.0214 },
  'banaras hindu university': { lat: 25.2677, lng: 82.9913 },
  'bhu': { lat: 25.2677, lng: 82.9913 },

  // Himachal / Manali / Shimla
  'solang valley': { lat: 32.3166, lng: 77.1578 },
  'rohtang pass': { lat: 32.3716, lng: 77.2466 },
  'hidimba devi temple': { lat: 32.2483, lng: 77.1812 },
  'hadimba temple': { lat: 32.2483, lng: 77.1812 },
  'mall road manali': { lat: 32.2396, lng: 77.1887 },
  'old manali': { lat: 32.2530, lng: 77.1770 },
  'vashisht baths': { lat: 32.2612, lng: 77.1882 },
  'kasol': { lat: 32.0100, lng: 77.3152 },
  'mall road shimla': { lat: 31.1048, lng: 77.1734 },
  'jakhoo temple': { lat: 31.1012, lng: 77.1834 },

  // Delhi
  'red fort': { lat: 28.6562, lng: 77.2410 },
  'jama masjid': { lat: 28.6507, lng: 77.2334 },
  'chandni chowk': { lat: 28.6506, lng: 77.2303 },
  'india gate': { lat: 28.6129, lng: 77.2295 },
  'qutub minar': { lat: 28.5244, lng: 77.1855 },
  'lotus temple': { lat: 28.5535, lng: 77.2588 },
  'humayun tomb': { lat: 28.5933, lng: 77.2507 },
  'connaught place': { lat: 28.6315, lng: 77.2167 },
  'sarojini nagar': { lat: 28.5772, lng: 77.1950 },
  'majnu ka tilla': { lat: 28.7007, lng: 77.2272 },
  'dilli haat': { lat: 28.5733, lng: 77.2078 },
  'shyam sweets': { lat: 28.6562, lng: 77.2301 },
  'manohar dhaba': { lat: 28.6539, lng: 77.2372 },
  'andhra bhavan': { lat: 28.6131, lng: 77.2283 },

  // Agra
  'taj mahal': { lat: 27.1751, lng: 78.0421 },
  'agra fort': { lat: 27.1795, lng: 78.0211 },
  'fatehpur sikri': { lat: 27.0945, lng: 77.6679 },
  'mehtab bagh': { lat: 27.1800, lng: 78.0420 },

  // Goa
  'baga beach': { lat: 15.5553, lng: 73.7517 },
  'calangute beach': { lat: 15.5439, lng: 73.7553 },
  'fort aguada': { lat: 15.4920, lng: 73.7737 },
  'anjuna beach': { lat: 15.5818, lng: 73.7428 },
  'chapora fort': { lat: 15.6059, lng: 73.7371 },
  'dudhsagar falls': { lat: 15.3144, lng: 74.3143 },

  // Mumbai
  'gateway of india': { lat: 18.9220, lng: 72.8347 },
  'marine drive': { lat: 18.9440, lng: 72.8230 },
  'elephanta caves': { lat: 18.9633, lng: 72.9315 },
  'juhu beach': { lat: 19.0988, lng: 72.8264 },
  'bandra bandstand': { lat: 19.0478, lng: 72.8214 },

  // Bangalore
  'lalbagh': { lat: 12.9507, lng: 77.5848 },
  'cubbon park': { lat: 12.9763, lng: 77.5929 },
  'bangalore palace': { lat: 12.9982, lng: 77.5920 },

  // Rishikesh
  'laxman jhula': { lat: 30.1294, lng: 78.3283 },
  'ram jhula': { lat: 30.1235, lng: 78.3145 },
  'triveni ghat': { lat: 30.0935, lng: 78.2970 },

  // Amritsar
  'golden temple': { lat: 31.6200, lng: 74.8765 },
  'jallianwala bagh': { lat: 31.6206, lng: 74.8801 },
  'wagah border': { lat: 31.6047, lng: 74.5738 },
};

// City Center Coordinate Defaults
export const KNOWN_CITIES: Record<string, GeoCoord> = {
  jaipur: { lat: 26.9124, lng: 75.7873 },
  udaipur: { lat: 24.5854, lng: 73.7125 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  'old delhi': { lat: 28.6506, lng: 77.2303 },
  'new delhi': { lat: 28.6139, lng: 77.2090 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  banaras: { lat: 25.3176, lng: 82.9739 },
  manali: { lat: 32.2432, lng: 77.1892 },
  himachal: { lat: 32.2432, lng: 77.1892 },
  shimla: { lat: 31.1048, lng: 77.1734 },
  agra: { lat: 27.1767, lng: 78.0081 },
  goa: { lat: 15.2993, lng: 74.1240 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  rishikesh: { lat: 30.0869, lng: 78.2676 },
  amritsar: { lat: 31.6340, lng: 74.8723 },
  kerala: { lat: 9.9312, lng: 76.2673 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  pune: { lat: 18.5204, lng: 73.8567 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  jodhpur: { lat: 26.2389, lng: 73.0243 },
  jaisalmer: { lat: 26.9157, lng: 70.9083 },
};

/**
 * Resolve coordinates for a place with fallback to landmarks, sample datasets, and destination city centers.
 */
export function resolvePlaceCoordinates(
  place: { name?: string; lat?: number; lng?: number; city?: string; category?: string },
  contextDestination?: string,
  index: number = 0
): GeoCoord {
  // 1. Exact valid coordinates
  if (typeof place.lat === 'number' && typeof place.lng === 'number' && place.lat !== 0 && place.lng !== 0) {
    return { lat: place.lat, lng: place.lng };
  }

  const rawName = (place.name || '').toLowerCase().trim();

  // 2. Direct Landmark match
  for (const [key, coord] of Object.entries(KNOWN_LANDMARKS)) {
    if (rawName.includes(key) || key.includes(rawName)) {
      return coord;
    }
  }

  // 3. Fallback to SAMPLE_PLACES match
  const sampleMatch = SAMPLE_PLACES.find(
    (sp) => sp.name.toLowerCase().includes(rawName) || rawName.includes(sp.name.toLowerCase())
  );
  if (sampleMatch && sampleMatch.lat && sampleMatch.lng) {
    return { lat: sampleMatch.lat, lng: sampleMatch.lng };
  }

  // 4. City center with natural geographic dispersion offset
  const searchContext = `${rawName} ${place.city || ''} ${place.category || ''} ${contextDestination || ''}`.toLowerCase();

  for (const [cityKey, baseCoord] of Object.entries(KNOWN_CITIES)) {
    if (searchContext.includes(cityKey)) {
      // Deterministic angle and radius dispersion so markers don't overlap
      const angle = (index * 1.35) % (2 * Math.PI);
      const radius = 0.008 + ((index * 0.006) % 0.024);
      return {
        lat: baseCoord.lat + Math.sin(angle) * radius,
        lng: baseCoord.lng + Math.cos(angle) * radius,
      };
    }
  }

  // 5. Default fallback to Delhi with slight offset
  const defaultBase = KNOWN_CITIES.delhi;
  const angle = (index * 1.35) % (2 * Math.PI);
  const radius = 0.008 + ((index * 0.006) % 0.02);
  return {
    lat: defaultBase.lat + Math.sin(angle) * radius,
    lng: defaultBase.lng + Math.cos(angle) * radius,
  };
}
