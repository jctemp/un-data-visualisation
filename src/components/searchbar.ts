import './searchbar.css';

class SearchBar {
    constructor(parentId: string, placeholder: string, suggestions: string[]) {
        const container = document.getElementById(parentId) as HTMLInputElement;
        container.classList.add('searchbar-container');

        const hideButton = document.createElement('button');
        hideButton.id = 'hide-button';
        hideButton.classList.add('hide-button');

        const span = document.createElement('span');
        span.classList.add('material-symbols-outlined');
        span.textContent = 'arrow_forward_ios';
        hideButton.appendChild(span);

        container.appendChild(hideButton);

        hideButton.addEventListener('click', () => {
            span.textContent = span.textContent === 'arrow_forward_ios' ? 'arrow_back_ios' : 'arrow_forward_ios';
            container.ariaDisabled = container.ariaDisabled === 'true' ? 'false' : 'true';
        });

        const searchbar = document.createElement('input');
        searchbar.id = 'searchbar';
        searchbar.placeholder = placeholder;
        searchbar.type = 'search';
        searchbar.classList.add('searchbar');
        container.appendChild(searchbar);

        const resultBox = document.createElement('ul');
        resultBox.id = 'result-box';
        resultBox.ariaDisabled = 'true';
        resultBox.classList.add('result-box');
        container.appendChild(resultBox);

        // if user press any key and release
        searchbar.onkeyup = (_e: KeyboardEvent) => {
            resultBox.ariaDisabled = 'false';

            let userData = searchbar.value; //user enetered data
            let candidates: string[] = [];
            if (userData) {
                candidates = suggestions.filter((data) => {
                    return data.toLocaleLowerCase().startsWith(userData.toLocaleLowerCase());
                });

                if (candidates.length === 0) {
                    resultBox.ariaDisabled = 'true';
                }

                candidates = candidates.slice(0, 5);

                // if user pressed enter
                if (_e.key === 'Enter') {
                    searchbar.value = candidates[0];
                    while (resultBox.firstChild) {
                        resultBox.removeChild(resultBox.firstChild);
                    }
                    resultBox.ariaDisabled = 'true';
                    this.callback(searchbar.value);
                    return;
                }

                const options = candidates
                    .map((data) => {
                        const listElement = document.createElement('li');
                        listElement.textContent = data;
                        return listElement;
                    }).map((element) => {
                        element.addEventListener('click', () => {
                            let selectUserData = element.textContent!;
                            searchbar.value = selectUserData;

                            while (resultBox.firstChild) {
                                resultBox.removeChild(resultBox.firstChild);
                            }
                            resultBox.ariaDisabled = 'true';
                            this.callback(searchbar.value);
                        });
                        return element;
                    });

                while (resultBox.firstChild) {
                    resultBox.removeChild(resultBox.firstChild);
                }

                options.forEach((element) => {
                    resultBox.appendChild(element);
                });
            } else {
                while (resultBox.firstChild) {
                    resultBox.removeChild(resultBox.firstChild);
                }
                resultBox.ariaDisabled = 'true';
            }

            searchbar.addEventListener("input", (e) => {
                if (searchbar.value === "") {
                    while (resultBox.firstChild) {
                        resultBox.removeChild(resultBox.firstChild);
                    }
                    resultBox.ariaDisabled = 'true';
                    this.callback("");
                }
            });
        }
    }

    public setCallback(callback: (data: string) => void) {
        this.callback = callback;
    }

    callback: (data: string) => void = (_data: string) => { };

}

export { SearchBar };