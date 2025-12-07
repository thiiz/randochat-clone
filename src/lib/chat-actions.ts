'use server';

import { cookies } from 'next/headers';
import { auth } from './auth';
import prisma from './prisma';
import { getOnlineUserIdsFromServer } from './supabase-server';

async function getSessionCookie() {
  const cookieStore = await cookies();
  return cookieStore.toString();
}

const RATE_LIMIT_SECONDS = 10;

async function checkRateLimit(
  userId: string,
  action: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const rateLimit = await prisma.rateLimit.findUnique({
    where: { userId_action: { userId, action } }
  });

  if (!rateLimit) {
    return { allowed: true };
  }

  const elapsed = (Date.now() - rateLimit.lastAttempt.getTime()) / 1000;

  if (elapsed < RATE_LIMIT_SECONDS) {
    return {
      allowed: false,
      retryAfter: Math.ceil(RATE_LIMIT_SECONDS - elapsed)
    };
  }

  return { allowed: true };
}

async function setRateLimit(userId: string, action: string): Promise<void> {
  await prisma.rateLimit.upsert({
    where: { userId_action: { userId, action } },
    update: { lastAttempt: new Date() },
    create: { userId, action, lastAttempt: new Date() }
  });
}

export async function getConversations() {
  const session = await auth.api.getSession({
    headers: {
      cookie: await getSessionCookie()
    }
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ user1Id: session.user.id }, { user2Id: session.user.id }],
      // Só mostrar conversas que têm pelo menos uma mensagem
      messages: {
        some: {}
      }
    },
    include: {
      user1: true,
      user2: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  // Conta mensagens não lidas por conversa (apenas mensagens do outro usuário)
  const unreadCounts = await prisma.message.groupBy({
    by: ['conversationId'],
    where: {
      conversationId: { in: conversations.map((c) => c.id) },
      senderId: { not: session.user.id },
      isRead: false
    },
    _count: { id: true }
  });

  const unreadCountMap = new Map(
    unreadCounts.map((uc) => [uc.conversationId, uc._count.id])
  );

  return conversations.map((conv) => {
    const otherUser =
      conv.user1Id === session.user.id ? conv.user2 : conv.user1;
    const lastMessage = conv.messages[0];

    return {
      id: conv.id,
      name:
        otherUser.name || `Anônimo #${otherUser.id.slice(0, 4).toUpperCase()}`,
      image: otherUser.image,
      lastMessage: lastMessage?.content || '',
      lastMessageTime: lastMessage?.createdAt || conv.updatedAt,
      unreadCount: unreadCountMap.get(conv.id) || 0,
      lastSeenAt: otherUser.lastSeenAt,
      otherUserId: otherUser.id
    };
  });
}

