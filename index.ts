#!/usr/bin/env node
import { argParser } from "./parser";

import "./commands/Capability";
import "./commands/Key";
import "./commands/Event";
import "./commands/Role";
import "./commands/Clone";
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
import "./commands/Run";
import "./commands/Service";
import "./commands/Secret";
import "./commands/Team";
import "./commands/Whoami";
import "./commands/Version";

(async () => {
  if (process.argv[0].includes("node")) process.argv.splice(0, 1);
  process.argv.splice(0, 1);
  if (process.argv.length === 0 || process.argv[0] === "help") {
    console.log(argParser.helpString(process.argv[1]));
  } else {
    let commands = argParser.parse(process.argv);
    try {
      for (let i = 0; i < commands.length; i++) await commands[i].execute();
    } catch (e) {
      console.log("ERROR", e);
    }
  }
})().catch((err) => {
  console.log("ERROR", err);
});
