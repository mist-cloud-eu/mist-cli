import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { fetchOrg, sshReq } from "../utils";

class Key implements Command {
  constructor(private duration: string, private params: { update: string }) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      console.log(
        await sshReq(
          `key ${this.duration} ${this.params.update} --org ${org.name}`
        )
      );
    } catch (e) {
      throw e;
    }
  }
}

argParser.push("key", {
  desc: "Create an api key",
  arg: "duration",
  construct: (arg, params) => new Key(arg, params),
  flags: {
    update: {
      desc: "Update the duration of a key",
      arg: "key",
      defaultValue: "",
      overrideValue: (s) => `--update ${s}`,
    },
  },
});