export async function getFavoriteConversations() {
  const session = await auth.api.getSession({
    headers: {
      cookie: await getSessionCookie()
    }
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const favorites = await prisma.favoriteConversation.findMany({
    where: { userId: session.user.id },
    include: {
      conversation: {
        include: {
          user1: true,
          user2: true
        }
      }
    }
  });

  return favorites.map((fav) => {
    const otherUser =
      fav.conversation.user1Id === session.user.id
        ? fav.conversation.user2
        : fav.conversation.user1;

    return {
      id: fav.conversation.id,
      name:
        otherUser.name || `Anônimo #${otherUser.id.slice(0, 4).toUpperCase()}`,
      image: otherUser.image,
      lastSeenAt: otherUser.lastSeenAt,
      otherUserId: otherUser.id
    };
  });
}

export async function getConversationMessages(conversationId: string): Promise<{
  conversation: {
    id: string;
    name: string;
    image: string | null;
    lastSeenAt: Date | null;
    otherUserId: string;
    isBlocked: boolean;
  };
  messages: Array<{
    id: string;
    content: string | null;
    imageUrl: string | null;
    senderId: 'me' | 'other';
    createdAt: Date;
    isRead: boolean;
  }>;
}> {
  const session = await auth.api.getSession({
    headers: {
      cookie: await getSessionCookie()
    }
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      user1: true,
      user2: true,
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const isParticipant =
    conversation.user1Id === session.user.id ||
    conversation.user2Id === session.user.id;

  if (!isParticipant) {
    throw new Error('Unauthorized');
  }

  const otherUser =
    conversation.user1Id === session.user.id
      ? conversation.user2
      : conversation.user1;

  // Verifica se há bloqueio entre os usuários
  const block = await prisma.blockedUser.findFirst({
    where: {
      OR: [
        { blockerId: session.user.id, blockedId: otherUser.id },
        { blockerId: otherUser.id, blockedId: session.user.id }
      ]
    }
  });

  const isBlocked = !!block;

  return {
    conversation: {
      id: conversation.id,
      name:
        otherUser.name || `Anônimo #${otherUser.id.slice(0, 4).toUpperCase()}`,
      image: otherUser.image,
      lastSeenAt: otherUser.lastSeenAt,
      otherUserId: otherUser.id,
      isBlocked
    },
    messages: conversation.messages.map((msg) => {
      const senderId: 'me' | 'other' =
        msg.senderId === session.user.id ? 'me' : 'other';
      return {
        id: msg.id,
        content: msg.content,
        imageUrl: msg.imageUrl,
        senderId,
        createdAt: msg.createdAt,
        isRead: msg.isRead
      };
    })
  };
}

export async function sendMessage(
  conversationId: string,
  content: string,
  imageUrl?: string
): Promise<{
  id: string;
  content: string | null;
  imageUrl: string | null;
  senderId: 'me' | 'other';
  createdAt: Date;
  isRead: boolean;
}> {
  const session = await auth.api.getSession({
    headers: {
      cookie: await getSessionCookie()
    }
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId }
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const isParticipant =
    conversation.user1Id === session.user.id ||
    conversation.user2Id === session.user.id;

  if (!isParticipant) {
    throw new Error('Unauthorized');
  }

  // Verifica se há bloqueio entre os usuários
  const otherUserId =
    conversation.user1Id === session.user.id
      ? conversation.user2Id
      : conversation.user1Id;

  const block = await prisma.blockedUser.findFirst({
    where: {
      OR: [
        { blockerId: session.user.id, blockedId: otherUserId },
        { blockerId: otherUserId, blockedId: session.user.id }
      ]
    }
  });

  if (block) {
    throw new Error('Não é possível enviar mensagens para este usuário');
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: session.user.id,
      content: content || null,
      imageUrl: imageUrl || null
    }
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() }
  });

  return {
    id: message.id,
    content: message.content,
    imageUrl: message.imageUrl,
    senderId: 'me' as const,
    createdAt: message.createdAt,
    isRead: message.isRead
  };
}

export async function findRandomUser(): Promise<{
  success: boolean;
  conversationId?: string;
  error?: string;
  retryAfter?: number;
}> {
  const session = await auth.api.getSession({
    headers: {
      cookie: await getSessionCookie()
    }
  });

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const currentUserId = session.user.id;

  // Rate limiting
  const rateLimitCheck = await checkRateLimit(currentUserId, 'random_search');
  if (!rateLimitCheck.allowed) {
    return {
      success: false,
      error: `Aguarde ${rateLimitCheck.retryAfter}s para tentar novamente`,
      retryAfter: rateLimitCheck.retryAfter
    };
  }

  // Busca usuários online diretamente do servidor (não confia no cliente)
  const onlineUserIds = await getOnlineUserIdsFromServer();

  // Filtra o próprio usuário da lista de online
  const availableOnlineUsers = onlineUserIds.filter(
    (id) => id !== currentUserId
  );

  if (availableOnlineUsers.length === 0) {
    await setRateLimit(currentUserId, 'random_search');
    return {
      success: false,
      error: 'Nenhum usuário online no momento',
      retryAfter: RATE_LIMIT_SECONDS
    };
  }

  // Query única otimizada: busca usuário aleatório elegível
  // - Está na lista de online (validada no servidor)
  // - Não tem conversa COM mensagens com o usuário atual
  // - Não é um favorito do usuário atual
  // - Não está bloqueado (em nenhuma direção)
  const randomUserResult = await prisma.$queryRaw<{ id: string }[]>`
    SELECT u.id
    FROM "user" u
    WHERE u.id = ANY(${availableOnlineUsers}::text[])
      AND NOT EXISTS (
        SELECT 1 FROM "conversation" c
        WHERE (
          (c."user1Id" = ${currentUserId} AND c."user2Id" = u.id)
          OR (c."user1Id" = u.id AND c."user2Id" = ${currentUserId})
        )
        AND EXISTS (SELECT 1 FROM "message" m WHERE m."conversationId" = c.id)
      )
      AND NOT EXISTS (
        SELECT 1 FROM "favorite_conversation" fc
        JOIN "conversation" c2 ON fc."conversationId" = c2.id
        WHERE fc."userId" = ${currentUserId}
          AND (
            (c2."user1Id" = ${currentUserId} AND c2."user2Id" = u.id)
            OR (c2."user1Id" = u.id AND c2."user2Id" = ${currentUserId})
          )
      )
      AND NOT EXISTS (
        SELECT 1 FROM "blocked_user" bu
        WHERE (bu."blockerId" = ${currentUserId} AND bu."blockedId" = u.id)
           OR (bu."blockerId" = u.id AND bu."blockedId" = ${currentUserId})
      )
    ORDER BY RANDOM()
    LIMIT 1
  `;

  if (randomUserResult.length === 0) {
    await setRateLimit(currentUserId, 'random_search');
    return {
      success: false,
      error: 'Nenhum usuário disponível no momento',
      retryAfter: RATE_LIMIT_SECONDS
    };
  }

  const randomUserId = randomUserResult[0].id;

  // Verifica se já existe uma conversa VAZIA com esse usuário (para reutilizar)
  const existingEmptyConversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { user1Id: currentUserId, user2Id: randomUserId },
        { user1Id: randomUserId, user2Id: currentUserId }
      ],
      messages: { none: {} }
    }
  });

  if (existingEmptyConversation) {
    return { success: true, conversationId: existingEmptyConversation.id };
  }

  // Cria nova conversa apenas se não existir nenhuma
  const newConversation = await prisma.conversation.create({
    data: {
      user1Id: currentUserId,
      user2Id: randomUserId
    }
  });

  return { success: true, conversationId: newConversation.id };
}

