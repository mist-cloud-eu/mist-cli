import { Command } from "typed-cmdargs";
import { clone } from "../clone_utils";
import { argParser } from "../parser";
import { addToHistory, fetchOrgRaw, output, sshReq } from "../utils";

class Clone implements Command {
  constructor(private name: string) {}
  async execute() {
    try {
      let { org, team } = fetchOrgRaw();
      if (org !== null)
        throw "Cannot clone an organization inside another organization.";
      let reply = await sshReq(`clone ${this.name}`);
      if (!reply.startsWith("{")) {
        output(reply);
        return;
      }
      let structure = JSON.parse(reply);
      await clone(structure, this.name);
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "clone";
argParser.push(CMD, {
  desc: "Download the code of an organization",
  arg: "name",
  construct: (arg) => new Clone(arg),
  flags: {},
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org === null;
  },
});
