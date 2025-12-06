'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { avatarUploadSchema, profileSchema } from './schema';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { error: string; fieldErrors?: Record<string, string[]> };

export async function uploadAvatar(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    return { error: 'Não autorizado' };
  }

  const file = formData.get('file') as File;
  if (!file) {
    return { error: 'Nenhum arquivo enviado' };
  }

  // Validação com Zod
  const validation = await avatarUploadSchema.safeParseAsync({ file });

  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return { error: firstError?.message || 'Arquivo inválido' };
  }

  try {
    // Deletar imagens antigas do usuário
    const { data: existingFiles } = await supabaseAdmin.storage
      .from('avatars')
      .list(session.user.id);

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(
        (f) => `${session.user.id}/${f.name}`
      );
      await supabaseAdmin.storage.from('avatars').remove(filesToDelete);
    }

    // Usa a extensão do arquivo comprimido (webp ou jpg)
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { error: 'Erro ao fazer upload da imagem' };
    }

    const { data } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Adiciona timestamp para evitar cache do navegador
    return {
      success: true,
      data: { url: `${data.publicUrl}?t=${Date.now()}` }
    };
  } catch (err) {
    console.error('Upload error:', err);
    return { error: 'Erro ao fazer upload da imagem' };
  }
}

interface UpdateProfileInput {
  name: string;
  image?: string;
}

export async function updateProfile(
  input: UpdateProfileInput
): Promise<ActionResult> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    return { error: 'Não autorizado' };
  }

  // Validação com Zod
  const validation = profileSchema.safeParse(input);

  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {};

    for (const issue of validation.error.issues) {
      const path = issue.path.map(String).join('.');
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);
    }

    return {
      error: 'Dados inválidos',
      fieldErrors
    };
  }

  const { name, image } = validation.data;

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        image: image?.trim() || null
      }
    });

    revalidatePath('/home');
    revalidatePath('/home/profile');

    return { success: true };
  } catch {
    return { error: 'Erro ao atualizar perfil' };
  }
}
