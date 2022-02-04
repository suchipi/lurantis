import fs from "fs";
import express from "express";
import kleur from "kleur";
import { run } from "./run";
import { compile } from "./compile";

async function main() {
  // just checking this exists; if it doesn't, run will throw
  await run("which npm");

  const app = express();

  app.get("/:pkg", (req, res) => {
    function bail(status: number, message = "") {
      res.status(status);
      res.end(message);
    }

    const { pkg } = req.params;
    if (!pkg) {
      return bail(
        400,
        "please specify the package to bundle, eg '/globby@11.0.0'"
      );
    }

    const [name, version] = pkg.split("@");
    if (!name || !version) {
      return bail(
        400,
        "please specify the package to bundle, eg '/globby@11.0.0'"
      );
    }

    compile(name.trim(), version.trim()).then(
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
}

main().catch((err) =>
  console.error(
    kleur.red(
      err ? err.stack || err.message || "<unknown error>" : "<unknown error>"
    )
  )
);
