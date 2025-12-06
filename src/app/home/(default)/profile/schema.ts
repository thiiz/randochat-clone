import { z } from 'zod';

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(20, 'Nome deve ter no máximo 20 caracteres')
    .transform((val) => val.trim()),
  image: z.string().url('URL da imagem inválida').optional().or(z.literal(''))
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Schema para upload de avatar
export const avatarUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.type.startsWith('image/'), {
      message: 'Por favor, selecione uma imagem'
    })
    .refine((file) => file.size <= 1 * 1024 * 1024, {
      message: 'A imagem deve ter no máximo 1MB'
    })
});

export type AvatarUploadData = z.infer<typeof avatarUploadSchema>;
