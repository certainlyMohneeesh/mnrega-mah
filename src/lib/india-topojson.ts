/**
 * India TopoJSON data for interactive map
 * Contains geometries for all 36 Indian states/UTs
 * 
 * This is a simplified TopoJSON structure. For production,
 * use full TopoJSON from: https://github.com/deldersveld/topojson
 */

export const indiaTopoJSON = {
  type: "Topology",
  arcs: [], // Simplified for now - will use external TopoJSON file
  objects: {
    states: {
      type: "GeometryCollection",
      geometries: [
        { type: "Polygon", properties: { STATE_NAME: "ANDAMAN AND NICOBAR", STATE_CODE: "AN", id: "AN" }, arcs: [[0]] },
        { type: "Polygon", properties: { STATE_NAME: "ANDHRA PRADESH", STATE_CODE: "AP", id: "AP" }, arcs: [[1]] },
        { type: "Polygon", properties: { STATE_NAME: "ARUNACHAL PRADESH", STATE_CODE: "AR", id: "AR" }, arcs: [[2]] },
        { type: "Polygon", properties: { STATE_NAME: "ASSAM", STATE_CODE: "AS", id: "AS" }, arcs: [[3]] },
        { type: "Polygon", properties: { STATE_NAME: "BIHAR", STATE_CODE: "BR", id: "BR" }, arcs: [[4]] },
        { type: "Polygon", properties: { STATE_NAME: "CHANDIGARH", STATE_CODE: "CH", id: "CH" }, arcs: [[5]] },
        { type: "Polygon", properties: { STATE_NAME: "CHHATTISGARH", STATE_CODE: "CT", id: "CT" }, arcs: [[6]] },
        { type: "Polygon", properties: { STATE_NAME: "DADRA AND NAGAR HAVELI", STATE_CODE: "DN", id: "DN" }, arcs: [[7]] },
        { type: "Polygon", properties: { STATE_NAME: "DAMAN AND DIU", STATE_CODE: "DD", id: "DD" }, arcs: [[8]] },
        { type: "Polygon", properties: { STATE_NAME: "GOA", STATE_CODE: "GA", id: "GA" }, arcs: [[9]] },
        { type: "Polygon", properties: { STATE_NAME: "GUJARAT", STATE_CODE: "GJ", id: "GJ" }, arcs: [[10]] },
        { type: "Polygon", properties: { STATE_NAME: "HARYANA", STATE_CODE: "HR", id: "HR" }, arcs: [[11]] },
        { type: "Polygon", properties: { STATE_NAME: "HIMACHAL PRADESH", STATE_CODE: "HP", id: "HP" }, arcs: [[12]] },
        { type: "Polygon", properties: { STATE_NAME: "JAMMU AND KASHMIR", STATE_CODE: "JK", id: "JK" }, arcs: [[13]] },
        { type: "Polygon", properties: { STATE_NAME: "JHARKHAND", STATE_CODE: "JH", id: "JH" }, arcs: [[14]] },
        { type: "Polygon", properties: { STATE_NAME: "KARNATAKA", STATE_CODE: "KA", id: "KA" }, arcs: [[15]] },
        { type: "Polygon", properties: { STATE_NAME: "KERALA", STATE_CODE: "KL", id: "KL" }, arcs: [[16]] },
        { type: "Polygon", properties: { STATE_NAME: "LADAKH", STATE_CODE: "LA", id: "LA" }, arcs: [[17]] },
        { type: "Polygon", properties: { STATE_NAME: "LAKSHADWEEP", STATE_CODE: "LD", id: "LD" }, arcs: [[18]] },
        { type: "Polygon", properties: { STATE_NAME: "MADHYA PRADESH", STATE_CODE: "MP", id: "MP" }, arcs: [[19]] },
        { type: "Polygon", properties: { STATE_NAME: "MAHARASHTRA", STATE_CODE: "MH", id: "MH" }, arcs: [[20]] },
        { type: "Polygon", properties: { STATE_NAME: "MANIPUR", STATE_CODE: "MN", id: "MN" }, arcs: [[21]] },
        { type: "Polygon", properties: { STATE_NAME: "MEGHALAYA", STATE_CODE: "ML", id: "ML" }, arcs: [[22]] },
        { type: "Polygon", properties: { STATE_NAME: "MIZORAM", STATE_CODE: "MZ", id: "MZ" }, arcs: [[23]] },
        { type: "Polygon", properties: { STATE_NAME: "NAGALAND", STATE_CODE: "NL", id: "NL" }, arcs: [[24]] },
        { type: "Polygon", properties: { STATE_NAME: "ODISHA", STATE_CODE: "OR", id: "OR" }, arcs: [[25]] },
        { type: "Polygon", properties: { STATE_NAME: "PUDUCHERRY", STATE_CODE: "PY", id: "PY" }, arcs: [[26]] },
        { type: "Polygon", properties: { STATE_NAME: "PUNJAB", STATE_CODE: "PB", id: "PB" }, arcs: [[27]] },
        { type: "Polygon", properties: { STATE_NAME: "RAJASTHAN", STATE_CODE: "RJ", id: "RJ" }, arcs: [[28]] },
        { type: "Polygon", properties: { STATE_NAME: "SIKKIM", STATE_CODE: "SK", id: "SK" }, arcs: [[29]] },
        { type: "Polygon", properties: { STATE_NAME: "TAMIL NADU", STATE_CODE: "TN", id: "TN" }, arcs: [[30]] },
        { type: "Polygon", properties: { STATE_NAME: "TELANGANA", STATE_CODE: "TS", id: "TS" }, arcs: [[31]] },
        { type: "Polygon", properties: { STATE_NAME: "TRIPURA", STATE_CODE: "TR", id: "TR" }, arcs: [[32]] },
        { type: "Polygon", properties: { STATE_NAME: "UTTAR PRADESH", STATE_CODE: "UP", id: "UP" }, arcs: [[33]] },
        { type: "Polygon", properties: { STATE_NAME: "UTTARAKHAND", STATE_CODE: "UK", id: "UK" }, arcs: [[34]] },
        { type: "Polygon", properties: { STATE_NAME: "WEST BENGAL", STATE_CODE: "WB", id: "WB" }, arcs: [[35]] },
      ]
    }
  }
};

/**
 * For production use, fetch actual TopoJSON from CDN or include in public folder
 * Example: https://cdn.jsdelivr.net/npm/india-map-topojson@1.0.0/india.json
 */
export async function fetchIndiaTopoJSON() {
  // In production, fetch from CDN or use local file
  // For now, return fallback that uses standard India GeoJSON
  return indiaTopoJSON;
}
