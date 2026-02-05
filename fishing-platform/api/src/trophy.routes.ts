import { Router } from 'express';
import {
  getTrophies,
  getTrophyById,
  createTrophy,
  updateTrophy,
  deleteTrophy,
} from '../controllers/trophy.controller';

const router = Router();

// Route to get all trophies
router.get('/', getTrophies);

// Route to get a trophy by ID
router.get('/:id', getTrophyById);

// Route to create a new trophy
router.post('/', createTrophy);

// Route to update an existing trophy
router.put('/:id', updateTrophy);

// Route to delete a trophy
router.delete('/:id', deleteTrophy);

export default router;