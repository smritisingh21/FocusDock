import db from '../config/db.js';
import redis from '../config/redis.js';

// Catalog of supported mini-app plugins
const AVAILABLE_WIDGETS = [
  {
    id: 'wallpaper',
    name: 'Dynamic Hero Wallpaper',
    category: 'Aesthetics & Time',
    description: 'Displays current time, day, greeting, and custom wallpaper banner with frost glass sidebar.',
    icon: 'Image',
    defaultEnabled: true,
    size: '1.15fr 1.45fr'
  },
  {
    id: 'todo',
    name: 'Today Task Checklist',
    category: 'Productivity',
    description: 'Interactive checklist with daily completion meter, priority tags, and quick-add actions.',
    icon: 'CheckSquare',
    defaultEnabled: true,
    size: '1.5fr 1.45fr'
  },
  {
    id: 'note',
    name: 'Lined Sticky Note',
    category: 'Notes & Ideas',
    description: 'Realistic yellow lined sticky paper for instant brainstorming, scratchpad notes, and auto-sync.',
    icon: 'FileText',
    defaultEnabled: true,
    size: '1fr'
  },
  {
    id: 'music',
    name: 'Music Player & Spotify',
    category: 'Entertainment & Focus',
    description: 'Rich audio player with animated soundwave visualizer, track controls, and Spotify embed support.',
    icon: 'Music',
    defaultEnabled: true,
    size: '1.15fr 1fr'
  },
  {
    id: 'calendar',
    name: 'Mini Monthly Calendar',
    category: 'Planning',
    description: 'Compact monthly calendar with current day indicator and quick date switcher.',
    icon: 'Calendar',
    defaultEnabled: true,
    size: '1.45fr'
  },
  {
    id: 'screentime',
    name: 'Screen Time & Analytics',
    category: 'Productivity',
    description: 'Daily screen time tracker with productivity metrics and active hours.',
    icon: 'Clock',
    defaultEnabled: true,
    size: '1fr'
  },
  {
    id: 'pomodoro',
    name: 'Focus Pomodoro Timer',
    category: 'Focus',
    description: 'Customizable countdown timer for deep work intervals and restful breaks.',
    icon: 'Timer',
    defaultEnabled: true,
    size: '1.4fr'
  },
  {
    id: 'reminders',
    name: 'Upcoming Reminders',
    category: 'Planning',
    description: 'Timely reminders list with custom alarms and priority notifications.',
    icon: 'Bell',
    defaultEnabled: true,
    size: '1fr'
  }
];

export async function getAvailableWidgets(req, res) {
  res.json({ widgets: AVAILABLE_WIDGETS });
}

// TODOS
export async function getTodos(req, res) {
  try {
    const userId = req.user.id;
    const cacheKey = `todos:${userId}`;

    const cached = await redis.getCache(cacheKey);
    if (cached) {
      return res.json({ todos: cached, source: 'redis-cache' });
    }

    const result = await db.query('SELECT * FROM todos WHERE user_id = $1 ORDER BY id ASC', [userId]);
    await redis.setCache(cacheKey, result.rows, 300);

    res.json({ todos: result.rows, source: 'database' });
  } catch (err) {
    console.error('Error fetching todos:', err);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
}

export async function createTodo(req, res) {
  try {
    const userId = req.user.id;
    const { text, priority } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Task text is required' });
    }

    const result = await db.query(
      'INSERT INTO todos (user_id, text, done, priority) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, text.trim(), false, priority || 'normal']
    );

    await redis.delCache(`todos:${userId}`);
    res.status(201).json({ todo: result.rows[0] });
  } catch (err) {
    console.error('Error creating todo:', err);
    res.status(500).json({ error: 'Failed to create todo' });
  }
}

export async function toggleTodo(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { done } = req.body;

    const result = await db.query(
      'UPDATE todos SET done = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [done, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    await redis.delCache(`todos:${userId}`);
    res.json({ todo: result.rows[0] });
  } catch (err) {
    console.error('Error toggling todo:', err);
    res.status(500).json({ error: 'Failed to update todo' });
  }
}

export async function deleteTodo(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await db.query('DELETE FROM todos WHERE id = $1 AND user_id = $2', [id, userId]);
    await redis.delCache(`todos:${userId}`);

    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    console.error('Error deleting todo:', err);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
}

// NOTES
export async function getNotes(req, res) {
  try {
    const userId = req.user.id;
    const cacheKey = `note:${userId}`;

    const cached = await redis.getCache(cacheKey);
    if (cached) {
      return res.json({ note: cached, source: 'redis-cache' });
    }

    const result = await db.query('SELECT * FROM notes WHERE user_id = $1 LIMIT 1', [userId]);
    const note = result.rows[0] || { content: '', color: 'yellow' };

    await redis.setCache(cacheKey, note, 300);
    res.json({ note, source: 'database' });
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
}

export async function updateNotes(req, res) {
  try {
    const userId = req.user.id;
    const { content, color } = req.body;

    const result = await db.query(
      'UPDATE notes SET content = $1, color = COALESCE($2, color), updated_at = CURRENT_TIMESTAMP WHERE user_id = $3 RETURNING *',
      [content, color, userId]
    );

    let note = result.rows[0];
    if (!note) {
      const inserted = await db.query(
        'INSERT INTO notes (user_id, content, color) VALUES ($1, $2, $3) RETURNING *',
        [userId, content, color || 'yellow']
      );
      note = inserted.rows[0];
    }

    await redis.setCache(`note:${userId}`, note, 300);
    res.json({ note });
  } catch (err) {
    console.error('Error updating notes:', err);
    res.status(500).json({ error: 'Failed to update notes' });
  }
}

// REMINDERS
export async function getReminders(req, res) {
  try {
    const userId = req.user.id;
    const cacheKey = `reminders:${userId}`;

    const cached = await redis.getCache(cacheKey);
    if (cached) {
      return res.json({ reminders: cached, source: 'redis-cache' });
    }

    const result = await db.query('SELECT * FROM reminders WHERE user_id = $1 ORDER BY id ASC', [userId]);
    await redis.setCache(cacheKey, result.rows, 300);

    res.json({ reminders: result.rows, source: 'database' });
  } catch (err) {
    console.error('Error fetching reminders:', err);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
}

export async function createReminder(req, res) {
  try {
    const userId = req.user.id;
    const { reminder_time, text } = req.body;

    if (!reminder_time || !text) {
      return res.status(400).json({ error: 'Time and text are required' });
    }

    const result = await db.query(
      'INSERT INTO reminders (user_id, reminder_time, text) VALUES ($1, $2, $3) RETURNING *',
      [userId, reminder_time, text.trim()]
    );

    await redis.delCache(`reminders:${userId}`);
    res.status(201).json({ reminder: result.rows[0] });
  } catch (err) {
    console.error('Error creating reminder:', err);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
}

export async function deleteReminder(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await db.query('DELETE FROM reminders WHERE id = $1 AND user_id = $2', [id, userId]);
    await redis.delCache(`reminders:${userId}`);

    res.json({ message: 'Reminder deleted' });
  } catch (err) {
    console.error('Error deleting reminder:', err);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
}

export default {
  getAvailableWidgets,
  getTodos,
  createTodo,
  toggleTodo,
  deleteTodo,
  getNotes,
  updateNotes,
  getReminders,
  createReminder,
  deleteReminder
};
