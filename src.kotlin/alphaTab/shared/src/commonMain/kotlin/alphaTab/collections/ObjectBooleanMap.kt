package alphaTab.collections

public data class ObjectBooleanMapEntry<TKey>(
    public val key:TKey,
    public val value:Boolean
)

public expect class ObjectBooleanMap<TKey> : Iterable<ObjectBooleanMapEntry<TKey>>  {
    public val size: Double
    
    public constructor()
    public constructor(items:Iterable<ObjectBooleanMapEntry<TKey>>)

    public fun has(key: TKey): Boolean
    public fun get(key: TKey): Boolean
    public fun set(key: TKey, value: Boolean)
    public fun delete(key: TKey)
    public fun values(): IBooleanIterable
    public fun keys(): Iterable<TKey>
    public fun clear()
}
