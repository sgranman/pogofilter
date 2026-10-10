// Entry point for the optional stats service. See stats/README.md.
import { createServer } from 'node:http';
import { createHandler, openDb } from './app.mjs';

const file = process.env.STATS_DB;
if (!file) {
  console.error('stats: set STATS_DB to a file path (e.g. /data/stats.db)');
  process.exit(1);
}

const port = Number(process.env.PORT) || 8090;
const db = openDb(file);
const server = createServer(createHandler({ db }));
server.listen(port, () => console.log(`stats: listening on :${port}, writing ${file}`));

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    server.close();
    db.close();
    process.exit(0);
  });
}
