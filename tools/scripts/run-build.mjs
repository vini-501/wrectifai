import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const nxCliPath = resolve('node_modules', 'nx', 'bin', 'nx.js');
const args = ['run-many', '-t', 'build', '-p', 'api,web', ...process.argv.slice(2)];

const child = spawn(process.execPath, [nxCliPath, ...args], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NX_DAEMON: 'false',
    NX_ISOLATE_PLUGINS: 'false',
  },
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

child.on('error', (error) => {
  console.error(error);
  process.exit(1);
});
