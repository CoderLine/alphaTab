import 'bootstrap';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { ZipReader } from '@coderline/alphatab/zip/ZipReader';

type TestResult = {
    originalFile: string;
    newFile: string | Uint8Array;
    diffFile: string | Uint8Array;
};

function setupComparer(card: HTMLElement, el: HTMLElement, result: TestResult) {
    const ex = el.querySelector<HTMLElement>('.expected')!;
    const ac = el.querySelector<HTMLElement>('.actual')!;
    const df = el.querySelector<HTMLElement>('.diff')!;
    const slider = el.querySelector<HTMLInputElement>('.slider')!;

    const exCanvas = ex.querySelector('img')!;
    const acCanvas = ac.querySelector('img')!;

    const width = Math.max(exCanvas.width, acCanvas.width);
    const height = Math.max(exCanvas.height, acCanvas.height);

    const controlsHeight = 60;

    el.style.width = `${width}px`;
    el.style.height = `${height + controlsHeight}px`;

    ex.style.width = `${width}px`;
    ex.style.height = `${height}px`;
    ex.style.top = `${controlsHeight}px`;

    ac.style.width = `${width / 2}px`;
    ac.style.height = `${height}px`;
    ac.style.top = `${controlsHeight}px`;

    df.style.width = `${width}px`;
    df.style.height = `${height}px`;
    df.style.top = `${controlsHeight}px`;

    slider.oninput = () => {
        ac.style.width = `${width * (1 - slider.valueAsNumber)}px`;
    };

    const diffToggle = el.querySelector<HTMLInputElement>('.toggle > input')!;
    diffToggle.onchange = () => {
        if (diffToggle.checked) {
            df.style.display = 'block';
        } else {
            df.style.display = 'none';
        }
    };
    const acceptButton = el.querySelector<HTMLButtonElement>('.accept')!;
    acceptButton.onclick = () => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/test-results/accept', true, null, null);
        xhr.responseType = 'text';
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = () => {
            acceptButton.classList.add('disabled');
            const response = JSON.parse(xhr.responseText);
            if (response.message) {
                acceptButton.innerText = response.message;
            } else {
                acceptButton.innerText = 'Accepted';
            }
            card.classList.add('accepted');
        };
        xhr.onerror = () => {
            alert('error accepting test result');
            acceptButton.innerText = 'Accept';
        };
        acceptButton.innerText = 'Accepting...';
        xhr.send(JSON.stringify(result));
    };
}

async function createComparer(card: HTMLElement, result: TestResult) {
    const comparer = document.createElement('div');
    comparer.classList.add('comparer');
    comparer.innerHTML = `
                <div class="expected"><img /></div>
                <div class="actual"><img /></div>
                <div class="diff"><img /></div>
                <input type="range" min="0" max="1" step="0.001" value="0.5" class="slider" />
                <div class="controls">
                    <label class="toggle">
                        <input type="checkbox" />
                        Show Diff
                    </label>
                    <button class="accept btn btn-secondary btn-sm">
                        Accept
                    </button>
                </div>
            `;

    const expected = new Promise((resolve, reject) => {
        const img = comparer.querySelector<HTMLImageElement>('.expected img')!;
        img.onload = () => {
            resolve(img);
        };
        img.onerror = () => {
            reject();
        };

        img.src = '/' + result.originalFile;
    });

    const actual = new Promise((resolve, reject) => {
        const img = comparer.querySelector<HTMLImageElement>('.actual img')!;
        img.onload = () => {
            resolve(img);
        };
        img.onerror = () => {
            reject();
        };

        if (result.newFile instanceof Uint8Array) {
            img.src = URL.createObjectURL(new Blob([result.newFile.buffer as ArrayBuffer], { type: 'image/png' }));
        } else {
            img.src = '/' + result.newFile;
        }
    });

    const diff = new Promise((resolve, reject) => {
        const img = comparer.querySelector<HTMLImageElement>('.diff img')!;
        img.onload = () => {
            resolve(img);
        };
        img.onerror = () => {
            reject();
        };

        if (result.newFile instanceof Uint8Array) {
            img.src = URL.createObjectURL(
                new Blob([(result.diffFile as Uint8Array).buffer as ArrayBuffer], { type: 'image/png' })
            );
        } else {
            img.src = '/' + result.diffFile;
        }
    });

    try {
        await Promise.allSettled([expected, actual, diff]);
    } catch {
        // ignore potentially missing images
    }

    setupComparer(card, comparer, result);

    return comparer;
}

