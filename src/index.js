#! /usr/bin/env node
"use strict";
exports.__esModule = true;
var fs_1 = require("fs");
var checkExistsFiles = [
    '.podspec',
    'android',
    'ios',
    'package.json',
    'src',
    'tsconfig.json'
];
var changeGradleVersion = {
    'rootProject.ext.junitVersion': '4.13.2',
    'rootProject.ext.androidxAppCompatVersion': '1.4.2',
    'rootProject.ext.androidxJunitVersion': '1.1.3',
    'rootProject.ext.androidxEspressoCoreVersion': '3.4.0',
    'com.android.tools.build:gradle': '7.2.1',
    'rootProject.ext.compileSdkVersion': '32',
    'rootProject.ext.minSdkVersion': '22',
    'rootProject.ext.targetSdkVersion': '32'
};
var changePackageVersion = {
    'prettier': '2.3.0',
    'prettier-plugin-java': '1.0.2',
    'typescript': '4.1.5'
};
var Migrate = /** @class */ (function () {
    function Migrate(cwd, argv) {
        this.cwd = cwd;
        this.argv = argv;
        this.workingPath = '';
        this.podSpecFile = '';
        this.changeFileTask = [];
        this.RegD = new RegExp("[0-9]+(.[0-9]+)?(.[0-9]+)?");
        this.workingPath = [process.env.PWD].join('/') + '/';
        console.info('[info] @rdlabo/capacitor-plugin-to-v4 path is ' + __dirname);
        console.info('[info] working path is ' + process.cwd());
        this.checkPluginDir();
    }
    Migrate.prototype.run = function () {
        var _this = this;
        // prepare changeFileTask
        (function () {
            _this.rewritePackageJson();
            // iOS
            _this.rewritePod();
            _this.rewritePbxproj();
            // Android
            _this.rewriteGradle();
            _this.rewriteGradleWrapper();
        })();
        // run changeFileTask
        for (var _i = 0, _a = this.changeFileTask; _i < _a.length; _i++) {
            var item = _a[_i];
            (0, fs_1.writeFileSync)(item.path, item.content);
        }
        (0, fs_1.copyFileSync)(__dirname + '/assets/gradlew', this.workingPath + 'android/gradlew');
        console.info('[info] success migrate to v4');
    };
    Migrate.prototype.rewritePackageJson = function () {
        var _this = this;
        var path = this.workingPath + 'package.json';
        var podSpec = (0, fs_1.readFileSync)(path, { encoding: 'utf8' }).split(/\r\n|\n/);
        var newLines = podSpec.map(function (line) {
            var matchKey = Object.keys(changePackageVersion).find(function (key) { return line.includes(key); });
            if (matchKey) {
                // @ts-ignore
                return line.replace(_this.RegD, changePackageVersion[matchKey]);
            }
            if (line.includes('verify:ios')) {
                return line.replace('-scheme Plugin && cd', '-scheme Plugin -destination generic/platform=iOS && cd');
            }
            return line;
        });
        this.changeFileTask.push({
            path: path,
            content: newLines.join('\n')
        });
    };
    Migrate.prototype.rewritePod = function () {
        var _this = this;
        (function () {
            var path = _this.workingPath + _this.podSpecFile;
            var podSpec = (0, fs_1.readFileSync)(path, { encoding: 'utf8' }).split(/\r\n|\n/);
            var newLines = podSpec.map(function (line) {
                if (line.includes('s.ios.deployment_target')) {
                    return line.replace(_this.RegD, '13.0');
                }
                return line;
            });
            _this.changeFileTask.push({
                path: path,
                content: newLines.join('\n')
            });
        })();
        (function () {
            var path = _this.workingPath + 'ios/Podfile';
            var podSpec = (0, fs_1.readFileSync)(path, { encoding: 'utf8' }).split(/\r\n|\n/);
            var newLines = podSpec.map(function (line) {
                if (line.includes('platform :ios')) {
                    return line.replace(_this.RegD, '13.0');
                }
                return line;
            });
            _this.changeFileTask.push({
                path: path,
                content: newLines.join('\n')
            });
        })();
    };
    Migrate.prototype.rewritePbxproj = function () {
        var _this = this;
        var path = this.workingPath + 'ios/Plugin.xcodeproj/project.pbxproj';
        var pbxproj = (0, fs_1.readFileSync)(this.workingPath + 'ios/Plugin.xcodeproj/project.pbxproj', { encoding: 'utf8' }).split(/\r\n|\n/);
        var newLines = pbxproj.map(function (line, i) {
            if (line.includes('IPHONEOS_DEPLOYMENT_TARGET')) {
                return line.replace(_this.RegD, '13.0');
            }
            if (line.includes('SKIP_INSTALL')) {
                return line + '\n\t\t\t\tSUPPORTS_MACCATALYST = NO';
            }
            return line;
        });
        this.changeFileTask.push({
            path: path,
            content: newLines.join('\n')
        });
    };
    Migrate.prototype.rewriteGradle = function () {
        var _this = this;
        var path = this.workingPath + 'android/build.gradle';
        var gradle = (0, fs_1.readFileSync)(path, { encoding: 'utf8' }).split(/\r\n|\n/);
        var newLines = gradle.map(function (line) {
            var matchKey = Object.keys(changeGradleVersion).find(function (key) { return line.includes(key); });
            if (matchKey) {
                // @ts-ignore
                return line.replace(_this.RegD, changeGradleVersion[matchKey]);
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
            path: path,
            content: newLines.join('\n')
        });
    };
    Migrate.prototype.rewriteGradleWrapper = function () {
        var path = this.workingPath + 'android/gradle/wrapper/gradle-wrapper.properties';
        var gradle = (0, fs_1.readFileSync)(path, { encoding: 'utf8' }).split(/\r\n|\n/);
        var newLines = gradle.map(function (line) {
            if (line.includes('gradle-7.0-all.zip')) {
                return line.replace('gradle-7.0-all.zip', 'gradle-7.4.2-all.zip');
            }
            return line;
        });
        this.changeFileTask.push({
            path: path,
            content: newLines.join('\n')
        });
    };
    Migrate.prototype.checkPluginDir = function () {
        var _this = this;
        // Capacitor Pluginのフォルダかを簡易チェック
        var sources = (0, fs_1.readdirSync)(this.workingPath);
        var notFoundFile = checkExistsFiles.find(function (file) {
            if (file === '.podspec' && !sources.find(function (source) {
                if (source.includes(file)) {
                    // podSpecファイル名を取得
                    _this.podSpecFile = source;
                    return true;
                }
            })) {
                return file;
            }
            else if (file !== '.podspec' && !sources.includes(file)) {
                return file;
            }
        });
        if (notFoundFile) {
            throw "[error] This folder may not plugin folder. Not found ".concat(notFoundFile, ". Please check path: ") + this.workingPath;
        }
    };
    return Migrate;
}());
var migrate = new Migrate(process.cwd(), process.argv);
migrate.run();
