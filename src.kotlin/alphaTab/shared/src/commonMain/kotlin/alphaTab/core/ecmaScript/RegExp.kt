package alphaTab.core.ecmaScript

private data class RegExpCacheEntry(val pattern: String, val flags: String)
private val RegexpCache = HashMap<RegExpCacheEntry, RegExp>()

internal class RegExp {
    private var _regex: Regex
    private var _global: Boolean

    public constructor(regex: String, flags: String = "") {
        val cache = RegexpCache.getOrPut(RegExpCacheEntry(regex, flags), {
            val options = HashSet<RegexOption>()
            for (c in flags) {
                when (c) {
                    'i' -> {
                        options.add(RegexOption.IGNORE_CASE)
                    }
                    'g' -> {
                        _global = true
                    }
                    'm' -> {
                        options.add(RegexOption.MULTILINE)
                    }
                }
            }
            _regex = Regex(regex, options)
            this
        })

        _regex = cache._regex
        _global = cache._global
    }

    public fun exec(s: String): Boolean {
        return _regex.matches(s)
    }

    public fun replace(s: String, replacement: String): String {
        return if (_global)
            _regex.replace(s, replacement)
        else
            _regex.replaceFirst(s, replacement)
    }
}
