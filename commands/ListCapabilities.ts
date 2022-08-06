import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { fetchOrg, sshReq } from "../utils";

class ListCapabilities implements Command {
  constructor(private role: string) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      console.log(
        await sshReq(`list-capabilities ${this.role} --org ${org.name}`)
      );
    } catch (e) {
      throw e;
    }
  }
}

argParser.push("list-capabilities", {
  desc: "List the capabilities of a role",
  arg: "role",
  construct: (arg, params) => new ListCapabilities(arg),
  flags: {},
});
