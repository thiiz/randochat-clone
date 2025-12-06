import { ExpandableAvatar } from '@/components/expandable-avatar';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import {
  Check,
  CheckCheck,
  AlertCircle,
  RotateCcw,
  Loader2
} from 'lucide-react';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string | null;
    imageUrl: string | null;
    senderId: 'me' | 'other';
    createdAt: Date;
    isRead: boolean;
    status?: 'sending' | 'sent' | 'failed';
  };
  isMe: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  showAvatar: boolean;
  avatarSrc?: string | null;
  initials: string;
  userName: string;
  onRetry?: (messageId: string) => void;
}

export function MessageBubble({
  message,
  isMe,
  isFirstInGroup,
  isLastInGroup,
  showAvatar,
  avatarSrc,
  initials,
  userName,
  onRetry
}: MessageBubbleProps) {
  const isFailed = message.status === 'failed';
  const isSending = message.status === 'sending';
  // Border radius logic
  const roundedClass = isMe
    ? cn(
        'rounded-2xl',
        isFirstInGroup && 'rounded-tr-2xl',
        !isFirstInGroup && 'rounded-tr-sm',
        isLastInGroup && 'rounded-br-2xl',
        !isLastInGroup && 'rounded-br-sm'
      )
    : cn(
        'rounded-2xl',
        isFirstInGroup && 'rounded-tl-2xl',
        !isFirstInGroup && 'rounded-tl-sm',
        isLastInGroup && 'rounded-bl-2xl',
        !isLastInGroup && 'rounded-bl-sm'
      );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'mb-0.5 flex w-full gap-2',
        isMe ? 'justify-end' : 'justify-start',
        isLastInGroup && 'mb-3'
      )}
    >
      {!isMe && (
        <div className='flex w-8 shrink-0 flex-col justify-end'>
          {showAvatar ? (
            <ExpandableAvatar
              src={avatarSrc}
              fallback={initials}
              name={userName}
              size='sm'
            />
          ) : (
            <div className='w-8' />
          )}
        </div>
      )}

      <div
        className={cn(
          'relative max-w-[80%] px-4 py-2 shadow-sm sm:max-w-[70%]',
          isMe
            ? isFailed
              ? 'bg-destructive/80 text-destructive-foreground'
              : 'bg-primary text-primary-foreground'
            : 'bg-muted/80 text-foreground dark:bg-muted/50',
          isSending && 'opacity-70',
          roundedClass
        )}
      >
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt='Attachment'
            className='mb-2 max-w-full rounded-lg'
          />
        )}

        {message.content && (
          <p className='text-sm leading-relaxed break-words whitespace-pre-wrap'>
            {message.content}
          </p>
        )}

        <div
          className={cn(
            'mt-1 flex items-center gap-1 select-none',
            isMe
              ? 'text-primary-foreground/70 justify-end'
              : 'text-muted-foreground justify-start',
            isFailed && 'text-destructive-foreground/70'
          )}
        >
          {isMe && (
            <span>
              {isSending ? (
                <Loader2 className='h-3 w-3 animate-spin' />
              ) : isFailed ? (
                <AlertCircle className='h-3 w-3' />
              ) : message.isRead ? (
                <CheckCheck className='h-3 w-3' />
              ) : (
                <Check className='h-3 w-3' />
              )}
            </span>
          )}
          <span className='text-[10px]'>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })}
          </span>
        </div>
      </div>

      {/* Botão de retry para mensagens com falha */}
      {isFailed && onRetry && (
        <button
          onClick={() => onRetry(message.id)}
          className='text-destructive hover:text-destructive/80 flex items-center gap-1 self-center transition-colors'
          title='Tentar novamente'
        >
          <RotateCcw className='h-4 w-4' />
        </button>
      )}
    </motion.div>
  );
}
