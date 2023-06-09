import "./selection.css";

interface SelectionArgs {
    parentId: string,
    selectName: string,
    options: string[] | [string, string[]][],
    useOptionsGroups: boolean,
    label?: string,
}

class Selection {
    public update(
        options: string[] | [string, string[]][],
        useOptionsGroups: boolean = false,
    ) {
        while (this.element!.firstChild) {
            this.element!.removeChild(this.element!.lastChild!);
        }

        if (!useOptionsGroups) {
            options = options as string[];
            options.forEach((name) => {
                const option = document.createElement("option");
                option.value = name;
                option.label = name;
                this.element.append(option);
            });
        } else {
            options = options as [string, string[]][];
            options.forEach((tuple) => {
                const [group, values] = tuple;
                const optionGroup = document.createElement("optgroup");
                optionGroup.label = group;
                this.element.append(optionGroup);

                values.forEach((name) => {
                    const option = document.createElement("option");
                    option.value = name;
                    option.label = name;
                    optionGroup.append(option);
                });
            });
        }
    }

    public clone(parentId: string, label?: string): Selection {
        const parent = document.getElementById(parentId);
        if (parent == null)
            throw Error("parent does not exits");

        let container = parent;

        if (label) {
            container = document.createElement("div");
            container.classList.add("selection-tuple");
            parent.append(container);

            const labelElement = document.createElement("label");
            labelElement.htmlFor = this.element.name + "-cloned";
            labelElement.textContent = label;
            container.append(labelElement);
        }

        const clonedElement = this.element.cloneNode(true) as HTMLSelectElement;
        clonedElement.name = this.element.name + "-cloned";
        container.append(clonedElement);

        // link the cloned element to the same event handlers
        clonedElement.onchange = this.element.onchange;
        clonedElement.addEventListener("change", (e) => {
            this.element.value = clonedElement.value;
            this.element.onchange?.call(this.element, e);
        });
        this.element.addEventListener("change", (e) => {
            clonedElement.value = this.element.value;
            clonedElement.onchange?.call(clonedElement, e);
        });

        const cloned = new Selection(clonedElement);
        return cloned;
    }

    public constructor(params: SelectionArgs | HTMLSelectElement) {
        if (params instanceof HTMLSelectElement) {
            this.element = params;
        } else {
            const parent = document.getElementById(params.parentId);
            if (parent == null)
                throw Error("parent does not exits");

            let container = parent;

            if (params.label) {
                container = document.createElement("div");
                container.classList.add("selection-tuple");
                parent.append(container);

                const label = document.createElement("label");
                label.htmlFor = params.selectName;
                label.textContent = params.label;
                container.append(label);
            }

            const select = document.createElement("select");
            select.name = params.selectName;
            select.ariaLabel = params.selectName;
            select.classList.add("selection");
            this.element = select;

            container.append(select);
            this.update(params.options, params.useOptionsGroups)
        }
    }

    public element: HTMLSelectElement;
}

export { Selection };
export type { SelectionArgs };