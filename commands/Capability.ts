import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { addToHistory, fetchOrg, fetchOrgRaw, output, sshReq } from "../utils";

class Capability implements Command {
  constructor(private capability: string, private params: { role: string }) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      output(
        await sshReq(
          `capability ${this.capability} --role ${this.params.role} --org ${org.name}`
        )
      );
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "capability";
argParser.push(CMD, {
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
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org !== null;
  },
});
