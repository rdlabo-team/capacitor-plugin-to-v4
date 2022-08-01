# capacitor-plugin-to-v4

This is a command tool that automatically update the capacitor plugin version 3 to 4.

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
