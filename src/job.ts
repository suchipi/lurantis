import * as changeCase from "change-case";
import { Config } from "./config";

export type JobOptions = {
  minify?: boolean;
};

export type JobDescription = {
  type: "npm";
  name: string;
  version: string;
  options: JobOptions;
};

export type Job = {
  id: string;
  description: JobDescription;
  globalName: string;
  options: JobOptions;
  paths: {
    workDir: (...parts: Array<string>) => string;
    bundle: string;
  };
};

export function makeJob(config: Config, description: JobDescription): Job {
  switch (description.type) {
    case "npm": {
      const { name, version, options } = description;

      return {
        id: `npm:${name}@${version}/${JSON.stringify(options)}`,
        description,
        globalName:
          "_LUR_" +
          changeCase.camelCase(name) +
          "_" +
          version.replace(/[^\w]/g, "_"),
        options,
        paths: {
          workDir: (...parts) =>
            config.cacheDir(
              options.minify ? "npm-min" : "npm",
              name,
              version,
              "work",
              ...parts
            ),
          bundle: config.cacheDir(
            options.minify ? "npm-min" : "npm",
            name,
            version,
            "bundle.js"
          ),
        },
      };
    }

    default: {
      throw new Error("Unhandled job type: " + description.type);
    }
  }
}
