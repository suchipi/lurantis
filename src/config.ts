import arg from "arg";
import path from "path";

export type Config = {
  cacheDir: (...parts: Array<string>) => string;
  port: number;
};

export function parseArgv(argv: Array<string>): Config {
  const args = arg(
    {
      "--cache-dir": String,
      "--port": Number,
    },
    { argv }
  );

  const cacheDir =
    args["--cache-dir"] || path.join(process.cwd(), "lurantis-cache");

  return {
    cacheDir: (...parts: Array<string>) => path.resolve(cacheDir, ...parts),
    port: args["--port"] || 8080,
  };
}