export async function markMessagesAsRead(
  conversationId: string
): Promise<void> {
  const session = await auth.api.getSession({
    headers: {
      cookie: await getSessionCookie()
    }
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Marca como lidas apenas mensagens enviadas pelo outro usuário
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: session.user.id },
      isRead: false
    },
    data: { isRead: true }
  });
}

export async function isFavorite(conversationId: string): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: {
      cookie: await getSessionCookie()
    }
  });

  if (!session?.user?.id) {
    return false;
  }

  const favorite = await prisma.favoriteConversation.findUnique({
    where: {
      userId_conversationId: {
        userId: session.user.id,
        conversationId
      }
    }
  });

  return !!favorite;
}

export async function toggleFavorite(conversationId: string): Promise<{
  success: boolean;
  isFavorite: boolean;
  error?: string;
}> {
  const session = await auth.api.getSession({
    headers: {
      cookie: await getSessionCookie()
    }
  });

  if (!session?.user?.id) {
    return { success: false, isFavorite: false, error: 'Unauthorized' };
  }

  // Verifica se a conversa existe e o usuário é participante
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId }
  });

  if (!conversation) {
    return {
      success: false,
      isFavorite: false,
      error: 'Conversation not found'
    };
  }

  const isParticipant =
    conversation.user1Id === session.user.id ||
    conversation.user2Id === session.user.id;

  if (!isParticipant) {
    return { success: false, isFavorite: false, error: 'Unauthorized' };
  }

  // Verifica se já é favorito
  const existingFavorite = await prisma.favoriteConversation.findUnique({
    where: {
      userId_conversationId: {
        userId: session.user.id,
        conversationId
      }
    }
  });

  if (existingFavorite) {
    // Remove dos favoritos
    await prisma.favoriteConversation.delete({
      where: { id: existingFavorite.id }
    });
    return { success: true, isFavorite: false };
  } else {
    // Adiciona aos favoritos
    await prisma.favoriteConversation.create({
      data: {
        userId: session.user.id,
        conversationId
      }
    });
    return { success: true, isFavorite: true };
  }
}
