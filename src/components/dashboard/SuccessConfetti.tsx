import { useEffect } from "react";
import confetti from "canvas-confetti";

interface SuccessConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

export const SuccessConfetti = ({ trigger, onComplete }: SuccessConfettiProps) => {
  useEffect(() => {
    if (!trigger) return;

    // Black & white confetti for premium B&W aesthetic
    const colors = ["#000000", "#333333", "#666666", "#999999", "#ffffff"];

    // First burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6, x: 0.5 },
      colors,
      ticks: 200,
      gravity: 1.2,
      scalar: 1.2,
      shapes: ["square", "circle"],
    });

    // Second burst (delayed)
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 100,
        origin: { y: 0.7, x: 0.3 },
        colors,
        ticks: 150,
        gravity: 1,
      });
    }, 150);

    // Third burst (delayed)
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 100,
        origin: { y: 0.7, x: 0.7 },
        colors,
        ticks: 150,
        gravity: 1,
      });
    }, 300);

    // Notify completion after animation
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [trigger, onComplete]);

  return null; // This component doesn't render anything
};
