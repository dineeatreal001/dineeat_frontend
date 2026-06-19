"use client";
import { useEffect, useState, useRef } from "react";

export default function LoadingScreen({ onComplete }) {
  const [phase, setPhase] = useState("typing");
  const [visibleCount, setVisibleCount] = useState(0);
  const [burst, setBurst] = useState(false);
  const [expand, setExpand] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const timeouts = useRef([]);
  
  const letters = ["D", "i", "n", "e", "E", "a", "t"];

  const clear = () => timeouts.current.forEach(clearTimeout);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      clear();
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Step 1 — reveal letters one by one
    letters.forEach((_, i) => {
      const t = setTimeout(() => {
        setVisibleCount(i + 1);
      }, 100 + i * 100);
      timeouts.current.push(t);
    });

    // Step 2 — after all letters visible, start shine loop
    const shineStart = setTimeout(() => {
      setPhase("shining");
    }, 100 + letters.length * 100 + 200);
    timeouts.current.push(shineStart);

    // Step 3 — trigger expand and burst animation after 5 seconds
    const expandTimer = setTimeout(() => {
      setExpand(true);
      setPhase("exploding");
      setTimeout(() => {
        setBurst(true);
      }, 500);
      const done = setTimeout(() => onComplete?.(), 1000);
      timeouts.current.push(done);
    }, 5000);
    timeouts.current.push(expandTimer);

    return clear;
  }, [isMounted, onComplete]);

  // Don't render anything during SSR
  if (!isMounted) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#0b1512] overflow-hidden
      transition-opacity duration-800 ${burst ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
    >
      {/* Expanding white background on exit */}
      <div className={`absolute inset-0 bg-gradient-radial from-[rgba(74,222,128,0.2)] to-transparent
        transition-transform duration-800 ${expand ? 'scale-[20]' : 'scale-0'}`}
        style={{ pointerEvents: 'none' }}
      />

      {/* Radial glow behind text */}
      <div className={`absolute w-[620px] h-[280px] rounded-full bg-gradient-radial from-[rgba(74,222,128,0.12)] to-transparent
        transition-opacity duration-400 ${phase === 'shining' ? 'opacity-100' : 'opacity-0'}
        ${expand ? 'scale-[3]' : 'scale-100'}`}
      />

      {/* Letter container with expand animation */}
      <div className={`flex items-baseline gap-0 relative transition-all duration-600
        ${expand ? 'scale-[3.5] opacity-0 blur-[20px]' : 'scale-100 opacity-100 blur-0'}`}
      >
        {letters.map((letter, i) => {
          const visible = i < visibleCount;
          const isEatPart = i >= 4;
          const isShining = phase === "shining";
          
          // Determine gradient and color
          let gradientClass = "";
          let textColor = "";
          
          if (isEatPart) {
            if (isShining) {
              gradientClass = "bg-gradient-to-r from-[#4ade80] via-white to-[#4ade80] bg-[length:200%_100%]";
              textColor = "text-transparent";
            } else {
              textColor = "text-[#4ade80]";
            }
          } else {
            if (isShining) {
              gradientClass = "bg-gradient-to-r from-white via-white to-white bg-[length:200%_100%]";
              textColor = "text-transparent";
            } else {
              textColor = "text-white";
            }
          }
          
          return (
            <span
              key={i}
              className={`inline-block font-extrabold relative overflow-hidden
                ${gradientClass} ${textColor} bg-clip-text
                transition-all duration-380
                ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-[22px] scale-85'}`}
              style={{
                fontSize: "clamp(56px, 9vw, 96px)",
                letterSpacing: "-0.02em",
                transitionDelay: `${i * 0.04}s`,
                textShadow: isShining && isEatPart ? "0 0 20px rgba(74,222,128,0.3)" : "none",
                marginLeft: i === 4 ? "0.12em" : 0,
                backgroundSize: "200% 100%",
                animation: isShining ? `shineText 2s ease-in-out ${i * 0.05}s infinite` : "none",
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>

      {/* Subtle tagline */}
      <p className={`absolute bottom-[calc(50%-90px)] left-1/2 text-[13px] tracking-[0.25em] 
        text-white/25 font-normal whitespace-nowrap uppercase
        transition-all duration-600 ${visibleCount === letters.length && !expand ? 'opacity-100' : 'opacity-0'}
        ${expand ? '-translate-x-1/2 scale-80' : '-translate-x-1/2'}`}
        style={{ left: '50%', transform: expand ? 'translateX(-50%) scale(0.8)' : 'translateX(-50%)' }}
      >
        Your restaurant, managed.
      </p>

      {/* Dot-pulse loader */}
      <div className={`absolute bottom-[calc(50%-130px)] left-1/2 flex gap-2
        transition-opacity duration-500 ${phase === "shining" && !expand ? 'opacity-100' : 'opacity-0'}`}
        style={{ left: '50%', transform: 'translateX(-50%)' }}
      >
        {[0, 1, 2].map((d) => (
          <span
            key={d}
            className="w-1.5 h-1.5 rounded-full bg-[#4ade80]"
            style={{
              animation: `dotPulse 1.2s ease-in-out ${d * 0.18}s infinite`,
              display: 'inline-block'
            }}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes shineText {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes dotPulse {
          0%, 80%, 100% { 
            opacity: 0.2; 
            transform: scale(0.85); 
          }
          40% { 
            opacity: 1; 
            transform: scale(1.25); 
          }
        }

        .animate-shineText {
          animation: shineText 2s ease-in-out infinite;
        }

        .animate-dotPulse {
          animation: dotPulse 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}