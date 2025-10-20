import { isWFSUrl, parseWFSUrl } from "../wfs";

describe("WFS module", () => {
  describe("isWFSUrl", () => {
    it("should detect WFS URLs with /wfs path", () => {
      expect(isWFSUrl("https://example.com/geoserver/wfs")).toBe(true);
    });

    it("should detect WFS URLs with service=wfs parameter", () => {
      expect(isWFSUrl("https://example.com/service?service=wfs")).toBe(true);
      expect(isWFSUrl("https://example.com/service?SERVICE=WFS")).toBe(true);
    });

    it("should detect WFS GetCapabilities requests", () => {
      expect(isWFSUrl("https://example.com/wfs?request=GetCapabilities")).toBe(true);
      expect(isWFSUrl("https://example.com/wfs?REQUEST=GETCAPABILITIES")).toBe(true);
    });

    it("should detect WFS GetFeature requests", () => {
      expect(isWFSUrl("https://example.com/wfs?request=GetFeature")).toBe(true);
    });

    it("should detect OWS endpoints without WMS service parameter", () => {
      expect(isWFSUrl("https://example.com/geoserver/ows")).toBe(true);
      expect(isWFSUrl("http://geo.pacioos.hawaii.edu/geoserver/PACIOOS/as_dw_nuu_jwl/ows")).toBe(true);
    });

    it("should not detect OWS endpoints with explicit WMS service", () => {
      expect(isWFSUrl("https://example.com/geoserver/ows?SERVICE=WMS")).toBe(false);
    });

    it("should not detect non-WFS URLs", () => {
      expect(isWFSUrl("https://example.com/arcgis/rest/services")).toBe(false);
      expect(isWFSUrl("https://example.com/api/data")).toBe(false);
    });
  });

  describe("parseWFSUrl", () => {
    it("should parse base URL without typename", () => {
      const result = parseWFSUrl("https://example.com/geoserver/wfs");
      expect(result.baseUrl).toBe("https://example.com/geoserver/wfs");
      expect(result.typename).toBeUndefined();
    });

    it("should parse typename from query parameters (lowercase)", () => {
      const result = parseWFSUrl("https://example.com/wfs?typename=myLayer");
      expect(result.baseUrl).toBe("https://example.com/wfs");
      expect(result.typename).toBe("myLayer");
    });

    it("should parse typeName from query parameters (camelCase)", () => {
      const result = parseWFSUrl("https://example.com/wfs?typeName=myLayer");
      expect(result.baseUrl).toBe("https://example.com/wfs");
      expect(result.typename).toBe("myLayer");
    });

    it("should parse TYPENAME from query parameters (uppercase)", () => {
      const result = parseWFSUrl("https://example.com/wfs?TYPENAME=myLayer");
      expect(result.baseUrl).toBe("https://example.com/wfs");
      expect(result.typename).toBe("myLayer");
    });

    it("should handle URLs with multiple query parameters", () => {
      const result = parseWFSUrl("https://example.com/wfs?service=wfs&version=2.0.0&typename=myLayer");
      expect(result.baseUrl).toBe("https://example.com/wfs");
      expect(result.typename).toBe("myLayer");
    });

    it("should strip WMS service parameter from OWS endpoints", () => {
      const result = parseWFSUrl("http://geo.pacioos.hawaii.edu/geoserver/PACIOOS/as_dw_nuu_jwl/ows?SERVICE=WMS&");
      expect(result.baseUrl).toBe("http://geo.pacioos.hawaii.edu/geoserver/PACIOOS/as_dw_nuu_jwl/ows");
      expect(result.typename).toBeUndefined();
    });
  });
});
