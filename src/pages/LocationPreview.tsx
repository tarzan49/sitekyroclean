import { useState } from 'react';
import IndexV1 from './IndexV1';
import QuizForm from '@/components/QuizForm';

export default function LocationPreview() {
  const [open, setOpen] = useState(true);
  if (new URLSearchParams(window.location.search).has('mobile')) {
    return <main style={{ minHeight: '100dvh', background: '#071a12', display: 'grid', placeItems: 'center', padding: 12 }}><iframe title="Pré-visualização do site em telemóvel" src="/__preview/localizacao" allow="geolocation" style={{ width: 'min(390px, 100%)', height: 'min(844px, calc(100dvh - 24px))', border: '1px solid #465044', borderRadius: 24 }} /></main>;
  }
  return <><IndexV1 /><QuizForm isOpen={open} onClose={() => setOpen(false)} /></>;
}
