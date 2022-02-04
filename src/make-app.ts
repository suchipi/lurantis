import fs from "fs";
import express from "express";
import { compile } from "./compile";
import { Config } from "./config";
import { sanitizeOutput } from "./sanitize-output";

export function makeApp(config: Config): express.Application {
  const app = express();

  app.get("/*", (req, res) => {
    function bail(status: number, message = "") {
      res.status(status);
      res.end(sanitizeOutput(config, message));
    }

    console.log(`GET ${req.path}`);

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

    // shouldn't be possible, but
    if (!name || !version) {
      return bail(400, badPkgUrlMessage);
    }

    compile(config, name, version).then(
      ({ scriptPath, globalName }) => {
        res.setHeader("Content-Type", "text/javascript;charset=UTF-8");
        res.setHeader("X-Global-Name", globalName);

        const readStream = fs.createReadStream(scriptPath);
        readStream.on("open", () => {
          readStream.pipe(res);
        });
        readStream.on("error", (err) => {
          bail(500, err?.message);
        });
      },
      (err) => {
        bail(500, err?.message);
      }
    );
  });

  return app;
}
