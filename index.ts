#!/usr/bin/env node
import { argParser } from "./parser";
import { checkVersion, execPromise, output } from "./utils";

import "./commands/Build";
import "./commands/Capability";
import "./commands/Clone";
import "./commands/Cron";
import "./commands/Deploy";
import "./commands/Event";
import "./commands/Inspect";
import "./commands/Key";
import "./commands/ListCapabilities";
import "./commands/ListCrons";
import "./commands/ListEvents";
import "./commands/ListKeys";
import "./commands/ListOrganizations";
import "./commands/ListRoles";
import "./commands/ListSecrets";
import "./commands/ListServices";
import "./commands/ListTeams";
import "./commands/ListUsers";
import "./commands/Login";
import "./commands/Org";
import "./commands/Purge";
import "./commands/Queue";
import "./commands/Role";
import "./commands/Run";
import "./commands/Secret";
import "./commands/Service";
// import "./commands/Signup";
import "./commands/Spending";
import "./commands/Team";
import "./commands/Version";
import "./commands/Whoami";

(async () => {
  checkVersion();
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
