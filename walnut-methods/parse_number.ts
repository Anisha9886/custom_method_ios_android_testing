import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Parse Number
 * description: Strip invisible Unicode and currency/grouping symbols from ${text} and store numeric string in $[number]
 * actionType: custom_parse_number
 * type: shared
 * needsLocator: false
 * category: iOS Device
 */
export async function parseNumber(ctx: WalnutContext) {
  // Converts display strings like "₹1,299", "$4,500.50", "1 234,99 €", "14\u200B" → "1299", "4500.50", "1234.99"
  // Runs strip_invisible logic inline so this method is self-contained.
  //
  // ctx.args[0] = resolved value of ${text}    — the raw display string
  // ctx.args[1] = "number" — runtime variable name from $[number]

  const raw    = String(ctx.args[0] ?? '').replace(/\p{Cf}/gu, '').replace(/[\u00A0\u202F\u2009\u200A\u2007\u2008\u205F\u3000]/g, ' ').normalize('NFC');
  const outVar = ctx.args[1];

  ctx.log('parse_number: raw input = ' + JSON.stringify(ctx.args[0]));
  ctx.log('parse_number: after invisible strip = ' + JSON.stringify(raw));

  if (!raw.trim()) {
    throw new Error('parse_number FAILED: input is empty after stripping invisible characters');
  }

  // Remove currency symbols and letter suffixes (₹, $, €, £, ¥, Rs, USD, INR, etc.)
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^[^\d\-\+]+/, '');   // leading currency / symbols
  cleaned = cleaned.replace(/[^\d\-\+\.]+$/, ''); // trailing currency / symbols / letters

  // Detect decimal separator: if both '.' and ',' present, the last one is decimal
  const hasDot   = cleaned.includes('.');
  const hasComma = cleaned.includes(',');

  if (hasDot && hasComma) {
    const lastDot   = cleaned.lastIndexOf('.');
    const lastComma = cleaned.lastIndexOf(',');
    if (lastComma > lastDot) {
      // European format: 1.234,56 → 1234.56
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // Standard format: 1,234.56 → 1234.56
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (hasComma) {
    // Could be grouping (1,234) or decimal (1,5) — treat as grouping if >1 digit after comma
    const afterComma = cleaned.split(',').pop() ?? '';
    if (afterComma.length === 3) {
      cleaned = cleaned.replace(/,/g, '');  // grouping separator
    } else {
      cleaned = cleaned.replace(',', '.');  // decimal separator
    }
  }

  // Remove any remaining grouping spaces
  cleaned = cleaned.replace(/\s/g, '');

  const num = parseFloat(cleaned);
  if (isNaN(num)) {
    throw new Error(
      'parse_number FAILED: could not parse a number from ' + JSON.stringify(raw) +
      ' (cleaned to ' + JSON.stringify(cleaned) + ')'
    );
  }

  ctx.log('parse_number: result = ' + String(num));
  ctx.setVariable(outVar, String(num));
}
