import path from 'path';
import fs from 'fs';

export async function acceptOne(newFile: string) {
    console.log('Accepting ', newFile);
    await fs.promises.rename(newFile, newFile.replace('.new.png', '.png'));

    const diff = newFile.replace('.new.png', '.diff.png');
    if (fs.existsSync(diff)) {
        await fs.promises.unlink(diff);
    }
    console.log('Accepted ', newFile);
}

export async function acceptAll(d: string) {
    const dir = await fs.promises.opendir(d);
    try {
        while (true) {
            const entry = await dir.read();
            if (!entry) {
                break;
            } else if (entry.isDirectory() && entry.name !== '.' && entry.name !== '..') {
                await acceptAll(path.join(d, entry.name));
            } else if (entry.isFile()) {
                if (entry.name.endsWith('.new.png')) {
                    acceptOne(path.join(entry.parentPath, entry.name));
                } else if (entry.name.endsWith('.diff.png')) {
                    fs.promises.unlink(path.join(entry.parentPath, entry.name));
                }
            }
        }
    } finally {
        await dir.close();
    }
}
