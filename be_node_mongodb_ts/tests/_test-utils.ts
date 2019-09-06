import { Server } from 'http';
import { Server as HttpsServer } from 'https';
import { init as appInit, close as appClose, IApp } from '../src/app';
import { init as configInit } from 'toolbox-api/dist/config';
import { IConfig } from '../src/core/config';
import { getDB } from '../src/core/db';

// -------------------------------------------------------------------------
// variables

let app: IApp|null;

// -------------------------------------------------------------------------
// methods

// gets the config
export const getConfig = () => configInit<IConfig>();

// gets host
export const getHost = () => getConfig().builtHost;

// gets a random key
export const rndKey = () => `${Math.round(Math.random() * 100000)}`;

// initializes application and server
export const initApp = async () => {
  if (app != null) { return app; }

  app = await appInit({ hideLogs: true });
};

// closes application and server
export const closeApp = async () => {
  // close the general one
  if (app != null && app.server != null) {
    await appClose(app);
  }

  // nullify the app now
  app = null;
};

// cleans up the database and test related
export const cleanup = async () => {
  const db = await getDB();
  if (db == null) { return; }

  const mongoDB = db.mongoose;
  const collections = await mongoDB.connection.db.collections();
  const promises: Promise<any>[] = [];

  // DEV: trying to get some performance by not removing database but
  //      the collection data

  // check all collections to see if there is data
  for (let i = 0; i < collections.length; i += 1) {
    promises.push(collections[i].drop());
  }

  await Promise.all(promises);

  // drop the database entirely
  // return await db.connection.db.dropDatabase();
};
