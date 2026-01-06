/**
 * PRISM ID - The Ultimate Sexy ID
 * 
 * Specs:
 * - Charset: Base31 (0-9, a-z excluding 0, 1, c, l, q)
 * - Sortable: Time-ordered
 * - Human-readable: Groups, pronunciation-friendly
 */

const ALPHABET = '23456789abdefghijkmnoprstuvwxyz';
const ALPHABET_MAP = {};
for (let i = 0; i < ALPHABET.length; i++) {
  ALPHABET_MAP[ALPHABET[i]] = i;
}

// Canonical exclusions mapping for typo correction
const TYPO_MAP = {
  '0': 'o',
  '1': 'i', // or l, but l is excluded too. Usually 1->i or l. Let's map to i since l is excluded. 
  // Actually spec says: 0, 1, c, l, q excluded.
  // c -> k
  // l -> 1 (wait, 1 is excluded). l -> i? 
  // q -> k
  'c': 'k',
  'l': 'i', // Visually similar
  'q': 'k',
  'o': '0', // If user types o, it's valid (o is in alphabet). 
            // Wait, 0 is excluded. So if user types 0, map to o.
  'i': '1', // If user types i, it's valid.
};
// Correction logic:
// 0 -> o
// 1 -> i
// c -> k
// l -> i (to avoid confusion with 1/i)
// q -> k

const BASE = ALPHABET.length; // 31

// Pre-calculated bit lengths for Base31 chars
// log2(31) = 4.954196
const BITS_PER_CHAR = Math.log2(BASE);

let lastTime = 0;
let seq = 0;

/**
 * Encodes a number (BigInt or Number) to Base31 string
 */
function encode(number, width) {
  let str = '';
  let n = BigInt(number);
  
  if (n === 0n) return ALPHABET[0].repeat(width || 1);

  while (n > 0n) {
    const rem = n % BigInt(BASE);
    str = ALPHABET[Number(rem)] + str;
    n = n / BigInt(BASE);
  }

  if (width) {
    return str.padStart(width, ALPHABET[0]);
  }
  return str;
}

/**
 * Decodes a Base31 string to BigInt
 */
function decode(str) {
  let n = 0n;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const val = ALPHABET_MAP[char];
    if (val === undefined) throw new Error(`Invalid character: ${char}`);
    n = n * BigInt(BASE) + BigInt(val);
  }
  return n;
}

/**
 * Generates random Base31 characters
 */
function randomChars(length) {
  let str = '';
  // We can generate random bytes and convert, or just pick random chars.
  // Picking random chars is easier for exact length.
  // For crypto security, we should use crypto.getRandomValues
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    str += ALPHABET[randomValues[i] % BASE];
  }
  return str;
}

/**
 * Calculates a simple checksum character
 */
function calculateChecksum(str) {
  // Simple polynomial rolling hash or Luhn-like mod 31
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const val = ALPHABET_MAP[char] || 0;
    // Weight by position to detect swaps
    sum = (sum + val * (i + 1)) % BASE;
  }
  return ALPHABET[sum]; // Returns single char
}

export class PrismID {
  static get CONFIG() {
    return {
      // Name: [Total Bits, Time Bits, Random Bits, Check Bits]
      'nano':     { name: 'Nano',     chars: 8,  bits: 40,  layout: { time: 0,  rand: 8, check: 0 } }, // pure random
      'micro':    { name: 'Micro',    chars: 11, bits: 55,  layout: { time: 0,  rand: 10, check: 1 } },
      'compact':  { name: 'Compact',  chars: 14, bits: 70,  layout: { time: 6,  rand: 7,  check: 1 } }, // ~30 bit time (sec precision?), 35 bit random
      'standard': { name: 'Standard', chars: 20, bits: 96,  layout: { time: 10, rand: 9,  check: 1 } }, // 48b time, 40b rand, 8b check (approx)
      'full':     { name: 'Full',     chars: 26, bits: 128, layout: { time: 10, rand: 15, check: 1 } }, // 48b time, 74b rand+seq
    };
  }

