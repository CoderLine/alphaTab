import com.vanniktech.maven.publish.JavadocJar
import com.vanniktech.maven.publish.KotlinJvm
import com.vanniktech.maven.publish.SourcesJar
import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    alias(libs.plugins.jetbrains.kotlin.jvm)
    `java-library`
    alias(libs.plugins.dokka)
    alias(libs.plugins.mavenPublish)
    alias(libs.plugins.animalsniffer)
}

val javaVersion = JavaVersion.VERSION_17

java {
    sourceCompatibility = javaVersion
    targetCompatibility = javaVersion
}

tasks.withType<JavaCompile>().configureEach {
    options.release.set(17)
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
        moduleName.set("alphaTab-core")
        freeCompilerArgs.addAll(
            listOf(
                // compile against the Java 17 class library, not the one of the JDK running Gradle
                "-Xjdk-release=17",
                "-Xno-call-assertions",
                "-Xno-receiver-assertions",
                "-Xno-param-assertions"
            )
        )
    }
}

sourceSets {
    main {
        kotlin.srcDirs("src/main-generated/java")
    }
    test {
        kotlin.srcDirs("src/test-generated/java")
    }
}

dependencies {
    implementation(libs.kotlinx.coroutines.core)
    // JVM applications initialize the native alphaSkia library themselves (e.g. AlphaSkiaLinux)
    api(libs.alphaskia)

    testImplementation(libs.junit)
    testImplementation(libs.alphaskia.macos)
    testImplementation(libs.alphaskia.linux)
    testImplementation(libs.alphaskia.windows)
    testImplementation(libs.kotlinx.coroutines.test)
    testImplementation(libs.klaxon)

    // the core also runs on Android (minSdk of the alphaTab AAR)
    signature(libs.gummybears.api26) {
        artifact {
            type = "signature"
        }
    }
}

animalsniffer {
    sourceSets = listOf(project.sourceSets.main.get())
}

mavenPublishing {
    coordinates(group.toString(), "alphaTab-core", version.toString())
    configure(KotlinJvm(javadocJar = JavadocJar.Dokka("dokkaGeneratePublicationHtml"), sourcesJar = SourcesJar.Sources()))
    pom {
        name = "alphaTab-core"
    }
}
