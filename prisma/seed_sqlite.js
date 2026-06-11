'use strict';
/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

const userProfiles = [
    { username: 'amelia', bio: 'Ambient producer who likes warm textures and live drums.' },
    { username: 'bram', bio: 'Guitarist focused on heavy riffs and clean transitions.' },
    { username: 'cora', bio: 'Songwriter who builds tracks around strong vocal hooks.' },
    { username: 'dylan', bio: 'Sound designer collecting field recordings and synth layers.' },
    { username: 'elaine', bio: 'Performer with an ear for tight rhythm sections.' },
    { username: 'finn', bio: 'Bass player aiming for a deep pocket and simple arrangements.' },
    { username: 'gaia', bio: 'Live set builder who prefers smooth, evolving structures.' },
    { username: 'hugo', bio: 'Lyric writer sketching short ideas into full songs.' },
    { username: 'iris', bio: 'Mixing experiments and bright melodic ideas.' },
    { username: 'jasper', bio: 'Loop maker sharing quick drafts for collaborations.' },
    { username: 'kiki', bio: 'Rehearsal recorder and arrangement note taker.' },
    { username: 'luca', bio: 'Melody tester keeping things simple and memorable.' },
    { username: 'mila', bio: 'Producer focusing on contrast and dynamics.' },
    { username: 'nolan', bio: 'Chorus rewriter making hooks hit harder.' },
    { username: 'olivia', bio: 'Demo maker who moves fast from idea to sketch.' },
    { username: 'pablo', bio: 'Raw session capturer preserving energy before polishing.' },
    { username: 'quinn', bio: 'Lead texture shaper with a taste for movement.' },
    { username: 'ravi', bio: 'Arrangement builder stacking energy in the right places.' },
    { username: 'sara', bio: 'Collaboration starter with a clean, minimal style.' },
    { username: 'timo', bio: 'Atmospheric instrumental drafts and wide soundscapes.' }
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

const commentSeeds = [
    "Great post! Really inspiring! 🎵",
    "Thanks for sharing this! 🙌",
    "Love the vibe of this track! 🔥",
    "Looking forward to more content like this! ✨",
    "This is exactly what I needed to hear! 🎧",
    "Amazing work, keep it up! 💪",
    "Thanks for the detailed explanation! 📝",
    "This resonates with my experience! 🎯",
    "Can't wait to try this out! 🚀",
    "Really helpful, appreciate it! 👍",
    "Beautiful composition! 🎹",
    "The production quality is top notch! 🎛️",
    "This gave me so many ideas! 💡",
    "Love the arrangement! 🎶",
    "So creative! Keep creating! 🎨"
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
      bio TEXT NOT NULL DEFAULT '',
      role TEXT DEFAULT 'user',
      avatar_url TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME
    );
  `);

    try {
        const cols = db.prepare("PRAGMA table_info('User')").all();
        const hasRole = cols.some((c) => c.name === 'role');
        const hasBio = cols.some((c) => c.name === 'bio');
        const hasAvatarUrl = cols.some((c) => c.name === 'avatar_url');

        if (!hasRole) {
            db.exec("ALTER TABLE User ADD COLUMN role TEXT DEFAULT 'user';");
        }
        if (!hasBio) {
            db.exec("ALTER TABLE User ADD COLUMN bio TEXT NOT NULL DEFAULT '';");
        }
        if (!hasAvatarUrl) {
            db.exec("ALTER TABLE User ADD COLUMN avatar_url TEXT;");
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

function ensurePostLikeTable() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS PostLike (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            postId INTEGER NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
            FOREIGN KEY (postId) REFERENCES Post(id) ON DELETE CASCADE,
            UNIQUE(userId, postId)
        );
    `);
}

function ensureSavedPostTable() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS SavedPost (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            postId INTEGER NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
            FOREIGN KEY (postId) REFERENCES Post(id) ON DELETE CASCADE,
            UNIQUE(userId, postId)
        );
    `);
}

function ensureCommentTable() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS Comment (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            userId INTEGER NOT NULL,
            postId INTEGER NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME,
            FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
            FOREIGN KEY (postId) REFERENCES Post(id) ON DELETE CASCADE
        );
    `);
}

function resetUsers() {
    db.exec('DELETE FROM User;');
    db.exec("DELETE FROM sqlite_sequence WHERE name='User';");
}