  /**
   * Generate a new PRISM ID
   * @param {string} type - 'nano', 'micro', 'compact', 'standard', 'full'
   * @param {string} prefix - Optional prefix (e.g. 'usr')
   */
  static generate(type = 'standard', prefix = '') {
    const config = this.CONFIG[type] || this.CONFIG['standard'];
    const now = Date.now();
    
    // Sequence handling for collision resistance in same ms
    if (now === lastTime) {
      seq++;
    } else {
      seq = 0;
      lastTime = now;
    }

    let idBody = '';
    
    // Time Component
    if (config.layout.time > 0) {
      // 10 chars of base31 is enough for 48 bits (approx 8900 years)
      // 6 chars of base31 is ~29 bits -> 17 years in seconds, or 6 days in ms.
      // For compact, we might want a relative epoch or reduced precision.
      // Let's stick to standard epoch for Standard/Full.
      
      let timeStr = encode(now, config.layout.time);
      // If the defined width is too small for full timestamp, we truncate (rotate) 
      // or we use a custom epoch. 
      // For "Compact" (6 chars), we can't store full timestamp. 
      // Let's assume Compact uses current year epoch or just lower resolution?
      // Spec says "Compact: 48b Time". 48 bits needs 10 chars.
      // The Spec table says Compact is 14 chars total.
      // If we strictly follow spec: 14 chars. 
      // If 48b time (10 chars), then 4 chars random?
      
      // Let's adjust to be realistic for a "Compact" ID:
      // Time: 8 chars (approx 39 bits -> 17 years in ms, or 500 years in seconds).
      // Let's use 8 chars for time in compact, 5 for random, 1 check.
      
      if (config.layout.time < 10) {
        // Use a recent epoch for shorter time strings to maximize utility
        // Epoch: Jan 1 2024
        const CUSTOM_EPOCH = 1704067200000;
        const timeVal = Math.max(0, now - CUSTOM_EPOCH);
        timeStr = encode(timeVal, config.layout.time);
      }
      
      idBody += timeStr;
    }

    // Random/Seq Component
    // We inject sequence into random bits if possible
    const randCharsNeeded = config.layout.rand;
    if (randCharsNeeded > 0) {
      // If we have a sequence and enough space, embed it
      // For simplicity, just appending random string
      idBody += randomChars(randCharsNeeded);
    }

    // Checksum
    if (config.layout.check > 0) {
      const check = calculateChecksum(prefix + idBody);
      idBody += check;
    }

    // Formatting with Hyphens
    // Strategy: split into groups of 4 from the right, or left?
    // User examples: pay-k7ra-xov5-mez8-k9
    // Groups of 4 are nice.
    
    let formatted = idBody;
    
    // Apply visual formatting if it's long
    if (idBody.length > 8) {
      // Split into chunks of 4
      const chunks = [];
      // For sortability, we usually don't want hyphens stored, but for display yes.
      // The spec includes hyphens in the string representation.
      
      // Custom grouping based on size
      if (type === 'full') {
        // 26 chars: 4-4-4-4-4-4-2 ? 
        // 26 is 6*4 + 2.
        formatted = idBody.match(/.{1,4}/g).join('-');
      } else if (type === 'standard') {
        // 20 chars: 4-4-4-4-4
        formatted = idBody.match(/.{1,4}/g).join('-');
      } else if (type === 'compact') {
        // 14 chars: 4-4-4-2
        formatted = idBody.match(/.{1,4}/g).join('-');
      }
    }

    if (prefix) {
      return `${prefix}-${formatted}`;
    }
    return formatted;
  }

