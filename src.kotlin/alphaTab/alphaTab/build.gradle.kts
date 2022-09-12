import android.databinding.tool.ext.toCamelCase
import java.io.FileInputStream
import java.util.Properties

//
// Common

group = "net.alphatab"
version = "1.3.0-SNAPSHOT"
plugins {
    // Common
    kotlin("multiplatform")

    // Android
    id("com.android.library")
    `maven-publish`
    signing
    id("org.jetbrains.dokka") version "1.7.10"

    // iOS
    //    kotlin("native.cocoapods")
}

kotlin {
    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.6.4")
            }
            kotlin.srcDirs("../../../dist/lib.kotlin/commonMain/generated")
        }

        val commonTest by getting {
            dependencies {
                implementation(kotlin("test-common"))
                implementation(kotlin("test-annotations-common"))
            }
            kotlin.srcDirs("../../../dist/lib.kotlin/commonTest/generated")
        }
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

//
// Android
kotlin {
    android()

    sourceSets {
        val androidMain by getting {
            dependencies {
                implementation("androidx.core:core-ktx:1.8.0")
                implementation("androidx.appcompat:appcompat:1.5.1")
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

        val androidAndroidTestRelease by getting
        val androidTest by getting {
            dependsOn(androidAndroidTestRelease)
            dependencies {
                implementation(kotlin("test-junit"))
                implementation("junit:junit:4.13.2")
                implementation("org.jetbrains.skija:skija-$target:0.93.6")
            }
        }
    }
}

android {
    compileSdk = 32

    sourceSets["main"].manifest.srcFile("src/androidMain/AndroidManifest.xml")
    sourceSets["main"].assets.srcDirs(
        "../../../font/bravura",
        "../../../font/sonivox"
    )
    sourceSets["main"].kotlin.srcDirs(
        "../../../dist/lib.kotlin/commonMain/generated"
    )
    sourceSets["test"].manifest.srcFile("src/androidTest/AndroidManifest.xml")
    sourceSets["test"].assets.srcDirs(
        "../../../test-data",
        "../../../font/bravura",
        "../../../font/roboto",
        "../../../font/ptserif"
    )
    sourceSets["test"].kotlin.srcDirs(
        "../../../dist/lib.kotlin/commonTest/generated"
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

    publishing {
        singleVariant("release") {
            withSourcesJar()
            withJavadocJar()
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

// Android Deployment
var sonatypeSigningKeyId = ""
var sonatypeSigningPassword = ""
var sonatypeSigningKey = ""
var ossrhUsername = ""
var ossrhPassword = ""
var sonatypeStagingProfileId = ""

val props = Properties()
val propsFile = project.rootProject.file("local.properties")
if (propsFile.exists()) {
    FileInputStream(propsFile).use {
        props.load(it);
    }
}

fun loadSetting(envKey: String, propKey: String, setter: (value: String) -> Unit) {
    if (props.containsKey(propKey)) {
        setter(props.getProperty(propKey));
    } else {
        val env = providers
            .environmentVariable(envKey)
            .forUseAtConfigurationTime()
        if (env.isPresent) {
            setter(env.get())
        }
    }
}

loadSetting("OSSRH_USERNAME", "ossrhUsername") { ossrhUsername = it }
loadSetting("OSSRH_PASSWORD", "ossrhPassword") { ossrhPassword = it }
loadSetting("SONATYPE_STAGING_PROFILE_ID", "sonatypeStagingProfileId") { sonatypeStagingProfileId = it }
loadSetting("SONATYPE_SIGNING_KEY_ID", "sonatypeSigningKeyId") { sonatypeSigningKeyId = it }
loadSetting("SONATYPE_SIGNING_PASSWORD", "sonatypeSigningPassword") { sonatypeSigningPassword = it }
loadSetting("SONATYPE_SIGNING_KEY", "sonatypeSigningKey") { sonatypeSigningKey = it }

kotlin {
    android {
        publishLibraryVariants("release")
    }
}
tasks.withType<org.jetbrains.dokka.gradle.DokkaTask>().configureEach {
    // custom output directory
    outputDirectory.set(buildDir.resolve("dokka"))

    dokkaSourceSets {
        named("androidMain") { }
    }
}
publishing {
    repositories {
        maven {
            name = "sonatype"
            url = uri(
                if (version.toString().endsWith("SNAPSHOT"))
                    "https://s01.oss.sonatype.org/content/repositories/snapshots/"
                else
                    "https://s01.oss.sonatype.org/service/local/staging/deploy/maven2/"
            )
            credentials {
                username = ossrhUsername
                password = ossrhPassword
            }
        }
    }

    val dokkaHtml by tasks.getting(org.jetbrains.dokka.gradle.DokkaTask::class)
    val javadocJar: TaskProvider<Jar> by tasks.registering(Jar::class) {
        dependsOn(dokkaHtml)
        archiveClassifier.set("javadoc")
        from(dokkaHtml.outputDirectory)
    }

    publications.withType<MavenPublication> {
        artifact(javadocJar)
        pom {
            description.set("alphaTab is a cross platform music notation and guitar tablature rendering library.")
            url.set("https://github.com/CoderLine/alphaTab")
            licenses {
                license {
                    name.set("MPL-2.0")
                    url.set("https://opensource.org/licenses/MPL-2.0")
                }
            }
            developers {
                developer {
                    id.set("danielku15")
                    name.set("Daniel Kuschny")
                    organization.set("CoderLine")
                    organizationUrl.set("https://github.com/coderline")
                }
            }
            scm {
                url.set(
                    "https://github.com/CoderLine/alphaTab.git"
                )
                connection.set(
                    "scm:git:git://github.com/CoderLine/alphaTab.git"
                )
                developerConnection.set(
                    "scm:git:git://github.com/CoderLine/alphaTab.git"
                )
            }
            issueManagement {
                system.set("GitHub")
                url.set("https://github.com/CoderLine/alphaTab/issues")
            }
        }
    }
}

// Need gradle-nexus/publish-plugin for that but its broken for MPP
// https://github.com/gradle-nexus/publish-plugin/issues/140
publishing.repositories.all {
    val capitalizedName = this.name.toCamelCase()
    val closeAndReleaseTask = rootProject.tasks.register<Task>(
        "closeAndRelease${capitalizedName}StagingRepository"
    )
    closeAndReleaseTask {
        description = "Closes and releases open staging repository in '${name}' Nexus instance."
        group = PublishingPlugin.PUBLISH_TASK_GROUP
//        dependsOn(closeTask, releaseTask)
    }
}

signing {
    if (sonatypeSigningKeyId.isNotBlank() && sonatypeSigningKey.isNotBlank() && sonatypeSigningPassword.isNotBlank()) {
        useInMemoryPgpKeys(sonatypeSigningKeyId, sonatypeSigningKey, sonatypeSigningPassword)
        sign(publishing.publications)
    }
}

//
// iOS

//kotlin {
//    iosX64()
//    iosArm64()
//    iosSimulatorArm64() sure all ios dependencies support this target
//
//    cocoapods {
//        summary = "Some description for the Shared Module"
//        homepage = "Link to the Shared Module homepage"
//        ios.deploymentTarget = "14.1"
//        framework {
//            baseName = "shared"
//        }
//    }
//
//    sourceSets {
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
//    }
//}
