import kleur from "kleur";
import { parseArgv } from "./config";
import { makeApp } from "./make-app";
import { makeLogger } from "./make-logger";

const log = makeLogger(kleur.yellow("CLI"));

async function main() {
  const config = parseArgv(process.argv.slice(2));
  const app = makeApp(config);
  app.listen(config.port, () => {
    log(`Listening on port ${config.port}`);
  });
}

main().catch((err) => {
  log(
    kleur.red(
      err ? err.stack || err.message || "<unknown error>" : "<unknown error>"
    )
  );
  process.exit(1);
});
