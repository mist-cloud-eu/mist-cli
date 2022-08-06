import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { fetchOrg, sshReq } from "../utils";

class Capability implements Command {
  constructor(private capability: string, private params: { role: string }) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      console.log(
        await sshReq(
          `capability ${this.capability} --role ${this.params.role} --org ${org.name}`
        )
      );
    } catch (e) {
      throw e;
    }
  }
}

argParser.push("capability", {
  desc: "Add a capability to a role",
  arg: "capability",
  construct: (arg, params: { role: string }) => new Capability(arg, params),
  flags: {
    role: {
      arg: "role",
      short: "r",
      overrideValue: (s) => s,
    },
  },
});
