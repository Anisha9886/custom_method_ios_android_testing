import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Get Text From XPaths
 * description: Read captured text from ${xpath1} or ${xpath2} or ${xpath3} and store in $[textValue]
 * actionType: custom_get_text_from_xpaths
 * context: shared
 * needsLocator: false
 * category: Query
 */
export async function getTextFromXpaths(ctx: WalnutContext) {
  // ctx.args[0] = value of ${xpath1} — variable name holding text captured from the first XPath
  // ctx.args[1] = value of ${xpath2} — variable name holding text captured from the second XPath
  // ctx.args[2] = value of ${xpath3} — variable name holding text captured from the third XPath
  // ctx.args[3] = "textValue"        — runtime variable name from $[textValue]
  //
  // HOW IT WORKS: In shared context there is no DOM access. Each ${xpathN} arg is the name of a
  // runtime variable that was populated by a prior "capture element text" step for that XPath.
  // This method picks the first variable that resolves to a non-empty string and stores it.

  const varNames  = [ctx.args[0], ctx.args[1], ctx.args[2]];
  const outputVar = ctx.args[3];

  // Strip invisible Unicode (bidi marks, zero-width chars) common on iOS/Android
  const clean = (v: unknown): string =>
    String(v ?? '')
      .replace(/\p{Cf}/gu, '')
      .replace(/[       　]/g, ' ')
      .normalize('NFC')
      .trim();

  for (const varName of varNames) {
    if (!varName || varName.trim() === '') continue;

    const raw = ctx.getVariable(varName);
    if (raw === undefined || raw === null) {
      ctx.log('Variable not set, skipping: ' + varName);
      continue;
    }

    const text = clean(raw);
    if (text === '') {
      ctx.log('Variable is empty, skipping: ' + varName);
      continue;
    }

    ctx.log('get_text_from_xpaths: using text "' + text + '" from variable "' + varName + '"');
    ctx.setVariable(outputVar, text);
    return;
  }

  throw new Error(
    'get_text_from_xpaths FAILED: none of the 3 variables contained text.\n'
    + '  xpath1 var = ' + varNames[0] + ' → ' + JSON.stringify(ctx.getVariable(varNames[0])) + '\n'
    + '  xpath2 var = ' + varNames[1] + ' → ' + JSON.stringify(ctx.getVariable(varNames[1])) + '\n'
    + '  xpath3 var = ' + varNames[2] + ' → ' + JSON.stringify(ctx.getVariable(varNames[2])) + '\n'
    + 'Ensure at least one capture step ran before this method and stored a non-empty value.'
  );
}
