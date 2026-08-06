import { Phone, Mail, MapPin, Clock, Send, MessageSquare } from "lucide-react";
import { submitContactForm } from "@/services/contactService";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { quoteFormSchema } from "@/lib/validation";
import {
  WHATSAPP_BASE,
  PHONE_TEL,
  PHONE_DISPLAY,
  BUSINESS_EMAIL,
  BUSINESS_EMAIL_HREF,
  BUSINESS_ADDRESS,
} from "@/constants/business";

const Contact = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    localidade: "",
    mensagem: "",
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validationResult = quoteFormSchema.safeParse({
        ...formData,
        files: [],
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast({
          title: 'Erro de Validação',
          description: firstError.message,
          variant: "destructive",
        });
        return;
      }

      await submitContactForm(formData);

      // Success - show toast
      toast({
        title: "Pedido enviado com sucesso",
        description: "Entraremos em contacto em breve!",
      });

      setFormData({ nome: "", telefone: "", email: "", localidade: "", mensagem: "" });
      navigate('/obrigado');
    } catch (error) {
      console.error('[Contact] Submit error:', error);
      
      // Build WhatsApp fallback message
      const whatsappMessage = encodeURIComponent(
        `Olá! Tentei pedir orçamento pelo site mas houve um erro.\n\n` +
        `Nome: ${formData.nome}\n` +
        `Tel: ${formData.telefone}\n` +
        `Email: ${formData.email}\n` +
        `Local: ${formData.localidade}\n\n` +
        `${formData.mensagem}`
      );
      
      toast({
        title: "Não foi possível enviar",
        description: (
          <div className="space-y-2">
            <p>Houve um problema. Contacte-nos diretamente:</p>
            <div className="flex gap-2 mt-2">
              <a
                href={`${WHATSAPP_BASE}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
              >
                WhatsApp
              </a>
              <a
                href={`mailto:${BUSINESS_EMAIL}?subject=Pedido%20Orçamento&body=${whatsappMessage}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Email
              </a>
            </div>
          </div>
        ),
        variant: 'destructive',
        duration: 15000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      label: 'Telemóvel/Telefone',
      value: PHONE_DISPLAY,
      subtext: 'Ligue-nos agora',
      href: `tel:${PHONE_TEL}`,
    },
    {
      icon: Mail,
      label: 'Email',
      value: BUSINESS_EMAIL,
      subtext: 'Envie-nos um email',
      href: BUSINESS_EMAIL_HREF,
    },
    {
      icon: MapPin,
      label: 'Morada',
      value: BUSINESS_ADDRESS.streetAddress,
      subtext: `${BUSINESS_ADDRESS.postalCode} ${BUSINESS_ADDRESS.addressLocality}`,
      href: null,
    },
    {
      icon: Clock,
      label: 'Horário',
      value: 'Segunda a Sábado: 08:00 - 00:00',
      subtext: "Segunda a Sábado",
      href: null,
    },
  ];

  return (
    <section ref={sectionRef} id="contactos" className="py-16 md:py-24 bg-gradient-to-b from-background via-secondary/10 to-secondary/30 overflow-hidden scroll-mt-32">
      <div className="container mx-auto px-4">
        {/* Premium Section Header */}
        <div className={`text-center mb-12 md:mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-gold" />
            <span className="text-gold font-semibold tracking-wide uppercase text-sm">Fale Connosco</span>
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-[#111111] mb-3">
            Prepare o seu espaço para impressionar.
          </h2>
          <p className="text-[#111111]/55 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            A nossa equipa chega à hora marcada, com eficiência e atenção aos detalhes. Garantimos um serviço profissional adaptado ao seu ritmo e à sua casa.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-gold to-gold-light mx-auto rounded-full mt-6"></div>
        </div>

        {/* Premium Contact Cards - Mobile */}
        <div className={`lg:hidden mb-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '100ms' }}>
          <div className="grid grid-cols-2 gap-4">
            {contactInfo.map((item, index) => {
              const Icon = item.icon;
              const content = (
                <div className="bg-[#FFFFFF] p-5 rounded-[20px] shadow-lg h-full">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-gold" />
                  </div>
                  <p className="text-xs text-[#111111]/55 font-medium uppercase tracking-wide mb-1">{item.label}</p>
                  <p className="font-bold text-[#111111] text-sm leading-tight">{item.value}</p>
                  <p className="text-xs text-[#111111]/55 mt-1">{item.subtext}</p>
                </div>
              );
              return item.href ? (
                <a key={index} href={item.href} className="block hover:-translate-y-1 transition-transform">
                  {content}
                </a>
              ) : (
                <div key={index}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Contact Form */}
          <div className={`lg:col-span-3 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '200ms' }}>
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-turquoise/10 via-gold/10 to-turquoise/10 rounded-[28px] blur-lg opacity-40"></div>
              
              <form onSubmit={handleSubmit} className="relative bg-[#FFFFFF] p-6 md:p-8 rounded-[22px] shadow-xl space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-semibold text-[#111111] mb-2 block">
                      Nome <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                      maxLength={100}
                      className="h-12 text-base border-border/50 focus:border-gold focus:ring-gold/20 rounded-xl"
                      placeholder="O seu nome completo"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#111111] mb-2 block">
                      Telemóvel/Telefone
                    </label>
                    <Input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      maxLength={20}
                      className="h-12 text-base border-border/50 focus:border-gold focus:ring-gold/20 rounded-xl"
                      placeholder="912 345 678"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-semibold text-[#111111] mb-2 block">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      maxLength={254}
                      className="h-12 text-base border-border/50 focus:border-gold focus:ring-gold/20 rounded-xl"
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#111111] mb-2 block">
                      Localidade <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.localidade}
                      onChange={(e) => setFormData({ ...formData, localidade: e.target.value })}
                      required
                      maxLength={100}
                      className="h-12 text-base border-border/50 focus:border-gold focus:ring-gold/20 rounded-xl"
                      placeholder="Ex: Porto, Lisboa, Braga..."
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#111111] mb-2 block">
                    Mensagem <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                    rows={4}
                    required
                    maxLength={2000}
                    className="text-base min-h-[120px] border-border/50 focus:border-gold focus:ring-gold/20 rounded-xl resize-none"
                    placeholder="Descreva o que precisa..."
                  />
                </div>

                <p className="text-xs text-[#111111]/55 bg-secondary/30 p-3 rounded-xl">
                  - Para orçamentos de Tapetes e Colchões, favor indicar as medidas.
                </p>


                {/* Submit Button */}
                <div className="relative group/btn pt-2">
                  <div className="absolute -inset-1 bg-gradient-to-r from-gold/40 via-gold/60 to-gold/40 rounded-2xl blur-md opacity-50 group-hover/btn:opacity-80 transition-opacity"></div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="relative w-full bg-gradient-to-r from-gold to-[#d4c78d] hover:from-[#d4c78d] hover:to-gold text-[#111111] font-bold py-6 h-auto text-base md:text-lg rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    {isSubmitting ? 'A enviar...' : 'Enviar Pedido'}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Contact Info - Desktop */}
          <div className={`hidden lg:block lg:col-span-2 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '300ms' }}>
            <div className="relative group h-full">
              <div className="absolute -inset-2 bg-gradient-to-br from-gold/20 via-turquoise/20 to-gold/20 rounded-[28px] blur-lg opacity-40"></div>
              
              <div className="relative bg-[#FFFFFF] p-8 rounded-[22px] shadow-xl h-full">
                <h3 className="text-xl font-bold text-[#111111] mb-6 flex items-center gap-2">
                  Informações de Contacto
                </h3>
                
                <div className="space-y-4">
                  {contactInfo.map((item, index) => {
                    const Icon = item.icon;
                    const content = (
                      <div className="flex items-start gap-4 p-4 rounded-[20px] bg-[#FFFFFF] border border-[rgba(26,78,48,0.10)] shadow-sm hover:shadow-md hover:border-gold/30 transition-all duration-300 group/item">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center flex-shrink-0 group-hover/item:scale-105 transition-transform">
                          <Icon className="w-6 h-6 text-gold" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs text-[#111111]/55 font-medium uppercase tracking-wider">{item.label}</span>
                          <p className="text-base font-bold text-[#111111] mt-1">{item.value}</p>
                          <p className="text-sm text-[#111111]/55">{item.subtext}</p>
                        </div>
                      </div>
                    );
                    return item.href ? (
                      <a key={index} href={item.href} className="block">
                        {content}
                      </a>
                    ) : (
                      <div key={index}>
                        {content}
                      </div>
                    );
                  })}
                </div>

                {/* Trust Badge */}
                <div className="mt-6 p-4 rounded-[18px] bg-gradient-to-r from-gold/10 to-turquoise/10 border border-gold/20">
                  <p className="text-sm text-[#111111]/80 text-center font-medium">
                    Resposta garantida em menos de 30 minutos durante o horário de funcionamento.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;