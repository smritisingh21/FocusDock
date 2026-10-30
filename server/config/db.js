import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Check if custom credentials or connection string are supplied
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST || '127.0.0.1',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'focusdock',
  connectionTimeoutMillis: 3000,
});

let isPgConnected = false;

// Fallback in-memory store in case PostgreSQL is offline during local dev
const inMemoryStore = {
  users: [
    {
      id: 1,
      username: 'user1',
      password_hash: bcrypt.hashSync('1234', 10),
      email: 'user1@focusdock.app',
      full_name: 'Smriti Singh',
      avatar_url: '👩‍💻',
      created_at: new Date()
    }
  ],
  user_preferences: [
    {
      id: 1,
      user_id: 1,
      theme_name: 'glass-dark',
      active_widgets: ['wallpaper', 'todo', 'music', 'note', 'calendar', 'screentime', 'pomodoro', 'reminders'],
      background_url: '/HEROSCREEN-2025021222.webp',
      glass_blur: 16,
      glass_opacity: 80,
      updated_at: new Date()
    }
  ],
  todos: [
    { id: 1, user_id: 1, text: 'Design modular widget architecture', done: true, priority: 'high', created_at: new Date() },
    { id: 2, user_id: 1, text: 'Configure PostgreSQL & Amazon S3 integration', done: true, priority: 'high', created_at: new Date() },
    { id: 3, user_id: 1, text: 'Deploy FocusDock to AWS EC2 with Redis caching', done: false, priority: 'normal', created_at: new Date() },
  ],
  notes: [
    { id: 1, user_id: 1, content: 'FocusDock architecture:\n- Dynamic Backgrounds with Amazon S3\n- Multi-widget plugin dock\n- Redis query caching\n- PostgreSQL persistent storage', color: 'yellow', updated_at: new Date() }
  ],
  reminders: [
    { id: 1, user_id: 1, reminder_time: '04:30', text: 'Morning workout & coffee', created_at: new Date() },
    { id: 2, user_id: 1, reminder_time: '10:05', text: 'Focus block & system review', created_at: new Date() }
  ]
};

export async function initDB() {
  try {
    const client = await pool.connect();
    isPgConnected = true;
    console.log('✅ [PostgreSQL] Connected successfully to database');

    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        full_name VARCHAR(100),
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        theme_name VARCHAR(50) DEFAULT 'glass-dark',
        active_widgets TEXT[] DEFAULT ARRAY['wallpaper', 'todo', 'music', 'note', 'calendar', 'screentime', 'pomodoro', 'reminders'],
        background_url TEXT,
        glass_blur INTEGER DEFAULT 16,
        glass_opacity INTEGER DEFAULT 80,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        done BOOLEAN DEFAULT FALSE,
        priority VARCHAR(20) DEFAULT 'normal',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT,
        color VARCHAR(30) DEFAULT 'yellow',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reminders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        reminder_time VARCHAR(20) NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure user1 default user exists
    const userRes = await client.query('SELECT id FROM users WHERE username = $1', ['user1']);
    if (userRes.rows.length === 0) {
      const hash = bcrypt.hashSync('1234', 10);
      const insertUser = await client.query(
        'INSERT INTO users (username, password_hash, email, full_name, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        ['user1', hash, 'user1@focusdock.app', 'Smriti Singh', '👩‍💻']
      );
      const newUserId = insertUser.rows[0].id;

      await client.query(
        'INSERT INTO user_preferences (user_id, theme_name, active_widgets, background_url) VALUES ($1, $2, $3, $4)',
        [newUserId, 'glass-dark', ['wallpaper', 'todo', 'music', 'note', 'calendar', 'screentime', 'pomodoro', 'reminders'], '/HEROSCREEN-2025021222.webp']
      );

      // Default todos
      await client.query(`
        INSERT INTO todos (user_id, text, done, priority) VALUES 
        ($1, 'Design modular widget architecture', true, 'high'),
        ($1, 'Configure PostgreSQL & Amazon S3 integration', true, 'high'),
        ($1, 'Deploy FocusDock to AWS EC2 with Redis caching', false, 'normal');
      `, [newUserId]);

      // Default note
      await client.query(`
        INSERT INTO notes (user_id, content, color) VALUES 
        ($1, 'FocusDock architecture:\n- Dynamic Backgrounds with Amazon S3\n- Multi-widget plugin dock\n- Redis query caching\n- PostgreSQL persistent storage', 'yellow');
      `, [newUserId]);

      // Default reminders
      await client.query(`
        INSERT INTO reminders (user_id, reminder_time, text) VALUES
        ($1, '04:30', 'Morning workout & coffee'),
        ($1, '10:05', 'Focus block & system review');
      `, [newUserId]);

      console.log('🌱 [PostgreSQL] Seeded default user (user1 / 1234) and initial records');
    }

    client.release();
  } catch (err) {
    isPgConnected = false;
    console.warn(`⚠️ [PostgreSQL] Could not connect to PostgreSQL (${err.message}). Using resilient in-memory datastore with user1 / 1234 pre-seeded.`);
  }
}

export async function query(text, params = []) {
  if (isPgConnected) {
    return pool.query(text, params);
  }
  // In-memory mock layer for dev resilience if Postgres is offline
  return executeInMemory(text, params);
}

