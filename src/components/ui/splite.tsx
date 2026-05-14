"use client";

import { Suspense, lazy, useEffect, useRef } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface SplineSceneProps {
  scene: string;
  className?: string;
  trackDocumentPointer?: boolean;
}

export function SplineScene({
  scene,
  className,
  trackDocumentPointer = false,
}: SplineSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trackDocumentPointer) return;

    const forwardPointer = (event: PointerEvent) => {
      const canvas = containerRef.current?.querySelector("canvas");
      if (!canvas) return;

      canvas.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          clientX: event.clientX,
          clientY: event.clientY,
          pointerId: event.pointerId,
          pointerType: event.pointerType,
        }),
      );
      canvas.dispatchEvent(
        new MouseEvent("mousemove", {
          bubbles: true,
          clientX: event.clientX,
          clientY: event.clientY,
        }),
      );
    };

    window.addEventListener("pointermove", forwardPointer, { passive: true });
    return () => window.removeEventListener("pointermove", forwardPointer);
  }, [trackDocumentPointer]);

  return (
    <div ref={containerRef} className="h-full w-full">
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          </div>
        }
      >
        <Spline scene={scene} className={className} />
      </Suspense>
    </div>
  );
}
