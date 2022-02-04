import * as changeCase from "change-case";
import { Config } from "./config";

export type Job = {
  id: string;
  pkg: {
    name: string;
    version: string;
  };
  globalName: string;
  paths: {
    pkgDir: (...parts: Array<string>) => string;
    entry: string;
    bundle: string;
  };
};

export function makeJob(config: Config, pkgName: string, version: string): Job {
  return {
    id: `${pkgName}@${version}`,
    pkg: {
      name: pkgName,
      version,
    },
    globalName:
      "_LUR_" +
      changeCase.camelCase(pkgName) +
      "_" +
      version.replace(/[^\w]/g, "_"),
    paths: {
      pkgDir: (...parts) => config.cacheDir(pkgName, version, ...parts),
      entry: config.cacheDir(pkgName, version, "index.js"),
      bundle: config.cacheDir(pkgName, version, "bundle.js"),
    },
  };
}
