// pm2 processes for the public note viewer (obsidian.loonielabs.net/r/<slug>).
// Secrets live in .env.local (gitignored).
const node = '/root/.nvm/versions/node/v24.18.0/bin/node'

module.exports = {
  apps: [
    {
      name: 'obsidian-note-api',
      cwd: __dirname,
      // Launch node directly: server/index.ts only listens when it is argv[1],
      // which isn't true under pm2's own fork wrapper.
      script: node,
      args: '--env-file=.env.local server/index.ts',
      interpreter: 'none'
    },
    {
      name: 'obsidian-note-web',
      cwd: __dirname,
      script: 'node_modules/vite/bin/vite.js',
      args: 'preview --host 127.0.0.1 --port 4173 --strictPort',
      interpreter: node
    }
  ]
}