function executeInMemory(text, params) {
  const normalized = text.trim().toLowerCase();

  // Simple query patterns for in-memory fallback
  if (normalized.startsWith('select') && normalized.includes('from users where username =')) {
    const username = params[0];
    const user = inMemoryStore.users.find((u) => u.username === username);
    return { rows: user ? [user] : [] };
  }

  if (normalized.startsWith('select') && normalized.includes('from users where id =')) {
    const id = parseInt(params[0], 10);
    const user = inMemoryStore.users.find((u) => u.id === id);
    return { rows: user ? [user] : [] };
  }

  if (normalized.startsWith('insert into users')) {
    const [username, password_hash, email, full_name, avatar_url] = params;
    const newUser = {
      id: inMemoryStore.users.length + 1,
      username,
      password_hash,
      email,
      full_name,
      avatar_url: avatar_url || '⚡️',
      created_at: new Date()
    };
    inMemoryStore.users.push(newUser);
    return { rows: [newUser] };
  }

  if (normalized.startsWith('select') && normalized.includes('from user_preferences where user_id =')) {
    const userId = parseInt(params[0], 10);
    let pref = inMemoryStore.user_preferences.find((p) => p.user_id === userId);
    if (!pref) {
      pref = {
        id: inMemoryStore.user_preferences.length + 1,
        user_id: userId,
        theme_name: 'glass-dark',
        active_widgets: ['wallpaper', 'todo', 'music', 'note', 'calendar', 'screentime', 'pomodoro', 'reminders'],
        background_url: '/HEROSCREEN-2025021222.webp',
        glass_blur: 16,
        glass_opacity: 80,
        updated_at: new Date()
      };
      inMemoryStore.user_preferences.push(pref);
    }
    return { rows: [pref] };
  }

  if (normalized.startsWith('update user_preferences')) {
    const userId = parseInt(params[params.length - 1], 10);
    let pref = inMemoryStore.user_preferences.find((p) => p.user_id === userId);
    if (pref) {
      if (text.includes('theme_name = $1') && params[0]) pref.theme_name = params[0];
      if (text.includes('active_widgets =') && params[1]) pref.active_widgets = params[1];
      if (text.includes('background_url =') && params[2]) pref.background_url = params[2];
      pref.updated_at = new Date();
    }
    return { rows: [pref] };
  }

  if (normalized.startsWith('select') && normalized.includes('from todos where user_id =')) {
    const userId = parseInt(params[0], 10);
    const todos = inMemoryStore.todos.filter((t) => t.user_id === userId);
    return { rows: todos };
  }

  if (normalized.startsWith('insert into todos')) {
    const [userId, itemText, done, priority] = params;
    const newTodo = {
      id: Date.now(),
      user_id: parseInt(userId, 10),
      text: itemText,
      done: !!done,
      priority: priority || 'normal',
      created_at: new Date()
    };
    inMemoryStore.todos.push(newTodo);
    return { rows: [newTodo] };
  }

  if (normalized.startsWith('update todos set done =')) {
    const [done, todoId, userId] = params;
    const todo = inMemoryStore.todos.find((t) => t.id === parseInt(todoId, 10) && t.user_id === parseInt(userId, 10));
    if (todo) todo.done = done;
    return { rows: todo ? [todo] : [] };
  }

  if (normalized.startsWith('delete from todos')) {
    const [todoId, userId] = params;
    inMemoryStore.todos = inMemoryStore.todos.filter((t) => !(t.id === parseInt(todoId, 10) && t.user_id === parseInt(userId, 10)));
    return { rowCount: 1 };
  }

  if (normalized.startsWith('select') && normalized.includes('from notes where user_id =')) {
    const userId = parseInt(params[0], 10);
    const note = inMemoryStore.notes.find((n) => n.user_id === userId);
    return { rows: note ? [note] : [] };
  }

  if (normalized.startsWith('update notes') || normalized.startsWith('insert into notes')) {
    const [userId, content, color] = params;
    let note = inMemoryStore.notes.find((n) => n.user_id === parseInt(userId, 10));
    if (!note) {
      note = { id: Date.now(), user_id: parseInt(userId, 10), content, color: color || 'yellow', updated_at: new Date() };
      inMemoryStore.notes.push(note);
    } else {
      note.content = content;
      if (color) note.color = color;
      note.updated_at = new Date();
    }
    return { rows: [note] };
  }

  if (normalized.startsWith('select') && normalized.includes('from reminders where user_id =')) {
    const userId = parseInt(params[0], 10);
    const reminders = inMemoryStore.reminders.filter((r) => r.user_id === userId);
    return { rows: reminders };
  }

  if (normalized.startsWith('insert into reminders')) {
    const [userId, time, remText] = params;
    const rem = { id: Date.now(), user_id: parseInt(userId, 10), reminder_time: time, text: remText, created_at: new Date() };
    inMemoryStore.reminders.push(rem);
    return { rows: [rem] };
  }

  if (normalized.startsWith('delete from reminders')) {
    const [remId, userId] = params;
    inMemoryStore.reminders = inMemoryStore.reminders.filter((r) => !(r.id === parseInt(remId, 10) && r.user_id === parseInt(userId, 10)));
    return { rowCount: 1 };
  }

  return { rows: [] };
}

export function getDbStatus() {
  return {
    type: 'PostgreSQL',
    connected: isPgConnected,
    mode: isPgConnected ? 'production-postgresql' : 'in-memory-fallback'
  };
}

export default { query, initDB, getDbStatus };
