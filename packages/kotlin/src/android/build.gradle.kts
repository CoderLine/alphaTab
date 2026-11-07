import com.vanniktech.maven.publish.AndroidSingleVariantLibrary
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    // AGP 9+ has built-in Kotlin support; a separate kotlin-android plugin is no
    // longer applied. See https://issuetracker.google.com/438678642.
    alias(libs.plugins.android.library)
    alias(libs.plugins.dokka)
    alias(libs.plugins.mavenPublish)
}

val javaVersion = JavaVersion.VERSION_17;
var jvmTargetVersion = JvmTarget.JVM_17

kotlin {
    compilerOptions {
        jvmTarget.set(jvmTargetVersion)
        moduleName.set("alphaTab-android")
        freeCompilerArgs.addAll(
            listOf(
                "-Xno-call-assertions",
                "-Xno-receiver-assertions",
                "-Xno-param-assertions"
            )
        )
    }
}

android {
    namespace = project.group.toString()
    compileSdk = 37

    defaultConfig {
        minSdk = 26
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        aarMetadata {
            minCompileSdk = 37
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

    sourceSets {
        getByName("main") {
            assets.srcDirs(
                "../../../alphatab/font/bravura",
                "../../../alphatab/font/sonivox"
            )
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
        //noinspection WrongGradleMethod
        ).joinToString(":") { "!*.${it}" }
    }
}

evaluationDependsOn(":core")
val core = project(":core")

// The Android integration uses internal members of the core, like AlphaTab.Windows does in C#
// through InternalsVisibleTo. Both artifacts are therefore published and consumed in lockstep.
tasks.withType<KotlinCompile>().configureEach {
    friendPaths.from(core.tasks.named("jar"))
}

dependencies {
    api(core)
    constraints {
        api("${core.group}:alphaTab-core") {
            version {
                strictly(core.version.toString())
            }
        }
    }

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.alphaskia)
    implementation(libs.alphaskia.android)
    implementation(libs.kotlinx.coroutines.core)

    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
}

mavenPublishing {
    coordinates(group.toString(), "alphaTab", version.toString())
    configure(
        AndroidSingleVariantLibrary(
            variant = "release",
            sourcesJar = true,
            publishJavadocJar = true
        )
    )
    pom {
        name = "alphaTab"
    }
}
