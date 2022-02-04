import kleur from "kleur";
import { parseArgv } from "./config";
import { makeApp } from "./make-app";

async function main() {
  const config = parseArgv(process.argv.slice(2));
  const app = makeApp(config);
  app.listen(config.port, () => {
    console.log(`Listening on port ${config.port}`);
  });
}

main().catch((err) =>
  console.error(
    kleur.red(
      err ? err.stack || err.message || "<unknown error>" : "<unknown error>"
    )
  )
);
