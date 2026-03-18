import React from 'react';

export function Logo({ className = '' }: { className?: string }) {
  const ringText = "as in content • as in content • as in content • ";
  
  return (
    <div className={`relative flex items-center justify-center w-24 h-24 ${className}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_20s_linear_infinite]">
        <path
          id="textPath"
          d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
          fill="none"
        />
        <text className="text-[10.5px] font-medium fill-[#839496] tracking-widest uppercase" letterSpacing="2">
          <textPath href="#textPath" startOffset="0%">
            {ringText}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#268bd2] to-[#d33682] leading-none">
          smug:
        </span>
      </div>
    </div>
  );
}
