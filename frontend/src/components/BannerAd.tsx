import { useEffect } from 'react';

interface BannerAdProps {
  adSlot: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function BannerAd({ adSlot, className = '' }: BannerAdProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle && !window.adsbygoogle.loaded) {
        window.adsbygoogle.push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div 
      className={`relative w-full bg-gradient-to-r from-yellow-400 to-orange-500 border-4 border-black p-2 z-50 ${className}`}
      style={{
        minHeight: '100px',
        background: 'linear-gradient(135deg, #FF0000 0%, #FF00FF 50%, #FFFF00 100%)',
        border: '8px solid black',
        boxShadow: '0 0 20px rgba(255, 0, 255, 0.8)',
      }}
    >
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-4 bg-black text-white rounded-lg opacity-90">
          <p className="text-2xl font-bold mb-2">AD PLACEHOLDER</p>
          <p className="text-sm">Ad Unit: {adSlot}</p>
          <p className="text-xs mt-2">This is a placeholder for Google AdSense</p>
        </div>
      </div>
      
      {/* Hidden actual ad component */}
      <ins
        className="adsbygoogle hidden"
        style={{
          display: 'block',
          minHeight: '100px',
          width: '100%',
        }}
        data-ad-client="ca-pub-8617849690810653"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

