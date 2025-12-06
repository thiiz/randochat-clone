'use client';

import { useRef, useEffect, useState, useCallback, RefObject } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  animate
} from 'motion/react';

interface FloatingVideoProps {
  src: string;
  frameCount?: number;
  containerRef: RefObject<HTMLDivElement | null>;
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

export function FloatingVideo({
  src,
  frameCount = 120,
  containerRef
}: FloatingVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frames, setFrames] = useState<ImageBitmap[]>([]);
  const [isReady, setIsReady] = useState(false);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number>(0);

  // Track scroll progress based on the container ref passed from parent
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Video position: starts next to hero text (right side) and moves to left
  const xPosition = useTransform(scrollYProgress, [0, 1], ['0%', '-100%']);

  // Video vertical position: centered vertically, moves down slightly
  const yPosition = useTransform(scrollYProgress, [0, 1], ['15%', '25%']);

  // Scale: starts at normal size and gets slightly smaller
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);

  // Opacity: always visible, slight fade at end
  const opacity = useTransform(scrollYProgress, [0, 0.9, 1], [1, 1, 0.6]);

  // Idle floating animation
  const floatY = useMotionValue(0);
  const floatRotate = useMotionValue(0);
  const smoothFloatY = useSpring(floatY, { stiffness: 50, damping: 20 });
  const smoothFloatRotate = useSpring(floatRotate, {
    stiffness: 50,
    damping: 20
  });

  // Check if user is at the top (idle state)
  const [isIdle, setIsIdle] = useState(true);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (value) => {
      setIsIdle(value < 0.02);
    });
    return unsubscribe;
  }, [scrollYProgress]);

  // Idle floating animation loop
  useEffect(() => {
    if (!isIdle) {
      floatY.set(0);
      floatRotate.set(0);
      return;
    }

    // Animate floating up and down
    const floatAnimation = animate(floatY, [0, -15, 0], {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut'
    });

    // Subtle rotation
    const rotateAnimation = animate(floatRotate, [0, 2, 0, -2, 0], {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut'
    });

    return () => {
      floatAnimation.stop();
      rotateAnimation.stop();
    };
  }, [isIdle, floatY, floatRotate]);

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
    <motion.div
      style={{
        x: xPosition,
        y: yPosition,
        scale,
        opacity,
        translateY: smoothFloatY,
        rotate: smoothFloatRotate
      }}
      className='pointer-events-none fixed top-0 left-1/2 z-0 h-[400px] w-[400px] md:h-[500px] md:w-[500px] lg:h-[700px] lg:w-[700px]'
    >
      {/* Loading state */}
      {!isReady && (
        <div className='flex h-full w-full items-center justify-center'>
          <div className='border-primary h-12 w-12 animate-spin rounded-full border-3 border-t-transparent' />
        </div>
      )}

      {/* Canvas for frames */}
      <canvas
        ref={canvasRef}
        className={`h-full w-full object-contain ${isReady ? 'block' : 'hidden'}`}
      />
    </motion.div>
  );
}
