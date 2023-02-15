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

class ListKeys implements Command {
  constructor(private params: { active: boolean; expired: boolean }) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      let cmd = [`list-keys`, `--org`, org.name];
      if (this.params.active === true) cmd.push("--active");
      if (this.params.expired === true) cmd.push("--expired");
      fastPrintTable(JSON.parse(await sshReq(...cmd)));
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "list-keys";
argParser.push(CMD, {
  desc: "List the keys of an organization",
  construct: (arg, params) => new ListKeys(params),
  flags: {
    active: {
      short: "a",
      desc: "Display active keys only",
      defaultValue: false,
      overrideValue: true,
    },
    expired: {
      short: "e",
      desc: "Display expired keys only",
      defaultValue: false,
      overrideValue: true,
    },
  },
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org !== null;
  },
});
