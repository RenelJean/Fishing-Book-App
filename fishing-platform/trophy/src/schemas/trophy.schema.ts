import { z } from 'zod';

const TrophySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  dateCaught: z.date(),
  weight: z.number().positive('Weight must be a positive number'),
  length: z.number().positive('Length must be a positive number'),
  location: z.string().min(1, 'Location is required'),
  imageUrl: z.string().url().optional(),
  anglerId: z.string().uuid(),
});

export type Trophy = z.infer<typeof TrophySchema>;

export default TrophySchema;