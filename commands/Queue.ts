import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import {
  output,
  fetchOrg,
  sshReq,
  printTable,
  addToHistory,
  fetchOrgRaw,
} from "../utils";

class Queue implements Command {
  constructor(private count: string, params: {}) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      let data: {
        id: string;
        s: string;
        e: string;
        r: string;
      }[] = JSON.parse(await sshReq(`queue`, this.count, `--org`, org.name));
      printTable(data, {
        "Message id": (x) => x.id,
        Event: (x) => x.e,
        River: (x) => x.r,
        Status: (x) => x.s,
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
  arg: "count",
  construct: (arg, params: {}) => new Queue(arg, params),
  flags: {},
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org !== null;
  },
});
