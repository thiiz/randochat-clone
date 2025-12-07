import { parseDate } from './date';

// Tempo em minutos para considerar um usuário online
export const ONLINE_THRESHOLD_MINUTES = 5;

/**
 * Normaliza a data para garantir interpretação correta de timezone.
 * Se for string, usa parseDate. Se já for Date, usa diretamente.
 */
function normalizeDate(date: Date | string): Date {
  if (typeof date === 'string') {
    return parseDate(date);
  }
  return date;
}

export function isUserOnline(lastSeenAt: Date | null | undefined): boolean {
  if (!lastSeenAt) return false;

  const now = new Date();
  const lastSeen = normalizeDate(lastSeenAt);
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  return diffMinutes <= ONLINE_THRESHOLD_MINUTES;
}

export function getLastSeenText(lastSeenAt: Date | null | undefined): string {
  if (!lastSeenAt) return 'Nunca visto';

  const now = new Date();
  const lastSeen = normalizeDate(lastSeenAt);
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Agora mesmo';
  if (diffMinutes < 60) return `Visto há ${diffMinutes} min`;
  if (diffHours < 24) return `Visto há ${diffHours}h`;
  if (diffDays === 1) return 'Visto ontem';
  return `Visto há ${diffDays} dias`;
}
