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
  constructor(private params: { again: string }) {}
  async execute() {
    try {
      await execStreamPromise(
        `git add -A && ${this.params.again} && git push origin HEAD 2>&1`,
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
  construct: (arg, params) => new Deploy(params),
  flags: {
    again: {
      defaultValue: "(git diff-index --quiet HEAD || git commit -m 'Deploy')",
      overrideValue: "git commit --allow-empty -m 'Redeploy'",
    },
  },
  isRelevant: () => fs.existsSync("mist.json"),
});
