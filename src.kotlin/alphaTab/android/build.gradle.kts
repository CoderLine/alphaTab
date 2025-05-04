import com.vanniktech.maven.publish.AndroidSingleVariantLibrary
import com.vanniktech.maven.publish.SonatypeHost
import java.io.FileInputStream
import java.util.Properties

plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.jetbrains.kotlin.android)
    alias(libs.plugins.dokka)
    alias(libs.plugins.mavenPublish)
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
var libVersion = "1.5.0-SNAPSHOT"
var libProjectUrl = "https://github.com/CoderLine/alphaTab"
var libGitUrlHttp = "https://github.com/CoderLine/alphaTab.git"
var libGitUrlGit = "scm:git:git://github.com/CoderLine/alphaTab.git"
var libLicenseSpdx = "MPL-2.0"
var libLicenseUrl = "https://opensource.org/licenses/MPL-2.0"
var libIssuesUrl = "https://github.com/CoderLine/alphaTab/issues"
val libGroup = "net.alphatab"
val libArtifactId = "alphaTab"

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

group = libGroup
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
            assets.srcDirs(
                "../../../font/bravura",
                "../../../font/sonivox"
            )
        }
        getByName("test") {
            java.srcDirs("../../../dist/lib.kotlin/commonTest/generated")
            kotlin.srcDirs("../../../dist/lib.kotlin/commonTest/generated")
        }
    }

    androidResources {
        ignoreAssetsPattern = arrayOf(
            "eot",
            "ttf",
            "svg",
            "woff",
            "woff2",
            "json",
            "txt",
            "md"
        ).joinToString(":") { "!*.${it}" }
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

publishing {
    repositories{
        maven {
            name = "DistPath"
            url = rootProject.projectDir.resolve("dist").toURI()
        }
    }
}

internal fun Project.findOptionalProperty(propertyName: String) = findProperty(propertyName)?.toString()

mavenPublishing {
    publishToMavenCentral(SonatypeHost.CENTRAL_PORTAL, automaticRelease = true)
    coordinates(libGroup, libArtifactId, libVersion)
    signAllPublications()

    configure(AndroidSingleVariantLibrary(
        variant = "release",
        sourcesJar = true,
        publishJavadocJar = true
    ))

    val inMemoryKeyFile = project.findOptionalProperty("signingInMemoryKeyFile")
    if (inMemoryKeyFile != null) {
        val inMemoryKeyId = project.findOptionalProperty("signingInMemoryKeyId")
        val inMemoryKeyPassword = project.findOptionalProperty("signingInMemoryKeyPassword").orEmpty()
        val signing = project.extensions.getByType(SigningExtension::class.java)
        val inMemoryKey = File(inMemoryKeyFile).readText()
        signing.useInMemoryPgpKeys(inMemoryKeyId, inMemoryKey, inMemoryKeyPassword)
    }

    pom {
        name = libArtifactId
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
