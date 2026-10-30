import express from 'express';
import {
  getAvailableWidgets,
  getTodos,
  createTodo,
  toggleTodo,
  deleteTodo,
  getNotes,
  updateNotes,
  getReminders,
  createReminder,
  deleteReminder,
} from '../controllers/widgetsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public widget catalog
router.get('/available', getAvailableWidgets);

// Protected routes for widgets data
router.use(authenticateToken);

router.get('/todos', getTodos);
router.post('/todos', createTodo);
router.put('/todos/:id/toggle', toggleTodo);
router.delete('/todos/:id', deleteTodo);

router.get('/notes', getNotes);
router.put('/notes', updateNotes);

router.get('/reminders', getReminders);
router.post('/reminders', createReminder);
router.delete('/reminders/:id', deleteReminder);

export default router;
