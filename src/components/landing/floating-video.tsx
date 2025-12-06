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
import Orb from '../Orb';

interface FloatingVideoProps {
  src: string;
  frameCount?: number;
  containerRef: RefObject<HTMLDivElement | null>;
}

function processFrameDataFast(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const threshold = 30;
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    if (
      data[i] < threshold &&
      data[i + 1] < threshold &&
      data[i + 2] < threshold
    ) {
      data[i + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// Generate extraction order: key frames first, then fill gaps
function getExtractionOrder(frameCount: number): number[] {
  const order: number[] = [];
  const added = new Set<number>();

  // Pass 1: Key frames (0%, 25%, 50%, 75%, 100%)
  const keyFrames = [
    0,
    Math.floor(frameCount * 0.25),
    Math.floor(frameCount * 0.5),
    Math.floor(frameCount * 0.75),
    frameCount - 1
  ];
  for (const f of keyFrames) {
    if (!added.has(f)) {
      order.push(f);
      added.add(f);
    }
  }

  // Pass 2: Fill gaps with 12.5% intervals
  const pass2 = [
    Math.floor(frameCount * 0.125),
    Math.floor(frameCount * 0.375),
    Math.floor(frameCount * 0.625),
    Math.floor(frameCount * 0.875)
  ];
  for (const f of pass2) {
    if (!added.has(f)) {
      order.push(f);
      added.add(f);
    }
  }

  // Pass 3: Remaining frames in order
  for (let i = 0; i < frameCount; i++) {
    if (!added.has(i)) {
      order.push(i);
      added.add(i);
    }
  }

  return order;
}

export function FloatingVideo({
  src,
  frameCount = 60,
  containerRef
}: FloatingVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(ImageBitmap | null)[]>(
    new Array(frameCount).fill(null)
  );
  const [hasFirstFrame, setHasFirstFrame] = useState(false);
  const currentFrameRef = useRef(-1);
  const rafRef = useRef<number>(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  const xPosition = useTransform(scrollYProgress, [0, 1], ['0%', '-100%']);
  const yPosition = useTransform(scrollYProgress, [0, 1], ['15%', '25%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 0.9, 1], [1, 1, 0.6]);

  const floatY = useMotionValue(0);
  const floatRotate = useMotionValue(0);
  const smoothFloatY = useSpring(floatY, { stiffness: 50, damping: 20 });
  const smoothFloatRotate = useSpring(floatRotate, {
    stiffness: 50,
    damping: 20
  });

  const [isIdle, setIsIdle] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (value) => {
      setIsIdle(value < 0.02);
    });
    return unsubscribe;
  }, [scrollYProgress]);

  useEffect(() => {
    if (!isIdle) {
      floatY.set(0);
      floatRotate.set(0);
      return;
    }

    const floatAnimation = animate(floatY, [0, -15, 0], {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut'
    });

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

  // Find nearest available frame
  const findNearestFrame = useCallback(
    (targetIndex: number): number => {
      const frames = framesRef.current;
      if (frames[targetIndex]) return targetIndex;

      // Search outward from target
      for (let offset = 1; offset < frameCount; offset++) {
        if (targetIndex - offset >= 0 && frames[targetIndex - offset]) {
          return targetIndex - offset;
        }
        if (targetIndex + offset < frameCount && frames[targetIndex + offset]) {
          return targetIndex + offset;
        }
      }
      return 0;
    },
    [frameCount]
  );

  const drawFrame = useCallback(
    (progress: number) => {
      const frames = framesRef.current;
      if (!frames.some((f) => f !== null)) return;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        const targetFrame = Math.min(
          Math.floor(progress * (frameCount - 1)),
          frameCount - 1
        );
        const frameIndex = findNearestFrame(targetFrame);

        if (frameIndex !== currentFrameRef.current && frames[frameIndex]) {
          currentFrameRef.current = frameIndex;
          const frame = frames[frameIndex]!;

          if (canvas.width !== frame.width || canvas.height !== frame.height) {
            canvas.width = frame.width;
            canvas.height = frame.height;
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(frame, 0, 0);
        }
      });
    },
    [frameCount, findNearestFrame]
  );

  useEffect(() => {
    if (!hasFirstFrame) return;
    const unsubscribe = scrollYProgress.on('change', drawFrame);
    return unsubscribe;
  }, [hasFirstFrame, scrollYProgress, drawFrame]);

  useEffect(() => {
    let isCancelled = false;
    const video = document.createElement('video');

    const loadVideo = async () => {
      video.src = src;
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.crossOrigin = 'anonymous';

      await new Promise<void>((resolve) => {
        video.onloadeddata = () => resolve();
        video.load();
      });

      if (isCancelled) return;

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      const duration = video.duration;

      const extractionOrder = getExtractionOrder(frameCount);

      for (let i = 0; i < extractionOrder.length; i++) {
        if (isCancelled) break;

        const frameIndex = extractionOrder[i];
        const time = (frameIndex / (frameCount - 1)) * duration;
        video.currentTime = time;

        await new Promise<void>((resolve) => {
          video.onseeked = () => resolve();
        });

        ctx.drawImage(video, 0, 0);
        processFrameDataFast(ctx, canvas.width, canvas.height);
        const bitmap = await createImageBitmap(canvas);

        framesRef.current[frameIndex] = bitmap;

        // First frame extracted: show and enable animation
        if (i === 0) {
          const displayCanvas = canvasRef.current;
          if (displayCanvas) {
            displayCanvas.width = bitmap.width;
            displayCanvas.height = bitmap.height;
            const displayCtx = displayCanvas.getContext('2d', { alpha: true });
            if (displayCtx) {
              displayCtx.clearRect(
                0,
                0,
                displayCanvas.width,
                displayCanvas.height
              );
              displayCtx.drawImage(bitmap, 0, 0);
            }
          }
          setHasFirstFrame(true);
        }

        // Yield every 3 frames
        if (i % 3 === 0 && i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
    };

    loadVideo();

    return () => {
      isCancelled = true;
      video.src = '';
    };
  }, [src, frameCount]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

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
      className='pointer-events-none fixed top-0 left-1/2 z-50 h-[400px] w-[400px] md:h-[500px] md:w-[500px] lg:h-[700px] lg:w-[700px]'
    >
      <div
        style={{
          width: '100%',
          height: '600px',
          position: 'relative',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10
        }}
        className='pointer-events-auto'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Orb
          hoverIntensity={1}
          rotateOnHover={true}
          hue={105}
          forceHoverState={isHovered}
        />
      </div>
      {!hasFirstFrame && (
        <div className='flex h-full w-full items-center justify-center'>
          <div className='border-primary h-12 w-12 animate-spin rounded-full border-3 border-t-transparent' />
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={`h-full w-full object-contain ${hasFirstFrame ? 'block' : 'hidden'}`}
      />
    </motion.div>
  );
}
