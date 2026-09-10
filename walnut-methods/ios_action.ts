import type { WalnutIosContext } from './walnut';

/** @walnut_method
 * name: iOS Action
 * description: Read the linked object's text on the iOS device and store it in $[textValue]
 * actionType: custom_ios_action
 * context: ios
 * needsLocator: true
 * category: iOS Device
 */
export async function iosAction(ctx: WalnutIosContext) {
  // ctx.locator — the step object's resolved XPath, because needsLocator is true
  // ctx.args[0] — "textValue", the runtime variable NAME from $[textValue]
  //
  // WHAT CHANGED, AND WHY IT MATTERS. The previous version of this method read
  // `ctx.getVariable(ctx.locator)`, on the belief that the agent pre-populated the variable
  // store with each element's live text keyed by its XPath. Nothing does that — the store is
  // keyed by variable NAME — so the lookup returned undefined on every run and the method
  // threw "no text captured, check the element is visible" while the element was in fact
  // right there. The context is now `ios`, which carries the run's device connection, and
  // ctx.getText below is a real call to WebDriverAgent.

  const outputVar = ctx.args[0];
  if (!outputVar) {
    throw new Error(
      'ios_action: missing output variable — add $[varName] to the step description, '
      + 'e.g. "Get text from Source City Field and store in $[sourceCity]".',
    );
  }

  const text = await ctx.getText(ctx.locator);

  // iOS pads rendered strings with invisible Unicode (bidi marks around digits and RTL-
  // adjacent text), which is how a later comparison of "2" against "2" fails while both
  // print identically. Strip that class before storing so every downstream assertion is
  // comparing what it appears to be comparing.
  const clean = String(text ?? '')
    .replace(/\p{Cf}/gu, '')
    .replace(/[       　]/g, ' ')
    .normalize('NFC')
    .trim();

  if (clean === '') {
    // Reached the device and it answered with nothing — a real, diagnosable state, unlike
    // the old always-undefined path. Either the element holds no text or the locator is on
    // the wrong node, and both are worth saying out loud.
    throw new Error(
      'ios_action FAILED: the element resolved but its text is empty.\n'
      + '  locator: ' + ctx.locator + '\n'
      + '  raw value: ' + JSON.stringify(text) + '\n'
      + 'The locator may be pointing at a container rather than the label — check what it matches.',
    );
  }

  ctx.log('ios_action: "' + clean + '" → ' + outputVar);
  ctx.setVariable(outputVar, clean);
}
