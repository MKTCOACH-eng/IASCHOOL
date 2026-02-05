"use client";

export function Footer() {
  return (
    <footer className="mt-auto py-6 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
          <span className="text-sm text-gray-400">Powered by</span>
          <span className="text-sm font-semibold text-[#4D7C8A]">IAschool</span>
        </div>
        <p className="text-xs text-gray-300 text-center mt-2">
          La mejor tecnología es la que no se siente complicada
        </p>
      </div>
    </footer>
  );
}
