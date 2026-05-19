/**
 * QuizStep4Contact.tsx
 * Step 4 of the Kyro quiz: contact information form.
 * Collects name, phone, optional email, and optional photo uploads.
 */

import { useRef } from 'react';
import { Camera, Trophy, Lock, ThumbsUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { QuizFormData } from '@/components/quiz/QuizTypes';

interface QuizStep4ContactProps {
  formData: QuizFormData;
  /** Updates a subset of formData fields. */
  updateFormData: (updates: Partial<QuizFormData>) => void;
}

/**
 * Contact data collection step.
 * Name and phone are required; email and photos are optional.
 */
const QuizStep4Contact = ({ formData, updateFormData }: QuizStep4ContactProps) => {
  const photoInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
      className="flex-1"
    >
      <div className="w-full max-w-sm">
        <h2 className="font-playfair text-xl sm:text-2xl font-bold text-white text-center mb-1 leading-[1.3]">
          Os seus dados
        </h2>
        <p className="text-center text-[11px] text-white/30 mb-5">
          Preenche em segundos, o pedido é enviado automaticamente.
        </p>

        <p className="flex items-center justify-center gap-2 text-center text-xs text-green-300/80 bg-green-900/20 border border-green-500/20 rounded-xl px-3 py-2 mb-5 font-medium">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
          Agenda quase cheia, confirme agora para garantir o seu horário
        </p>

        {/* Trust strip */}
        <div className="flex items-center justify-center gap-4 mb-5">
          {([
            { Icon: Trophy,   text: 'N.º1 no Porto'      },
            { Icon: Lock,     text: 'Dados Seguros'       },
            { Icon: ThumbsUp, text: 'Sem compromisso'     },
          ] as const).map(({ Icon, text }) => (
            <div key={text} className="flex flex-col items-center gap-1">
              <Icon className="w-4 h-4 text-gold/70" strokeWidth={2} />
              <span className="text-[10px] text-white/40 font-semibold leading-none text-center">{text}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Nome *</label>
            <Input
              placeholder="O seu nome"
              value={formData.name}
              onChange={e => updateFormData({ name: e.target.value })}
              className="text-base h-13 bg-white/[0.06] border-white/15 text-white placeholder:text-white/20 focus-visible:ring-gold rounded-xl"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Telemóvel / WhatsApp *</label>
            <Input
              type="tel"
              placeholder="9xx xxx xxx"
              value={formData.phone}
              onChange={e => updateFormData({ phone: e.target.value })}
              className="text-base h-13 bg-white/[0.06] border-white/15 text-white placeholder:text-white/20 focus-visible:ring-gold rounded-xl"
            />
          </div>
          <div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => {
                const files = Array.from(e.target.files ?? []).slice(0, 5);
                updateFormData({ photos: files });
              }}
            />
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 border border-dashed border-white/[0.12] hover:border-gold/35 rounded-xl p-3 text-sm text-white/30 hover:text-white/55 transition-colors"
            >
              <Camera className="w-4 h-4" />
              {formData.photos && formData.photos.length > 0
                ? `${formData.photos.length} foto(s) selecionada(s)`
                : 'Foto do item (Opcional)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizStep4Contact;
