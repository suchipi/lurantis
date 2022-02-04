import os from "os";
import { rootDir } from "./root-dir";
import { Config } from "./config";

export function sanitizeOutput(config: Config, input: string) {
  const replacements = [
    //
    config.cacheDir(),
    rootDir(),
    process.cwd(),
    os.homedir(),
  ].map((str) => new RegExp(str, "g"));

  return replacements.reduce((prev, curr) => {
    return prev.replace(curr, "[redacted]");
  }, input);
}
