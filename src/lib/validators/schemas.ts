import * as z from 'zod';

export const businessInfoSchema = z.object({
  name: z.string().min(2, 'Business name required'),
  email: z.string().email('Invalid email'),
});

export const staffSchema = z.object({
  staffName: z.string().min(2, 'Staff name required'),
  staffEmail: z.string().email('Invalid email'),
});

export const signupSchema = businessInfoSchema.merge(
  z.object({
    password: z.string().min(8, 'Password min 8 chars'),
    confirmPassword: z.string()
  })
).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword']
});
