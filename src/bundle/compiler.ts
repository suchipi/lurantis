import fs from "fs";
import path from "path";
import util from "util";
import os from "os";
import rimraf from "rimraf";
import kleur from "kleur";
import * as kame from "kame";
import { run } from "../run";
import { rootDir } from "../root-dir";
import { makeLogger } from "../make-logger";
import { Job } from "../job";

const log = makeLogger(kleur.magenta("COMPILER"));

const bundler = new kame.Bundler();

const npmLogsDir = path.join(os.homedir(), ".npm", "_logs");

const primraf = util.promisify(rimraf);

export async function compile(job: Job): Promise<void> {
  log(`Building: ${job.id}`);

  const initialCwd = process.cwd();

  const dir = job.paths.workDir;

  try {
    await primraf(dir());

    await fs.promises.mkdir(dir(), { recursive: true });
    await fs.promises.writeFile(
      dir("package.json"),
      JSON.stringify({
        name: "@suchipi/null",
        version: "0.0.0",
        dependencies: { [job.pkg.name]: job.pkg.version },
      })
    );

    log(`Starting npm install for: ${job.id}`);
    await run("npm", ["install"], {
      cwd: dir(),
      env: {
        ...process.env,
        NPM_CONFIG_USERCONFIG: rootDir("data", "target.npmrc"),
      },
    });

    await fs.promises.writeFile(
      dir("index.js"),
      `module.exports = require(${JSON.stringify(job.pkg.name)});`
    );

    log(`Starting kame bundle for: ${job.id}`);
    process.chdir(dir()); // affects module paths in kame output comments/strings
    const { warnings } = bundler.bundle({
      input: dir("index.js"),
      output: job.paths.bundle,
      globalName: job.globalName,
    });
    warnings.forEach((message) => log(`kame warning from ${job.id}`, message));

    log(`Cleaning workdir for: ${job.id}`);
    await primraf(dir());

    log(`Finished bundling: ${job.id}`);
    return;
  } catch (err) {
    await primraf(dir());
    log(`Error while building ${job.id}: ${err?.stack || err?.message || err}`);
    throw err;
  } finally {
    // Don't want our disk to fill up
    await primraf(npmLogsDir);
    process.chdir(initialCwd);
  }
}
