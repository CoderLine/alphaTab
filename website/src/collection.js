export class Collection {
    constructor(array) {
        this.array = array;
    }
    push(item) {
        this.array.push(item);
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
        const groupLookup = new Map();
        const groups = [];
        this.array.forEach(val => {
            const key = keySelector(val);
            if (groupLookup.has(key)) {
                groupLookup.get(key).items.push(val);
            } else {
                const group = { key: key, items: new Collection([val]) };
                groupLookup.set(key, group);
                groups.push(group);
            }
        });
        return new Collection(groups);
    }
    orderBy() {
        const selectors = arguments;
        const copy = this.array.slice();
        return new Collection(copy.sort((a, b) => {
            let result = 0;
            for (let i = 0; i < selectors.length; i++) {
                const sel = selectors[i];
                const aval = sel(a);
                const bval = sel(b);
                switch (typeof aval) {
                    case "string":
                        result = aval.localeCompare(bval);
                        break;
                    default:
                        if (a < b) {
                            result = -1;
                        } else if (a > b) {
                            result = 1;
                        } else {
                            result = 0;
                        }
                        break;
                }
                if (result != 0) {
                    break;
                }
            }
            return result;
        }));
    }
}

export default Collection;