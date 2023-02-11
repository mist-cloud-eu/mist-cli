import { Command } from "typed-cmdargs";
import { clone } from "../clone_utils";
import { argParser } from "../parser";
import { addToHistory, fetchOrg, fetchOrgRaw, output, sshReq } from "../utils";

class Org implements Command {
  constructor(
    private name: string,
    private params: { join: OrganizationArg; delete: OrganizationDeleteArg }
  ) {}
  execute() {
    return this.params.delete.execute(this.name, this.params.join);
  }
}

interface OrganizationArg {
  execute(name: string): Promise<void>;
}
class CreateOrganization implements OrganizationArg {
  async execute(name: string) {
    try {
      let { org, team } = fetchOrgRaw();
      if (org !== null)
        throw "Cannot create a new organization inside another organization.";
      let reply = await sshReq(`org ${name}`);
      if (!reply.startsWith("{")) {
        output(reply);
        return;
      }
      let structure = JSON.parse(reply);
      await clone(structure, name);
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}
class JoinOrganization implements OrganizationArg {
  async execute(name: string) {
    try {
      output(await sshReq(`org ${name} --join`));
    } catch (e) {
      throw e;
    }
  }
}

interface OrganizationDeleteArg {
  execute(name: string, join: OrganizationArg): Promise<void>;
}
class NoDeleteOrganization implements OrganizationDeleteArg {
  execute(name: string, join: OrganizationArg) {
    return join.execute(name);
  }
}
class DeleteOrganization implements OrganizationDeleteArg {
  async execute(name: string, join: OrganizationArg) {
    try {
      output(await sshReq(`org ${name} --delete`));
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "org";
argParser.push(CMD, {
  desc: "Create an organization",
  arg: "name",
  construct: (arg, params) => new Org(arg, params),
  flags: {
    join: {
      short: "j",
      desc: "Join an existing organization",
      defaultValue: new CreateOrganization(),
      overrideValue: new JoinOrganization(),
    },
    delete: {
      desc: "Delete the organization",
      defaultValue: new NoDeleteOrganization(),
      overrideValue: new DeleteOrganization(),
    },
  },
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org === null;
  },
});
