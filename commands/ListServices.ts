import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import {
  output,
  fetchOrg,
  sshReq,
  addToHistory,
  fetchOrgRaw,
  fastPrintTable,
} from "../utils";

class ListServices implements Command {
  constructor(private params: { team: string }) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      let cmd = [`list-services`, `--org`, org.name];
      if (this.params.team !== "") {
        cmd.push(`--team`, this.params.team);
        fastPrintTable(JSON.parse(await sshReq(...cmd)), {
          name: "Name",
          teamPrivate: "Private",
        });
      } else {
        fastPrintTable(JSON.parse(await sshReq(...cmd)), {
          team: "Team",
          name: "Name",
          teamPrivate: "Private",
        });
      }
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "list-services";
argParser.push(CMD, {
  desc: "List the services of a team",
  construct: (arg, params: { team: string }) => new ListServices(params),
  flags: {
    team: {
      short: "t",
      arg: "team",
      defaultValue: "",
      overrideValue: (s) => s,
    },
  },
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org !== null;
  },
});
