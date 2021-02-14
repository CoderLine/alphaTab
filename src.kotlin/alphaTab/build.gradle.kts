plugins {
    kotlin("multiplatform") version "1.4.10"
//    id("com.android.library")
//    id("kotlin-android-extensions")
}

group = "net.alphatab"
version = "1.3-SNAPSHOT"

repositories {
    google()
    mavenCentral()
    maven("https://maven.pkg.jetbrains.space/public/p/compose/dev")
}

kotlin {
    jvm {
        compilations.all {
            kotlinOptions.jvmTarget = "10"
        }
        testRuns["test"].executionTask.configure {
            useJUnit()
        }
    }
//    android()
    sourceSets {

        val commonMain by getting {
            dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.4.2")
            }
        }
        commonMain.kotlin.srcDirs("../../dist/lib.kotlin/src")

        val os = System.getProperty("os.name")
        val target = when {
            os == "Mac OS X" -> {
                "macos"
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
                implementation("org.jetbrains.skiko:skiko-jvm-runtime-$target-x64:0.2.6")
            }
        }
        jvmMain.kotlin.srcDirs("src/jvmCommon/kotlin")

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

//android {
//    compileSdkVersion(29)
//    sourceSets["main"].manifest.srcFile("src/androidMain/AndroidManifest.xml")
//    defaultConfig {
//        minSdkVersion(24)
//        targetSdkVersion(29)
//    }
//}
