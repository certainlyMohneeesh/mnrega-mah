// Web Worker for map path generation
// This offloads heavy computation from main thread

self.addEventListener('message', (e) => {
  const { type, data } = e.data;

  if (type === 'GENERATE_PATHS') {
    const { features, scale, centerLon, centerLat } = data;
    
    // Mercator projection
    const project = (lon, lat) => {
      const x = scale * (lon - centerLon);
      const y = -scale * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
      const offsetY = scale * Math.log(Math.tan(Math.PI / 4 + (centerLat * Math.PI) / 360));
      return [x + 400, y + offsetY + 450];
    };

    // Convert coordinates to SVG path
    const coordsToPath = (coords) => {
      if (!coords || coords.length === 0) return "";
      
      const processRing = (ring) => {
        if (!Array.isArray(ring[0])) return "";
        
        const points = ring.map(([lon, lat]) => project(lon, lat));
        if (points.length === 0) return "";
        
        let path = `M ${points[0][0]} ${points[0][1]}`;
        for (let i = 1; i < points.length; i++) {
          path += ` L ${points[i][0]} ${points[i][1]}`;
        }
        path += " Z";
        return path;
      };

      if (coords[0] && Array.isArray(coords[0][0]) && Array.isArray(coords[0][0][0])) {
        // MultiPolygon
        return coords.map((polygon) => 
          polygon.map((ring) => processRing(ring)).join(" ")
        ).join(" ");
      } else if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
        // Polygon
        return coords.map((ring) => processRing(ring)).join(" ");
      }
      
      return "";
    };

    // Process all features
    const paths = features.map((feature, index) => ({
      id: index,
      name: feature.properties.NAME_1 || feature.properties.NAME || "",
      path: coordsToPath(feature.geometry.coordinates)
    }));

    self.postMessage({ type: 'PATHS_READY', paths });
  }
});
