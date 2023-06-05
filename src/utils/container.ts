export class SingleValue<T> {
    public constructor(value: T) {
        this._value = value;
    }

    set value(value: T) {
        this._value = value;
    }

    get value(): T {
        return this._value;
    }

    public _value: T;
}