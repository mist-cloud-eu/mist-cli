import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { fetchOrg, sshReq } from "../utils";

class ListTeams implements Command {
  constructor() {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      console.log(await sshReq(`list-teams --org ${org.name}`));
    } catch (e) {
      throw e;
    }
  }
}

argParser.push("list-teams", {
  desc: "List the teams of an organization",
  construct: (arg, params) => new ListTeams(),
  flags: {},
});
