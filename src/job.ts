import * as changeCase from "change-case";
import { Config } from "./config";

export type Job = {
  id: string;
  pkg: {
    type: "npm";
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
    id: `npm:${pkgName}@${version}`,
    pkg: {
      type: "npm",
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
        config.cacheDir("npm", pkgName, version, "work", ...parts),
      bundle: config.cacheDir(pkgName, version, "bundle.js"),
    },
  };
}
