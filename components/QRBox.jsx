'use client';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

// Shows a scannable QR code for the page's own URL. Meant for the start and
// end screens only — hidden once a student is mid-quiz, per the teacher's
// request ("show it as soon as I open the app, hide it once I'm playing").
export default function QRBox() {
  const [url, setUrl] = useState('');
  useEffect(() => {
    setUrl(window.location.origin + window.location.pathname);
  }, []);
  if (!url) return null;
  return (
    <div className="qr-box">
      <span className="qr-tag">📱 Scan to play on your phone</span>
      <QRCodeSVG value={url} size={128} bgColor="#fffaf9" fgColor="#8f6fe0" />
      <span className="qr-url">{url}</span>
    </div>
  );
}