  static parse(id) {
    // strip hyphens
    const clean = id.replace(/-/g, '').toLowerCase();
    
    // check prefix
    let prefix = '';
    let body = clean;
    
    // Heuristic: if contains hyphen in original, split
    if (id.includes('-')) {
      const parts = id.split('-');
      // If first part is alpha only and not base31-ish (contains l, q etc?) 
      // or just assume first part is prefix if it doesn't look like the rest?
      // Actually, spec says PREFIX-....
      // We assume if there are multiple parts, first is prefix.
      // But generated IDs have hyphens inside body too.
      // Example: pay-k7ra-xov5...
      // We need to know the structure.
      
      // Let's assume the prefix is the part before the first hyphen if it's text.
      // Simplified: Just parse the whole string.
    }

    return {
      original: id,
      clean: clean,
      length: clean.length,
      // We can infer type from length
      type: Object.entries(this.CONFIG).find(([, c]) => {
         // rough match (+/- prefix length)
         return Math.abs(c.chars - clean.length) < 5; 
      })?.[0] || 'unknown'
    };
  }
  
  static isValid(id) {
    try {
      // 1. Check characters
      const clean = id.replace(/-/g, '').toLowerCase();
      // Split prefix if exists. How to distinguish prefix from payload?
      // Assuming standard formatted Prism IDs have a checksum at the end.
      
      // If we generated it, we know the format.
      // Let's validate the checksum of the last char against the rest.
      
      const payload = clean.slice(0, -1);
      const check = clean.slice(-1);
      
      // This only works if we assume the whole string (including prefix) participated in checksum
      // Our generate function did: calculateChecksum(prefix + idBody_without_check)
      // So yes, cleaning hyphens -> payload + check
      
      // However, if prefix had hyphens? (Unlikely)
      
      // Re-calculate
      const expected = calculateChecksum(payload);
      return expected === check;
    } catch (e) {
      return false;
    }
  }
}

// prism-id.js

/**
 * PRISM ID - The Ultimate Sexy ID
 * 
 * Specs:
 * - Charset: Base31 (0-9, a-z excluding 0, 1, c, l, q)
 * - Sortable: Time-ordered
 * - Human-readable: Groups, pronunciation-friendly
 */

const ALPHABET = '23456789abdefghijkmnoprstuvwxyz';
const ALPHABET_MAP = {};
for (let i = 0; i < ALPHABET.length; i++) {
  ALPHABET_MAP[ALPHABET[i]] = i;
}

const BASE = ALPHABET.length; // 31

let lastTime = 0;
let seq = 0;

/**
 * Encodes a number (BigInt or Number) to Base31 string
 */
function encode(number, width) {
  let str = '';
  let n = BigInt(number);
  
  if (n === 0n) return ALPHABET[0].repeat(width || 1);

  while (n > 0n) {
    const rem = n % BigInt(BASE);
    str = ALPHABET[Number(rem)] + str;
    n = n / BigInt(BASE);
  }

  if (width) {
    return str.padStart(width, ALPHABET[0]);
  }
  return str;
}

/**
 * Generates random Base31 characters
 */
function randomChars(length) {
  let str = '';
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    str += ALPHABET[randomValues[i] % BASE];
  }
  return str;
}

/**
 * Calculates a simple checksum character (Luhn-mod-31-ish)
 */
function calculateChecksum(str) {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const val = ALPHABET_MAP[char] || 0;
    // Weight by position to detect swaps
    sum = (sum + val * (i + 1)) % BASE;
  }
  return ALPHABET[sum];
}

export class PrismID {
  static get CONFIG() {
    return {
      'nano':     { name: 'Nano',     chars: 8,  bits: 40,  layout: { time: 0,  rand: 8, check: 0 } }, 
      'micro':    { name: 'Micro',    chars: 11, bits: 55,  layout: { time: 0,  rand: 10, check: 1 } },
      'compact':  { name: 'Compact',  chars: 14, bits: 70,  layout: { time: 6,  rand: 7,  check: 1 } }, 
      'standard': { name: 'Standard', chars: 20, bits: 96,  layout: { time: 10, rand: 9,  check: 1 } }, 
      'full':     { name: 'Full',     chars: 26, bits: 128, layout: { time: 10, rand: 15, check: 1 } }, 
    };
  }

