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
  constructor(
    private params: { count: string; event: string; river: string }
  ) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      let cmd = [`queue`, `--count`, this.params.count, `--org`, org.name];
      if (this.params.event !== "") cmd.push(`--event`, this.params.event);
      if (this.params.river !== "") cmd.push(`--river`, this.params.river);
      let data: {
        id: string;
        q: string;
        s: string;
        e: string;
        r: string;
      }[] = JSON.parse(await sshReq(...cmd));
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
  construct: (arg, params: { count: string; event: string; river: string }) =>
    new Queue(params),
  flags: {
    count: {
      short: "c",
      arg: "count",
      defaultValue: "15",
      overrideValue: (s) => s,
    },
    event: {
      short: "e",
      arg: "event",
      defaultValue: "",
      overrideValue: (s: string) => s,
    },
    river: {
      short: "r",
      arg: "river",
      defaultValue: "",
      overrideValue: (s: string) => s,
    },
  },
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org !== null;
  },
});
