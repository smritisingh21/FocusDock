import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import redis from '../config/redis.js';
import { generateToken } from '../middleware/auth.js';

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Default fast-path for requirement: user = user1 and pwd = 1234
    if (username.trim() === 'user1' && password === '1234') {
      const userRes = await db.query('SELECT * FROM users WHERE username = $1', ['user1']);
      let user = userRes.rows[0];

      if (!user) {
        // If not in DB yet, create user1
        const hash = bcrypt.hashSync('1234', 10);
        const created = await db.query(
          'INSERT INTO users (username, password_hash, email, full_name, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          ['user1', hash, 'user1@focusdock.app', 'Smriti Singh', '👩‍💻']
        );
        user = created.rows[0];
      }

      // Get preferences
      const prefRes = await db.query('SELECT * FROM user_preferences WHERE user_id = $1', [user.id]);
      const preferences = prefRes.rows[0] || {
        theme_name: 'glass-dark',
        active_widgets: ['wallpaper', 'todo', 'music', 'note', 'calendar', 'screentime', 'pomodoro', 'reminders'],
        background_url: '/HEROSCREEN-2025021222.webp',
        glass_blur: 16,
        glass_opacity: 80
      };

      const token = generateToken(user);
      const safeUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
      };

      // Cache user in Redis
      await redis.setCache(`user:${user.id}`, safeUser, 3600);
      await redis.setCache(`preferences:${user.id}`, preferences, 3600);

      return res.json({
        message: 'Login successful',
        token,
        user: safeUser,
        preferences,
      });
    }

    // Standard database lookup for signed up users
    const userRes = await db.query('SELECT * FROM users WHERE username = $1 OR email = $1', [username.trim()]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = userRes.rows[0];
    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Get preferences
    const prefRes = await db.query('SELECT * FROM user_preferences WHERE user_id = $1', [user.id]);
    const preferences = prefRes.rows[0] || {
      theme_name: 'glass-dark',
      active_widgets: ['wallpaper', 'todo', 'music', 'note', 'calendar', 'screentime', 'pomodoro', 'reminders'],
      background_url: '/HEROSCREEN-2025021222.webp',
      glass_blur: 16,
      glass_opacity: 80
    };

    const token = generateToken(user);
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
    };

    // Cache user session in Redis
    await redis.setCache(`user:${user.id}`, safeUser, 3600);
    await redis.setCache(`preferences:${user.id}`, preferences, 3600);

    res.json({
      message: 'Login successful',
      token,
      user: safeUser,
      preferences,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
}

export async function signup(req, res) {
  try {
    const { username, password, email, fullName, avatar } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters long' });
    }

    // Check existing
    const existing = await db.query('SELECT id FROM users WHERE username = $1', [username.trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Username is already taken' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const userRes = await db.query(
      'INSERT INTO users (username, password_hash, email, full_name, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, full_name, avatar_url, created_at',
      [
        username.trim(),
        passwordHash,
        email || `${username.trim()}@focusdock.app`,
        fullName || username.trim(),
        avatar || '✨'
      ]
    );

    const newUser = userRes.rows[0];

    // Create default preferences in PostgreSQL
    const prefRes = await db.query(
      'INSERT INTO user_preferences (user_id, theme_name, active_widgets, background_url, glass_blur, glass_opacity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        newUser.id,
        'glass-dark',
        ['wallpaper', 'todo', 'music', 'note', 'calendar', 'screentime', 'pomodoro', 'reminders'],
        '/HEROSCREEN-2025021222.webp',
        16,
        80
      ]
    );
    const preferences = prefRes.rows[0];

    // Initialize default welcome todo & note for the user
    await db.query(
      'INSERT INTO todos (user_id, text, done, priority) VALUES ($1, $2, $3, $4)',
      [newUser.id, 'Welcome to FocusDock! Customize your widgets', false, 'high']
    );
    await db.query(
      'INSERT INTO notes (user_id, content, color) VALUES ($1, $2, $3)',
      [newUser.id, '💡 Tip: Click "Add Mini-App" to customize which widgets are loaded onto your workspace!', 'yellow']
    );

    const token = generateToken(newUser);

    // Cache user & preferences in Redis
    await redis.setCache(`user:${newUser.id}`, newUser, 3600);
    await redis.setCache(`preferences:${newUser.id}`, preferences, 3600);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: newUser,
      preferences,
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
}

export async function getMe(req, res) {
  try {
    const userId = req.user.id;

    // Check Redis cache first
    let user = await redis.getCache(`user:${userId}`);
    if (!user) {
      const userRes = await db.query(
        'SELECT id, username, email, full_name, avatar_url, created_at FROM users WHERE id = $1',
        [userId]
      );
      if (userRes.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      user = userRes.rows[0];
      await redis.setCache(`user:${userId}`, user, 3600);
    }

    // Check preferences in Redis cache
    let preferences = await redis.getCache(`preferences:${userId}`);
    if (!preferences) {
      const prefRes = await db.query('SELECT * FROM user_preferences WHERE user_id = $1', [userId]);
      preferences = prefRes.rows[0] || {
        theme_name: 'glass-dark',
        active_widgets: ['wallpaper', 'todo', 'music', 'note', 'calendar', 'screentime', 'pomodoro', 'reminders'],
        background_url: '/HEROSCREEN-2025021222.webp',
        glass_blur: 16,
        glass_opacity: 80
      };
      await redis.setCache(`preferences:${userId}`, preferences, 3600);
    }

    res.json({
      user,
      preferences,
      cached: Boolean(user)
    });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function logout(req, res) {
  try {
    if (req.user?.id) {
      await redis.delCache(`user:${req.user.id}`);
      await redis.delCache(`preferences:${req.user.id}`);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error during logout' });
  }
}

export default { login, signup, getMe, logout };
