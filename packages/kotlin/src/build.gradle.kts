import com.vanniktech.maven.publish.MavenPublishBaseExtension
import java.io.FileInputStream
import java.util.Properties

plugins {
    alias(libs.plugins.jetbrains.kotlin.android) apply false
    alias(libs.plugins.android.library) apply false
    alias(libs.plugins.jetbrains.kotlin.jvm) apply false
    alias(libs.plugins.dokka) apply false
    alias(libs.plugins.mavenPublish) apply false
    alias(libs.plugins.animalsniffer) apply false
}

val props = Properties()
val propsFile = rootProject.file("local.properties")
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
    "alphaTab is a cross platform music notation and guitar tablature rendering library. " +
        "The \"alphaTab.net\" attribution in rendered scores must stay visible, " +
        "see https://alphatab.net/docs/attribution"
var libAuthorId = "danielku15"
var libAuthorName = "Daniel Kuschny"
var libOrgUrl = "https://github.com/coderline"
var libCompany = "CoderLine"
var libVersion = "1.10.0-SNAPSHOT"
var libProjectUrl = "https://github.com/CoderLine/alphaTab"
var libGitUrlHttp = "https://github.com/CoderLine/alphaTab.git"
var libGitUrlGit = "scm:git:git://github.com/CoderLine/alphaTab.git"
var libLicenseSpdx = "MPL-2.0"
var libLicenseUrl = "https://opensource.org/licenses/MPL-2.0"
var libIssuesUrl = "https://github.com/CoderLine/alphaTab/issues"
val libGroup = "net.alphatab"

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

subprojects {
    group = libGroup
    version = libVersion

    plugins.withId("com.vanniktech.maven.publish") {
        extensions.configure<PublishingExtension> {
            repositories {
                maven {
                    name = "DistPath"
                    url = rootProject.projectDir.resolve("dist").toURI()
                }
            }
        }

        extensions.configure<MavenPublishBaseExtension> {
            publishToMavenCentral(automaticRelease = true)
            signAllPublications()

            val inMemoryKeyFile = findProperty("signingInMemoryKeyFile")?.toString()
            if (inMemoryKeyFile != null) {
                val inMemoryKeyId = findProperty("signingInMemoryKeyId")?.toString()
                val inMemoryKeyPassword =
                    findProperty("signingInMemoryKeyPassword")?.toString().orEmpty()
                val signing = extensions.getByType(SigningExtension::class.java)
                val inMemoryKey = File(inMemoryKeyFile).readText()
                signing.useInMemoryPgpKeys(inMemoryKeyId, inMemoryKey, inMemoryKeyPassword)
            }

            pom {
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
