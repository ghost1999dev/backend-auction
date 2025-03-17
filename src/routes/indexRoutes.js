import Router from 'express';
import { indexWelcome } from '../controllers/indexController.js';
const router = Router();

router.route('/').get(indexWelcome);

export default router;
