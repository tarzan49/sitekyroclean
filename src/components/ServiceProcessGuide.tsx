import type { ReactNode } from 'react';
import IllustratedProcessGuide from '@/components/IllustratedProcessGuide';
import { SERVICE_PROCESS_GUIDES, type ProcessServiceSlug } from '@/data/serviceProcessGuides';

export default function ServiceProcessGuide({ serviceSlug, city, cityPrep = 'em', dark = false, switcher }: { serviceSlug: ProcessServiceSlug; city?: string; cityPrep?: string; dark?: boolean; switcher?: ReactNode }) {
  const guide = SERVICE_PROCESS_GUIDES[serviceSlug];
  return <IllustratedProcessGuide key={serviceSlug} guide={guide} heading={`${guide.heading}, passo a passo${city ? ` ${cityPrep}` : ""}`} goldWord={city || ""} downloadName={serviceSlug} dark={dark} switcher={switcher} />;
}
