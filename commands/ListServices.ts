import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { fetchOrg, sshReq } from "../utils";

class ListServices implements Command {
  constructor(private team: string) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      console.log(await sshReq(`list-services ${this.team} --org ${org.name}`));
    } catch (e) {
      throw e;
    }
  }
}

argParser.push("list-services", {
  desc: "List the services of a team",
  arg: "team",
  construct: (arg, params) => new ListServices(arg),
  flags: {},
});
