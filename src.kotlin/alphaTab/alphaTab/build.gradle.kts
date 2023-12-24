import android.databinding.tool.ext.toCamelCase
import java.io.FileInputStream
import java.util.Properties

//
// Common

group = "net.alphatab"
version = "1.3.0-SNAPSHOT"
plugins {
    // Common
    alias(libs.plugins.kotlinMultiplatform)

    // Android
    alias(libs.plugins.androidLibrary)
    `maven-publish`
    signing
    alias(libs.plugins.dokka)

    // iOS
//    alias(libs.plugins.kotlinCocoapods)
}

repositories{
    google()
    mavenCentral()
    maven("https://s01.oss.sonatype.org/content/repositories/snapshots/")
}

val jvmTarget = 17
val alphaTabDescription = "alphaTab is a cross platform music notation and guitar tablature rendering library."
val alphaTabWebsite = "https://alphatab.net"

kotlin {
    sourceSets {
        commonMain {
            dependencies {
                implementation(libs.kotlinx.coroutines.core)
                implementation(libs.alphaskia)
            }
            kotlin.srcDirs("../../../dist/lib.kotlin/commonMain/generated")
        }
        commonTest {
            dependencies {
                implementation(libs.kotlin.test)
                implementation(libs.kotlinx.coroutines.test)
                implementation(libs.alphaskia.macos)
                implementation(libs.alphaskia.linux)
                implementation(libs.alphaskia.windows)
            }
            kotlin.srcDirs("../../../dist/lib.kotlin/commonTest/generated")
        }

        androidMain {
            dependencies {
                implementation(libs.alphaskia.android)
            }
        }
    }
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    kotlinOptions {
        jvmTarget = this@Build_gradle.jvmTarget.toString()
        freeCompilerArgs += listOf(
            "-Xno-call-assertions",
            "-Xno-receiver-assertions",
            "-Xno-param-assertions",
            "-Xmulti-platform"
        )
    }
}

//
// Android
kotlin {
    androidTarget {
        compilations.all {
            kotlinOptions {
                jvmTarget = this@Build_gradle.jvmTarget.toString()
            }
        }
    }

    sourceSets {
        androidMain.dependencies {
            implementation(libs.androidx.appcompat)
        }
    }
}

android {
    compileSdk = 33
    namespace = project.group.toString()

    sourceSets["main"].manifest.srcFile("src/androidMain/AndroidManifest.xml")
    sourceSets["main"].assets.srcDirs(
        "../../../font/bravura",
        "../../../font/sonivox"
    )
    sourceSets["test"].manifest.srcFile("src/androidTest/AndroidManifest.xml")
    sourceSets["test"].assets.srcDirs(
        "../../../test-data",
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
        minSdk = 26
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
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
    androidTestImplementation(libs.androidx.test.core)
    androidTestImplementation(libs.androidx.test.core.ktx)
}

val fetchTestResultsTask by tasks.registering {
    group = "reporting"
    doLast {
        exec {
            executable = android.adbExecutable.toString()
            args = listOf(
                "pull",
                "/storage/emulated/0/Documents/test-results",
                layout.buildDirectory.dir("reports/androidTests/connected/").toString()
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
        props.load(it)
    }
}

fun loadSetting(envKey: String, propKey: String, setter: (value: String) -> Unit) {
    if (props.containsKey(propKey)) {
        setter(props.getProperty(propKey))
    } else {
        val env = providers.environmentVariable(envKey)
        if (env.isPresent) {
            setter(env.get())
        }
    }
}

loadSetting("OSSRH_USERNAME", "ossrhUsername") { ossrhUsername = it }
loadSetting("OSSRH_PASSWORD", "ossrhPassword") { ossrhPassword = it }
loadSetting("SONATYPE_STAGING_PROFILE_ID", "sonatypeStagingProfileId") {
    sonatypeStagingProfileId = it
}
loadSetting("SONATYPE_SIGNING_KEY_ID", "sonatypeSigningKeyId") { sonatypeSigningKeyId = it }
loadSetting("SONATYPE_SIGNING_PASSWORD", "sonatypeSigningPassword") { sonatypeSigningPassword = it }
loadSetting("SONATYPE_SIGNING_KEY", "sonatypeSigningKey") { sonatypeSigningKey = it }

kotlin {
    androidTarget {
        publishLibraryVariants("release")
    }
}
tasks.withType<org.jetbrains.dokka.gradle.DokkaTask>().configureEach {
    // custom output directory
    outputDirectory.set(layout.buildDirectory.dir("dokka"))

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
            description.set(alphaTabDescription)
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

kotlin {
//    iosX64()
//    iosArm64()
//    iosSimulatorArm64()
//
//    cocoapods {
//        summary = alphaTabDescription
//        homepage = alphaTabWebsite
//        ios.deploymentTarget = "16.0"
//        framework {
//            baseName = "alphaTab"
//        }
//    }
}
