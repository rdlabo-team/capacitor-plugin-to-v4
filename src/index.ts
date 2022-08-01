#! /usr/bin/env node

import { readFileSync, readdirSync, writeFileSync, copyFileSync} from 'fs';

const checkExistsFiles = [
  '.podspec',
  'android',
  'ios',
  'package.json',
  'src',
  'tsconfig.json'
];

const changeGradleVersion = {
  'rootProject.ext.junitVersion': '4.13.2',
  'rootProject.ext.androidxAppCompatVersion': '1.4.2',
  'rootProject.ext.androidxJunitVersion': '1.1.3',
  'rootProject.ext.androidxEspressoCoreVersion': '3.4.0',
  'com.android.tools.build:gradle': '7.2.1',
  'rootProject.ext.compileSdkVersion': '32',
  'rootProject.ext.minSdkVersion': '22',
  'rootProject.ext.targetSdkVersion': '32',
};

const changePackageVersion = {
  '"prettier"': '2.3.0',
  '"prettier-plugin-java"': '1.0.2',
  '"typescript"': '4.1.5',
};

class Migrate {
  workingPath = '';
  podSpecFile = '';
  changeFileTask: {
    path: string;
    content: string;
  }[] = [];
  readonly RegD = new RegExp(`[0-9]+(\.\[0-9]+)?(\.\[0-9]+)?`)

  constructor(
    public cwd: string,
    public argv: string[],
  ) {
    this.workingPath = [process.env.PWD].join('/') + '/';
    console.info('[info] @rdlabo/capacitor-plugin-to-v4 path is ' + __dirname);
    console.info('[info] working path is ' + process.cwd());
  }

  public run() {
    const notFoundFile = this.checkPluginDir();
    if (notFoundFile) {
      console.error(`[error] This folder may not plugin folder. Not found ${notFoundFile}. Please check path: ` + this.workingPath);
      return;
    }

    // prepare changeFileTask
    (() => {
      const rewritePackageJson = this.rewritePackageJson();
      console.log('[info] get update lines of ' + rewritePackageJson.join(' and '));

      // iOS
      const rewritePod = this.rewritePod();
      console.log('[info] get update lines of ' + rewritePod.join(' and '));

      const rewritePbxproj = this.rewritePbxproj();
      console.log('[info] get update lines of ' + rewritePbxproj.join(' and '));

      // Android
      const rewriteGradle = this.rewriteGradle();
      console.log('[info] get update lines of ' + rewriteGradle.join(' and '));

      const rewriteGradleWrapper = this.rewriteGradleWrapper();
      console.log('[info] get update lines of ' + rewriteGradleWrapper.join(' and '));
    })();

    // run changeFileTask
    for (let item of this.changeFileTask) {
      writeFileSync(item.path, item.content);
      console.log('[success] write ' + item.path);
    }
    copyFileSync(__dirname + '/assets/gradlew', this.workingPath + 'android/gradlew');
    console.log('[success] write ' + this.workingPath + 'android/gradlew');

    console.info('success migrate to v4🎉');
    console.info('Next step: You should run `npm install`')
  }

  private rewritePackageJson(): string[] {
    const path = this.workingPath + 'package.json';
    const podSpec = readFileSync(path, { encoding: 'utf8' }).split(/\r\n|\n/);
    const newLines = podSpec.map(line => {
      const matchKey = Object.keys(changePackageVersion).find(key => line.includes(key));
      if (matchKey) {
        // @ts-ignore
        return line.replace(this.RegD, changePackageVersion[matchKey]);
      }
      if (line.includes('verify:ios')) {
        return line.replace('-scheme Plugin && cd', '-scheme Plugin -destination generic/platform=iOS && cd');
      }
      return line;
    });
    this.changeFileTask.push({
      path,
      content: newLines.join('\n')
    });

    return [path];
  }

