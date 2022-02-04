import path from "path";
import fs from "fs";
import os from "os";
import * as kame from "kame";
import { run } from "./run";
import * as changeCase from "change-case";
import rimraf from "rimraf";
import { Config } from "./config";
import { rootDir } from "./root-dir";

function globalName(pkgName: string, version: string): string {
  return (
    "_LUR_" +
    changeCase.camelCase(pkgName) +
    "_" +
    version.replace(/[^\w]/g, "_")
  );
}

const npmLogsDir = path.join(os.homedir(), ".npm", "_logs");

const bundler = new kame.Bundler();

export async function compile(
  config: Config,
  pkgName: string,
  version: string
): Promise<{
  scriptPath: string;
  globalName: string;
}> {
  console.log(`Package requested: ${pkgName}@${version}`);

  const initialCwd = process.cwd();
  const gName = globalName(pkgName, version);

  const dir = (...parts: Array<string>) =>
    config.cacheDir(pkgName, version, ...parts);

  if (fs.existsSync(dir("dist", "bundle.js"))) {
    console.log(`Using cache: ${pkgName}@${version}`);
    return {
      scriptPath: dir("dist/bundle.js"),
      globalName: gName,
    };
  }

  console.log(`Building: ${pkgName}@${version}`);
  try {
    rimraf.sync(dir());

    await fs.promises.mkdir(dir(), { recursive: true });
    await fs.promises.writeFile(
      dir("package.json"),
      JSON.stringify({
        name: "@suchipi/null",
        version: "0.0.0",
        dependencies: { [pkgName]: version },
      })
    );

    console.log(`Starting npm install for: ${pkgName}@${version}`);
    await run("npm", ["install"], {
      cwd: dir(),
      env: { ...process.env, NPM_CONFIG_USERCONFIG: rootDir("target.npmrc") },
    });

    await fs.promises.writeFile(
      dir("index.js"),
      `module.exports = require(${JSON.stringify(pkgName)});`
    );
    await fs.promises.mkdir(dir("dist"), { recursive: true });

    console.log(`Starting kame bundle for: ${pkgName}@${version}`);
    process.chdir(dir());
    const { warnings } = bundler.bundle({
      input: dir("index.js"),
      output: dir("dist/bundle.js"),
      globalName: gName,
    });
    warnings.forEach(console.error);

    console.log(`Finished bundling: ${pkgName}@${version}`);
    return {
      scriptPath: dir("dist/bundle.js"),
      globalName: gName,
    };
  } catch (err) {
    rimraf.sync(dir());
    console.log(
      `Error while building ${pkgName}@${version}: ${
        err?.stack || err?.message || err
      }`
    );
    throw err;
  } finally {
    rimraf.sync(npmLogsDir);
    process.chdir(initialCwd);
  }
}
