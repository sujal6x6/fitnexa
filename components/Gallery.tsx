'use client';
import Image from 'next/image';
import { useState } from 'react';
export default function Gallery({ images, name }: { images: { url: string; alt: string | null }[]; name: string }) {
  const [i, setI] = useState(0);
  if (!images.length) return <div className="gal"><div className="main" style={{ display: 'grid', placeItems: 'center' }}><b className="d" style={{ fontSize: 90, color: '#ccc' }}>FITNEXA</b></div></div>;
  return (<div className="gal"><div className="main"><Image src={images[i].url} alt={images[i].alt ?? name} fill priority sizes="(max-width:860px) 100vw, 50vw" /></div>
    {images.length > 1 && <div className="th">{images.map((im, k) => <button key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-label={`Image ${k + 1}`}><Image src={im.url} alt="" fill sizes="72px" style={{ objectFit: 'cover', objectPosition: 'top' }} /></button>)}</div>}</div>);
}
