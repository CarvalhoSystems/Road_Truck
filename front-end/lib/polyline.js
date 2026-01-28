/**
 * polyline.js - Versão JavaScript Puro (ES5/ES6)
 * Código reescrito a partir de @googlemaps/polyline-codec para JS puro.
 */

// =====================================================================
// FUNÇÕES UTILS INTERNAS
// =====================================================================

/**
 * @ignore
 */
const round = (v) => {
  return Math.floor(Math.abs(v) + 0.5) * (v >= 0 ? 1 : -1);
};

/**
 * Helper function for encodeSigned.
 *
 * @ignore
 */
const polylineEncodeUnsigned = function (value, array) {
  while (value >= 0x20) {
    array.push(String.fromCharCode((0x20 | (value & 0x1f)) + 63));
    value >>= 5;
  }
  array.push(String.fromCharCode(value + 63));
  return array;
};

/**
 * Encodes the given value in our compact polyline format, appending the
 * encoded value to the given array of strings.
 *
 * @ignore
 */
const polylineEncodeSigned = function (value, array) {
  return polylineEncodeUnsigned(value < 0 ? ~(value << 1) : value << 1, array);
};

/**
 * Encodes a generic polyline; optionally performing a transform on each point
 * before encoding it.
 *
 * @ignore
 */
const polylineEncodeLine = function (array, transform) {
  const v = [];
  let start = [0, 0];
  let end;
  for (let i = 0, I = array.length; i < I; ++i) {
    // In order to prevent drift (from quantizing deltas), we explicitly convert
    // coordinates to fixed-precision to obtain integer deltas.
    end = transform(array[i]);

    // Push the next edge
    polylineEncodeSigned(round(end[0]) - round(start[0]), v); // lat
    polylineEncodeSigned(round(end[1]) - round(start[1]), v); // lng
    start = end;
  }

  return v.join("");
};

// =====================================================================
// FUNÇÕES DE EXPORTAÇÃO (GLOBAL)
// =====================================================================

/**
 * Decodes an encoded path string into a sequence of LatLngs ([lat, lng] arrays).
 *
 * Exposta como decode() no escopo global.
 */
window.decodePolyline = function (encodedPath, precision = 5) {
  const factor = Math.pow(10, precision);

  const len = encodedPath.length;

  const path = new Array(Math.floor(encodedPath.length / 2));
  let index = 0;
  let lat = 0;
  let lng = 0;
  let pointIndex = 0;

  for (; index < len; ++pointIndex) {
    let result = 1;
    let shift = 0;
    let b;
    do {
      b = encodedPath.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    result = 1;
    shift = 0;
    do {
      b = encodedPath.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    path[pointIndex] = [lat / factor, lng / factor];
  }
  // truncate array
  path.length = pointIndex;

  return path;
};

/**
 * Polyline encodes an array of objects having lat and lng properties or arrays [lat, lng].
 *
 * Exposta como encodePolyline() no escopo global.
 */
window.encodePolyline = function (path, precision = 5) {
  const factor = Math.pow(10, precision);

  const transform = function latLngToFixed(latLng) {
    // Verifica se é um objeto {lat, lng} ou um array [lat, lng]
    if (!Array.isArray(latLng)) {
      latLng = [latLng.lat, latLng.lng];
    }

    return [round(latLng[0] * factor), round(latLng[1] * factor)];
  };

  return polylineEncodeLine(path, transform);
};

// Se você estava usando as funções com os nomes originais 'decode' e 'encode'
// no seu código do mapa, renomeie-as ou use:
// const decode = window.decodePolyline;
// const encode = window.encodePolyline;
