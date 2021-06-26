package alphaTab.collections

public data class DoubleDoubleMapEntry(
    public val key:Double,
    public val value:Double
)

public expect class DoubleDoubleMap : Iterable<DoubleDoubleMapEntry> {
    public val size: Double
    
    public constructor()
    public constructor(items:Iterable<DoubleDoubleMapEntry>)

    public fun has(key: Double): Boolean
    public fun get(key: Double): Double
    public fun set(key: Double, value: Double)
    public fun delete(key: Double)
    public fun values(): IDoubleIterable
    public fun keys(): IDoubleIterable
    public fun clear()
}
