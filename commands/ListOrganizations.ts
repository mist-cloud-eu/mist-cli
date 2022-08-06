import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { fetchOrg, sshReq } from "../utils";

class ListRoles implements Command {
  constructor() {}
  async execute() {
    try {
      console.log(await sshReq(`list-organizations`));
    } catch (e) {
      throw e;
    }
  }
}

argParser.push("list-organizations", {
  desc: "List the organization the current user has access to",
  construct: (arg, params) => new ListRoles(),
  flags: {},
});
