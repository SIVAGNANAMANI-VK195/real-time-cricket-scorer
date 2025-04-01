
import React from "react";
import { ShieldCheck, Award, ShieldAlert, BarChart4 } from "lucide-react";

export const CricketBall = ({ className }: { className?: string }) => (
  <div className={`relative rounded-full ${className || "h-5 w-5"}`}>
    <div className="absolute inset-0 rounded-full bg-red-600"></div>
    <div className="absolute inset-[15%] rounded-full bg-white"></div>
    <div className="absolute h-[60%] w-[2px] top-[20%] left-[48%] bg-red-600 rotate-45"></div>
    <div className="absolute h-[60%] w-[2px] top-[20%] left-[48%] bg-red-600 -rotate-45"></div>
  </div>
);

export const Cricket = ({ className }: { className?: string }) => (
  <div className={`relative ${className || "h-6 w-6"}`}>
    <ShieldCheck className="w-full h-full text-cricket-pitch" />
    <div className="absolute inset-0 flex items-center justify-center">
      <CricketBall className="h-3 w-3" />
    </div>
  </div>
);

// Export other cricket-related icons
export {
  ShieldCheck,
  Award,
  ShieldAlert,
  BarChart4
};
