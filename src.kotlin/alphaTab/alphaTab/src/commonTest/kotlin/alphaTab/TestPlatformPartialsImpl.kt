package alphaTab

import alphaTab.core.ecmaScript.Uint8Array
@ExperimentalUnsignedTypes
public expect class TestPlatformPartials {
    companion object {
        fun deleteFile(path: String)
        fun loadFile(path: String): Uint8Array
        fun saveFile(name: String, data: Uint8Array)
        fun joinPath(vararg path: String): String
        fun listDirectory(path: String): alphaTab.collections.List<String>
    }
}
