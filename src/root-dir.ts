import path from "path";
import rootdir from "../rootdir";

export const rootDir = (...parts: Array<string>) =>
  path.resolve(rootdir, ...parts);
