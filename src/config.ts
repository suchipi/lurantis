import arg from "arg";
import path from "path";

export type Config = {
  cacheDir: (...parts: Array<string>) => string;
  port: number;
  helpRequested: boolean;
  versionRequested: boolean;
};

export function parseArgv(argv: Array<string>): Config {
  const args = arg(
    {
      "--cache-dir": String,
      "--port": Number,
      "--help": Boolean,
      "--version": Boolean,

      "-h": "--help",
      "-help": "--help",
      "-?": "--help",

      "-v": "--version",
      "-version": "--version",
    },
    { argv }
  );

  const cacheDir = args["--cache-dir"]
    ? path.resolve(args["--cache-dir"])
    : path.join(process.cwd(), "lurantis-cache");

  return {
    cacheDir: (...parts: Array<string>) => path.resolve(cacheDir, ...parts),
    port: args["--port"] || 8080,
    helpRequested: args["--help"] || false,
    versionRequested: args["--version"] || false,
  };
}
