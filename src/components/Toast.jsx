import React from 'react';
import { AlertCircle, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toastMessage } = useApp();
  if (!toastMessage) return null;

  const bg =
    toastMessage.type === 'error' ? 'bg-[#FCE4D6] text-[#843C0C]' :
    toastMessage.type === 'info'  ? 'bg-[#E3EDF7] text-[#315C87]' :
    'bg-[#E2F0D9] text-[#3B6628]';

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 p-4 rounded-2xl comic-border-thick comic-shadow-sm animate-bounce ${bg}`}>
      {toastMessage.type === 'error'
        ? <AlertCircle className="w-5 h-5 text-[#843C0C]" />
        : <Sparkles className="w-5 h-5 text-[#3B6628]" />}
      <span className="text-sm font-black">{toastMessage.text}</span>
    </div>
  );
}
