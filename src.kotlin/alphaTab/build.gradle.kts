plugins {
    kotlin("multiplatform") version "1.5.0"
//    id("com.android.library")
//    id("kotlin-android-extensions")
}

group = "net.alphatab"
version = "1.3-SNAPSHOT"

repositories {
    google()
    mavenCentral()
    maven("https://packages.jetbrains.team/maven/p/skija/maven")
}

kotlin {
    jvm {
        compilations.all {
            kotlinOptions.jvmTarget = "11"
        }
        testRuns["test"].executionTask.configure {
            useJUnit()
        }
    }
//    android()
    sourceSets {

        val commonMain by getting {
            dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.5.0-RC")
            }
        }
        commonMain.kotlin.srcDirs("../../dist/lib.kotlin/src")

        val os = System.getProperty("os.name")
        val target = when {
            os == "Mac OS X" -> {
                "macos-x64"
            }
            os.startsWith("Win") -> {
                "windows"
            }
            os.startsWith("Linux") -> {
                "linux"
            }
            else -> {
                throw Error("Unsupported OS: $os")
            }
        }
        val jvmMain by getting {
            dependencies {
                api("org.jetbrains.skija:skija-$target:0.91.3")
            }
        }
        jvmMain.kotlin.srcDirs("src/jvmCommon/kotlin")
        // TODO: check if we can control this folder
        jvmMain.resources.srcDirs("../../font/").apply {
            this.filter.include("**/*.ttf")
            this.filter.include("**/*.sf2")
        }

        val jvmTest by getting {
            dependencies {
                implementation(kotlin("test-junit"))
            }
        }
        jvmTest.kotlin.srcDirs("../../dist/lib.kotlin/test")

//        val androidMain by getting {
//            dependencies {
//                implementation("com.google.android.material:material:1.3.0")
//            }
//        }
//        androidMain.kotlin.srcDirs("src/jvmCommon/kotlin")
//
//        val androidTest by getting {
//            dependencies {
//                implementation(kotlin("test-junit"))
//                implementation("junit:junit:4.13")
//            }
//        }
    }
}

tasks.named<org.gradle.jvm.tasks.Jar>("jvmSourcesJar") {
    exclude("*")
}

//android {
//    compileSdkVersion(29)
//    sourceSets["main"].manifest.srcFile("src/androidMain/AndroidManifest.xml")
//    defaultConfig {
//        minSdkVersion(24)
//        targetSdkVersion(29)
//    }
//}

extensions.findByName("buildScan")?.withGroovyBuilder {
    setProperty("termsOfServiceUrl", "https://gradle.com/terms-of-service")
    setProperty("termsOfServiceAgree", "yes")
}
