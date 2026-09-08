import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Get Text From XPaths
 * description: Get text from object using xpaths ${xpaths} and store in $[textValue]
 * actionType: custom_get_text_from_xpaths
 * context: shared
 * needsLocator: false
 * category: Query
 */
export async function getTextFromXpaths(ctx: WalnutContext) {
  // ctx.args[0] = ${xpaths}    — pipe-separated XPath strings for the object, e.g.:
  //                              //android.widget.TextView[@resource-id="dest"]|//XCUIElementTypeStaticText[@name="dest"]
  //                              Any number of XPaths can be provided.
  // ctx.args[1] = "textValue"  — runtime variable name from $[textValue]
  //
  // HOW IT WORKS:
  // The Walnut agent captures the text from each XPath locator and stores it in the
  // variable context keyed by the XPath string itself. This method splits the pipe-
  // separated list, looks up each XPath in the variable context, and stores the first
  // non-empty result as the named runtime variable.

  const rawXpaths = ctx.args[0] || '';
  const outputVar = ctx.args[1];

  if (!outputVar) {
    throw new Error('get_text_from_xpaths: output variable name is missing. Add $[varName] to the step description.');
  }

  const xpaths = rawXpaths
    .split('|')
    .map(x => x.trim())
    .filter(x => x.length > 0);

  if (xpaths.length === 0) {
    throw new Error('get_text_from_xpaths: no XPaths provided. Pass at least one XPath in ${xpaths}.');
  }

  ctx.log('get_text_from_xpaths: checking ' + xpaths.length + ' XPath(s) for object text');

  // Strip invisible Unicode (bidi marks, zero-width chars) common on iOS/Android
  const clean = (v: unknown): string =>
    String(v ?? '')
      .replace(/\p{Cf}/gu, '')
      .replace(/[       　]/g, ' ')
      .normalize('NFC')
      .trim();

  for (const xpath of xpaths) {
    // The Walnut agent stores captured element text in variableContext using the XPath as the key
    const captured = ctx.getVariable(xpath);

    if (captured === undefined || captured === null) {
      ctx.log('No text captured for XPath, skipping: ' + xpath);
      continue;
    }

    const text = clean(captured);
    if (text === '') {
      ctx.log('Captured text is empty for XPath, skipping: ' + xpath);
      continue;
    }

    ctx.log('get_text_from_xpaths: found "' + text + '" from XPath: ' + xpath);
    ctx.setVariable(outputVar, text);
    return;
  }

  // None of the XPaths had text — build a diagnostic dump
  const dump = xpaths
    .map((x, i) => '  [' + (i + 1) + '] ' + x + ' → ' + JSON.stringify(ctx.getVariable(x)))
    .join('\n');

  throw new Error(
    'get_text_from_xpaths FAILED: none of the ' + xpaths.length + ' XPath(s) had captured text.\n'
    + dump + '\n'
    + 'Check that the object is visible on screen and at least one XPath locator matches it.'
  );
}
