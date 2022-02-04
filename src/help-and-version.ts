import fs from "fs";
import { rootDir } from "./root-dir";

export function getUsage(): string {
  return fs
    .readFileSync(rootDir("data", "usage.txt"), "utf-8")
    .replace("$VERSION", getVersion());
}

export function getVersion(): string {
  const json = fs.readFileSync(rootDir("package.json"), "utf-8");
  const pkg = JSON.parse(json);
  return pkg.version;
}
