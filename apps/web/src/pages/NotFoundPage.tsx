import { Home } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <main className="relay-app min-h-screen w-full bg-surface text-text flex flex-col items-center justify-center p-6 text-center">
      <div className="flex flex-col items-center max-w-md w-full">
        {/* Isometric Box Illustration */}
        <div className="relative mb-8 flex items-center justify-center" aria-hidden="true">
          <svg
            width="160"
            height="160"
            viewBox="0 0 160 160"
            fill="none"
            className="overflow-visible drop-shadow-sm"
          >
            {/* Soft grid background */}
            <path
              d="M20 80 L80 45 L140 80 L80 115 Z"
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray="2 2"
              fill="none"
            />
            {/* Bottom isometric cube / box base */}
            {/* Top face */}
            <path
              d="M80 32 L124 57 L80 82 L36 57 Z"
              fill="var(--linen-deep)"
              stroke="var(--charcoal)"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            {/* Left face */}
            <path
              d="M36 57 L80 82 L80 128 L36 103 Z"
              fill="var(--charcoal)"
              stroke="var(--charcoal)"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            {/* Right face */}
            <path
              d="M80 82 L124 57 L124 103 L80 128 Z"
              fill="var(--charcoal-soft)"
              stroke="var(--charcoal)"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            {/* Isometric box tape / flap detail in copper */}
            <path
              d="M74 35 L86 42 L86 85 L74 78 Z"
              fill="var(--copper)"
              opacity="0.85"
            />
            {/* Box interior seam / dotted line */}
            <path
              d="M80 82 L80 128"
              stroke="var(--paper)"
              strokeWidth="1"
              strokeOpacity="0.2"
            />
            {/* Floating indicator tag */}
            <g transform="translate(94, 22)">
              <rect
                x="0"
                y="0"
                width="34"
                height="18"
                rx="2"
                fill="var(--copper)"
              />
              <text
                x="17"
                y="12"
                fill="var(--paper)"
                fontSize="9"
                fontFamily="var(--font-mono)"
                fontWeight="600"
                textAnchor="middle"
              >
                404
              </text>
            </g>
          </svg>
        </div>

        {/* Editorial rule */}
        <div className="w-12 h-px bg-copper mb-6" />

        {/* Mono kicker */}
        <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">
          Page Not Found
        </p>

        {/* Title */}
        <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-text mb-4">
          Page not found
        </h1>

        {/* Description */}
        <p className="text-text-muted text-sm sm:text-base max-w-sm mb-8 leading-relaxed font-sans">
          The requested path doesn't exist or may have been moved out of context.
        </p>

        {/* Button */}
        <Button variant="primary" asChild>
          <Link to="/dashboard">
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </main>
  );
}
