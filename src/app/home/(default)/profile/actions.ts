'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function uploadAvatar(formData: FormData) {
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

  if (!file.type.startsWith('image/')) {
    return { error: 'Por favor, selecione uma imagem' };
  }

  // A imagem já vem comprimida do cliente, mas verificamos por segurança
  if (file.size > 1 * 1024 * 1024) {
    return { error: 'A imagem deve ter no máximo 1MB' };
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
    return { url: `${data.publicUrl}?t=${Date.now()}` };
  } catch (err) {
    console.error('Upload error:', err);
    return { error: 'Erro ao fazer upload da imagem' };
  }
}

export async function updateProfile(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    return { error: 'Não autorizado' };
  }

  const name = formData.get('name') as string;
  const image = formData.get('image') as string;

  if (!name || name.trim().length < 2) {
    return { error: 'Nome deve ter pelo menos 2 caracteres' };
  }

  if (name.trim().length > 50) {
    return { error: 'Nome deve ter no máximo 50 caracteres' };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
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
