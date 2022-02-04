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
    workDir: (...parts: Array<string>) => string;
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
      workDir: (...parts) =>
        config.cacheDir(pkgName, version, "work", ...parts),
      bundle: config.cacheDir(pkgName, version, "bundle.js"),
    },
  };
}
