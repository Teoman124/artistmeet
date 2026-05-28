'use strict';
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

// Profiles to insert: 1 admin + 3 users
const profiles = [
    { username: 'admin', email: 'admin@example.com', password: 'password', role: 'admin' },
    { username: 'user', email: 'user@example.com', password: 'password', role: 'user' },
    { username: 'bob', email: 'bob@example.com', password: 'password', role: 'user' },
    { username: 'carol', email: 'carol@example.com', password: 'password', role: 'user' }
];

function ensureUserTable() {
    db.exec(`
    CREATE TABLE IF NOT EXISTS User (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME
    );
  `);

    // If the table exists but role column is missing, add it.
    try {
        const cols = db.prepare("PRAGMA table_info('User')").all();
        const hasRole = cols.some((c) => c.name === 'role');
        if (!hasRole) {
            db.exec("ALTER TABLE User ADD COLUMN role TEXT DEFAULT 'user';");
        }
    } catch (e) {
        // ignore
    }
}

function resetUsers() {
    // Remove all existing users to rebuild from scratch
    db.exec('DELETE FROM User;');
    // Reset sqlite_sequence for AUTOINCREMENT
    db.exec("DELETE FROM sqlite_sequence WHERE name='User';");
}

function seedProfiles() {
    const insert = db.prepare('INSERT INTO User (username, email, password, role, updatedAt) VALUES (?, ?, ?, ?, datetime(\'now\'))');
    const insertMany = db.transaction((rows) => {
        for (const r of rows) insert.run(r.username, r.email, r.password, r.role || 'user');
    });
    insertMany(profiles);
}

function showSample() {
    const rows = db.prepare('SELECT id, username, email, role, createdAt, updatedAt FROM User ORDER BY id LIMIT 20').all();
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
