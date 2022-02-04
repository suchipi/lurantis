import kleur from "kleur";
import { makeLogger } from "../make-logger";
import { compile } from "./compiler";
import { isCached } from "./cache";
import { Job } from "../job";

const log = makeLogger(kleur.green("DEPOT"));

const inflightBuilds: { [key: string]: Promise<void> } = {};

export async function ensureBundle(job: Job): Promise<void> {
  log(`Package requested: ${job.id}`);

  if (isCached(job)) {
    return;
  }

  const maybeInflightBuild = inflightBuilds[job.id];
  if (maybeInflightBuild != null) {
    log(`Awaiting in-flight build: ${job.id}`);
    return maybeInflightBuild;
  }

  try {
    const promise = compile(job);
    inflightBuilds[job.id] = promise;
    const result = await promise;
    return result;
  } finally {
    delete inflightBuilds[job.id];
  }
}
