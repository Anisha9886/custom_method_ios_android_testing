import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: iOS Get Element Text
 * description: Get text from element ${selector} on iOS device and store in $[textValue]
 * actionType: custom_ios_get_text
 * type: shared
 * needsLocator: false
 * category: iOS Device
 */
export async function iosGetText(ctx: WalnutContext) {
  // ctx.args[0] = value of ${selector} — the element selector to read text from
  // ctx.args[1] = "textValue" — the runtime variable name from $[textValue]
  const selector = ctx.args[0];
  const outputVar = ctx.args[1];

  const text = ctx.getVariable(selector);
  ctx.log('iOS element text retrieved: ' + text);
  ctx.setVariable(outputVar, text);
}
