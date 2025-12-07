import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Send, Smile, Image as ImageIcon } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onTyping: () => void;
  onStopTyping: () => void;
  sending: boolean;
  disabled?: boolean;
  disabledMessage?: string;
  className?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onTyping,
  onStopTyping,
  sending,
  disabled,
  disabledMessage,
  className
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !sending) {
        onSend();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    if (e.target.value.trim()) {
      onTyping();
    } else {
      onStopTyping();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  return (
    <footer
      className={cn(
        'bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky bottom-0 z-10 border-t p-2 backdrop-blur-md sm:p-4',
        className
      )}
    >
      <div className='mx-auto flex max-w-3xl items-end gap-2'>
        <div className='flex shrink-0 gap-0.5 sm:gap-1'>
          <Button
            variant='ghost'
            size='icon'
            className='text-muted-foreground hover:bg-muted hover:text-foreground h-9 w-9 shrink-0 rounded-full'
          >
            <Smile className='h-5 w-5' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='text-muted-foreground hover:bg-muted hover:text-foreground h-9 w-9 shrink-0 rounded-full'
          >
            <ImageIcon className='h-5 w-5' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='text-muted-foreground hover:bg-muted hover:text-foreground hidden h-9 w-9 shrink-0 rounded-full sm:inline-flex'
          >
            <Paperclip className='h-5 w-5' />
          </Button>
        </div>

        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={onStopTyping}
          placeholder={
            disabled && disabledMessage ? disabledMessage : 'Mensagem...'
          }
          className='scrollbar-hide max-h-[200px] min-h-[44px] w-full resize-none border-0 bg-transparent px-4 py-3 shadow-none focus-visible:ring-0'
          rows={1}
          disabled={sending || disabled}
        />

        <Button
          size='icon'
          className={cn(
            'h-11 w-11 shrink-0 rounded-full shadow-sm transition-all duration-200',
            value.trim() && !disabled
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
          onClick={onSend}
          disabled={sending || !value.trim() || disabled}
        >
          <Send className={cn('h-5 w-5', value.trim() && 'ml-0.5')} />
        </Button>
      </div>
    </footer>
  );
}
