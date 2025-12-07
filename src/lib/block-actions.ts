'use server';

import { cookies } from 'next/headers';
import { auth } from './auth';
import prisma from './prisma';

async function getSessionCookie() {
  const cookieStore = await cookies();
  return cookieStore.toString();
}

export async function isUserBlocked(otherUserId: string): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: {
      cookie: await getSessionCookie()
    }
  });

  if (!session?.user?.id) {
    return false;
  }

  const block = await prisma.blockedUser.findUnique({
    where: {
      blockerId_blockedId: {
        blockerId: session.user.id,
        blockedId: otherUserId
      }
    }
  });

  return !!block;
}

export async function toggleBlockUser(otherUserId: string): Promise<{
  success: boolean;
  isBlocked: boolean;
  error?: string;
}> {
  const session = await auth.api.getSession({
    headers: {
      cookie: await getSessionCookie()
    }
  });

  if (!session?.user?.id) {
    return { success: false, isBlocked: false, error: 'Unauthorized' };
  }

  if (session.user.id === otherUserId) {
    return {
      success: false,
      isBlocked: false,
      error: 'Você não pode bloquear a si mesmo'
    };
  }

  // Verifica se já está bloqueado
  const existingBlock = await prisma.blockedUser.findUnique({
    where: {
      blockerId_blockedId: {
        blockerId: session.user.id,
        blockedId: otherUserId
      }
    }
  });

  if (existingBlock) {
    // Desbloqueia
    await prisma.blockedUser.delete({
      where: { id: existingBlock.id }
    });
    return { success: true, isBlocked: false };
  } else {
    // Bloqueia
    await prisma.blockedUser.create({
      data: {
        blockerId: session.user.id,
        blockedId: otherUserId
      }
    });
    return { success: true, isBlocked: true };
  }
}

export async function getBlockedUsers(): Promise<
  Array<{
    id: string;
    name: string | null;
    image: string | null;
    blockedAt: Date;
  }>
> {
  const session = await auth.api.getSession({
    headers: {
      cookie: await getSessionCookie()
    }
  });

  if (!session?.user?.id) {
    return [];
  }

  const blockedUsers = await prisma.blockedUser.findMany({
    where: { blockerId: session.user.id },
    include: { blocked: true },
    orderBy: { createdAt: 'desc' }
  });

  return blockedUsers.map((b: (typeof blockedUsers)[number]) => ({
    id: b.blocked.id,
    name: b.blocked.name,
    image: b.blocked.image,
    blockedAt: b.createdAt
  }));
}
