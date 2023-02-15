import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { output, fetchOrg, sshReq, addToHistory, fetchOrgRaw } from "../utils";

class ListRoles implements Command {
  constructor() {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      output(await sshReq(`list-roles`, `--org`, org.name));
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "list-roles";
argParser.push(CMD, {
  desc: "List the roles of an organization",
  construct: (arg, params) => new ListRoles(),
  flags: {},
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org !== null;
  },
});
