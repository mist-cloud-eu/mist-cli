import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { addToHistory, output, sshReq } from "../utils";

class ListEvents implements Command {
  constructor(private key: string) {}
  async execute() {
    try {
      output(await sshReq(`list-events ${this.key}`));
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "list-events";
argParser.push(CMD, {
  desc: "List the events of an api key",
  arg: "api key",
  construct: (arg, params) => new ListEvents(arg),
  flags: {},
});
