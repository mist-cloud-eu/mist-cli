import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import {
  output,
  fetchOrg,
  sshReq,
  printTable,
  addToHistory,
  fetchOrgRaw,
  fastPrintTable,
} from "../utils";

class Queue implements Command {
  constructor(private params: { count: string }) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      let data: {
        id: string;
        q: string;
        s: string;
        e: string;
        r: string;
      }[] = JSON.parse(
        await sshReq(`queue`, `--count`, this.params.count, `--org`, org.name)
      );
      fastPrintTable(data, {
        id: "Id",
        r: "River",
        e: "Event",
        s: "Status",
        q: "Time",
      });
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "queue";
argParser.push(CMD, {
  desc: "Show status of queued requests",
  construct: (arg, params: { count: string }) => new Queue(params),
  flags: {
    count: {
      short: "c",
      arg: "count",
      defaultValue: "15",
      overrideValue: (s) => s,
    },
  },
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org !== null;
  },
});
