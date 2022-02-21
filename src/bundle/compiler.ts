import fs from "fs";
import path from "path";
import util from "util";
import os from "os";
import rimraf from "rimraf";
import kleur from "kleur";
import * as kame from "kame";
import { minify } from "terser";
import { run } from "../run";
import { rootDir } from "../root-dir";
import { makeLogger } from "../make-logger";
import { Job } from "../job";

const log = makeLogger(kleur.magenta("COMPILER"));

const bundler = new kame.Bundler();

const npmLogsDir = path.join(os.homedir(), ".npm", "_logs");

const primraf = util.promisify(rimraf);

export async function compile(job: Job): Promise<void> {
  if (job.description.type !== "npm") {
    throw new Error("Job types other than npm aren't supported yet");
  }

  const description = job.description;

  log(`Building: ${job.id}`);

  const originalCwd = process.cwd();
  const dir = job.paths.workDir;

  try {
    await primraf(dir());

    await fs.promises.mkdir(dir(), { recursive: true });
    await fs.promises.writeFile(
      dir("package.json"),
      JSON.stringify({
        name: "@suchipi/null",
        version: "0.0.0",
        dependencies: { [description.name]: description.version },
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
      `module.exports = require(${JSON.stringify(description.name)});`
    );

    log(`Starting kame bundle for: ${job.id}`);
    process.env.KAME_ALLOW_UNRESOLVED = "true";
    process.chdir(dir());

    bundler.bundle({
      input: dir("index.js"),
      output: job.paths.bundle,
      globalName: job.globalName,
    });

    log(`Cleaning workdir for: ${job.id}`);
    await primraf(dir());

    if (description.options.minify) {
      log(`Minifying: ${job.id}`);
      const input = await fs.promises.readFile(job.paths.bundle, "utf-8");
      const terserResult = await minify(input, { sourceMap: false });
      await fs.promises.writeFile(job.paths.bundle, terserResult.code!);
    } else {
      log(`No minification requested for: ${job.id}`);
    }

    log(`Finished bundling: ${job.id}`);
    return;
  } catch (err) {
    await primraf(dir());
    log(`Error while building ${job.id}: ${err?.stack || err?.message || err}`);
    throw err;
  } finally {
    process.chdir(originalCwd);
    // Don't want our disk to fill up
    await primraf(npmLogsDir);
  }
}
