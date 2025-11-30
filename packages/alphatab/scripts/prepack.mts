import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const packageJsonPath = path.resolve(__dirname, '..', 'package.json');


let packageJsonContent = await fs.promises.readFile(packageJsonPath, 'utf-8');
packageJsonContent = packageJsonContent.replace('"type": "module"', '"type": "commonjs"');
await fs.promises.writeFile(packageJsonPath, packageJsonContent);

await fs.promises.copyFile(path.resolve(__dirname, '../../../README.md'), path.resolve(__dirname, '../README.md'));


// NOTE: Backwards compatibility for bundler plugins
await fs.promises.cp(
    path.resolve(__dirname, '../../vite/dist'),
    path.resolve(__dirname, '../dist/vite'),
    { 
        recursive: true,
        filter(source) {
            source = path.resolve(source);
            if(source.includes(`${path.sep}types`)){
                return false;
            }
            return true;
        },
    }
)
await fs.promises.copyFile(path.resolve(__dirname, '../bundler/alphaTab.vite.js'), path.resolve(__dirname, '../dist/alphaTab.vite.js'));
await fs.promises.copyFile(path.resolve(__dirname, '../bundler/alphaTab.vite.mjs'), path.resolve(__dirname, '../dist/alphaTab.vite.mjs'));
await fs.promises.copyFile(path.resolve(__dirname, '../bundler/alphaTab.vite.d.ts'), path.resolve(__dirname, '../dist/alphaTab.vite.d.ts'));

await fs.promises.cp(
    path.resolve(__dirname, '../../webpack/dist'),
    path.resolve(__dirname, '../dist/webpack'),
    { 
        recursive: true,
        filter(source) {
            source = path.resolve(source);
            if(source.includes(`${path.sep}types`)){
                return false;
            }
            return true;
        },
    }
)
await fs.promises.copyFile(path.resolve(__dirname, '../bundler/alphaTab.webpack.js'), path.resolve(__dirname, '../dist/alphaTab.webpack.js'));
await fs.promises.copyFile(path.resolve(__dirname, '../bundler/alphaTab.webpack.mjs'), path.resolve(__dirname, '../dist/alphaTab.webpack.mjs'));
await fs.promises.copyFile(path.resolve(__dirname, '../bundler/alphaTab.webpack.d.ts'), path.resolve(__dirname, '../dist/alphaTab.webpack.d.ts'));
