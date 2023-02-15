import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { output, fetchOrg, sshReq, addToHistory, fetchOrgRaw } from "../utils";

class ListTeams implements Command {
  constructor() {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      output(await sshReq(`list-teams`, `--org`, org.name));
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "list-teams";
argParser.push(CMD, {
  desc: "List the teams of an organization",
  construct: (arg, params) => new ListTeams(),
  flags: {},
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org !== null;
  },
});
