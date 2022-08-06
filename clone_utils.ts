import fs from "fs";
import { GIT_HOST } from "./config";
import { execPromise } from "./utils";

export async function clone(struct: any, name: string) {
  try {
    console.log(`Cloning ${name}...`);
    fs.mkdirSync(`${name}/.mist`, { recursive: true });
    let orgFile: OrgFile = { name };
    fs.writeFileSync(`${name}/.mist/conf.json`, JSON.stringify(orgFile));
    await execPromise(`git clone -q "${GIT_HOST}/${name}/events" events`, name);
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
      // console.log(`git clone "${HOST}/${org}/${team}/${k}" "${prefix}/${k}"`);
      let repo = `"${GIT_HOST}/${org}/${team}/${k}"`;
      let dir = `${prefix}/${k}`;
      try {
        fs.mkdirSync(`${dir}`, { recursive: true });
        await execPromise(`git init`, dir);
        await execPromise(`git remote add origin ${repo}`, dir);
        await fs.writeFile(
          dir + "/fetch.bat",
          `@echo off
git fetch
git reset --hard origin/master
(goto) 2>nul & del "%~f0"`,
          () => {}
        );
      } catch (e) {
        console.log(e);
      }
    }
  });
}
