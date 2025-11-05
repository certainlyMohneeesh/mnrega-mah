/**
 * Utility functions for map data processing and visualization
 */

/**
 * Generate color based on value using a gradient scale
 */
export function getColorForValue(
  value: number,
  min: number,
  max: number,
  colorScale: string[] = ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15']
): string {
  if (value === 0 || max === min) return colorScale[0];
  
  const normalized = (value - min) / (max - min);
  const index = Math.min(Math.floor(normalized * colorScale.length), colorScale.length - 1);
  
  return colorScale[index];
}

/**
 * Format large numbers with Indian numbering system
 */
export function formatIndianNumber(num: number): string {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(2)} K`;
  }
  return `₹${num.toFixed(2)}`;
}

/**
 * Calculate min and max values from data array
 */
export function getMinMax(data: number[]): { min: number; max: number } {
  const validData = data.filter(d => d !== null && d !== undefined && !isNaN(d));
  
  if (validData.length === 0) {
    return { min: 0, max: 0 };
  }
  
  return {
    min: Math.min(...validData),
    max: Math.max(...validData),
  };
}

/**
 * Generate legend items based on data range
 */
export function generateLegendItems(
  min: number,
  max: number,
  colorScale: string[],
  formatter: (value: number) => string = (v) => v.toFixed(0)
): Array<{ color: string; label: string; range: string }> {
  const range = max - min;
  const step = range / colorScale.length;
  
  return colorScale.map((color, index) => {
    const rangeStart = min + (step * index);
    const rangeEnd = min + (step * (index + 1));
    
    return {
      color,
      label: index === 0 ? 'Low' : index === colorScale.length - 1 ? 'High' : 'Medium',
      range: `${formatter(rangeStart)} - ${formatter(rangeEnd)}`,
    };
  });
}

/**
 * Convert state name to slug format
 */
export function stateNameToSlug(stateName: string): string {
  return stateName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Get bounds from GeoJSON data
 */
export function getBoundsFromGeoJSON(geoJson: any): [[number, number], [number, number]] | null {
  if (!geoJson || !geoJson.features || geoJson.features.length === 0) {
    return null;
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  geoJson.features.forEach((feature: any) => {
    if (feature.geometry.type === 'Polygon') {
      feature.geometry.coordinates[0].forEach(([lng, lat]: [number, number]) => {
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
      });
    } else if (feature.geometry.type === 'MultiPolygon') {
      feature.geometry.coordinates.forEach((polygon: any) => {
        polygon[0].forEach(([lng, lat]: [number, number]) => {
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
        });
      });
    }
  });

  return [[minLat, minLng], [maxLat, maxLng]];
}

/**
 * Color scales for different metrics
 */
export const COLOR_SCALES = {
  expenditure: ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15'],
  households: ['#eff6ff', '#bfdbfe', '#60a5fa', '#2563eb', '#1e3a8a'],
  personDays: ['#f0fdf4', '#bbf7d0', '#4ade80', '#16a34a', '#14532d'],
  works: ['#fef3c7', '#fde047', '#facc15', '#eab308', '#854d0e'],
};
