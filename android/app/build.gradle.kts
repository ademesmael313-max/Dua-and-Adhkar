plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.noor.dua"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.noor.dua"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        resourceConfigurations += listOf("en", "ar")
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        buildConfig = false
    }

    packaging {
        resources.excludes += setOf("/META-INF/{AL2.0,LGPL2.1}")
    }
}

// The page bundle lives in assets/www (see scripts/sync-android.sh). Fail the
// build early with an actionable message instead of shipping an empty WebView.
tasks.named("preBuild") {
    doFirst {
        val index = layout.projectDirectory.file("src/main/assets/www/index.html").asFile
        if (!index.exists()) {
            throw GradleException(
                "The bundled web app is missing (android/app/src/main/assets/www/index.html). " +
                    "Run ./scripts/sync-android.sh from the repository root to build the web app " +
                    "and copy it into the Android project.",
            )
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.activity:activity-ktx:1.9.3")
    implementation("androidx.webkit:webkit:1.12.1")
}
