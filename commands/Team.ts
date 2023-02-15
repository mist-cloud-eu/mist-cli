import { Command } from "typed-cmdargs";
import { output, fetchOrg, sshReq, addToHistory, fetchOrgRaw } from "../utils";
import fs from "fs";
import { argParser } from "../parser";

class Team implements Command {
  constructor(
    private name: string,
    private params: { user: string; delete: TeamDeleteArg }
  ) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      if (team !== null) throw "Must be in the organization root.";
      this.params.delete.execute(this.name, this.params.user, org.name);
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

interface TeamDeleteArg {
  execute(name: string, user: string, org: string): Promise<void>;
}
class NoDeleteTeam implements TeamDeleteArg {
  async execute(name: string, user: string, org: string) {
    try {
      fs.mkdirSync(name);
      output(await sshReq(`team`, name, user, `--org`, org));
    } catch (e) {
      throw e;
    }
  }
}
class DeleteTeam implements TeamDeleteArg {
  async execute(name: string, user: string, org: string) {
    try {
      output(await sshReq(`team`, name, `--delete`, `--org`, org));
      if (fs.existsSync(name)) fs.renameSync(name, `(deleted) ${name}`);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "team";
argParser.push(CMD, {
  desc: "Create a team",
  arg: "name",
  construct: (arg, params) => new Team(arg, params),
  flags: {
    user: {
      short: "u",
      arg: "email",
      desc: "Move user to team",
      defaultValue: "",
      overrideValue: (s) => `--user ${s}`,
    },
    delete: {
      desc: "Delete the team",
      defaultValue: new NoDeleteTeam(),
      overrideValue: new DeleteTeam(),
    },
  },
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org !== null && team === null;
  },
});
