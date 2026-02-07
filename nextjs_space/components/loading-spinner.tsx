"use client";

export function LoadingSpinner({ size = "md", text }: { size?: "sm" | "md" | "lg"; text?: string }) {
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-14 h-14 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} animate-spin rounded-full border-[#1B4079]/20 border-t-[#1B4079]`}
        />
        <div 
          className={`absolute inset-0 ${sizeClasses[size]} animate-ping rounded-full border-[#1B4079]/10 opacity-75`}
          style={{ animationDuration: '1.5s' }}
        />
      </div>
      {text && (
        <p className="text-sm text-gray-500 animate-pulse">{text}</p>
      )}
    </div>
  );
}
