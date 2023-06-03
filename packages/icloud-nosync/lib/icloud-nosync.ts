#!/usr/bin/env node

import { program } from "commander";
import { NosyncService } from "./nosyncService";

const service = new NosyncService();
program.version(require("../package").version, "-v, --version");
// .option("-i, --git-ignore [name]") // TODO: add option to add node_modules* to .gitignore

program
  .command("dir")
  .argument("<dirName>", "You can only pass one directory name at a time")
  .description("Not to sync certain defined directory with iCloud Drive. It could be folder or file.")
  .action((dirName) => {
    service.noSync(dirName);
  });

program
  .command("npm-install")
  .description("npm install without syncing node_modules with iCloud Drive")
  .action(() => {
    service.noSyncNpmInstall("npm");
  });

program
  .command("yarn-install")
  .description("yarn install without syncing node_modules with iCloud Drive")
  .action(() => {
    service.noSyncNpmInstall("yarn");
  });

if (program.args) program.parse(process.argv);
