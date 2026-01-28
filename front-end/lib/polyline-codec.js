/**
 * Polyline Codec - Decodifica e codifica polylines do Google Maps
 * Funciona offline, sem dependências externas
 */

(function (window) {
  "use strict";

  /**
   * Decodifica uma polyline codificada
   * @param {string} encoded - String polyline codificada
   * @returns {Array} Array de [lat, lng]
   */
  function decode(encoded) {
    var inv = 1.0 / 1e5;
    var decoded = [];
    var previous = [0, 0];
    var i = 0;

    while (i < encoded.length) {
      var ll = [0, 0];
      for (var j = 0; j < 2; j++) {
        var shift = 0;
        var result = 0;
        var byte = 0;
        do {
          byte = encoded.charCodeAt(i++) - 63;
          result |= (byte & 0x1f) << shift;
          shift += 5;
        } while (byte >= 0x20);
        ll[j] = previous[j] + (result & 1 ? ~(result >> 1) : result >> 1);
        previous[j] = ll[j];
      }
      decoded.push([ll[0] * inv, ll[1] * inv]);
    }

    return decoded;
  }

  /**
   * Codifica um array de [lat, lng] para polyline
   * @param {Array} decoded - Array de [lat, lng]
   * @returns {string} String polyline codificada
   */
  function encode(decoded) {
    var encoded = "";
    var invScale = 1e5;
    var previous = [0, 0];

    for (var i = 0; i < decoded.length; i++) {
      var current = [
        Math.round(decoded[i][0] * invScale),
        Math.round(decoded[i][1] * invScale),
      ];

      for (var j = 0; j < 2; j++) {
        var value = current[j] - previous[j];
        value = value << 1;
        if (value < 0) {
          value = ~value;
        }

        var chunk = "";
        while (value >= 0x20) {
          chunk = String.fromCharCode((0x20 | (value & 0x1f)) + 63) + chunk;
          value >>= 5;
        }
        chunk = String.fromCharCode(value + 63) + chunk;
        encoded += chunk;
        previous[j] = current[j];
      }
    }

    return encoded;
  }

  // Exporta para window e para módulos
  if (typeof window !== "undefined") {
    window.polylineCodec = {
      decode: decode,
      encode: encode,
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      decode: decode,
      encode: encode,
    };
  }
})(typeof window !== "undefined" ? window : global);
