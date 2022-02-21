import kleur from "kleur";
import { formatError } from "pretty-print-error";
import { parseArgv } from "./config";
import { getUsage, getVersion } from "./help-and-version";
import { makeApp } from "./make-app";
import { makeLogger } from "./make-logger";

const log = makeLogger(kleur.yellow("CLI"));

async function main() {
  const config = parseArgv(process.argv.slice(2));
  if (config.helpRequested) {
    console.log(getUsage());
    process.exit(0);
  }
  if (config.versionRequested) {
    console.log(getVersion());
    process.exit(0);
  }

  const app = makeApp(config);
  app.listen(config.port, () => {
    log(`Listening on port ${config.port}`);
  });
}

main().catch((err) => {
  log(formatError(err));
  process.exit(1);
});
