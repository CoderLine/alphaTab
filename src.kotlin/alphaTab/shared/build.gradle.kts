plugins {
    kotlin("multiplatform")
//    kotlin("native.cocoapods")
    id("com.android.library")
}

group = "net.alphatab"
version = "1.3-SNAPSHOT"

kotlin {
    android()
//    iosX64()
//    iosArm64()
//    iosSimulatorArm64() sure all ios dependencies support this target

//    cocoapods {
//        summary = "Some description for the Shared Module"
//        homepage = "Link to the Shared Module homepage"
//        ios.deploymentTarget = "14.1"
//        framework {
//            baseName = "shared"
//        }
//    }

    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.5.2")
            }
            kotlin.srcDirs("./src/commonMain/generated")
        }

        val commonTest by getting {
            dependencies {
                implementation(kotlin("test-common"))
                implementation(kotlin("test-annotations-common"))
            }
            kotlin.srcDirs("./src/commonTest/generated")
        }

        val androidMain by getting {
            dependencies {
                implementation("androidx.core:core-ktx:1.7.0")
                implementation("androidx.appcompat:appcompat:1.4.1")
                implementation("com.google.android.material:material:1.5.0")
                implementation("androidx.recyclerview:recyclerview:1.2.1")
                implementation("com.google.android.flexbox:flexbox:3.0.0")
            }
        }

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

        val androidTest by getting {
            dependencies {
                implementation(kotlin("test-junit"))
                implementation("junit:junit:4.13.2")
                implementation("org.jetbrains.skija:skija-$target:0.93.6")
            }
        }

//        val iosX64Main by getting
//        val iosArm64Main by getting
//        val iosSimulatorArm64Main by getting
//        val iosMain by creating {
//            dependsOn(commonMain)
//            iosX64Main.dependsOn(this)
//            iosArm64Main.dependsOn(this)
//            //iosSimulatorArm64Main.dependsOn(this)
//        }
//        val iosX64Test by getting
//        val iosArm64Test by getting
//        //val iosSimulatorArm64Test by getting
//        val iosTest by creating {
//            dependsOn(commonTest)
//            iosX64Test.dependsOn(this)
//            iosArm64Test.dependsOn(this)
//            //iosSimulatorArm64Test.dependsOn(this)
//        }

    }
}

android {
    compileSdk = 31

    sourceSets["main"].manifest.srcFile("src/androidMain/AndroidManifest.xml")
    sourceSets["main"].assets.srcDirs(
        "../../../font/bravura",
        "../../../font/sonivox"
    )
    sourceSets["test"].manifest.srcFile("src/androidTest/AndroidManifest.xml")
    sourceSets["test"].assets.srcDirs(
        "../../../test-data",
        "../../../font/bravura",
        "../../../font/roboto",
        "../../../font/ptserif"
    )
    androidResources {
        ignoreAssetsPattern = arrayOf(
            "eot",
            "otf",
            "svg",
            "woff",
            "woff2",
            "json",
            "txt",
            "md"
        ).joinToString(":") { "!*.${it}" }
    }

    defaultConfig {
        minSdk = 24
        targetSdk = 31
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    testOptions {
        unitTests {
            isIncludeAndroidResources = true
        }
    }
}
dependencies {
    // To use the androidx.test.core APIs
    androidTestImplementation("androidx.test:core:1.4.0")
    // Kotlin extensions for androidx.test.core
    androidTestImplementation("androidx.test:core-ktx:1.4.0")
}

val fetchTestResultsTask by tasks.registering {
    group = "reporting"
    doLast {
        exec {
            executable = android.adbExecutable.toString()
            args = listOf(
                "pull",
                "/storage/emulated/0/Documents/test-results",
                "$buildDir/reports/androidTests/connected/"
            )
        }
    }
}

tasks.whenTaskAdded {
    if (this.name == "connectedDebugAndroidTest") {
        this.finalizedBy(fetchTestResultsTask)
    }
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    kotlinOptions {
        freeCompilerArgs += listOf(
            "-Xno-call-assertions",
            "-Xno-receiver-assertions",
            "-Xno-param-assertions"
        )
    }
}
