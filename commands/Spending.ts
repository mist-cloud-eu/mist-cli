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

class Spending implements Command {
  constructor(params: {}) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      let data: { job: string; ms: number; es: string; c: string }[] =
        JSON.parse(await sshReq(`spending`, `--org`, org.name));
      let total = 0;
      printTable(data, {
        Job: (x) => x.job,
        " Executions": (x) => "" + x.es,
        " Time (ms)": (x) => "" + x.ms,
        " Cost (€)": (x) => {
          total += +x.c;
          return "" + x.c;
        },
      });
      console.log("Total cost: €", total.toFixed(2));
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "spending";
argParser.push(CMD, {
  desc: "Show unpaid spending",
  construct: (arg, params: {}) => new Spending(params),
  flags: {},
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org !== null;
  },
});
