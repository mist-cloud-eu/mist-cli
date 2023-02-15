import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import {
  addToHistory,
  fastPrintTable,
  fetchOrg,
  fetchOrgRaw,
  output,
  sshReq,
} from "../utils";

class ListEvents implements Command {
  constructor(private params: { key: string }) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      let cmd = [`list-events`, `--org`, org.name];
      if (this.params.key !== "") cmd.push(`--key`, this.params.key);
      fastPrintTable(JSON.parse(await sshReq(...cmd)));
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "list-events";
argParser.push(CMD, {
  desc: "List the events of an organization",
  construct: (arg, params: { key: string }) => new ListEvents(params),
  flags: {
    key: {
      short: "k",
      arg: "key",
      defaultValue: "",
      overrideValue: (s) => s,
    },
  },
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org !== null;
  },
});
