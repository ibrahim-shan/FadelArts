import { Router } from 'express';
import { login, logout, me } from '../controllers/auth.controller';
import { authRequired } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authRequired, me);

export default router;

