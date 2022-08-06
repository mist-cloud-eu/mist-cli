import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { fetchOrg, sshReq } from "../utils";

class ListRoles implements Command {
  constructor() {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      console.log(await sshReq(`list-roles --org ${org.name}`));
    } catch (e) {
      throw e;
    }
  }
}

argParser.push("list-roles", {
  desc: "List the roles of an organization",
  construct: (arg, params) => new ListRoles(),
  flags: {},
});
