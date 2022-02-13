plugins {
    id("com.android.application")
    kotlin("android")
}

dependencies {
    implementation(project(":alphaTab"))
    implementation("com.google.android.material:material:1.5.0")
    implementation("androidx.appcompat:appcompat:1.4.1")
    implementation("androidx.constraintlayout:constraintlayout:2.1.3")
    implementation("androidx.lifecycle:lifecycle-extensions:2.2.0")
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
    signingConfigs {
        getByName("debug") {
            keyAlias = "key0"
            keyPassword = "alphaTab"
            storeFile = file("../alphatab.jks")
            storePassword = "alphaTab"
        }
        create("release") {
            keyAlias = "key0"
            keyPassword = "alphaTab"
            storeFile = file("../alphatab.jks")
            storePassword = "alphaTab"
        }
    }

    buildTypes {
        getByName("debug") {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("debug")
        }
        getByName("release") {
            signingConfig = signingConfigs.getByName("release")
        }
    }
}

