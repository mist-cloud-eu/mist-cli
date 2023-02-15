import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { addToHistory, output, sshReq } from "../utils";

class Purge implements Command {
  constructor(private params: { delete: string }) {}
  async execute() {
    try {
      output(await sshReq(`purge`, this.params.delete));
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "purge";
argParser.push(CMD, {
  desc: "Remove all ssh keys from current user",
  construct: (arg, params) => new Purge(params),
  flags: {
    delete: {
      desc: "Delete the user",
      defaultValue: "",
      overrideValue: "--delete",
    },
  },
  isRelevant: () => false,
});
