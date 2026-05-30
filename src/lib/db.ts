import Database from 'better-sqlite3';
import path from 'path';

const databasePath = path.join(process.cwd(), 'prisma', 'dev.db');

export function getDatabase() {
  const database = new Database(databasePath);
  database.pragma('foreign_keys = ON');
  return database;
}
