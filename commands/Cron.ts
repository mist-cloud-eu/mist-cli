import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { output, fetchOrg, sshReq, addToHistory, fetchOrgRaw } from "../utils";

class Cron implements Command {
  constructor(
    private name: string,
    private params: {
      expr: string;
      overwrite: string;
      event: string;
    }
  ) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      let call = await sshReq(
        `cron`,
        this.name,
        this.params.overwrite,
        this.params.event,
        `--expr`,
        this.params.expr,
        `--org`,
        org.name
      );
      if (this.params.expr === "") {
        output(call);
      } else {
        let { s, n }: { s: string; n: Date } = JSON.parse(call);
        output(
          `Cron '${s}' set to run next time at ${new Date(n).toLocaleString()}`
        );
      }
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "cron";
argParser.push(CMD, {
  desc: "Set a cron job trigger",
  arg: "name",
  construct: (
    arg,
    params: {
      expr: string;
      overwrite: string;
      event: string;
    }
  ) => new Cron(arg, params),
  flags: {
    expr: {
      short: "x",
      arg: "cron expression",
      overrideValue: (s) => s,
    },
    overwrite: {
      defaultValue: "",
      overrideValue: "--overwrite",
    },
    event: {
      short: "e",
      arg: "event",
      defaultValue: "",
      overrideValue: (s) => `--event ${s}`,
    },
  },
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return team !== null;
  },
});
