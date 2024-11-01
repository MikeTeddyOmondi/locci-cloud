import express from 'express';

import MessageResponse from '../interfaces/MessageResponse.js';
import projects from './projects.js';

const router = express.Router();

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/projects', projects);

export default router;
