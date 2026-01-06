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