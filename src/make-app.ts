import fs from "fs";
import express from "express";
import cors from "cors";
import kleur from "kleur";
import { Config } from "./config";
import { sanitizeOutput } from "./sanitize-output";
import { makeLogger } from "./make-logger";
import { makeJob } from "./job";
import { ensureBundle } from "./bundle/depot";
import { homepage } from "./homepage";

const log = makeLogger(kleur.blue("HTTP"));

export function makeApp(config: Config): express.Application {
  const app = express();

  app.use(cors());

  app.get("/", homepage);

  app.get("/npm/*", (req, res) => {
    function bail(status: number, message = "") {
      log(`Bailing on ${req.path}: ${status}`);

      res.status(status);
      res.end(sanitizeOutput(config, message));
    }

    log(`GET ${req.path}`);

    const badPkgUrlMessage =
      "please specify a valid npm package name and full version, eg /npm/lodash@4.17.21. You cannot use ranges (eg ^1.1.0), major-only versions (eg react@16) or tags like 'latest', 'next', etc.";

    const pkg = req.path.replace(/^\/npm\//, "");
    if (!pkg) {
      return bail(400, badPkgUrlMessage);
    }

    const matches = pkg.match(
      /^((?:@[a-z0-9\-~][a-z0-9\-._~]*\/)?[a-z0-9\-~][a-z0-9\-._~]*)@([A-Za-z0-9.\-_]+)$/
    );
    if (!matches) {
      return bail(400, badPkgUrlMessage);
    }

    const [_, name, version] = matches;
    if (/^[\d.]+$/.test(version) && !/^\d+\.\d+\.\d+$/.test(version)) {
      // They specified some numbers, but not semver
      return bail(400, badPkgUrlMessage);
    }

    if (!/\d/.test(version)) {
      // probably a tag like 'latest' or 'next'. They need to be more specific
      return bail(400, badPkgUrlMessage);
    }

    const job = makeJob(config, name, version);

    ensureBundle(job)
      .then(() => {
        res.setHeader("Content-Type", "text/javascript;charset=UTF-8");
        res.setHeader("X-Global-Name", job.globalName);

        const readStream = fs.createReadStream(job.paths.bundle);
        readStream.on("open", () => {
          readStream.pipe(res);
        });
        readStream.on("error", (err) => {
          bail(500, err?.message);
        });
      })
      .catch((err) => {
        bail(500, err?.message);
      });
  });

  return app;
}
