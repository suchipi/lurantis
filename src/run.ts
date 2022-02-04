import * as firstBase from "first-base";

function printResult(result: firstBase.RunContext["result"]) {
  return `${result.code}\n${result.stdout}\n${result.stderr}`;
}

export async function run(
  cmd: string,
  args: Array<string> = [],
  options: firstBase.Options = {}
) {
  const ctx = firstBase.spawn(cmd, args, options);
  await ctx.completion;
  if (ctx.result.error || ctx.result.code !== 0) {
    throw new Error(
      `Command '${[cmd, ...args].join(" ")}' failed: ${printResult(ctx.result)}`
    );
  } else {
    return ctx.result;
  }
}
