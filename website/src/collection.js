export class Collection {
    constructor(array) {
        this.array = array;
    }
    filter(predicate) {
        return new Collection(this.array.filter(predicate));
    }
    map(predicate) {
        return new Collection(this.array.map(predicate));
    }
    toArray() {
        return this.array;
    }
    groupBy(keySelector) {
        const obj = { lookup: {}, result: [] };
        this.array.reduce((_, val) => {
            const key = keySelector(val);
            if (key in obj.lookup) {
                obj.lookup[key].items.push(val);
            } else {
                const group = { key: key, items: [val] };
                obj.lookup[key] = group;
                obj.result.push(group);
            }
            return obj;
        }, obj);
        return new Collection(obj.result);
    }
    orderBy() {
        const selectors = arguments;
        const copy = this.array.slice();
        return new Collection(copy.sort((a, b) => {
            let result = 0;
            for (let i = 0; i < selectors.length; i++) {
                const sel = selectors[i];
                result = sel(a).localeCompare(sel(b));
                if (result != 0) {
                    break;
                }
            }
            return result;
        }));
    }
}

export default Collection;