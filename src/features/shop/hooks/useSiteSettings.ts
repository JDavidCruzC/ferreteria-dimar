import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { COMPANY_ADDRESS, WHATSAPP_NUMBER } from "@/lib/constants";

export interface SiteSettings {
  hero_eyebrow: string;
  hero_title_1: string;
  hero_title_accent: string;
  hero_title_2: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_cta_link: string;
  project_cta_eyebrow: string;
  project_cta_title: string;
  project_cta_title_accent: string;
  project_cta_description: string;
  project_cta_button: string;
  project_cta_whatsapp_message: string;
  footer_address: string;
  footer_map_embed_url: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  hero_eyebrow: "DIMAR D&L · DESDE 2003",
  hero_title_1: "TODO EN",
  hero_title_accent: "FERRETERÍA",
  hero_title_2: "PARA TUS PROYECTOS",
  hero_subtitle:
    "Productos de calidad, las mejores marcas y el mejor servicio para profesionales y hogares.",
  hero_cta_text: "VER PRODUCTOS",
  hero_cta_link: "/catalogo",
  project_cta_eyebrow: "TRABAJEMOS JUNTOS",
  project_cta_title: "¿TIENES UN PROYECTO",
  project_cta_title_accent: "EN MENTE?",
  project_cta_description:
    "En DIMAR D&L tenemos todo lo que necesitas para hacerlo realidad. Contáctanos y recibe asesoría personalizada.",
  project_cta_button: "ESCRÍBENOS POR WHATSAPP",
  project_cta_whatsapp_message:
    "¡Hola DIMAR! Tengo un proyecto en mente y me gustaría una asesoría.",
  footer_address: COMPANY_ADDRESS,
  footer_map_embed_url:
    "https://www.google.com/maps?q=Ilo,Moquegua,Peru&output=embed",
};

export function buildWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function useSiteSettings() {
  const { data, isLoading } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("store_settings")
        .select("value")
        .eq("key", "site_settings")
        .maybeSingle();
      return { ...DEFAULT_SITE_SETTINGS, ...((data?.value as Partial<SiteSettings>) || {}) };
    },
    staleTime: 60_000,
  });

  return { settings: data || DEFAULT_SITE_SETTINGS, loading: isLoading };
}

export function useUpdateSiteSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (next: SiteSettings) => {
      const { data: existing } = await supabase
        .from("store_settings")
        .select("id")
        .eq("key", "site_settings")
        .maybeSingle();
      if (existing) {
        const { error } = await supabase
          .from("store_settings")
          .update({ value: next as any, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("store_settings")
          .insert({ key: "site_settings", value: next as any });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site_settings"] }),
  });
}