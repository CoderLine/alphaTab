//import org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget

plugins {
    kotlin("multiplatform")
    id("com.android.library")
}

group = "net.alphatab"
version = "1.3-SNAPSHOT"

kotlin {
    android()
//    ios {
//        binaries {
//            framework {
//                baseName = "alphaTab"
//            }
//        }
//    }

    jvm {
        compilations.all {
            kotlinOptions.jvmTarget = "14"
        }
        testRuns["test"].executionTask.configure {
            useJUnit()
        }
    }

    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.5.0-RC")
            }
            kotlin.srcDirs("../../../dist/lib.kotlin/src")
        }

        val commonTest by getting {
            dependencies {
                implementation(kotlin("test-common"))
                implementation(kotlin("test-annotations-common"))
            }
        }

        val androidMain by getting {
            dependencies {
                implementation("com.google.android.material:material:1.3.0")
            }
        }
        val androidTest by getting {
            dependencies {
                implementation(kotlin("test-junit"))
                implementation("junit:junit:4.13.2")
            }
            kotlin.srcDirs("../../../dist/lib.kotlin/test")
        }
//        val iosMain by getting
//        val iosTest by getting

        val os = System.getProperty("os.name")
        val skijaTarget = when {
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
                implementation("org.jetbrains.skija:skija-$skijaTarget:0.91.3")
            }
            kotlin.srcDirs("src/jvmCommon/kotlin")
            resources.srcDirs("../../../font/").apply {
                this.filter.include("**/*.ttf")
                this.filter.include("**/*.sf2")
            }
        }

        val jvmTest by getting {
            dependencies {
                implementation(kotlin("test-junit"))
            }
            kotlin.srcDirs("../../../dist/lib.kotlin/test")
        }
    }
}

android {
    compileSdkVersion(30)
    sourceSets["main"].manifest.srcFile("src/androidMain/AndroidManifest.xml")
    sourceSets["main"].assets.srcDirs(
        "../../../font/bravura",
        "../../../font/sonivox"
    )
    sourceSets["main"].java.srcDir("src/jvmCommon/kotlin")
    sourceSets["androidTest"].manifest.srcFile("src/androidTest/AndroidManifest.xml")
    sourceSets["androidTest"].java.srcDirs("src/androidTest/kotlin", "../../../dist/lib.kotlin/test")
    sourceSets["androidTest"].assets.srcDirs(
        "../../../test-data/",
        "../../../font/bravura",
        "../../../font/roboto",
        "../../../font/ptserif"
    )
    aaptOptions{
        ignoreAssetsPattern = arrayOf(
            "eot",
            "otf",
            "svg",
            "woff",
            "woff2",
            "json",
            "txt"
        ).joinToString(":") { "!*.${it}" }
    }

    defaultConfig {
        minSdkVersion(24)
        targetSdkVersion(29)
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    dependencies {
        implementation("org.jetbrains.kotlin:kotlin-stdlib:1.5.0")
        implementation("androidx.core:core-ktx:1.3.2")
        implementation("androidx.appcompat:appcompat:1.2.0")
        implementation("com.google.android.material:material:1.3.0")
        implementation("com.google.android:flexbox:2.0.1")
        testImplementation("junit:junit:4.13.2")
        androidTestImplementation("androidx.test.ext:junit:1.1.2")
        androidTestImplementation("androidx.test.espresso:espresso-core:3.3.0")
    }
}

val fetchTestResultsTask by tasks.registering {
    group = "reporting"
    doLast {
        exec {
            executable = android.adbExecutable.toString()
            args = listOf("pull", "/storage/emulated/0/Documents/test-results", "$buildDir/reports/androidTests/connected/")
        }
    }
}

tasks.whenTaskAdded {
    if(this.name == "connectedDebugAndroidTest") {
        this.finalizedBy(fetchTestResultsTask)
    }
}

//val packForXcode by tasks.creating(Sync::class) {
//    group = "build"
//    val mode = System.getenv("CONFIGURATION") ?: "DEBUG"
//    val sdkName = System.getenv("SDK_NAME") ?: "iphonesimulator"
//    val targetName = "ios" + if (sdkName.startsWith("iphoneos")) "Arm64" else "X64"
//    val framework =
//        kotlin.targets.getByName<KotlinNativeTarget>(targetName).binaries.getFramework(mode)
//    inputs.property("mode", mode)
//    dependsOn(framework.linkTask)
//    val targetDir = File(buildDir, "xcode-frameworks")
//    from({ framework.outputDirectory })
//    into(targetDir)
//}
//
//tasks.getByName("build").dependsOn(packForXcode)
