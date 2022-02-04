import fs from "fs";
import express from "express";
import kleur from "kleur";
import { Config } from "./config";
import { sanitizeOutput } from "./sanitize-output";
import { makeLogger } from "./make-logger";
import { makeJob } from "./job";
import { ensureBundle } from "./bundle/depot";

const log = makeLogger(kleur.blue("HTTP"));

export function makeApp(config: Config): express.Application {
  const app = express();

  app.get("/*", (req, res) => {
    function bail(status: number, message = "") {
      log(`Bailing on ${req.path}: ${status}`);

      res.status(status);
      res.end(sanitizeOutput(config, message));
    }

    log(`GET ${req.path}`);

    const badPkgUrlMessage =
      "please specify a valid npm package name and version, eg /lodash@4.17.21";

    const pkg = req.path.replace(/^\//, "");
    if (!pkg) {
      return bail(400, badPkgUrlMessage);
    }

    const matches = pkg.match(
      /^((?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*)@([A-Za-z0-9.-_~]+)$/
    );
    if (!matches) {
      return bail(400, badPkgUrlMessage);
    }

    const [_, name, version] = matches;

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