function resetPosts() {
    db.exec('DELETE FROM Post;');
    db.exec("DELETE FROM sqlite_sequence WHERE name='Post';");
}

function resetPostRelations() {
    db.exec('DELETE FROM PostLike;');
    db.exec('DELETE FROM SavedPost;');
    db.exec("DELETE FROM sqlite_sequence WHERE name='PostLike';");
    db.exec("DELETE FROM sqlite_sequence WHERE name='SavedPost';");
}

function resetComments() {
    db.exec('DELETE FROM Comment;');
    db.exec("DELETE FROM sqlite_sequence WHERE name='Comment';");
}

function seedProfiles() {
    const profiles = userProfiles.map((profile, index) => ({
        username: profile.username,
        email: `${profile.username}@example.com`,
        password: 'password',
        role: index === 0 ? 'admin' : 'user',
        bio: profile.bio
    }));

    const insert = db.prepare('INSERT INTO User (username, email, password, role, bio, updatedAt) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))');
    const insertMany = db.transaction((rows) => {
        for (const r of rows) insert.run(r.username, r.email, hashPassword(r.password), r.role || 'user', r.bio || '');
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

function seedPostRelations() {
    const posts = db.prepare('SELECT id FROM Post ORDER BY id ASC').all();
    const users = db.prepare('SELECT id FROM User ORDER BY id ASC').all();

    const likeInsert = db.prepare('INSERT OR IGNORE INTO PostLike (userId, postId, createdAt) VALUES (?, ?, datetime(\'now\'))');
    const saveInsert = db.prepare('INSERT OR IGNORE INTO SavedPost (userId, postId, createdAt) VALUES (?, ?, datetime(\'now\'))');

    const insertMany = db.transaction(() => {
        for (let index = 0; index < users.length; index += 1) {
            const user = users[index];
            const likedPost = posts[(index + 1) % posts.length];
            const savedPost = posts[(index + 2) % posts.length];

            likeInsert.run(user.id, likedPost.id);
            saveInsert.run(user.id, savedPost.id);
        }
    });

    insertMany();
}

function seedComments() {
    const users = db.prepare('SELECT id FROM User ORDER BY id ASC').all();
    const posts = db.prepare('SELECT id FROM Post ORDER BY id ASC').all();

    const insert = db.prepare('INSERT INTO Comment (content, userId, postId, createdAt, updatedAt) VALUES (?, ?, ?, datetime(\'now\'), datetime(\'now\'))');
    const insertMany = db.transaction(() => {
        // Iedere post krijgt 2-4 random comments
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            // Random aantal comments tussen 2 en 5
            const numComments = Math.floor(Math.random() * 4) + 2;

            for (let j = 0; j < numComments && j < users.length; j++) {
                const user = users[j % users.length];
                const randomComment = commentSeeds[Math.floor(Math.random() * commentSeeds.length)];
                insert.run(randomComment, user.id, post.id);
            }
        }
    });

    insertMany();
}

function showSample() {
    const rows = db.prepare('SELECT id, username, email, bio, role, avatar_url, createdAt, updatedAt FROM User ORDER BY id LIMIT 20').all();
    console.log('Seeded users:', rows.length);

    const posts = db.prepare(`
      SELECT Post.id, Post.title, Post.description, User.username
      FROM Post
      INNER JOIN User ON User.id = Post.userId
      ORDER BY Post.id ASC
      LIMIT 20
    `).all();
    console.log('Seeded posts:', posts.length);

    const comments = db.prepare(`
      SELECT Comment.id, Comment.content, User.username, Post.title as postTitle
      FROM Comment
      INNER JOIN User ON User.id = Comment.userId
      INNER JOIN Post ON Post.id = Comment.postId
      ORDER BY Comment.id ASC
      LIMIT 20
    `).all();
    console.log('Seeded comments:', comments.length);
}

try {
    ensureUserTable();
    ensurePostTable();
    ensurePostLikeTable();
    ensureSavedPostTable();
    ensureCommentTable();
    resetPostRelations();
    resetComments();
    resetPosts();
    resetUsers();
    seedProfiles();
    seedPosts();
    seedPostRelations();
    seedComments();
    showSample();
    console.log('Seeding complete.');
    process.exitCode = 0;
} catch (err) {
    console.error('Seeding error:', err && err.message);
    process.exitCode = 1;
} finally {
    try { db.close(); } catch { }
}