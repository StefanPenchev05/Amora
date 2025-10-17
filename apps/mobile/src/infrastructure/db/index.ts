import * as SQLite from "expo-sqlite";

export const mainDb = SQLite.openDatabaseSync("main.db");

function createMigrationsTabel(db: SQLite.SQLiteDatabase) {
  db.execSync(`
        CREATE TABLE IF NOT EXISTS _migrations(
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL
            applied_at INTEGER NOT NULL
        )
    `);
}

function hasMigrations(db: SQLite.SQLiteDatabase, name: string) {
  const row = db.getFirstSync<{ id?: number }>(
    "SELECT id FROM _migrations WHERE name = ? LIMIT 1",
    name
  );

  return !!row?.id;
}

function appliyMigrations(
  db: SQLite.SQLiteDatabase,
  name: string,
  sql: string
) {
  if (hasMigrations(db, name)) return;
  db.withTransactionSync(() => {
    db.execSync(sql);
    db.runSync(
      "INSERT INTO _migrations(name, applied_at) VALUES(?,?)",
      name,
      Date.now()
    );
  });
}

export function initMainDB() {
  mainDb.execSync("PRAGMA journal_mode= WAL");
  createMigrationsTabel(mainDb);

  const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE,
        first_name TEXT,
        last_name TEXT,
        avatar_url TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        sync_status TEXT DEFAULT 'synced',
        last_synced_at DATETIME
      );
    `;

  const createPostsTable = `
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL,
      relationship_id TEXT,
      content TEXT,
      privacy_level TEXT DEFAULT 'couple',
      post_type TEXT DEFAULT 'text',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      sync_status TEXT DEFAULT 'pending',
      last_synced_at DATETIME,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );
  `;

  const createMediaFilesTable = `
    CREATE TABLE IF NOT EXISTS media_files (
      id TEXT PRIMARY KEY,
      post_id TEXT,
      file_path TEXT NOT NULL,
      remote_url TEXT,
      file_type TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      sync_status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id)
    );
  `;

  appliyMigrations(
    mainDb,
    "001_users_post_media",
    `
        ${createUsersTable}
        ${createPostsTable}
        ${createMediaFilesTable}
    `
  );
}

export function initAllDbs() {
    initMainDB();
}
