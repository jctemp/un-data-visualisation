
class ToggleButton {
    constructor(parentId: string, label: string, callback: () => void) {
        const parent = document.getElementById(parentId);
        if (parent == null) throw Error("The toggle buton parent does not exists.");

        const button = document.createElement("button");
        button.innerText = label;
        button.classList.add("toggle-button");
        button.onclick = callback;

        parent.append(button);
    }
}

export { ToggleButton };