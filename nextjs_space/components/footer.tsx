"use client";

export function Footer() {
  return (
    <footer className="mt-auto py-6 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
          <span className="text-sm text-gray-500">Powered by</span>
          <a 
            href="/" 
            className="text-sm font-semibold text-[#1B4079] hover:text-[#4D7C8A] transition-colors"
          >
            IAschool
          </a>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          La mejor tecnología es la que no se siente complicada
        </p>
      </div>
    </footer>
  );
}
