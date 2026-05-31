import { Button } from "@/components/ui/button";
import { MessageCircle, Wrench } from "lucide-react";
import { useSiteSettings, buildWhatsAppLink } from "@/features/shop/hooks/useSiteSettings";

const ProjectCTA = () => {
  const { settings } = useSiteSettings();
  const link = buildWhatsAppLink(settings.project_cta_whatsapp_message);

  return (
    <section className="relative bg-[hsl(0_0%_8%)] text-white overflow-hidden">
      <div className="h-1.5 hazard-stripes" />
      <div className="container py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-[1fr,1.2fr] gap-8 lg:gap-14 items-center relative z-10">
        <div className="flex justify-center lg:justify-start">
          <div className="relative h-44 w-44 sm:h-56 sm:w-56 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center">
            <Wrench className="h-24 w-24 sm:h-32 sm:w-32 text-primary" strokeWidth={1.4} />
            <div className="absolute -inset-2 rounded-full border border-primary/20 animate-pulse-glow" />
          </div>
        </div>
        <div className="space-y-5 text-center lg:text-left">
          <p className="text-[10px] sm:text-xs font-display font-bold text-primary uppercase tracking-[0.35em]">
            {settings.project_cta_eyebrow}
          </p>
          <h2 className="font-display font-black uppercase leading-[0.95] tracking-tight text-3xl sm:text-4xl lg:text-5xl">
            <span className="block text-white">{settings.project_cta_title}</span>
            <span className="block text-primary drop-shadow-[0_2px_14px_rgba(245,166,35,0.5)]">
              {settings.project_cta_title_accent}
            </span>
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto lg:mx-0">
            {settings.project_cta_description}
          </p>
          <a href={link} target="_blank" rel="noopener noreferrer" className="inline-block">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold tracking-widest uppercase h-13 px-8 gap-3 shadow-[0_10px_40px_rgba(245,166,35,0.45)]"
            >
              <MessageCircle className="h-5 w-5" />
              {settings.project_cta_button}
            </Button>
          </a>
        </div>
      </div>
      {/* Right-side hazard ribbon decoration */}
      <div className="absolute right-0 top-0 bottom-0 w-16 hazard-stripes opacity-80 hidden md:block" />
      <div className="h-1.5 hazard-stripes" />
    </section>
  );
};

export default ProjectCTA;