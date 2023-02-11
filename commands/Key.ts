import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { output, fetchOrg, sshReq, addToHistory, fetchOrgRaw } from "../utils";

class Key implements Command {
  constructor(private duration: string, private params: { update: string }) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      if (this.params.update === "") {
        let { key, expiry }: { key: string; expiry: string } = JSON.parse(
          await sshReq(
            `key ${this.duration} ${this.params.update} --org ${org.name}`
          )
        );
        output(`${key} expires on ${new Date(expiry).toLocaleString()}.`);
      } else {
        let { count, expiry }: { count: number; expiry: string } = JSON.parse(
          await sshReq(
            `key ${this.duration} ${this.params.update} --org ${org.name}`
          )
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
      desc: "Update the key",
      arg: "key",
      defaultValue: "",
      overrideValue: (s) => `--update ${s}`,
    },
    name: {
      desc: "Human readable name of key",
      arg: "name",
      defaultValue: "",
      overrideValue: (s) => `--name ${s}`,
    },
  },
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org !== null;
  },
});
