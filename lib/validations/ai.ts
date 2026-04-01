import { z } from 'zod';

export const imageGenerationSchema = z.object({
  prompt: z.string()
    .min(3, "Prompt must be at least 3 characters")
    .max(1000, "Prompt must be under 1000 characters")
    .transform(str => str.trim()),
    
  aspectRatio: z.enum(['1:1', '16:9', '9:16']).optional().default('1:1'),
});

export type ImageGenerationInput = z.infer<typeof imageGenerationSchema>;
