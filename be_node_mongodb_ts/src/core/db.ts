import { IDb, init } from 'toolbox-api/dist/db';
import { getConfig } from './config';
import { getLogger } from './logger';

// --------------------------------------------------
// variables

let db: IDb|null = null;

// --------------------------------------------------
// methods

// initialize the db
export const initDB = async () => {
  if (db != null) { return db; }

  const config = getConfig();
  if (config == null || config.db == null || Object.keys(config.db).length === 0) {
    return null;
  }

  db = await init(
    config.db,
    getLogger(),
  );

  return db;
};

// initialize the db
export const getDB = () => db;

// closes the db
export const closeDB = async () => {
  if (db == null) { return; }

// DEV: we set here so that typing doesn't mess up
  const conn = db.mongoose.connection;

  // remove events first...
  if (conn.off != null) {
    try {
      conn.off('error');
      conn.off('disconnected');
    } catch (err) {
      // DEV: don't error because of this
    }
  }

  // wait for the db to catch up
  const dbTimer = new Promise((resolve) => {
    setTimeout(
      async () => {
        // close the database
        await conn.close();
        resolve();
      },
      250
    );
  });

  await dbTimer;

  db = null;
};
