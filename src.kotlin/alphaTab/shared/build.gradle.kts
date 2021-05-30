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
            kotlinOptions.jvmTarget = "11"
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
            kotlin.srcDirs("../../../dist/lib.kotlin/test")
        }

        val jvmMain by getting {
            kotlin.srcDirs("src/jvmCommonMain/kotlin")
            dependencies {
                // TODO: check with Skija devs to have a platform independent lib
                implementation("org.jetbrains.skija:skija-windows:0.91.3")
                implementation("org.eclipse.collections:eclipse-collections-api:10.4.0")
                implementation("org.eclipse.collections:eclipse-collections:10.4.0")

            }
            resources.srcDirs("../../../font/").apply {
                this.filter.include("**/*.ttf")
                this.filter.include("**/*.sf2")
            }
        }

        val jvmTest by getting {
            //kotlin.srcDirs("src/jvmCommonTest")
            dependencies {
                implementation(kotlin("test"))
                implementation(kotlin("test-junit"))
                implementation("junit:junit:4.13.2")
            }
        }

        val androidMain by getting {
            kotlin.srcDirs("src/jvmCommonMain/kotlin")
            dependencies {
                implementation("org.eclipse.collections:eclipse-collections-api:10.4.0")
                implementation("org.eclipse.collections:eclipse-collections:10.4.0")
                implementation("androidx.core:core-ktx:1.5.0")
                implementation("androidx.appcompat:appcompat:1.3.0")
                implementation("com.google.android.material:material:1.3.0")
                implementation("androidx.recyclerview:recyclerview:1.2.0")
                implementation("com.google.android.flexbox:flexbox:3.0.0")
            }
        }
        val androidTest by getting {
            dependencies {
//                implementation(kotlin("test"))
                implementation(kotlin("test-junit"))
                implementation("junit:junit:4.13.2")
            }
        }

//        val iosMain by getting
//        val iosTest by getting

    }
}

android {
    compileSdkVersion(30)
    sourceSets["main"].manifest.srcFile("src/androidMain/AndroidManifest.xml")
    sourceSets["main"].assets.srcDirs(
        "../../../font/bravura",
        "../../../font/sonivox"
    )
    sourceSets["androidTest"].manifest.srcFile("src/androidTest/AndroidManifest.xml")
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
        targetSdkVersion(30)
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    packagingOptions {
        exclude("LICENSE-EPL-1.0.txt")
        exclude("LICENSE-EDL-1.0.txt")
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

// TODO: remove assertions for faster library.
//tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile)
//    .all {
//        kotlinOptions {
//            freeCompilerArgs += [
//                '-Xno-call-assertions',
//                '-Xno-receiver-assertions',
//                '-Xno-param-assertions'
//            ]
//        }
//    }

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
