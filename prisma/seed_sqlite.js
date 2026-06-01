'use strict';
/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

const userNames = [
    'amelia',
    'bram',
    'cora',
    'dylan',
    'elaine',
    'finn',
    'gaia',
    'hugo',
    'iris',
    'jasper',
    'kiki',
    'luca',
    'mila',
    'nolan',
    'olivia',
    'pablo',
    'quinn',
    'ravi',
    'sara',
    'timo'
];

const postSeeds = [
    {
        title: 'Studio Notes from Last Night',
        description: 'A quick recap of the drum takes, synth layers, and the parts that finally clicked.'
    },
    {
        title: 'New Vocal Demo',
        description: 'Trying a warmer vocal take with a softer arrangement and more room in the mix.'
    },
    {
        title: 'Rough Guitar Ideas',
        description: 'Three riff directions for the next session, all built around the same heavy groove.'
    },
    {
        title: 'Ambient Loop Experiment',
        description: 'Layered field recordings with a slow chord progression to test a more open sound.'
    },
    {
        title: 'Percussion Sketch',
        description: 'A stripped-back rhythm idea with hand percussion and a sharper snare pattern.'
    },
    {
        title: 'Bassline Draft',
        description: 'Simple pocket-first bass movement that leaves space for the lead melody.'
    },
    {
        title: 'Live Set Update',
        description: 'Reworking the intro and outro so the transition feels smoother on stage.'
    },
    {
        title: 'Songwriting Fragment',
        description: 'A short lyrical idea that might become the hook for a full track later.'
    },
    {
        title: 'Mixing Progress',
        description: 'Cleaner drums, less low-end clutter, and a brighter vocal presence in the chorus.'
    },
    {
        title: 'Beat Loop Upload',
        description: 'A compact loop built for quick collaboration and variation in the next round.'
    },
    {
        title: 'Rehearsal Recording',
        description: 'Captured a rehearsal take to compare timing, energy, and arrangement ideas.'
    },
    {
        title: 'Melody Test',
        description: 'Trying a more memorable top line with fewer notes and more space between phrases.'
    },
    {
        title: 'Production Checkpoint',
        description: 'At this stage the track feels solid, but the bridge still needs more contrast.'
    },
    {
        title: 'Chorus Revision',
        description: 'The chorus now leans harder into the main theme without getting too crowded.'
    },
    {
        title: 'Warm-up Demo',
        description: 'A fast idea sketch to keep momentum before the next full writing session.'
    },
    {
        title: 'Garage Session Notes',
        description: 'Captured the raw take so we can keep the urgency when polishing it later.'
    },
    {
        title: 'Sound Design Pass',
        description: 'Refining the lead texture with a little more movement and a sharper attack.'
    },
    {
        title: 'Arrangement Idea',
        description: 'Testing a bigger buildup before the final section to make the payoff land harder.'
    },
    {
        title: 'Fresh Draft',
        description: 'A new starting point for the collaboration thread, kept intentionally simple.'
    },
    {
        title: 'Instrumental Update',
        description: 'The latest export leans more atmospheric and gives the lead room to breathe.'
    }
];

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('base64url');
    const derivedKey = crypto.scryptSync(password, salt, 64).toString('base64url');
    return `scrypt$${salt}$${derivedKey}`;
}

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
    } catch {
        // ignore
    }
}

function ensurePostTable() {
    db.exec(`
    CREATE TABLE IF NOT EXISTS Post (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      userId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
    );
  `);

    try {
        const cols = db.prepare("PRAGMA table_info('Post')").all();
        const hasDescription = cols.some((c) => c.name === 'description');
        const hasCreatedAt = cols.some((c) => c.name === 'createdAt');
        const hasUpdatedAt = cols.some((c) => c.name === 'updatedAt');

        if (!hasDescription) {
            db.exec("ALTER TABLE Post ADD COLUMN description TEXT NOT NULL DEFAULT '';");
        }

        if (!hasCreatedAt) {
            db.exec("ALTER TABLE Post ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP;");
        }

        if (!hasUpdatedAt) {
            db.exec("ALTER TABLE Post ADD COLUMN updatedAt DATETIME;");
        }
    } catch {
        // ignore
    }
}

function resetUsers() {
    // Remove all existing users to rebuild from scratch
    db.exec('DELETE FROM User;');
    // Reset sqlite_sequence for AUTOINCREMENT
    db.exec("DELETE FROM sqlite_sequence WHERE name='User';");
}

function resetPosts() {
    db.exec('DELETE FROM Post;');
    db.exec("DELETE FROM sqlite_sequence WHERE name='Post';");
}

function seedProfiles() {
    const profiles = userNames.map((username, index) => ({
        username,
        email: `${username}@example.com`,
        password: 'password',
        role: index === 0 ? 'admin' : 'user'
    }));

    const insert = db.prepare('INSERT INTO User (username, email, password, role, updatedAt) VALUES (?, ?, ?, ?, datetime(\'now\'))');
    const insertMany = db.transaction((rows) => {
        for (const r of rows) insert.run(r.username, r.email, hashPassword(r.password), r.role || 'user');
    });
    insertMany(profiles);
}

function seedPosts() {
    const users = db.prepare('SELECT id FROM User ORDER BY id ASC').all();
    const insert = db.prepare('INSERT INTO Post (title, description, userId, createdAt, updatedAt) VALUES (?, ?, ?, datetime(\'now\'), datetime(\'now\'))');
    const insertMany = db.transaction((rows) => {
        for (let index = 0; index < rows.length; index += 1) {
            const user = users[index % users.length];
            insert.run(rows[index].title, rows[index].description, user.id);
        }
    });

    insertMany(postSeeds);
}

function showSample() {
    const rows = db.prepare('SELECT id, username, email, role, createdAt, updatedAt FROM User ORDER BY id LIMIT 20').all();
    console.log('Seeded users:', rows);

    const posts = db.prepare(`
      SELECT Post.id, Post.title, Post.description, User.username
      FROM Post
      INNER JOIN User ON User.id = Post.userId
      ORDER BY Post.id ASC
      LIMIT 20
    `).all();
    console.log('Seeded posts:', posts);
}

try {
    ensureUserTable();
    ensurePostTable();
    resetUsers();
    resetPosts();
    seedProfiles();
    seedPosts();
    showSample();
    console.log('Seeding complete.');
    process.exitCode = 0;
} catch (err) {
    console.error('Seeding error:', err && err.message);
    process.exitCode = 1;
} finally {
    try { db.close(); } catch { }
}