  static generate(type = 'standard', prefix = '') {
    const config = this.CONFIG[type] || this.CONFIG['standard'];
    const now = Date.now();
    
    // Sequence handling for collision resistance in same ms
    if (now === lastTime) {
      seq++;
    } else {
      seq = 0;
      lastTime = now;
    }

    let idBody = '';
    
    // Time Component
    if (config.layout.time > 0) {
      let timeStr;
      
      // For compact IDs, use 2024 epoch and seconds precision to save space
      if (config.layout.time < 10) {
        const CUSTOM_EPOCH = 1704067200000; // Jan 1 2024
        // Use seconds precision
        const timeVal = Math.max(0, Math.floor((now - CUSTOM_EPOCH) / 1000));
        timeStr = encode(timeVal, config.layout.time);
      } else {
        // Full millisecond precision from 1970
        timeStr = encode(now, config.layout.time);
      }
      
      // Truncate if too long (shouldn't happen with math above)
      if (timeStr.length > config.layout.time) {
         timeStr = timeStr.slice(-config.layout.time);
      }
      
      idBody += timeStr;
    }

    // Random/Seq Component
    const randCharsNeeded = config.layout.rand;
    if (randCharsNeeded > 0) {
      idBody += randomChars(randCharsNeeded);
    }

    // Checksum
    if (config.layout.check > 0) {
      // Checksum includes prefix to type-bind the ID
      const check = calculateChecksum((prefix || '') + idBody);
      idBody += check;
    }

    // Formatting with Hyphens
    let formatted = idBody;
    
    if (idBody.length > 8) {
      // Split into readable groups
      if (type === 'full') {
        // 26 chars: 4-4-4-4-4-4-2
        formatted = idBody.match(/.{1,4}/g).join('-');
      } else if (type === 'standard') {
        // 20 chars: 4-4-4-4-4
        formatted = idBody.match(/.{1,4}/g).join('-');
      } else if (type === 'compact') {
        // 14 chars: 4-4-4-2
        formatted = idBody.match(/.{1,4}/g).join('-');
      }
    }

    // Lowercase prefix
    const safePrefix = prefix ? prefix.toLowerCase() : '';
    
    if (safePrefix) {
      return `${safePrefix}-${formatted}`;
    }
    return formatted;
  }

  static parse(id) {
    const clean = id.replace(/-/g, '').toLowerCase();
    const len = clean.length;
    
    // Try to guess type based on length
    // Note: length might include prefix
    
    // Reverse find type
    let inferredType = 'unknown';
    // We don't know the prefix length easily without heuristics.
    // Assuming standard Prism IDs where payload length is fixed.
    
    for (const [key, cfg] of Object.entries(this.CONFIG)) {
        // If clean length matches exactly, or clean length minus 3-4 chars matches
        if (len === cfg.chars || (len >= cfg.chars + 2 && len <= cfg.chars + 6)) {
            inferredType = key;
            break; 
        }
    }

    return {
      original: id,
      clean: clean,
      length: len,
      type: inferredType
    };
  }
  
  static isValid(id) {
    try {
      if (!id) return false;
      
      // Strip hyphens
      const clean = id.replace(/-/g, '').toLowerCase();
      
      // Basic charset check
      for (let char of clean) {
        if (!ALPHABET_MAP.hasOwnProperty(char)) return false;
      }
      
      // Checksum validation
      // Assume the last character is checksum
      const payload = clean.slice(0, -1);
      const check = clean.slice(-1);
      
      // For a valid Prism ID, the checksum is calculated on the *unformatted* payload + prefix
      // Since 'clean' is effectively (prefix + payload + check) without hyphens,
      // and generate() did calculateChecksum(prefix + payload),
      // Recalculating checksum on payload (which includes prefix) should match check.
      
      return calculateChecksum(payload) === check;
    } catch (e) {
      return false;
    }
  }
}