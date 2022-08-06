import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { fetchOrg, sshReq } from "../utils";

class ListKeys implements Command {
  constructor() {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      console.log(await sshReq(`list-keys --org ${org.name}`));
    } catch (e) {
      throw e;
    }
  }
}

argParser.push("list-keys", {
  desc: "List the keys of an organization",
  construct: (arg, params) => new ListKeys(),
  flags: {},
});
