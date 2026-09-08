import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Get Text From XPaths
 * description: Read visible text from ${xpath1} or ${xpath2} or ${xpath3} and store in $[textValue]
 * actionType: custom_get_text_from_xpaths
 * context: web
 * needsLocator: false
 * category: Query
 */
export async function getTextFromXpaths(ctx: WalnutContext) {
  // ctx.args[0] = value of ${xpath1} — first XPath to try
  // ctx.args[1] = value of ${xpath2} — second XPath to try
  // ctx.args[2] = value of ${xpath3} — third XPath to try
  // ctx.args[3] = "textValue"        — runtime variable name from $[textValue]

  const xpaths   = [ctx.args[0], ctx.args[1], ctx.args[2]];
  const outputVar = ctx.args[3];

  for (const xpath of xpaths) {
    if (!xpath || xpath.trim() === '') continue;

    try {
      const visible = await ctx.isVisible(xpath);
      if (!visible) {
        ctx.log('XPath not visible, skipping: ' + xpath);
        continue;
      }

      const rawText = await ctx.getText(xpath);

      // Strip invisible Unicode (bidi marks, zero-width chars) common on iOS/Android
      const text = String(rawText ?? '')
        .replace(/\p{Cf}/gu, '')
        .replace(/[       　]/g, ' ')
        .normalize('NFC')
        .trim();

      if (text === '') {
        ctx.log('XPath visible but text is empty, skipping: ' + xpath);
        continue;
      }

      ctx.log('get_text_from_xpaths: found text "' + text + '" at XPath: ' + xpath);
      ctx.setVariable(outputVar, text);
      return;
    } catch (e) {
      ctx.log('XPath errored, skipping: ' + xpath + ' — ' + (e as Error).message);
    }
  }

  throw new Error(
    'get_text_from_xpaths FAILED: none of the 3 XPaths produced visible text.\n'
    + '  xpath1 = ' + xpaths[0] + '\n'
    + '  xpath2 = ' + xpaths[1] + '\n'
    + '  xpath3 = ' + xpaths[2] + '\n'
    + 'Check that at least one locator matches an element with text on screen.'
  );
}
