'use strict';
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

// Example profiles to insert
const profiles = [
    { username: 'alice', email: 'alice@example.com', password: 'password123' },
    { username: 'bob', email: 'bob@example.com', password: 'password123' },
    { username: 'carol', email: 'carol@example.com', password: 'password123' },
    { username: 'dave', email: 'dave@example.com', password: 'password123' },
    { username: 'eve', email: 'eve@example.com', password: 'password123' }
];

function ensureUserTable() {
    db.exec(`
    CREATE TABLE IF NOT EXISTS User (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME
    );
  `);
}

function resetUsers() {
    // Remove all existing users to rebuild from scratch
    db.exec('DELETE FROM User;');
    // Reset sqlite_sequence for AUTOINCREMENT
    db.exec("DELETE FROM sqlite_sequence WHERE name='User';");
}

function seedProfiles() {
    const insert = db.prepare('INSERT INTO User (username, email, password, updatedAt) VALUES (?, ?, ?, datetime(\'now\'))');
    const insertMany = db.transaction((rows) => {
        for (const r of rows) insert.run(r.username, r.email, r.password);
    });
    insertMany(profiles);
}

function showSample() {
    const rows = db.prepare('SELECT id, username, email, createdAt, updatedAt FROM User ORDER BY id LIMIT 20').all();
    console.log('Seeded users:', rows);
}

try {
    ensureUserTable();
    resetUsers();
    seedProfiles();
    showSample();
    console.log('Seeding complete.');
    process.exitCode = 0;
} catch (err) {
    console.error('Seeding error:', err && err.message);
    process.exitCode = 1;
} finally {
    try { db.close(); } catch (_) { }
}
