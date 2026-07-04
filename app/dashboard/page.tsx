'use client';

import PlatformFrame from '@/components/shell/PlatformFrame';

export default function Dashboard() {
  const designUrl = process.env.NEXT_PUBLIC_OPEN_DESIGN_URL || 'http://localhost:3000';
  const openhandsUrl = process.env.NEXT_PUBLIC_OPENHANDS_URL || 'http://localhost:5000';

  return (
    <PlatformFrame>
      <div className="flex h-full w-full bg-slate-900">
        <iframe 
          src={designUrl} 
          className="flex-1 border-0"
          title="Open Design Workspace"
          allow="camera; microphone; clipboard-read; clipboard-write"
          loading="lazy"
        />
        <iframe 
          src={openhandsUrl} 
          className="flex-1 border-0 border-l-2 border-slate-800"
          title="OpenHands Instance"
          allow="camera; microphone; clipboard-read; clipboard-write"
          loading="lazy"
        />
      </div>
    </PlatformFrame>
  );
}