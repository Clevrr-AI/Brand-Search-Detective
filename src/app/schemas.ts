import { z } from 'zod';

export const brandFormSchema = z.object({
  brandName: z.string().min(2, 'Brand name must be at least 2 characters.'),
  brandWebsite: z.string().url('Please enter a valid website URL.'),
  keywords: z.string().min(3, 'Please provide some relevant keywords.'),
});

export const queriesFormSchema = z.object({
    email: z.string().email('Please enter a valid email address.'),
    queries: z.array(z.string().min(1, 'Query cannot be empty.')).min(1, 'At least one query is required.'),
});