package alphaTab.collections

internal data class DoubleBooleanMapEntry(
    public val key:Double,
    public val value:Boolean
)

internal expect class DoubleBooleanMap : Iterable<DoubleBooleanMapEntry> {
    public val size: Double
    
    public constructor()
    public constructor(items:Iterable<DoubleBooleanMapEntry>)

    public fun has(key: Double): Boolean
    public fun get(key: Double): Boolean
    public fun set(key: Double, value: Boolean)
    public fun delete(key: Double)
    public fun values(): IBooleanIterable
    public fun keys(): IDoubleIterable
    public fun clear()
}
