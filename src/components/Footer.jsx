import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#FFFDF9] border-t-4 border-[#2C3E35] py-6 mt-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-[#7CA190] text-xs font-black">
          <span className="text-lg">🌿</span>
          <span>&copy; 2026 DayMirror App. Dibuat dengan cinta untuk membantumu melompat lebih tinggi!</span>
        </div>
        <div className="flex gap-4 text-[10px] text-[#7CA190] font-black uppercase">
          <span className="hover:text-[#2C3E35] cursor-pointer">Saran Lucu</span>
          <span>&bull;</span>
          <span className="hover:text-[#2C3E35] cursor-pointer">Panduan Tenang</span>
          <span>&bull;</span>
          <span className="hover:text-[#2C3E35] cursor-pointer">Buku Ajaib</span>
        </div>
      </div>
    </footer>
  );
}
