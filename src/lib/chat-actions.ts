'use server';

import { cookies } from 'next/headers';
import { auth } from './auth';
import prisma from './prisma';

async function getSessionCookie() {
  const cookieStore = await cookies();
  return cookieStore.toString();
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
      OR: [{ user1Id: session.user.id }, { user2Id: session.user.id }]
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

  return conversations.map((conv) => {
    const otherUser = conv.user1Id === session.user.id ? conv.user2 : conv.user1;
    const lastMessage = conv.messages[0];

    return {
      id: conv.id,
      name: otherUser.name || `Anônimo #${otherUser.id.slice(0, 4).toUpperCase()}`,
      image: otherUser.image,
      lastMessage: lastMessage?.content || '',
      lastMessageTime: lastMessage?.createdAt || conv.updatedAt,
      unreadCount: lastMessage ? (lastMessage.isRead ? 0 : 1) : 0,
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
      name: otherUser.name || `Anônimo #${otherUser.id.slice(0, 4).toUpperCase()}`,
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

  return {
    conversation: {
      id: conversation.id,
      name: otherUser.name || `Anônimo #${otherUser.id.slice(0, 4).toUpperCase()}`,
      image: otherUser.image,
      lastSeenAt: otherUser.lastSeenAt,
      otherUserId: otherUser.id
    },
    messages: conversation.messages.map((msg) => {
      const senderId: 'me' | 'other' = msg.senderId === session.user.id ? 'me' : 'other';
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
