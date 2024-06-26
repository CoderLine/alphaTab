import url from 'url';
import path from 'path';
import fs from 'fs';


async function accept(d) {
    const dir = await fs.promises.opendir(d);
    try {
        while (true) {
            const entry = await dir.read();
            if (!entry) {
                break;
            } else if (entry.isDirectory() && entry.name !== '.' && entry.name !== '..') {
                await accept(path.join(d, entry.name))
            } else if (entry.isFile()) {
                if (entry.name.endsWith('.new.png')) {
                    console.log('Accepting ', path.join(entry.path, entry.name));
                    fs.promises.rename(path.join(entry.path, entry.name), path.join(entry.path, entry.name.replace('.new', '')));
                } else if (entry.name.endsWith('.diff.png')) {
                    fs.promises.unlink(path.join(entry.path, entry.name))
                }
            }
        }
    }
    finally {
        await dir.close();
    }
}

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const testDataPath = path.join(__dirname, '..', 'test-data');
await accept(testDataPath);
