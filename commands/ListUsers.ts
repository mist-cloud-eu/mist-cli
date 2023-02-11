import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { output, fetchOrg, sshReq, addToHistory, fetchOrgRaw } from "../utils";

class ListUsers implements Command {
  constructor(private params: { pending: string }) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      output(
        await sshReq(`list-users ${this.params.pending} --org ${org.name}`)
      );
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "list-users";
argParser.push(CMD, {
  desc: "List the users of an organization",
  construct: (arg, params) => new ListUsers(params),
  flags: {
    pending: {
      desc: "Show only pending users",
      defaultValue: "",
      overrideValue: "--pending",
    },
  },
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org !== null;
  },
});
