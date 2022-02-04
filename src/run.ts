import * as firstBase from "first-base";

export async function run(
  cmd: string,
  args: Array<string> = [],
  options: firstBase.Options = {}
) {
  const ctx = firstBase.spawn(cmd, args, options);
  await ctx.completion;
  if (ctx.result.error || ctx.result.code !== 0) {
    throw new Error(
      `Command '${JSON.stringify({
        cmd,
        args,
        options,
      })}' failed: ${JSON.stringify(ctx.result)}`
    );
  } else {
    return ctx.result;
  }
}
