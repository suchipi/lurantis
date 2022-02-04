import fs from "fs";
import kleur from "kleur";
import { Job } from "../job";
import { makeLogger } from "../make-logger";

const log = makeLogger(kleur.cyan("CACHE"));

export function isCached(job: Job): boolean {
  if (fs.existsSync(job.paths.bundle)) {
    log(`HIT: ${job.id}`);
    return true;
  } else {
    log(`MISS: ${job.id}`);
    return false;
  }
}
