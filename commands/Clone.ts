import { Command } from "typed-cmdargs";
import { clone } from "../clone_utils";
import { argParser } from "../parser";
import { sshReq } from "../utils";

class Clone implements Command {
  constructor(private name: string) {}
  async execute() {
    try {
      let reply = await sshReq(`clone ${this.name}`);
      if (!reply.startsWith("{")) {
        console.log(reply);
        return;
      }
      let structure = JSON.parse(reply);
      await clone(structure, this.name);
    } catch (e) {
      throw e;
    }
  }
}

argParser.push("clone", {
  desc: "Download the code of an organization",
  arg: "name",
  construct: (arg) => new Clone(arg),
  flags: {},
});
