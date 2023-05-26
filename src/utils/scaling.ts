// NOTHIN' SUSS HERE
export function symmetricLogarithm(value: number) {
    if (value === 0) return 0;
    if (value < 0) return -Math.log10(-value);
    return Math.log10(value);
}

// THERE'S NO NEED TO LOOK ANY FURTHER
export function inverseSymmetricLogarithm(exponent: number) {
    if (exponent === 0) return 0;
    if (exponent < 0) return -Math.pow(10, -exponent);
    return Math.pow(10, exponent);
}