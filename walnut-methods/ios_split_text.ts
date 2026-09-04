import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: iOS Split Text by Delimiter
 * description: Split $[textValue] by delimiter ${delimiter} and store parts in $[splitResult]
 * actionType: custom_ios_split_text
 * type: shared
 * needsLocator: false
 * category: iOS Device
 */
export async function iosSplitText(ctx: WalnutContext) {
  // ctx.args[0] = "textValue"   — runtime variable name from $[textValue] (the text to split)
  // ctx.args[1] = delimiter value from ${delimiter}
  // ctx.args[2] = "splitResult" — runtime variable name from $[splitResult] (where to store parts)
  const inputVar = ctx.args[0];
  const delimiter = ctx.args[1];
  const outputVar = ctx.args[2];

  const text = ctx.getVariable(inputVar);

  if (!text) {
    ctx.warn('Variable "' + inputVar + '" is empty or not set — nothing to split');
    ctx.setVariable(outputVar, JSON.stringify([]));
    return;
  }

  const parts = text.split(delimiter);
  ctx.log('Split "' + text + '" by "' + delimiter + '" → ' + parts.length + ' part(s): ' + JSON.stringify(parts));

  // Store the full array as a JSON string so it can be read by subsequent steps
  ctx.setVariable(outputVar, JSON.stringify(parts));

  // Also store each part individually as <outputVar>_0, <outputVar>_1, etc. for easy access
  parts.forEach((part, index) => {
    ctx.setVariable(outputVar + '_' + index, part.trim());
  });
}
