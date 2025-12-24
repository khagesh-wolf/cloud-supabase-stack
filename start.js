import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting Chiya Dani...\n');

// Start backend
const backend = spawn('node', ['server.js'], {
  cwd: join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Start frontend after a small delay
setTimeout(() => {
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  frontend.on('error', (err) => {
    console.error('Frontend error:', err);
  });
}, 1000);

backend.on('error', (err) => {
  console.error('Backend error:', err);
});

// Handle exit
process.on('SIGINT', () => {
  backend.kill();
  process.exit();
});
