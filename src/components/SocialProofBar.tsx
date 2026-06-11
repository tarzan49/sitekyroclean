const items = [
  { value: '5.0 ★', label: 'Google Reviews' },
  { value: '+1000',  label: 'Clientes satisfeitos' },
  { value: '1h',     label: 'Duração média do serviço' },
  { value: '0€',     label: 'Custos de deslocação' },
];

const SocialProofBar = () => (
  <div className="bg-[#FAFAF7] border-b border-[#111111]/6">
    <div className="max-w-7xl mx-auto px-6 md:px-10">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#111111]/6">
        {items.map((item, i) => (
          <div key={i} className="py-5 md:py-6 text-center">
            <p className="font-playfair font-normal text-[#1A4E30] text-2xl md:text-3xl leading-none mb-1">
              {item.value}
            </p>
            <p className="text-[9px] font-medium text-[#111111]/35 tracking-[0.22em] uppercase">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default SocialProofBar;
