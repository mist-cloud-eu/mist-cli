import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { addToHistory, output, sshReq } from "../utils";

class Whoami implements Command {
  constructor() {}
  async execute() {
    try {
      output((await sshReq(`whoami`)).trim());
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "whoami";
argParser.push(CMD, {
  desc: "Displays the email of the current ssh key",
  construct: (arg) => new Whoami(),
  flags: {},
  isRelevant: () => false,
});
