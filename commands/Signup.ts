import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import fs from "fs";
import {
  addToHistory,
  execPromise,
  fetchOrg,
  fetchOrgRaw,
  output,
  sshReq,
} from "../utils";

class Signup implements Command {
  constructor(private cvr: string) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      output(
        await sshReq(`sign-up-for-early-access ${this.cvr} --org ${org.name}`)
      );
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "sign-up-for-early-access";
argParser.push(CMD, {
  desc: "Sign up for early access to unlock premium features",
  arg: "danish cvr",
  construct: (arg, params: {}) => new Signup(arg),
  flags: {},
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org !== null;
  },
});
