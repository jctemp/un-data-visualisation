import "./options.css"

class ThresholdOptions {
    constructor(parentId: string, inputs: [number, string][]) {
        const parent = document.getElementById(parentId);
        if (parent == null) throw Error("The threshold parent does not exists.");
        parent.classList.add("threshold-container");
        this.element = parent;

        inputs.forEach((values, index) => {
            const [value, colour] = values;

            const tuple = document.createElement("div");
            tuple.classList.add("threshold-tuple");

            const numberInput = document.createElement("input");
            numberInput.type = "number";
            numberInput.value = value.toString();
            numberInput.classList.add("threshold-number");

            const label = document.createElement("div");
            label.innerText = "<";
            label.classList.add("threshold-label");


            const colourInput = document.createElement("input");
            colourInput.type = "color";
            colourInput.value = colour;
            if (index > 0) colourInput.classList.add("threshold-colour-after");


            this.controls.push([numberInput, colourInput]);
            if (index > 0) tuple.append(label);
            if (index > 0) tuple.append(numberInput);
            tuple.append(colourInput);
            parent.append(tuple);
        });
    }

    public setRange(range: [number, number]) {
        this.controls.forEach(([numberInput, _]) => {
            numberInput.min = range[0].toString();
            numberInput.max = range[1].toString();
        });
    }

    public setCallback(callback: () => void) {
        this.controls.forEach(([numberInput, colourInput]) => {
            numberInput.onchange = callback;
            colourInput.onchange = callback;
        });
    }

    public setThresholds(thresholds: number[]) {
        this.controls.reverse().forEach(([numberInput, _], index) => {
            numberInput.value = thresholds[index].toString();
        });
        this.controls.reverse();
    }

    public setColours(colours: string[]) {
        this.controls.reverse().forEach(([_, colourInput], index) => {
            colourInput.value = colours[index];
        });
        this.controls.reverse();
    }

    public getThresholds(): number[] {
        return this.controls.map(([numberInput, _]) => parseFloat(numberInput.value)).reverse();
    }

    public getColours(): string[] {
        return this.controls.map(([_, colourInput]) => colourInput.value).reverse();
    }

    public show() {
        this.element.ariaDisabled = "false";
    }

    public hide() {
        this.element.ariaDisabled = "true";
    }

    controls: [HTMLInputElement, HTMLInputElement][] = [];
    element: HTMLElement;
}

class ColourOptions {
    constructor(parentId: string, inputs: [string, string][]) {
        const parent = document.getElementById(parentId);
        if (parent == null) throw Error("The threshold parent does not exists.");
        parent.classList.add("options-container");
        this.element = parent;

        this.controls = [];
        inputs.forEach((values) => {
            const [name, colour] = values;

            const tuple = document.createElement("div");
            tuple.classList.add("threshold-tuple");

            const colourInput = document.createElement("input");
            colourInput.type = "color";
            colourInput.value = colour;
            colourInput.classList.add("threshold-number");

            const label = document.createElement("div");
            label.innerText = name;
            label.classList.add("threshold-label");
            label.classList.add("threshold-label-fixed");

            this.controls.push(colourInput);

            tuple.append(label);
            tuple.append(colourInput);
            parent.append(tuple);
        });
    }

    public setCallback(callback: () => void) {
        this.controls.forEach((colourInput) => {
            colourInput.onchange = callback;
        });
    }

    public getColours(): string[] {
        return this.controls.map((colourInput) => colourInput.value);
    }

    public setColours(colours: string[]) {
        this.controls.forEach((colourInput, index) => {
            colourInput.value = colours[index];
        });
    }

    controls: HTMLInputElement[];
    element: HTMLElement;
}

class ThresholdNumberOptions {
    constructor(parentId: string, range: [number, number], prefix: string) {
        const parent = document.getElementById(parentId);
        if (parent == null) throw Error("The threshold parent does not exists.");
        parent.classList.add("threshold-container-relative");
        this.element = parent;

        const [min, max] = range;

        const tuple = document.createElement("div");
        tuple.classList.add("threshold-tuple");

        const numberInput = document.createElement("input");
        numberInput.type = "number";
        numberInput.value = min.toString();
        numberInput.min = min.toString();
        numberInput.max = max.toString();
        numberInput.classList.add("threshold-number");

        const label = document.createElement("div");
        label.innerText = prefix;
        label.classList.add("threshold-label");

        this.control = numberInput;

        tuple.append(label);
        tuple.append(numberInput);
        parent.append(tuple);

        this.control.onkeydown = (e) => {
            if (e.key === "Enter") {
                this.control.value = Math.min(max, Math.max(min, parseFloat(this.control.value))).toString();
            }
        }
    }

    public setRange(range: [number, number]) {
        this.control.min = range[0].toString();
        this.control.max = range[1].toString();
    }

    public setCallback(callback: () => void) {
        this.control.onchange = callback;
    }

    control: HTMLInputElement;
    element: HTMLElement;
}

class CheckBoxOption {
    constructor(parentId: string, prefix: string) {
        const parent = document.getElementById(parentId);
        if (parent == null) throw Error("The threshold parent does not exists.");
        parent.classList.add("options-container-extra");
        this.element = parent;

        const tuple = document.createElement("div");
        tuple.classList.add("threshold-tuple");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("option-checkbox");

        const label = document.createElement("div");
        label.innerText = prefix;
        label.classList.add("threshold-label");
        label.classList.add("threshold-label-fixed");

        this.control = checkbox;

        tuple.append(label);
        tuple.append(checkbox);
        parent.append(tuple);
    }

    public setCallback(callback: () => void) {
        this.control.onchange = callback;
    }

    control: HTMLInputElement;
    element: HTMLElement;
}

export { ThresholdOptions, ThresholdNumberOptions, ColourOptions, CheckBoxOption };



