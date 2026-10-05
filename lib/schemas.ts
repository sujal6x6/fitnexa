import { z } from 'zod';

const url = z.string().refine((s) => /^https?:\/\//.test(s) || s.startsWith('/'), 'Invalid image URL');
export const productSchema = z.object({
  name: z.string().trim().min(2), slug: z.string().regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens'), sku: z.string().trim().min(1),
  category_id: z.string().uuid().nullable(), price_paise: z.number().int().min(0), compare_price_paise: z.number().int().min(0).nullable(),
  short_description: z.string().nullable(), description: z.string().nullable(), features: z.array(z.string()), specifications: z.record(z.string()),
  warranty: z.string().nullable(), stock: z.number().int().min(0), is_featured: z.boolean(), is_active: z.boolean(),
  seo_title: z.string().nullable(), seo_description: z.string().nullable(), images: z.array(url).max(12),
});
