module.exports = {
  apps: [
    {
      name: "directory-app-server",
      script: "dist/server.js",
      ignore_watch: ["node_modules", "uploads"],
      watch_delay: 1000,
      env: {
        PORT: 3001,
      },
    },
  ],
};
