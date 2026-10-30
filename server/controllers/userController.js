import db from '../config/db.js';
import redis from '../config/redis.js';
import { uploadImage } from '../services/s3Service.js';

export async function getPreferences(req, res) {
  try {
    const userId = req.user.id;

    // Check Redis cache first
    const cached = await redis.getCache(`preferences:${userId}`);
    if (cached) {
      return res.json({ preferences: cached, source: 'redis-cache' });
    }

    const result = await db.query('SELECT * FROM user_preferences WHERE user_id = $1', [userId]);
    let preferences = result.rows[0];

    if (!preferences) {
      const created = await db.query(
        'INSERT INTO user_preferences (user_id, theme_name, active_widgets, background_url) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, 'glass-dark', ['wallpaper', 'todo', 'music', 'note', 'calendar', 'screentime', 'pomodoro', 'reminders'], '/HEROSCREEN-2025021222.webp']
      );
      preferences = created.rows[0];
    }

    // Set Redis cache (TTL 10 min)
    await redis.setCache(`preferences:${userId}`, preferences, 600);

    res.json({ preferences, source: 'database' });
  } catch (err) {
    console.error('Error getting preferences:', err);
    res.status(500).json({ error: 'Failed to retrieve preferences' });
  }
}

export async function updatePreferences(req, res) {
  try {
    const userId = req.user.id;
    const { theme_name, active_widgets, background_url, glass_blur, glass_opacity } = req.body;

    const currentRes = await db.query('SELECT * FROM user_preferences WHERE user_id = $1', [userId]);
    let pref = currentRes.rows[0];

    const updatedTheme = theme_name !== undefined ? theme_name : (pref?.theme_name || 'glass-dark');
    const updatedWidgets = active_widgets !== undefined ? active_widgets : (pref?.active_widgets || ['wallpaper', 'todo', 'music', 'note', 'calendar', 'screentime', 'pomodoro', 'reminders']);
    const updatedBg = background_url !== undefined ? background_url : (pref?.background_url || '/HEROSCREEN-2025021222.webp');
    const updatedBlur = glass_blur !== undefined ? glass_blur : (pref?.glass_blur || 16);
    const updatedOpacity = glass_opacity !== undefined ? glass_opacity : (pref?.glass_opacity || 80);

    if (pref) {
      const result = await db.query(
        `UPDATE user_preferences 
         SET theme_name = $1, active_widgets = $2, background_url = $3, glass_blur = $4, glass_opacity = $5, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $6 
         RETURNING *`,
        [updatedTheme, updatedWidgets, updatedBg, updatedBlur, updatedOpacity, userId]
      );
      pref = result.rows[0];
    } else {
      const result = await db.query(
        `INSERT INTO user_preferences (user_id, theme_name, active_widgets, background_url, glass_blur, glass_opacity) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [userId, updatedTheme, updatedWidgets, updatedBg, updatedBlur, updatedOpacity]
      );
      pref = result.rows[0];
    }

    // Update Redis cache with latest preferences
    await redis.setCache(`preferences:${userId}`, pref, 600);

    res.json({
      message: 'Preferences updated successfully',
      preferences: pref,
      source: 'database-updated-redis-cached'
    });
  } catch (err) {
    console.error('Error updating preferences:', err);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
}

export async function uploadBackground(req, res) {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    // Upload to Amazon S3 (with local fallback if AWS keys not configured yet)
    const uploadResult = await uploadImage(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname,
      'user-backgrounds'
    );

    // Save image URL into user_preferences in PostgreSQL
    await db.query(
      `UPDATE user_preferences 
       SET background_url = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $2`,
      [uploadResult.url, userId]
    );

    // Invalidate & refresh Redis cache
    const updatedRes = await db.query('SELECT * FROM user_preferences WHERE user_id = $1', [userId]);
    const updatedPref = updatedRes.rows[0];
    if (updatedPref) {
      await redis.setCache(`preferences:${userId}`, updatedPref, 600);
    }

    res.json({
      message: 'Background image uploaded successfully',
      backgroundUrl: uploadResult.url,
      storage: uploadResult.storage,
      note: uploadResult.note || 'Saved to Amazon S3 bucket',
      preferences: updatedPref,
    });
  } catch (err) {
    console.error('Upload background error:', err);
    res.status(500).json({ error: 'Failed to upload background image' });
  }
}

export default { getPreferences, updatePreferences, uploadBackground };
