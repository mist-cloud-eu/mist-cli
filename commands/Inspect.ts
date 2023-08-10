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

class Inspect implements Command {
  constructor(private id: string, private params: { river: string }) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      let res = JSON.parse(
        await sshReq(
          `inspect`,
          this.id,
          `--river`,
          this.params.river,
          `--org`,
          `${org.name}`
        )
      );
      let resout = res.output;
      delete res.output;
      console.log(res);
      output("Output:");
      output(resout);
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "inspect";
argParser.push(CMD, {
  desc: "Show detailed information about an event",
  arg: "id",
  construct: (arg, params: { river: string }) => new Inspect(arg, params),
  flags: {
    river: {
      short: "r",
      arg: "river",
      overrideValue: (s) => s,
    },
  },
  example: "inspect def52a --river init",
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org !== null;
  },
});
