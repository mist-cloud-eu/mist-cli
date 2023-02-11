#!/usr/bin/env node
import { argParser } from "./parser";
import { execPromise, output } from "./utils";
import * as conf from "./package.json";

import "./commands/Capability";
import "./commands/Key";
import "./commands/Build";
import "./commands/Event";
import "./commands/Deploy";
import "./commands/Role";
import "./commands/Clone";
import "./commands/Inspect";
import "./commands/ListOrganizations";
import "./commands/ListCapabilities";
import "./commands/ListEvents";
import "./commands/ListKeys";
import "./commands/ListRoles";
import "./commands/ListSecrets";
import "./commands/ListServices";
import "./commands/ListTeams";
import "./commands/ListUsers";
import "./commands/Login";
import "./commands/Org";
import "./commands/Purge";
import "./commands/Queue";
import "./commands/Run";
import "./commands/Service";
import "./commands/Signup";
import "./commands/Spending";
import "./commands/Secret";
import "./commands/Team";
import "./commands/Whoami";
import "./commands/Version";

function versionIsOlder(old: string, new_: string) {
  let os = old.split(".");
  let ns = new_.split(".");
  if (+os[0] < +ns[0]) return true;
  else if (+os[0] > +ns[0]) return false;
  else if (+os[1] < +ns[1]) return true;
  else if (+os[1] > +ns[1]) return false;
  else if (+os[2] < +ns[2]) return true;
  return false;
}

(async () => {
  try {
    let call = await execPromise(
      "npm show @mist-cloud-eu/mist-cli dist-tags --json"
    );
    let version: { latest: string } = JSON.parse(call);
    if (versionIsOlder(conf.version, version.latest)) {
      output("New version of mist-cli available, to update run the command:");
      output("    npm update -g @mist-cloud-eu/mist-cli");
    }
  } catch (e) {}

  if (process.argv[0].includes("node")) process.argv.splice(0, 1);
  process.argv.splice(0, 1);
  if (process.argv.length === 0 || process.argv[0] === "help") {
    output(argParser.helpString(process.argv[1]));
  } else {
    let commands = argParser.parse(process.argv);
    try {
      for (let i = 0; i < commands.length; i++) await commands[i].execute();
    } catch (e) {
      console.log("\x1b[31mERROR %s\x1b[0m", e);
    }
  }
})().catch((e) => {
  console.log("\x1b[31mERROR %s\x1b[0m", e);
});
