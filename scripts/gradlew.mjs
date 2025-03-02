// npm scripts cannot call batch/shell scripts properly so we do the logic ourselves here.
import path from 'node:path';
import os from 'node:os';
import childProcess from 'node:child_process';
import url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const workingDir = path.resolve(__dirname, '..', 'src.kotlin', 'alphaTab');

/**
 * @type {childProcess.ChildProcess}
 */
let run;

if (os.platform() === 'win32') {
    const shellScript = 'gradlew.bat';
    const args = ['/c', shellScript, ...process.argv.slice(2)];

    run = childProcess.spawn('cmd.exe', args, {
        env: process.env,
        cwd: workingDir,
        stdio: 'inherit'
    });
} else {
    const shellScript = './gradlew';
    const args = [shellScript, ...process.argv.slice(2)];

    run = childProcess.spawn('/bin/bash', args, {
        env: process.env,
        cwd: workingDir,
        stdio: 'inherit'
    });
}

run.on('error', () => {
    console.error('Error executing gradlew');
    process.exit(1);
});
run.on('close', code => {
    if (code !== 0) {
        console.error(`Gradlew exited with code ${code}`);
    } else {
        console.info(`Gradlew exited with code ${code}`);
    }
    process.exit(code);
});
