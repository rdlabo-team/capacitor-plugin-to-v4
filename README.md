# capacitor-plugin-to-v4

This is a command tool that automatically update the capacitor plugin version 3 to 4. This library follows the changes in https://github.com/ionic-team/create-capacitor-plugin/commit/03027bf603626ebfdba084cb9d9a1a359d008554

At least, this library is used to make the following plugins Capacitor4-compatible.

- @capacitor-community/admob
- @capacitor-community/stripe
- @capacitor-community/facebook-login

## usage

run `npx` command into plugin folder.

```bash
% npx @rdlabo/capacitor-plugin-to-v4  
```

## result

```bash
Need to install the following packages:
@rdlabo/capacitor-plugin-to-v4
Ok to proceed? (y) y

[info] @rdlabo/capacitor-plugin-to-v4 path is /Users/sakakibara/.npm/_npx/8b6523b6da3b9745/node_modules/@rdlabo/capacitor-plugin-to-v4/src
[info] working path is /Users/sakakibara/dev/capacitor-stripe
[info] get update lines of /Users/sakakibara/dev/capacitor-stripe/package.json
[info] get update lines of /Users/sakakibara/dev/capacitor-stripe/CapacitorCommunityStripe.podspec and /Users/sakakibara/dev/capacitor-stripe/ios/Podfile
[info] get update lines of /Users/sakakibara/dev/capacitor-stripe/ios/Plugin.xcodeproj/project.pbxproj
[info] get update lines of /Users/sakakibara/dev/capacitor-stripe/android/build.gradle
[info] get update lines of /Users/sakakibara/dev/capacitor-stripe/android/gradle/wrapper/gradle-wrapper.properties
[success] write /Users/sakakibara/dev/capacitor-stripe/package.json
[success] write /Users/sakakibara/dev/capacitor-stripe/CapacitorCommunityStripe.podspec
[success] write /Users/sakakibara/dev/capacitor-stripe/ios/Podfile
[success] write /Users/sakakibara/dev/capacitor-stripe/ios/Plugin.xcodeproj/project.pbxproj
[success] write /Users/sakakibara/dev/capacitor-stripe/android/build.gradle
[success] write /Users/sakakibara/dev/capacitor-stripe/android/gradle/wrapper/gradle-wrapper.properties
[success] write /Users/sakakibara/dev/capacitor-stripe/android/gradlew
success migrate to v4🎉
Next step: You should run `npm install`
```

## Troubleshooting

### removed `jcenter()` before run

If plugin had manually removed `jcenter()`, will not work well. When this, you should check `android/build.gradle` and add `mavenCentral()` manually.

For the correct configuration, please click here:
https://github.com/ionic-team/create-capacitor-plugin/commit/03027bf603626ebfdba084cb9d9a1a359d008554#diff-51795f26cbdfdde24931f6d0f9d6f047f4617fc6a6cb850029cd78c8e0e9b90d
