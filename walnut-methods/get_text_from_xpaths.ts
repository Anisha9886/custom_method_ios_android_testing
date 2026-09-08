import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: iOS Get Object Text
 * description: Get text from object on iOS device and store in $[textValue]
 * actionType: custom_ios_get_object_text
 * context: shared
 * needsLocator: true
 * category: iOS Device
 */
export async function iosGetObjectText(ctx: WalnutContext) {
  // ctx.locator   — the object's locator (XPath or selector), injected by the Walnut agent
  // ctx.args[0]   — "textValue" — runtime variable name from $[textValue]

  const outputVar = ctx.args[0];

  if (!outputVar) {
    throw new Error('ios_get_object_text: missing output variable — add $[varName] to the step description.');
  }
  // ctx.getElementText() reads the LIVE element via ios_get_text on the device.
  // Defaults to this step's linked object; pass an xpath to override.
  const locator = (ctx as any).locator as string;
  const captured = await (ctx as any).getElementText();

  // Strip invisible Unicode chars common on iOS/Android (bidi marks, zero-width spaces)
  const clean = (v: unknown): string =>
    String(v ?? '')
      .replace(/\p{Cf}/gu, '')
      .replace(/[       　]/g, ' ')
      .normalize('NFC')
      .trim();

  const text = clean(captured);

  if (text === '') {
    throw new Error(
      'ios_get_object_text FAILED: no text captured from object.\n'
      + '  locator: ' + locator + '\n'
      + '  raw value: ' + JSON.stringify(captured) + '\n'
      + 'Check that the object is visible on screen and the locator matches it.'
    );
  }

  ctx.log('ios_get_object_text: "' + text + '" → ' + outputVar);
  ctx.setVariable(outputVar, text);
}
