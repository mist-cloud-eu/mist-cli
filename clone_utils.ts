import fs from "fs";
import { GIT_HOST } from "./config";
import { output, execPromise } from "./utils";

export async function clone(struct: any, name: string) {
  try {
    output(`Cloning ${name}...`);
    fs.mkdirSync(`${name}/.mist`, { recursive: true });
    let orgFile: OrgFile = { name };
    fs.writeFileSync(`${name}/.mist/conf.json`, JSON.stringify(orgFile));
    await execPromise(
      `git clone -q "${GIT_HOST}/${name}/event-catalogue" event-catalogue`,
      name
    );
    Object.keys(struct).forEach((team) => {
      fs.mkdirSync(`${name}/${team}`, { recursive: true });
      createFolderStructure(struct[team], `${name}/${team}`, name, team);
    });
  } catch (e) {
    throw e;
  }
}

function createFolderStructure(
  struct: any,
  prefix: string,
  org: string,
  team: string
) {
  Object.keys(struct).forEach(async (k) => {
    if (struct[k] instanceof Object)
      createFolderStructure(struct[k], prefix + "/" + k, org, team);
    else {
      // output(`git clone "${HOST}/${org}/${team}/${k}" "${prefix}/${k}"`);
      let repo = `"${GIT_HOST}/${org}/${team}/${k}"`;
      let dir = `${prefix}/${k}`;
      try {
        fs.mkdirSync(dir, { recursive: true });
        await execPromise(`git init --initial-branch=main`, dir);
        await execPromise(`git remote add origin ${repo}`, dir);
        await fs.writeFile(
          dir + "/fetch.bat",
          `@echo off
git fetch
git reset --hard origin/main
del fetch.sh
(goto) 2>nul & del fetch.bat`,
          () => {}
        );
        await fs.writeFile(
          dir + "/fetch.sh",
          `#!/bin/sh
git fetch
git reset --hard origin/main
rm fetch.bat fetch.sh`,
          () => {}
        );
      } catch (e) {
        console.log(e);
      }
    }
  });
}
