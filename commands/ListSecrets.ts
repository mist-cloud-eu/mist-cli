import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { fetchOrg, sshReq } from "../utils";

class ListSecrets implements Command {
  constructor() {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      console.log(await sshReq(`list-secrets --org ${org.name}`));
    } catch (e) {
      throw e;
    }
  }
}

argParser.push("list-secrets", {
  desc: "List the secrets of an organization",
  construct: (arg, params) => new ListSecrets(),
  flags: {},
});
