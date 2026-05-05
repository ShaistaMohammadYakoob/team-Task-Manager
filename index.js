import('./server/server.js').catch((error) => {
  console.error(`Server bootstrap failed: ${error.message}`);
  process.exit(1);
});
