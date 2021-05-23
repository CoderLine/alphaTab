buildscript {
    repositories {
        gradlePluginPortal()
        google()
        jcenter()
        mavenCentral()
    }
    dependencies {
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:1.5.0")
        classpath("com.android.tools.build:gradle:4.2.1")
    }
}

allprojects {
    repositories {
        google()
        jcenter()
        mavenCentral()
        maven("https://packages.jetbrains.team/maven/p/skija/maven")
    }
}
