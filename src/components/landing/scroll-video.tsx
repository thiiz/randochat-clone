'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface ScrollVideoProps {
  src: string;
  className?: string;
  frameCount?: number;
  /** Ref do container que define o range do scroll (start → end) */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

// Helper function to process frame data (remove black background)
async function processFrameData(
  canvas: HTMLCanvasElement
): Promise<ImageBitmap> {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const threshold = 30;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (r < threshold && g < threshold && b < threshold) {
      data[i + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return createImageBitmap(canvas);
}

export function ScrollVideo({
  src,
  className,
  frameCount = 120,
  scrollContainerRef
}: ScrollVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frames, setFrames] = useState<ImageBitmap[]>([]);
  const [isReady, setIsReady] = useState(false);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number>(0);

  // Use scroll progress based on container ref or window
  const { scrollYProgress } = useScroll(
    scrollContainerRef?.current
      ? {
          target: scrollContainerRef,
          offset: ['start start', 'end end']
        }
      : undefined
  );

  // Extract frames from video
  useEffect(() => {
    const video = document.createElement('video');
    video.src = src;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';

    const extractFrames = async () => {
      await new Promise<void>((resolve) => {
        video.onloadeddata = () => resolve();
        video.load();
      });

      const duration = video.duration;
      const extractedFrames: ImageBitmap[] = [];
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d')!;

      for (let i = 0; i < frameCount; i++) {
        const time = (i / (frameCount - 1)) * duration;
        video.currentTime = time;

        await new Promise<void>((resolve) => {
          video.onseeked = () => resolve();
        });

        ctx.drawImage(video, 0, 0);
        const bitmap = await processFrameData(canvas);
        extractedFrames.push(bitmap);
      }

      setFrames(extractedFrames);
      setIsReady(true);
    };

    extractFrames();

    return () => {
      video.src = '';
    };
  }, [src, frameCount]);

  // Draw frame based on scroll
  const drawFrame = useCallback(
    (progress: number) => {
      if (!isReady || frames.length === 0) return;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        const frameIndex = Math.min(
          Math.max(Math.floor(progress * (frames.length - 1)), 0),
          frames.length - 1
        );

        if (frameIndex !== currentFrameRef.current) {
          currentFrameRef.current = frameIndex;
          const frame = frames[frameIndex];

          if (canvas.width !== frame.width || canvas.height !== frame.height) {
            canvas.width = frame.width;
            canvas.height = frame.height;
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(frame, 0, 0);
        }
      });
    },
    [isReady, frames]
  );

  // Draw first frame when ready
  useEffect(() => {
    if (!isReady || frames.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const firstFrame = frames[0];
    canvas.width = firstFrame.width;
    canvas.height = firstFrame.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(firstFrame, 0, 0);
    currentFrameRef.current = 0;
  }, [isReady, frames]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Sync with scroll
  useEffect(() => {
    if (!isReady) return;
    const unsubscribe = scrollYProgress.on('change', drawFrame);
    return unsubscribe;
  }, [isReady, scrollYProgress, drawFrame]);

  return (
    <div className={`relative ${className || ''}`}>
      {!isReady && (
        <div className='flex h-full w-full items-center justify-center'>
          <div className='border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent' />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`h-auto w-full ${isReady ? 'block' : 'hidden'}`}
      />
    </div>
  );
}
