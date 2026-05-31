import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBanners } from "@/features/shop/hooks/useBanners";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSiteSettings } from "@/features/shop/hooks/useSiteSettings";
import logoDimar from "@/assets/dimar-logo.png";
import { Link } from "react-router-dom";

const fallbackSlides = [
  { title: "Herramientas de Calidad", subtitle: "Las mejores marcas para tu construcción y hogar", cta_text: "Ver Herramientas", image_desktop: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&h=500&fit=crop", link_url: "/catalogo?cat=herramientas" },
  { title: "Materiales de Construcción", subtitle: "Cemento, ladrillos y todo lo que necesitas para tu obra", cta_text: "Ver Materiales", image_desktop: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=1200&h=500&fit=crop", link_url: "/catalogo?cat=materiales-construccion" },
  { title: "Pinturas y Acabados", subtitle: "Dale color y protección a tus espacios", cta_text: "Ver Pinturas", image_desktop: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1200&h=500&fit=crop", link_url: "/catalogo?cat=pinturas-acabados" },
];

const HeroBanner = () => {
  const { banners } = useBanners();
  const isMobile = useIsMobile();
  const { settings } = useSiteSettings();
  const [current, setCurrent] = useState(0);

  const bgSlides = banners.length > 0
    ? banners.map((b) => (isMobile && b.image_mobile ? b.image_mobile : b.image_desktop))
    : fallbackSlides.map((s) => s.image_desktop);

  const next = useCallback(() => setCurrent((c) => (c + 1) % bgSlides.length), [bgSlides.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + bgSlides.length) % bgSlides.length), [bgSlides.length]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  useEffect(() => {
    if (current >= bgSlides.length) setCurrent(0);
  }, [bgSlides.length, current]);

  return (
    <section className="relative overflow-hidden bg-[hsl(0_0%_8%)] text-white">
      {/* Hazard top stripe */}
      <div className="h-1.5 hazard-stripes" />

      <div className="relative h-[460px] sm:h-[520px] lg:h-[580px]">
        {/* Background slideshow */}
        {bgSlides.map((src, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? "opacity-100" : "opacity-0"}`}
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/30" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_transparent_0%,_rgba(0,0,0,0.6)_70%)]" />
          </div>
        ))}

        {/* Content */}
        <div className="relative container h-full grid grid-cols-1 lg:grid-cols-[auto,1fr] items-center gap-6 lg:gap-12">
          {/* Logo (hidden on small) */}
          <div className="hidden lg:flex items-center justify-center pl-4">
            <img
              src={logoDimar}
              alt="DIMAR D&L"
              className="h-72 xl:h-80 object-contain drop-shadow-[0_0_40px_rgba(245,166,35,0.35)] animate-float"
            />
          </div>

          <div className="max-w-2xl space-y-5 sm:space-y-6">
            <div className="inline-block px-3 py-1 text-[10px] sm:text-xs font-display font-bold text-primary border border-primary/40 rounded-full uppercase tracking-[0.3em]">
              {settings.hero_eyebrow}
            </div>
            <h1 className="font-display font-black leading-[0.95] tracking-tight uppercase text-white text-4xl sm:text-5xl lg:text-7xl">
              <span className="block">{settings.hero_title_1}</span>
              <span className="block text-primary drop-shadow-[0_2px_18px_rgba(245,166,35,0.6)]">
                {settings.hero_title_accent}
              </span>
              <span className="block">{settings.hero_title_2}</span>
            </h1>
            <div className="h-1 w-24 bg-primary" />
            <p className="text-sm sm:text-base lg:text-lg text-white/85 max-w-xl font-body">
              {settings.hero_subtitle}
            </p>
            <Link to={settings.hero_cta_link}>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold tracking-widest uppercase rounded-md px-8 h-12 shadow-[0_8px_30px_rgba(245,166,35,0.4)] gap-3"
              >
                <ShoppingCart className="h-5 w-5" />
                {settings.hero_cta_text}
              </Button>
            </Link>
          </div>
        </div>

        {bgSlides.length > 1 && (
          <>
            <Button variant="ghost" size="icon" className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-primary/20 backdrop-blur border border-primary/30 text-white" onClick={prev}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-primary/20 backdrop-blur border border-primary/30 text-white" onClick={next}>
              <ChevronRight className="h-5 w-5" />
            </Button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {bgSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all ${i === current ? "w-10 bg-primary" : "w-3 bg-white/30"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Wood/floor accent line */}
      <div className="h-2 bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
    </section>
  );
};

export default HeroBanner;
