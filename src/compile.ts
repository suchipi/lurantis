import fs from "fs";
import * as kame from "kame";
import { run } from "./run";
import { rootDir } from "./root-dir";
import * as changeCase from "change-case";
import rimraf from "rimraf";

function globalName(pkgName: string, version: string): string {
  return (
    "ODB_" +
    changeCase.camelCase(pkgName) +
    "_" +
    version.replace(/[^\w]/g, "_")
  );
}

const bundler = new kame.Bundler();

export async function compile(
  pkgName: string,
  version: string
): Promise<{
  scriptPath: string;
  globalName: string;
}> {
  const gName = globalName(pkgName, version);

  const dir = (...parts: Array<string>) =>
    rootDir("cache", pkgName, version, ...parts);

  if (fs.existsSync(dir("dist", "bundle.js"))) {
    return {
      scriptPath: dir("dist/bundle.js"),
      globalName: gName,
    };
  }

  try {
    await fs.promises.mkdir(dir());
    await fs.promises.writeFile(
      dir("package.json"),
      JSON.stringify({
        name: "@suchipi/null",
        version: "0.0.0",
        dependencies: { [pkgName]: [version] },
      })
    );

    await run("npm", ["install", "--ignore-scripts"], { cwd: dir() });

    await fs.promises.writeFile(
      dir("index.js"),
      `module.exports = require(${JSON.stringify(pkgName)});`
    );
    await fs.promises.mkdir(dir("dist"));

    const { warnings } = bundler.bundle({
      input: dir("src/index.js"),
      output: dir("dist/bundle.js"),
      globalName: gName,
    });
    warnings.forEach(console.error);

    return {
      scriptPath: dir("dist/bundle.js"),
      globalName: gName,
    };
  } catch (err) {
    rimraf.sync(dir());
    throw err;
  }
}
