import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, copyFileSync} from 'fs';

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
  'prettier': '2.3.0',
  'prettier-plugin-java': '1.0.2',
  'typescript': '4.1.5',
};

class Migrate {
  sourceDir = '';
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
    this.checkPluginDir();
  }

  public run() {
    // prepare changeFileTask
    (() => {
      this.rewritePackageJson();

      // iOS
      this.rewritePod();
      this.rewritePbxproj();

      // Android
      this.rewriteGradle();
      this.rewriteGradleWrapper();
    })();

    // run changeFileTask
    for (let item of this.changeFileTask) {
      writeFileSync(item.path, item.content);
    }

    // file copy
    copyFileSync(process.cwd() + '/src/assets/gradlew', this.sourceDir + 'android/gradlew');
  }

  private rewritePackageJson() {
    const path = this.sourceDir + 'package.json';
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
  }

  private rewritePod() {
    (() => {
      const path = this.sourceDir + this.podSpecFile;
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
    })();

    (() => {
      const path = this.sourceDir + 'ios/Podfile';
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
    })();
  }

  private rewritePbxproj() {
    const path = this.sourceDir + 'ios/Plugin.xcodeproj/project.pbxproj';
    const pbxproj = readFileSync(this.sourceDir + 'ios/Plugin.xcodeproj/project.pbxproj', { encoding: 'utf8' }).split(/\r\n|\n/);
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
  }

  private rewriteGradle() {
    const path = this.sourceDir + 'android/build.gradle';
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
  }

  private rewriteGradleWrapper() {
    const path = this.sourceDir + 'android/gradle/wrapper/gradle-wrapper.properties';
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
  }

  private checkPluginDir() {
    if (this.argv.length < 3) {
      throw '[error] command needs plugin folder path. ex) `npm run migrate path/to/plugin_folder`';
    }

    this.sourceDir = [process.cwd(), process.argv[2]].join('/') + '/';

    // Capacitor Pluginのフォルダかを簡易チェック
    const sources = readdirSync(this.sourceDir);
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
    if (notFoundFile) {
      throw `[error] This folder may not plugin folder. Not found ${notFoundFile}. Please check path: ` + this.sourceDir;
    }
  }
}

const migrate = new Migrate(process.cwd(), process.argv);
migrate.run();
