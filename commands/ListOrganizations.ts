import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { output, fetchOrg, sshReq, addToHistory } from "../utils";

class ListRoles implements Command {
  constructor() {}
  async execute() {
    try {
      output(await sshReq(`list-organizations`));
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "list-organizations";
argParser.push(CMD, {
  desc: "List the organization the current user has access to",
  construct: (arg, params) => new ListRoles(),
  flags: {},
});
