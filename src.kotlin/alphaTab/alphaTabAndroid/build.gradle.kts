plugins {
    id("com.android.application")
    kotlin("android")
}

dependencies {
    implementation(project(":shared"))
    implementation("com.google.android.material:material:1.4.0")
    implementation("androidx.appcompat:appcompat:1.3.1")
    implementation("androidx.constraintlayout:constraintlayout:2.1.1")
}

android {
    compileSdk = 31
    defaultConfig {
        applicationId = "net.alphatab.android"
        minSdk = 24
        targetSdk = 31
        versionCode = 1
        versionName = "1.0"
    }
    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
        }
    }

    packagingOptions {
        resources.excludes.add("LICENSE-EPL-1.0.txt")
        resources.excludes.add("LICENSE-EDL-1.0.txt")
    }
}

