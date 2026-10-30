'use client';

import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { ArrowLeft } from 'lucide-react';

type DockEdge = 'left' | 'right';

const IDLE_DELAY_MS = 30_000;
const EDGE_GAP_PX = 16;

export default function ReturnToCentralButton() {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragRef = useRef({
    pointerId: -1,
    startX: 0,
    startLeft: 0,
    moved: false,
  });
  const suppressClickRef = useRef(false);
  const [left, setLeft] = useState(0);
  const [edge, setEdge] = useState<DockEdge>('right');
  const [isTucked, setIsTucked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);

  const centralDashboardUrl = `${(
    process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || 'http://localhost:3000'
  ).replace(/\/+$/, '')}/dashboard`;

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = null;
  }, []);

  const scheduleTuck = useCallback(() => {
    clearIdleTimer();
    idleTimerRef.current = setTimeout(() => setIsTucked(true), IDLE_DELAY_MS);
  }, [clearIdleTimer]);

  useEffect(() => {
    const positionAtEdge = () => {
      const width = buttonRef.current?.offsetWidth ?? 48;
      setLeft(edge === 'right' ? Math.max(EDGE_GAP_PX, window.innerWidth - width - EDGE_GAP_PX) : EDGE_GAP_PX);
      setIsPositioned(true);
    };

    positionAtEdge();
    scheduleTuck();
    window.addEventListener('resize', positionAtEdge);

    return () => {
      window.removeEventListener('resize', positionAtEdge);
      clearIdleTimer();
    };
  }, [clearIdleTimer, edge, scheduleTuck]);

  const reveal = () => {
    setIsTucked(false);
    scheduleTuck();
  };

  const handlePointerDown = (event: PointerEvent<HTMLAnchorElement>) => {
    if (event.button !== 0) return;
    clearIdleTimer();

    const rect = event.currentTarget.getBoundingClientRect();
    const startLeft = rect.left;
    setLeft(startLeft);
    setIsTucked(false);
    setIsDragging(true);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startLeft,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerId !== dragRef.current.pointerId) return;
    const deltaX = event.clientX - dragRef.current.startX;
    if (Math.abs(deltaX) > 4) dragRef.current.moved = true;
    if (!dragRef.current.moved) return;

    const width = event.currentTarget.offsetWidth;
    const maxLeft = Math.max(0, window.innerWidth - width);
    setLeft(Math.min(maxLeft, Math.max(0, dragRef.current.startLeft + deltaX)));
  };

  const handlePointerUp = (event: PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerId !== dragRef.current.pointerId) return;
    const moved = dragRef.current.moved;
    const width = event.currentTarget.offsetWidth;
    const dragLeft = dragRef.current.startLeft + (event.clientX - dragRef.current.startX);
    const midpoint = dragLeft + width / 2;
    const nextEdge: DockEdge = midpoint < window.innerWidth / 2 ? 'left' : 'right';
    setEdge(nextEdge);
    setLeft(nextEdge === 'left' ? EDGE_GAP_PX : Math.max(EDGE_GAP_PX, window.innerWidth - width - EDGE_GAP_PX));
    setIsDragging(false);
    dragRef.current.pointerId = -1;

    if (moved) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
    scheduleTuck();
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  };

  const tuckTransform = edge === 'right'
    ? 'translateX(calc(50% + 16px))'
    : 'translateX(calc(-50% - 16px))';

  return (
    <a
      ref={buttonRef}
      href={centralDashboardUrl}
      aria-label="Back to your CHS dashboard"
      title="Back to your CHS dashboard"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerEnter={reveal}
      onPointerLeave={scheduleTuck}
      onFocus={() => {
        clearIdleTimer();
        setIsTucked(false);
      }}
      onBlur={scheduleTuck}
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[60] flex h-11 w-11 touch-none select-none cursor-grab items-center justify-center gap-2 rounded-full bg-orange-600 text-white shadow-lg shadow-orange-950/20 transition-[transform,background-color,box-shadow] duration-300 hover:bg-orange-700 hover:shadow-xl active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 md:bottom-24 md:h-11 md:w-auto md:px-4"
      style={{
        left,
        transform: isTucked ? tuckTransform : 'translateX(0)',
        transition: isDragging ? 'none' : undefined,
        visibility: isPositioned ? 'visible' : 'hidden',
      }}
    >
      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="hidden whitespace-nowrap text-sm font-semibold md:inline">Back to CHS</span>
    </a>
  );
}
