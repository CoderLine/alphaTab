package alphaTab.model

expect class ComparisonHelpersPartials {
    companion object {
        public fun compareObjects(
            expected: Any?,
            actual: Any?,
            path: String,
            ignoreKeys: alphaTab.collections.List<String>?
        ): Boolean;
    }
}
