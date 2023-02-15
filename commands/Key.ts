import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { output, fetchOrg, sshReq, addToHistory, fetchOrgRaw } from "../utils";

class Key implements Command {
  constructor(
    private duration: string,
    private params: { update: string; name: string }
  ) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      let cmd = [`key`, this.duration, `--org`, org.name];
      if (this.params.name !== "") cmd.push(`--name`, this.params.name);
      if (this.params.update === "") {
        let { key, expiry }: { key: string; expiry: string } = JSON.parse(
          await sshReq(...cmd)
        );
        output(`${key} expires on ${new Date(expiry).toLocaleString()}.`);
      } else {
        if (this.params.update !== "") cmd.push(`--update`, this.params.update);
        let { count, expiry }: { count: number; expiry: string } = JSON.parse(
          await sshReq(...cmd)
        );
        output(
          `Updated ${count} keys to expire on ${new Date(
            expiry
          ).toLocaleString()}.`
        );
      }
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "key";
argParser.push(CMD, {
  desc: "Create an api key",
  arg: "duration",
  construct: (arg, params) => new Key(arg, params),
  flags: {
    update: {
      short: "u",
      desc: "Update the key",
      arg: "key",
      defaultValue: "",
      overrideValue: (s) => s,
    },
    name: {
      short: "n",
      desc: "Human readable name of key",
      arg: "name",
      defaultValue: "",
      overrideValue: (s) => s,
    },
  },
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org !== null;
  },
});
