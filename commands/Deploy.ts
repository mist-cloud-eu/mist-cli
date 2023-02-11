import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import fs from "fs";
import {
  addToHistory,
  execPromise,
  execStreamPromise,
  output,
  sshReq,
} from "../utils";

class Deploy implements Command {
  constructor() {}
  async execute() {
    try {
      await execStreamPromise(
        `git add -A && (git diff-index --quiet HEAD || git commit -m 'Deploy') && git push origin HEAD 2>&1`,
        output
      );
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "deploy";
argParser.push(CMD, {
  desc: "Short hand for git add, commit, and push",
  construct: (arg) => new Deploy(),
  flags: {},
  isRelevant: () => fs.existsSync("mist.json"),
});