async function createResultViewer(result: TestResult) {
    const resultItem = document.createElement('div');
    resultItem.classList.add('card', 'm-3');

    const resultBody = document.createElement('div');
    resultBody.classList.add('card-body');
    resultItem.appendChild(resultBody);

    const resultTitle = document.createElement('h5');
    resultTitle.classList.add('card-title');
    resultTitle.innerText = result.originalFile;
    resultBody.appendChild(resultTitle);

    resultBody.appendChild(await createComparer(resultItem, result));

    return resultItem;
}

async function displayResults(results: TestResult[]) {
    const wrapper = document.querySelector<HTMLElement>('#results-wrapper')!;
    wrapper.innerHTML = '';

    for (const result of results) {
        wrapper.appendChild(await createResultViewer(result));
    }

    if (results.length === 0) {
        wrapper.innerHTML = '<div class="alert alert-success" role="alert">No reported errors on visual tests.</div>';
    }
}

function loadResults() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/test-results/list', true, null, null);
    xhr.responseType = 'text';
    xhr.onload = () => {
        const response = JSON.parse(xhr.responseText);
        displayResults(response);
    };
    xhr.onerror = () => {
        alert('error loading test results');
    };
    xhr.send();
}

loadResults();

document.body.addEventListener(
    'dragover',
    e => {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer!.dropEffect = 'link';
    },
    false
);

document.body.addEventListener(
    'dragenter',
    () => {
        document.body.classList.add('drop');
    },
    true
);

document.body.addEventListener('dragleave', () => {
    document.body.classList.remove('drop');
});

document.body.addEventListener(
    'drop',
    e => {
        e.stopPropagation();
        e.preventDefault();
        document.body.classList.remove('drop');
        const files = e.dataTransfer!.files;
        if (files.length === 1) {
            const reader = new FileReader();
            reader.onload = data => {
                const reader = new ZipReader(ByteBuffer.fromBuffer(new Uint8Array(data.target!.result as ArrayBuffer)));
                const entries = reader.read();

                const grouped = new Map();
                for (const entry of entries) {
                    if (entry.data.length > 0) {
                        const path = entry.fullName.startsWith('test-data/')
                            ? entry.fullName
                            : `test-data/${entry.fullName}`;
                        const key = `${path.replace('.diff.png', '').replace('.new.png', '')}.png`;
                        if (grouped.has(key)) {
                            if (entry.fullName.endsWith('.diff.png')) {
                                grouped.get(key).diffFile = entry.data;
                            } else if (entry.fullName.endsWith('.new.png')) {
                                grouped.get(key).newFile = entry.data;
                            }
                        } else {
                            if (entry.fullName.endsWith('.diff.png')) {
                                grouped.set(key, {
                                    originalFile: key,
                                    diffFile: entry.data
                                });
                            } else if (entry.fullName.endsWith('.new.png')) {
                                grouped.set(key, {
                                    originalFile: key,
                                    newFile: entry.data
                                });
                            }
                        }
                    }
                }

                const results = Array.from(grouped.values());
                displayResults(results);
            };
            reader.readAsArrayBuffer(files[0]);
        }
    },
    true
);

document.querySelector<HTMLInputElement>('#hide-accepted')!.onchange = e => {
    if ((e.target as HTMLInputElement)!.checked) {
        document.body.classList.add('hide-accepted');
    } else {
        document.body.classList.remove('hide-accepted');
    }
};