  private rewritePod(): string[] {
    const resultPath: string[] = [];
    (() => {
      const path = this.workingPath + this.podSpecFile;
      const podSpec = readFileSync(path, { encoding: 'utf8' }).split(/\r\n|\n/);
      const newLines = podSpec.map(line => {
        if (line.includes('s.ios.deployment_target')) {
          return line.replace(this.RegD, '13.0');
        }
        return line;
      });
      this.changeFileTask.push({
        path,
        content: newLines.join('\n')
      });
      resultPath.push(path);
    })();

    (() => {
      const path = this.workingPath + 'ios/Podfile';
      const podSpec = readFileSync(path, { encoding: 'utf8' }).split(/\r\n|\n/);
      const newLines = podSpec.map(line => {
        if (line.includes('platform :ios')) {
          return line.replace(this.RegD, '13.0');
        }
        return line;
      });
      this.changeFileTask.push({
        path,
        content: newLines.join('\n')
      });
      resultPath.push(path);
    })();

    return resultPath;
  }

  private rewritePbxproj(): string[] {
    const path = this.workingPath + 'ios/Plugin.xcodeproj/project.pbxproj';
    const pbxproj = readFileSync(this.workingPath + 'ios/Plugin.xcodeproj/project.pbxproj', { encoding: 'utf8' }).split(/\r\n|\n/);
    const newLines = pbxproj.map((line, i) => {
      if (line.includes('IPHONEOS_DEPLOYMENT_TARGET')) {
        return line.replace(this.RegD, '13.0');
      }
      if (line.includes('SKIP_INSTALL')) {
        return line + '\n\t\t\t\tSUPPORTS_MACCATALYST = NO'
      }

      return line;
    });
    this.changeFileTask.push({
      path,
      content: newLines.join('\n')
    });

    return [path];
  }

  private rewriteGradle(): string[] {
    const path = this.workingPath + 'android/build.gradle';
    const gradle = readFileSync(path, { encoding: 'utf8' }).split(/\r\n|\n/);

    const newLines = gradle.map(line => {
      const matchKey = Object.keys(changeGradleVersion).find(key => line.includes(key));
      if (matchKey) {
        // @ts-ignore
        return line.replace(this.RegD, changeGradleVersion[matchKey]);
      }

      if (line.includes('jcenter()')) {
        return '        mavenCentral()';
      }

      if (line.includes('mavenCentral()')) {
        return '';
      }

      if (line.includes('sourceCompatibility JavaVersion') || line.includes('targetCompatibility JavaVersion')) {
        return line.replace('VERSION_1_8', 'VERSION_11');
      }

      return line;
    });

    this.changeFileTask.push({
      path,
      content: newLines.join('\n')
    });

    return [path];
  }

  private rewriteGradleWrapper(): string[] {
    const path = this.workingPath + 'android/gradle/wrapper/gradle-wrapper.properties';
    const gradle = readFileSync(path, { encoding: 'utf8' }).split(/\r\n|\n/);

    const newLines = gradle.map(line => {
      if (line.includes('gradle-7.0-all.zip')) {
        return line.replace('gradle-7.0-all.zip', 'gradle-7.4.2-all.zip');
      }

      return line;
    });

    this.changeFileTask.push({
      path,
      content: newLines.join('\n')
    });

    return [path];
  }

  private checkPluginDir(): string | undefined {
    // Capacitor Pluginのフォルダかを簡易チェック
    const sources = readdirSync(this.workingPath);
    const notFoundFile = checkExistsFiles.find(file => {
      if (file === '.podspec' && !sources.find(source => {
        if (source.includes(file)) {
          // podSpecファイル名を取得
          this.podSpecFile = source;
          return true;
        }
      })) {
        return file;
      } else if (file !== '.podspec' && !sources.includes(file)) {
        return file;
      }
    });
    return notFoundFile;
  }
}

const migrate = new Migrate(process.cwd(), process.argv);
migrate.run();
