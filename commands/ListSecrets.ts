import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { output, fetchOrg, sshReq, addToHistory, fetchOrgRaw } from "../utils";

class ListSecrets implements Command {
  constructor() {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      if (team === null)
        throw "Cannot manage secrets in organization root. First create a team.";
      output(await sshReq(`list-secrets --org ${org.name} --team ${team}`));
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "list-secrets";
argParser.push(CMD, {
  desc: "List the secrets of a team",
  construct: (arg, params) => new ListSecrets(),
  flags: {},
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org !== null;
  },
});
