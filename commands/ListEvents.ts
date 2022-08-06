import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { sshReq } from "../utils";

class ListEvents implements Command {
  constructor(private key: string) {}
  async execute() {
    try {
      console.log(await sshReq(`list-events ${this.key}`));
    } catch (e) {
      throw e;
    }
  }
}

argParser.push("list-events", {
  desc: "List the events of an api key",
  arg: "api key",
  construct: (arg, params) => new ListEvents(arg),
  flags: {},
});
