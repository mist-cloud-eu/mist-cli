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

class ListCapabilities implements Command {
  constructor(private role: string) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      fastPrintTable(
        JSON.parse(
          await sshReq(`list-capabilities`, this.role, `--org`, org.name)
        )
      );
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "list-capabilities";
argParser.push(CMD, {
  desc: "List the capabilities of a role",
  arg: "role",
  construct: (arg, params) => new ListCapabilities(arg),
  flags: {},
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org !== null;
  },
});
