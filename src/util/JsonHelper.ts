export class JsonHelper {
    public static parseEnum<T>(value: string, enumType: any): T {
        return (isNaN(parseInt(value))
            ? enumType[Object.keys(enumType).find(k => k.toLowerCase() === value.toLowerCase()) as any]
            : parseInt(value)
        ) as any as T;
    }
}