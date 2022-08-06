import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { sshReq } from "../utils";

class Purge implements Command {
  constructor(private params: { delete: string }) {}
  async execute() {
    try {
      console.log(await sshReq(`purge ${this.params.delete}`));
    } catch (e) {
      throw e;
    }
  }
}

argParser.push("purge", {
  desc: "Remove all ssh keys from current user",
  construct: (arg, params) => new Purge(params),
  flags: {
    delete: {
      desc: "Delete the user",
      defaultValue: "",
      overrideValue: "--delete",
    },
  },
});
