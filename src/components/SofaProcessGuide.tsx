import ServiceProcessGuide from './ServiceProcessGuide';
export default function SofaProcessGuide(props: { city?: string; cityPrep?: string }) {
  return <ServiceProcessGuide serviceSlug="limpeza-sofas" {...props} />;
}
