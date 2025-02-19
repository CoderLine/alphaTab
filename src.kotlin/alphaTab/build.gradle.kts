import java.io.FileInputStream
import java.util.Properties

plugins {
    alias(libs.plugins.jetbrains.kotlin.android) apply false
    alias(libs.plugins.android.library) apply false
    alias(libs.plugins.nexus)
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

var ossrhUsername = ""
var ossrhPassword = ""
var sonatypeStagingProfileId = ""
loadSetting("OSSRH_USERNAME", "ossrhUsername") { ossrhUsername = it }
loadSetting("OSSRH_PASSWORD", "ossrhPassword") { ossrhPassword = it }
loadSetting("SONATYPE_STAGING_PROFILE_ID", "sonatypeStagingProfileId") {
    sonatypeStagingProfileId = it
}

nexusPublishing {
    repositories.sonatype {
        stagingProfileId = sonatypeStagingProfileId
        nexusUrl.set(uri("https://s01.oss.sonatype.org/service/local/"))
        snapshotRepositoryUrl.set(uri("https://s01.oss.sonatype.org/content/repositories/snapshots/"))
        username = ossrhUsername
        password = ossrhPassword
    }
}
