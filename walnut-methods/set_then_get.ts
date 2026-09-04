import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Set Then Get
 * description: Round-trip check — store ${value} in $[name] then read it back to confirm the variable store works
 * actionType: custom_set_then_get
 * context: shared
 * needsLocator: false
 * category: Smoke
 */
export async function setThenGet(ctx: WalnutContext) {
  // ctx.args[0] = value of ${value} — the data to store
  // ctx.args[1] = "name" — the runtime variable name from $[name]
  const value = ctx.args[0];
  const varName = ctx.args[1];

  ctx.log('SET_THEN_GET — writing "' + value + '" into variable "' + varName + '"');
  ctx.setVariable(varName, value);

  const retrieved = ctx.getVariable(varName);
  ctx.log('SET_THEN_GET — read back: ' + JSON.stringify(retrieved));

  if (retrieved !== value) {
    throw new Error(
      'SET_THEN_GET FAILED: stored ' + JSON.stringify(value) +
      ' but got back ' + JSON.stringify(retrieved) +
      ' — variable store round-trip is broken'
    );
  }

  ctx.log('SET_THEN_GET PASSED — variable store is working correctly');
}
