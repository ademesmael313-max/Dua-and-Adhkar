// The repository root is a Gradle project so Android Studio can open the whole
// repository directly (File -> Open... -> this folder). `android/` continues to
// work as a standalone entry point: both roots build the same module, which
// lives in android/app. Keep the plugin versions in build.gradle.kts in sync
// with android/build.gradle.kts.
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "Noor"
include(":app")
project(":app").projectDir = file("android/app")
