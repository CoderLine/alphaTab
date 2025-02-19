import java.io.FileInputStream
import java.util.Properties

plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.jetbrains.kotlin.android)
    alias(libs.plugins.dokka)
    `maven-publish`
    signing
}


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
        val env = providers
            .environmentVariable(envKey)
        if (env.isPresent) {
            setter(env.get())
        }
    }
}

var libDescription =
    "alphaTab is a cross platform music notation and guitar tablature rendering library."
var libAuthorId = "danielku15"
var libAuthorName = "Daniel Kuschny"
var libOrgUrl = "https://github.com/coderline"
var libCompany = "CoderLine"
var libVersion = "1.4.0-SNAPSHOT"
var libProjectUrl = "https://github.com/CoderLine/alphaTab"
var libGitUrlHttp = "https://github.com/CoderLine/alphaTab.git"
var libGitUrlGit = "scm:git:git://github.com/CoderLine/alphaTab.git"
var libLicenseSpdx = "MPL-2.0"
var libLicenseUrl = "https://opensource.org/licenses/MPL-2.0"
var libIssuesUrl = "https://github.com/CoderLine/alphaTab/issues"

loadSetting("ALPHATAB_DESCRIPTION", "alphatabDescription") { libDescription = it }
loadSetting("ALPHATAB_AUTHOR_ID", "alphatabAuthorId") { libAuthorId = it }
loadSetting("ALPHATAB_AUTHOR_NAME", "alphatabAuthorName") { libAuthorName = it }
loadSetting("ALPHATAB_ORG_URL", "alphatabOrgUrl") { libOrgUrl = it }
loadSetting("ALPHATAB_COMPANY", "alphatabCompany") { libCompany = it }
loadSetting("ALPHATAB_VERSION", "alphatabVersion") { libVersion = it }
loadSetting("ALPHATAB_PROJECT_URL", "alphatabProjectUrl") { libProjectUrl = it }
loadSetting("ALPHATAB_GIT_URL_HTTP", "alphatabGitUrlHttp") { libGitUrlHttp = it }
loadSetting("ALPHATAB_GIT_URL_GIT", "alphatabGitUrlGit") { libGitUrlGit = it }
loadSetting("ALPHATAB_LICENSE_SPDX", "alphatabLicenseSpdx") { libLicenseSpdx = it }
loadSetting("ALPHATAB_LICENSE_URL", "alphatabLicenseUrl") { libLicenseUrl = it }
loadSetting("ALPHATAB_ISSUES_URL", "alphatabIssuesUrl") { libIssuesUrl = it }

group = "net.alphatab"
version = libVersion

val javaVersion = JavaVersion.VERSION_17;
var jvmTarget = 17
android {
    namespace = project.group.toString()
    compileSdk = 34

    defaultConfig {
        minSdk = 26
        setProperty("archivesBaseName", "alphaTab-android")
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        aarMetadata {
            minCompileSdk = 34
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }
    compileOptions {
        sourceCompatibility = javaVersion
        targetCompatibility = javaVersion
    }
    kotlinOptions {
        jvmTarget = javaVersion.toString()
        freeCompilerArgs += listOf(
            "-Xno-call-assertions",
            "-Xno-receiver-assertions",
            "-Xno-param-assertions"
        )
    }

    sourceSets {
        getByName("main") {
            java.srcDirs("../../../dist/lib.kotlin/commonMain/generated")
            kotlin.srcDirs("../../../dist/lib.kotlin/commonMain/generated")
        }
        getByName("test") {
            java.srcDirs("../../../dist/lib.kotlin/commonTest/generated")
            kotlin.srcDirs("../../../dist/lib.kotlin/commonTest/generated")
        }
    }

    publishing {
        singleVariant("release") {
            withSourcesJar()
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)

    implementation(libs.alphaskia.android)
    implementation(libs.kotlinx.coroutines.core)
    implementation(libs.alphaskia)

    testImplementation(libs.alphaskia.macos)
    testImplementation(libs.alphaskia.linux)
    testImplementation(libs.alphaskia.windows)
    testImplementation(libs.kotlinx.coroutines.test)
}


var sonatypeSigningKeyId = ""
var sonatypeSigningPassword = ""
var sonatypeSigningKey = ""
var sonatypeStagingProfileId = ""
loadSetting("SONATYPE_STAGING_PROFILE_ID", "sonatypeStagingProfileId") {
    sonatypeStagingProfileId = it
}
loadSetting("SONATYPE_SIGNING_KEY_ID", "sonatypeSigningKeyId") { sonatypeSigningKeyId = it }
loadSetting("SONATYPE_SIGNING_PASSWORD", "sonatypeSigningPassword") { sonatypeSigningPassword = it }
loadSetting("SONATYPE_SIGNING_KEY", "sonatypeSigningKey") { sonatypeSigningKey = it }

publishing {
    repositories {
        maven {
            name = "DistPath"
            url = rootProject.projectDir.resolve("dist").toURI()
        }
    }

    val dokkaHtml by tasks.getting(org.jetbrains.dokka.gradle.DokkaTask::class)
    val javadocJar: TaskProvider<Jar> by tasks.registering(Jar::class) {
        dependsOn(dokkaHtml)
        archiveClassifier.set("javadoc")
        from(dokkaHtml.outputDirectory)
    }

    publications {
        create<MavenPublication>("release") {
            artifact(javadocJar)
            afterEvaluate {
                from(components["release"])
            }

            artifactId = tasks.withType<Jar>().firstOrNull()?.archiveBaseName?.get()
            pom {
                name = artifactId
                description = libDescription
                url = libProjectUrl
                licenses {
                    license {
                        name = libLicenseSpdx
                        url = libLicenseUrl
                    }
                }
                developers {
                    developer {
                        id = libAuthorId
                        name = libAuthorName
                        organization = libCompany
                        organizationUrl = libOrgUrl
                    }
                }
                scm {
                    url = libGitUrlHttp
                    connection = "scm:git:$libGitUrlGit"
                    developerConnection = "scm:git:$libGitUrlGit"
                }
                issueManagement {
                    system = "GitHub"
                    url = libIssuesUrl
                }
            }
        }
    }
}

signing {
    if (sonatypeSigningKeyId.isNotBlank() && sonatypeSigningKey.isNotBlank() && sonatypeSigningPassword.isNotBlank()) {
        useInMemoryPgpKeys(sonatypeSigningKeyId, sonatypeSigningKey, sonatypeSigningPassword)
        sign(publishing.publications["release"])
    } else if (System.getenv("KOTLIN_REQUIRE_SIGNING") == "true") {
        logger.error("Missing Signing Key configuration")
        throw Exception("Missing Signing Key configuration")
    }
}
