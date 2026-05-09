"use client";

interface LogoSVGProps {
  className?: string;
  color?: string;
}

// SVG recreation of Paula Spinelli's poppy/anemone line-art logo
export function FlowerSVG({ className = "w-8 h-8", color = "currentColor" }: LogoSVGProps) {
  return (
    <svg
      viewBox="0 0 80 95"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Left outer petal */}
      <path
        d="M40 50 C32 42 18 38 16 26 C14 14 26 10 35 22 C30 12 38 4 44 14 C40 6 52 4 54 16 C56 4 66 8 62 20 C58 32 46 40 40 50"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner petal left */}
      <path
        d="M40 50 C36 42 28 36 28 26 C28 18 36 16 40 26"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner petal right */}
      <path
        d="M40 50 C44 42 52 36 52 26 C52 18 44 16 40 26"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bottom left petal */}
      <path
        d="M40 50 C32 48 22 52 20 62 C18 72 28 74 36 62"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bottom right petal */}
      <path
        d="M40 50 C48 48 58 52 60 62 C62 72 52 74 44 62"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Stem */}
      <path
        d="M40 65 C38 74 37 82 40 90"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LogoFull({
  className = "",
  teal = false,
}: {
  className?: string;
  teal?: boolean;
}) {
  const flowerColor = teal ? "#6BBFB5" : "#6BBFB5";
  const textColor = teal ? "text-teal-400" : "text-gray-800";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <FlowerSVG color={flowerColor} className="w-8 h-10" />
      <div className="leading-tight">
        <div className={`font-script text-xl leading-tight ${textColor === "text-teal-400" ? "text-teal-400" : "text-gray-800"}`}>
          Paula Spinelli
        </div>
        <div className="font-sans text-[9px] tracking-[0.3em] uppercase text-gray-500 -mt-0.5">
          Cosmiatra
        </div>
      </div>
    </div>
  );
}
