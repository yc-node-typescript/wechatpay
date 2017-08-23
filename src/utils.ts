import { createHash } from 'crypto';
import * as xml2js from 'xml2js';

export function sign(object, key) {
  let querystring = createQueryString(object);
  querystring += '&key=' + key;
  return createHash('md5').update(querystring).digest('hex').toUpperCase();
}

export function shaSign(object) {
  // var querystring = createQueryString(object);
  // let shaObj = new jsSHA("SHA-1", 'TEXT');
  // shaObj.update(querystring);
  // return shaObj.getHash('HEX');
}

export function createNonceStr(length?: number): string {
  length = length || 24;
  if (length > 32) length = 32;
  return (Math.random().toString(36).substr(2, 12) +
    Math.random().toString(36).substr(2, 12) + 
    Math.random().toString(36).substr(2, 12)).substr(0, length);
}

export function createQueryString(options) {
  return Object.keys(options)
    .filter(key => {
      return (
        options[key] !== undefined &&
        options[key] !== '' &&
        ['pfx', 'apiKey', 'sign', 'key'].indexOf(key) < 0
      );
    })
    .sort()
    .map(key => {
      return key + '=' + options[key];
    })
    .join('&');
}

export function buildXML(json) {
  const builder = new xml2js.Builder();
  return builder.buildObject(json);
}

export function parseXML(xml) {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser({
      trim: true,
      explicitArray: false,
      explicitRoot: false,
    });
    parser.parseString(xml, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
