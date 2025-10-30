/**
 * Geolocation utility to detect user's district based on their coordinates
 * Uses Haversine formula to calculate distance between user and district centers
 */

// Maharashtra district coordinates (approximate district centers)
export const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number; name: string }> = {
  'ahmednagar': { lat: 19.0948, lng: 74.7480, name: 'Ahmednagar' },
  'akola': { lat: 20.7002, lng: 77.0082, name: 'Akola' },
  'amravati': { lat: 20.9374, lng: 77.7796, name: 'Amravati' },
  'aurangabad': { lat: 19.8762, lng: 75.3433, name: 'Aurangabad' },
  'beed': { lat: 18.9894, lng: 75.7585, name: 'Beed' },
  'bhandara': { lat: 21.1704, lng: 79.6522, name: 'Bhandara' },
  'buldhana': { lat: 20.5311, lng: 76.1831, name: 'Buldhana' },
  'chandrapur': { lat: 19.9615, lng: 79.2961, name: 'Chandrapur' },
  'dhule': { lat: 20.9042, lng: 74.7749, name: 'Dhule' },
  'gadchiroli': { lat: 20.1809, lng: 80.0094, name: 'Gadchiroli' },
  'gondia': { lat: 21.4577, lng: 80.1955, name: 'Gondia' },
  'hingoli': { lat: 19.7154, lng: 77.1473, name: 'Hingoli' },
  'jalgaon': { lat: 21.0077, lng: 75.5626, name: 'Jalgaon' },
  'jalna': { lat: 19.8347, lng: 75.8800, name: 'Jalna' },
  'kolhapur': { lat: 16.7050, lng: 74.2433, name: 'Kolhapur' },
  'latur': { lat: 18.3984, lng: 76.5604, name: 'Latur' },
  'mumbai': { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
  'mumbai-suburban': { lat: 19.1136, lng: 72.9083, name: 'Mumbai Suburban' },
  'nagpur': { lat: 21.1458, lng: 79.0882, name: 'Nagpur' },
  'nanded': { lat: 19.1383, lng: 77.3210, name: 'Nanded' },
  'nandurbar': { lat: 21.3667, lng: 74.2333, name: 'Nandurbar' },
  'nashik': { lat: 19.9975, lng: 73.7898, name: 'Nashik' },
  'osmanabad': { lat: 18.1760, lng: 76.0394, name: 'Osmanabad' },
  'palghar': { lat: 19.6966, lng: 72.7636, name: 'Palghar' },
  'parbhani': { lat: 19.2608, lng: 76.7611, name: 'Parbhani' },
  'pune': { lat: 18.5204, lng: 73.8567, name: 'Pune' },
  'raigad': { lat: 18.5204, lng: 73.0200, name: 'Raigad' },
  'ratnagiri': { lat: 16.9902, lng: 73.3120, name: 'Ratnagiri' },
  'sangli': { lat: 16.8524, lng: 74.5815, name: 'Sangli' },
  'satara': { lat: 17.6805, lng: 74.0183, name: 'Satara' },
  'sindhudurg': { lat: 16.3667, lng: 73.6667, name: 'Sindhudurg' },
  'solapur': { lat: 17.6599, lng: 75.9064, name: 'Solapur' },
  'thane': { lat: 19.2183, lng: 72.9781, name: 'Thane' },
  'wardha': { lat: 20.7453, lng: 78.6022, name: 'Wardha' },
  'washim': { lat: 20.1109, lng: 77.1350, name: 'Washim' },
  'yavatmal': { lat: 20.3897, lng: 78.1213, name: 'Yavatmal' },
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Find the nearest district based on user's coordinates
 * @param userLat - User's latitude
 * @param userLng - User's longitude
 * @returns District key and distance
 */
export function findNearestDistrict(userLat: number, userLng: number): {
  districtKey: string;
  districtName: string;
  distance: number;
} | null {
  let nearestDistrict = null;
  let minDistance = Infinity;

  for (const [key, coords] of Object.entries(DISTRICT_COORDINATES)) {
    const distance = calculateDistance(userLat, userLng, coords.lat, coords.lng);
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestDistrict = {
        districtKey: key,
        districtName: coords.name,
        distance,
      };
    }
  }

  return nearestDistrict;
}

/**
 * Get user's current position using browser Geolocation API
 * @returns Promise with coordinates or null if denied/unavailable
 */
export async function getUserLocation(): Promise<{
  lat: number;
  lng: number;
} | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  });
}

/**
 * Detect user's district based on their location
 * @returns Promise with district information or null
 */
export async function detectUserDistrict(): Promise<{
  districtKey: string;
  districtName: string;
  distance: number;
} | null> {
  try {
    const location = await getUserLocation();
    
    if (!location) {
      return null;
    }

    const nearestDistrict = findNearestDistrict(location.lat, location.lng);
    
    if (nearestDistrict && nearestDistrict.distance > 200) {
      // User is more than 200km from any Maharashtra district
      console.warn('User appears to be outside Maharashtra');
      return null;
    }

    return nearestDistrict;
  } catch (error) {
    console.error('Error detecting user district:', error);
    return null;
  }
}

/**
 * Store detected district in localStorage for future use
 */
export function saveDetectedDistrict(districtKey: string, districtName: string): void {
  try {
    localStorage.setItem('detectedDistrict', JSON.stringify({
      key: districtKey,
      name: districtName,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.error('Error saving detected district:', error);
  }
}

/**
 * Get previously detected district from localStorage
 * @returns Saved district info or null if not found/expired
 */
export function getSavedDetectedDistrict(): {
  key: string;
  name: string;
} | null {
  try {
    const saved = localStorage.getItem('detectedDistrict');
    if (!saved) return null;

    const data = JSON.parse(saved);
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    // Expire after one week
    if (Date.now() - data.timestamp > oneWeek) {
      localStorage.removeItem('detectedDistrict');
      return null;
    }

    return { key: data.key, name: data.name };
  } catch (error) {
    console.error('Error reading saved district:', error);
    return null;
  }
}
