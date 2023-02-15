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

class ListCrons implements Command {
  constructor() {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      fastPrintTable(JSON.parse(await sshReq(`list-crons`, `--org`, org.name)));
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "list-crons";
argParser.push(CMD, {
  desc: "List the cron jobs of an organization",
  construct: (arg, params) => new ListCrons(),
  flags: {},
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org !== null;
  },
});
