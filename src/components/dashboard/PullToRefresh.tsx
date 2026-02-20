import { useState, useRef, useCallback, type ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
}

export const PullToRefresh = ({ onRefresh, children }: PullToRefreshProps) => {
  const isMobile = useIsMobile();
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const THRESHOLD = 80;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!pulling || refreshing) return;
      const diff = e.touches[0].clientY - startY.current;
      if (diff > 0) {
        setPullDistance(Math.min(diff * 0.5, 120));
      }
    },
    [pulling, refreshing]
  );

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullDistance(THRESHOLD);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    setPulling(false);
    setPullDistance(0);
  }, [pullDistance, refreshing, onRefresh]);

  if (!isMobile) return <>{children}</>;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      {(pullDistance > 0 || refreshing) && (
        <div
          className="flex items-center justify-center transition-all"
          style={{ height: refreshing ? THRESHOLD : pullDistance }}
        >
          <Loader2
            className={`w-5 h-5 text-muted-foreground ${refreshing ? "animate-spin" : ""}`}
            style={{
              opacity: Math.min(pullDistance / THRESHOLD, 1),
              transform: `rotate(${pullDistance * 3}deg)`,
            }}
          />
        </div>
      )}
      {children}
    </div>
  );
};
