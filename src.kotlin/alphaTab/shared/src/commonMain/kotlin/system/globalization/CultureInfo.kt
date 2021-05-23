package system.globalization

class CultureInfo {
    companion object {
        public var invariantCulture = CultureInfo(true)
    }

    public val isInvariant:Boolean;

    public constructor(isInvariant:Boolean) {
        this.isInvariant = isInvariant;
    }
}
