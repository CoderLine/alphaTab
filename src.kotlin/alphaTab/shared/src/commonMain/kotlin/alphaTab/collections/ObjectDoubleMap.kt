package alphaTab.collections

internal data class ObjectDoubleMapEntry<TKey>(
    public val key:TKey,
    public val value:Double
)

internal expect class ObjectDoubleMap<TKey> : Iterable<ObjectDoubleMapEntry<TKey>> {
    public val size: Double

    public constructor()
    public constructor(items:Iterable<ObjectDoubleMapEntry<TKey>>)

    public fun has(key: TKey): Boolean
    public fun get(key: TKey): Double
    public fun set(key: TKey, value: Double)
    public fun delete(key: TKey)
    public fun values(): IDoubleIterable
    public fun keys(): Iterable<TKey>
    public fun clear()
}
