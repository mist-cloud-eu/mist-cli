import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { sshReq } from "../utils";

class Whoami implements Command {
  constructor() {}
  async execute() {
    try {
      console.log(await sshReq(`whoami`));
    } catch (e) {
      throw e;
    }
  }
}

argParser.push("whoami", {
  desc: "Displays the email of the current ssh key",
  construct: (arg) => new Whoami(),
  flags: {},
});
