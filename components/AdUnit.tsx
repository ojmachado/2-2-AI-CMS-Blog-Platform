import React, { useEffect, useRef } from 'react';
import { dbService } from '../services/dbService';

interface AdUnitProps {
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
}

export const AdUnit: React.FC<AdUnitProps> = ({ 
  slotId = '1234567890', // Default mock slot
  format = 'auto',
  className = ''
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const [clientId, setClientId] = React.useState<string>('');

  useEffect(() => {
    dbService.getSettings().then(settings => {
      setClientId(settings.googleAdSenseId);
    });
  }, []);

  useEffect(() => {
    if (clientId && adRef.current) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [clientId]);

  if (!clientId) return null;

  return (
    <div className={`ad-container my-8 text-center bg-slate-50 border border-slate-100 rounded-lg overflow-hidden ${className}`}>
        <div className="text-[10px] text-slate-400 uppercase tracking-widest py-1">Advertisement</div>
        <ins
            ref={adRef}
            className="adsbygoogle block"
            style={{ display: 'block' }}
            data-ad-client={clientId}
            data-ad-slot={slotId}
            data-ad-format={format}
            data-full-width-responsive="true"
        />
    </div>
  );
};