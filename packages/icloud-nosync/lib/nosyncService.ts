import fs from "fs";
import path from "path";
import { execSync } from "child_process";

import ora from "ora";

const defaultSpinnerText = "🐢 ...\n";

export class NosyncService implements INosyncService {
  private pwd = process.cwd();
  private spinner = ora(defaultSpinnerText);

  public async noSync(fileOrFolder: string) {
    this.spinner.start();

    const targetPath = path.join(this.pwd, fileOrFolder);
    if (!fs.existsSync(targetPath)) {
      console.log(`❌ ${targetPath} does not exist`);
      process.exit(1);
    }

    const targetIsSymbolic = fs.lstatSync(targetPath).isSymbolicLink();

    if (targetIsSymbolic) {
      console.log(`❌ ${targetPath} is already a symbolic link`);
      process.exit(1);
    }

    const targetNosyncPath = targetPath + ".nosync";
    const IsTargetNosyncExist = fs.existsSync(targetNosyncPath) && fs.lstatSync(targetNosyncPath).isDirectory();

    if (IsTargetNosyncExist) {
      fs.rmdirSync(targetNosyncPath);
    }

    fs.renameSync(targetPath, targetNosyncPath);
    fs.symlinkSync(targetNosyncPath, targetPath);

    this.spinner.stop();
    console.log(`✅ NoSync succeeded`);
  }

  public async noSyncNpmInstall(packageMgmt: SupportedPackageMgmt) {
    const packageJsonPath = path.join(this.pwd, "package.json");

    if (!fs.existsSync(packageJsonPath)) {
      console.log(`❌ Current directory is NOT a node project\n`);
      process.exit(1);
    }
    console.log(`✅ Current directory is a node project\n`);

    this.spinner.start();

    const output = execSync(
      `${packageMgmt} install && mv node_modules node_modules.nosync && ln -s node_modules.nosync node_modules`
    );

    console.log(`✅ Successfully: ${packageMgmt} install: ${output.toString("utf-8")}\n`);
    this.spinner.stop();
  }
}

interface INosyncService {
  noSync(fileOrFolder: string): Promise<void>;
  noSyncNpmInstall(packageMgmt: SupportedPackageMgmt): Promise<void>;
}

export type SupportedPackageMgmt = "npm" | "yarn";
