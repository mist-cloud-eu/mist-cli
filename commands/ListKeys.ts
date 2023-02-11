import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { output, fetchOrg, sshReq, addToHistory, fetchOrgRaw } from "../utils";

class ListKeys implements Command {
  constructor() {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      output(await sshReq(`list-keys --org ${org.name}`));
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "list-keys";
argParser.push(CMD, {
  desc: "List the keys of an organization",
  construct: (arg, params) => new ListKeys(),
  flags: {},
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org !== null;
  },
});
