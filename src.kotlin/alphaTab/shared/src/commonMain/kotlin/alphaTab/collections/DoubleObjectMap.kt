package alphaTab.collections

public data class DoubleObjectMapEntry<TValue>(
    public val key: Double,
    public val value: TValue
)

public expect class DoubleObjectMap<TValue> : Iterable<DoubleObjectMapEntry<TValue>> {
    public val size: Double
    
    public constructor()
    public constructor(items: Iterable<DoubleObjectMapEntry<TValue>>)

    public fun has(key: Double): Boolean
    public fun get(key: Double): TValue
    public fun set(key: Double, value: TValue)
    public fun delete(key: Double)
    public fun values(): Iterable<TValue>
    public fun keys(): IDoubleIterable
    public fun clear()
}
