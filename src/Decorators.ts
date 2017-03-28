export function Memoize(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>) {
    if (descriptor.value != null) {
        memoizeMethod(descriptor);
    }
    else if (descriptor.get != null) {
        memoizeGetAccessor(descriptor);
    }
    else {
        throw new Error("Only put a Memoize decorator on a method or get accessor");
    }
}

function memoizeMethod(descriptor: TypedPropertyDescriptor<any>) {
    const originalValue = descriptor.value;
    let hasRun = false;
    let returnedValue: any;

    descriptor.value = function(...args: any[]) {
        if (!hasRun) {
            returnedValue = originalValue.apply(this, args);
            hasRun = true;
        }

        return returnedValue;
    };
}

function memoizeGetAccessor(descriptor: TypedPropertyDescriptor<any>) {
    const originalGet = descriptor.get;
    const originalSet = descriptor.set;
    let hasRun = false;
    let returnedValue: any;

    descriptor.get = function(...args: any[]) {
        if (!hasRun) {
            returnedValue = originalGet.apply(this, args);
            hasRun = true;
        }

        return returnedValue;
    };

    if (descriptor.set != null) {
        descriptor.set = function(...args: any[]) {
            hasRun = false;
            return originalSet.apply(this, args);
        };
    }
}
