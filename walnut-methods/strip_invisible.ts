import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Strip Invisible Characters
 * description: Strip invisible Unicode from $[rawText] and store cleaned value in $[cleanText]
 * actionType: custom_strip_invisible
 * context: shared
 * needsLocator: false
 * category: iOS Device
 */
export async function stripInvisible(ctx: WalnutContext) {
  // ctx.args[0] = "rawText"   — runtime variable name from $[rawText]  (source to clean)
  // ctx.args[1] = "cleanText" — runtime variable name from $[cleanText] (where to store result)
  //
  // iOS wraps rendered numbers and labels in invisible Unicode characters, causing assertions
  // like expected "14" but element text is "14" — both printing identically because the
  // difference is invisible. This method removes that entire class of characters.
  //
  // What gets stripped:
  //   - Unicode category Cf (format characters): bidi marks (U+200F, U+200E), zero-width
  //     joiners/non-joiners (U+200C, U+200D), BOM (U+FEFF), word-joiner (U+2060),
  //     invisible separators, etc.
  //   - The non-breaking space family: NBSP (U+00A0), narrow NBSP (U+202F),
  //     thin space (U+2009), hair space (U+200A), figure space (U+2007),
  //     zero-width space (U+200B) — collapsed to a regular ASCII space.
  //
  // What is preserved:
  //   - Leading/trailing regular spaces (real data in some fields).
  //   - All printable characters.
  //
  // Normalisation: NFC applied last so combining characters compose correctly.

  const inputVar  = ctx.args[0];
  const outputVar = ctx.args[1];

  const raw = ctx.getVariable(inputVar);

  if (raw === undefined || raw === null) {
    ctx.warn('strip_invisible: variable "' + inputVar + '" is not set — storing empty string');
    ctx.setVariable(outputVar, '');
    return;
  }

  const text = String(raw);

  // --- Step 1: Remove Unicode category Cf (format / invisible control characters) ---
  // Regex \p{Cf} matches all Unicode format characters (requires ES2018+ with 'u' flag).
  const noCf = text.replace(/\p{Cf}/gu, '');

  // --- Step 2: Collapse the non-breaking space family to a regular space ---
  // U+00A0 NO-BREAK SPACE
  // U+202F NARROW NO-BREAK SPACE
  // U+2009 THIN SPACE
  // U+200A HAIR SPACE
  // U+2007 FIGURE SPACE
  // U+2008 PUNCTUATION SPACE
  // U+205F MEDIUM MATHEMATICAL SPACE
  // U+3000 IDEOGRAPHIC SPACE
  const noFancySpace = noCf.replace(/[\u00A0\u202F\u2009\u200A\u2007\u2008\u205F\u3000]/g, ' ');

  // --- Step 3: NFC normalisation ---
  const clean = noFancySpace.normalize('NFC');

  // Diagnostic: show what changed (hex comparison when strings look identical)
  if (clean !== text) {
    const hexRaw   = Array.from(text).map(c => 'U+' + c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')).join(' ');
    const hexClean = Array.from(clean).map(c => 'U+' + c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')).join(' ');
    ctx.log('strip_invisible: cleaned "' + inputVar + '"');
    ctx.log('  raw   codepoints: ' + hexRaw);
    ctx.log('  clean codepoints: ' + hexClean);
  } else {
    ctx.log('strip_invisible: "' + inputVar + '" had no invisible characters — value unchanged');
  }

  ctx.setVariable(outputVar, clean);
}
