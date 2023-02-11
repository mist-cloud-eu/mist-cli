import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { output, fetchOrg, sshReq, addToHistory, fetchOrgRaw } from "../utils";

class ListServices implements Command {
  constructor(private team: string) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      output(await sshReq(`list-services ${this.team} --org ${org.name}`));
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "list-services";
argParser.push(CMD, {
  desc: "List the services of a team",
  arg: "team",
  construct: (arg, params) => new ListServices(arg),
  flags: {},
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org !== null;
  },
});
