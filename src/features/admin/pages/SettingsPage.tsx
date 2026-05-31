import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/features/theme/ThemeProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Settings, PartyPopper, Sun, Receipt, Save, Loader2, Building2, Sparkles, MessageSquareHeart, Database, Lock } from "lucide-react";
import { Globe, MessageCircle, MapPin } from "lucide-react";
import { useSiteSettings, useUpdateSiteSettings, DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/features/shop/hooks/useSiteSettings";
import { toast } from "sonner";
import {
  DEFAULT_COMPANY_INFO,
  DEFAULT_TEMPLATE,
  DOCUMENT_KINDS,
  loadTemplateFromDb,
  saveTemplateToDb,
  type CompanyReceiptInfo,
  type ReceiptTemplate,
} from "@/features/admin/components/PrintReceipt";
import { FileText } from "lucide-react";

const THEME_EMOJIS: Record<string, string> = {
  default: "🎮", san_valentin: "❤️", halloween: "🎃", navidad: "🎄",
  dia_madre: "🌸", dia_padre: "👔", año_nuevo: "🎆", dia_niño: "🎈", custom: "🎨",
};

const COMPANY_FIELDS: { key: keyof CompanyReceiptInfo; label: string; placeholder: string; icon: string }[] = [
  { key: "ruc", label: "R.U.C.", placeholder: "", icon: "🏢" },
  { key: "direccion", label: "Dirección", placeholder: "Ilo, Moquegua - Perú", icon: "📍" },
  { key: "ciudad", label: "Ciudad / Región", placeholder: "Ilo - Moquegua - Perú", icon: "🌍" },
  { key: "telefono", label: "Teléfono", placeholder: "931697638", icon: "📞" },
  { key: "web", label: "Página Web", placeholder: "", icon: "🌐" },
  { key: "email", label: "Correo Electrónico", placeholder: "dimarferreteria@gmail.com", icon: "📧" },
  { key: "copyright", label: "Nombre en Copyright", placeholder: "DIMAR FERRETERÍA", icon: "©️" },
];

const SUPPORT_PHONE = "+51 989 600 490";
const BACKUP_PASSWORD = "DIMAR";

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [companyInfo, setCompanyInfo] = useState<CompanyReceiptInfo>(DEFAULT_COMPANY_INFO);
  const [saving, setSaving] = useState(false);
  const [template, setTemplate] = useState<ReceiptTemplate>(DEFAULT_TEMPLATE);
  const [savingTpl, setSavingTpl] = useState(false);

  // Site settings (Hero, CTA, Map)
  const { settings: siteSettings } = useSiteSettings();
  const updateSite = useUpdateSiteSettings();
  const [site, setSite] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  useEffect(() => { if (siteSettings) setSite(siteSettings); }, [siteSettings]);
  const updateSiteField = (k: keyof SiteSettings, v: string) => setSite(p => ({ ...p, [k]: v }));
  const saveSite = async () => {
    try {
      await updateSite.mutateAsync(site);
      toast.success("✅ Sitio web actualizado — se aplica en la home");
    } catch (e: any) { toast.error("Error: " + e.message); }
  };

  useEffect(() => {
    loadTemplateFromDb().then(setTemplate);
  }, []);

  const updateTpl = (patch: Partial<ReceiptTemplate>) => setTemplate(p => ({ ...p, ...patch }));
  const saveTpl = async () => {
    setSavingTpl(true);
    try {
      await saveTemplateToDb(template);
      toast.success("✅ Plantilla de tickets guardada — se aplica en todos los módulos");
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
    setSavingTpl(false);
  };

  const { data: themeSettings = [] } = useQuery({
    queryKey: ["theme_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("theme_settings").select("*").order("key");
      if (error) throw error;
      return data;
    },
  });

  const { data: storedCompanyInfo } = useQuery({
    queryKey: ["receipt_company_info"],
    queryFn: async () => {
      const { data } = await supabase
        .from("store_settings")
        .select("value")
        .eq("key", "receipt_company_info")
        .maybeSingle();
      return data?.value ? { ...DEFAULT_COMPANY_INFO, ...(data.value as any) } : DEFAULT_COMPANY_INFO;
    },
  });

  useEffect(() => {
    if (storedCompanyInfo) setCompanyInfo(storedCompanyInfo);
  }, [storedCompanyInfo]);

  const activateThemeMutation = useMutation({
    mutationFn: async (key: string) => {
      await supabase.from("theme_settings").update({ is_active: false }).neq("key", "___");
      const { error } = await supabase.from("theme_settings").update({ is_active: true }).eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["theme_settings"] });
      toast.success("Tema actualizado");
    },
  });

  const saveCompanyInfo = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("store_settings")
        .select("id")
        .eq("key", "receipt_company_info")
        .maybeSingle();

      if (existing) {
        await supabase.from("store_settings").update({ value: companyInfo as any }).eq("key", "receipt_company_info");
      } else {
        await supabase.from("store_settings").insert({ key: "receipt_company_info", value: companyInfo as any });
      }
      queryClient.invalidateQueries({ queryKey: ["receipt_company_info"] });
      toast.success("✅ Cambios guardados correctamente");
    } catch (e: any) {
      toast.error("Error al guardar: " + e.message);
    }
    setSaving(false);
  };

  // ─── Backup SQL (downloadable JSON snapshot) ───
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupPwd, setBackupPwd] = useState("");
  const downloadBackup = async () => {
    if (backupPwd !== BACKUP_PASSWORD) {
      toast.error("Contraseña incorrecta");
      return;
    }
    setBackupLoading(true);
    try {
      const tables = [
        "products", "categories", "brands", "customers", "suppliers",
        "transactions", "transaction_items", "combos", "combo_items",
        "staff_members", "staff_schedules", "attendance_records",
        "service_orders", "purchases", "purchase_items", "inventory_movements",
        "store_settings", "company_info", "company_locations", "company_team",
        "payment_accounts", "banners", "vitrinas", "appointments",
      ];
      const dump: Record<string, any> = { _meta: { generated_at: new Date().toISOString(), system: "DIMAR FERRETERÍA" } };
      for (const t of tables) {
        const { data, error } = await (supabase as any).from(t).select("*");
        if (!error) dump[t] = data;
      }
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dimar_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup descargado correctamente");
      setBackupPwd("");
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
    setBackupLoading(false);
  };

  const setCI = (patch: Partial<CompanyReceiptInfo>) => setCompanyInfo(prev => ({ ...prev, ...patch }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" /> Configuración
      </h1>

      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="tickets" className="gap-1"><Receipt className="h-4 w-4" /> Tickets</TabsTrigger>
          <TabsTrigger value="sitio" className="gap-1"><Globe className="h-4 w-4" /> Sitio Web</TabsTrigger>
          <TabsTrigger value="apariencia" className="gap-1"><Sparkles className="h-4 w-4" /> Apariencia</TabsTrigger>
          <TabsTrigger value="empresa" className="gap-1"><Building2 className="h-4 w-4" /> Empresa</TabsTrigger>
          <TabsTrigger value="sistema" className="gap-1"><Database className="h-4 w-4" /> Sistema</TabsTrigger>
        </TabsList>

        {/* ─── TICKETS ─── */}
        <TabsContent value="tickets" className="space-y-6 mt-4">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5" /> Datos de Comprobantes / Boletas
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Estos datos aparecen en la cabecera de todos los tickets, boletas y proformas.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {COMPANY_FIELDS.map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <Label className="text-sm flex items-center gap-1.5">
                      <span>{f.icon}</span> {f.label}
                    </Label>
                    <Input
                      value={(companyInfo[f.key] as string) || ""}
                      placeholder={f.placeholder}
                      onChange={e => setCI({ [f.key]: e.target.value } as any)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquareHeart className="h-5 w-5 text-pink-500" /> Mensaje de despedida del Ticket
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Editá libremente el "gracias" final que aparece al pie de cada ticket de venta.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Título destacado</Label>
                <Input
                  value={companyInfo.saleFooterTitle || ""}
                  placeholder="¡Gracias por su compra!"
                  onChange={e => setCI({ saleFooterTitle: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Mensaje (varias líneas permitidas)</Label>
                <Textarea
                  value={companyInfo.saleFooterMessage || ""}
                  rows={3}
                  placeholder="Su confianza es nuestro mayor orgullo..."
                  onChange={e => setCI({ saleFooterMessage: e.target.value })}
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <label className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <span className="text-sm">📧 Mostrar correo</span>
                  <Switch checked={companyInfo.saleFooterShowEmail !== false} onCheckedChange={v => setCI({ saleFooterShowEmail: v })} />
                </label>
                <label className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <span className="text-sm">☏ Mostrar teléfono</span>
                  <Switch checked={companyInfo.saleFooterShowPhone !== false} onCheckedChange={v => setCI({ saleFooterShowPhone: v })} />
                </label>
                <label className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <span className="text-sm">📱 Mostrar redes</span>
                  <Switch checked={!!companyInfo.saleFooterShowSocial} onCheckedChange={v => setCI({ saleFooterShowSocial: v })} />
                </label>
              </div>
              {companyInfo.saleFooterShowSocial && (
                <div className="space-y-1.5">
                  <Label className="text-sm">Usuario / Red Social</Label>
                  <Input
                    value={companyInfo.saleFooterSocial || ""}
                    placeholder="@dimar.ferreteria"
                    onChange={e => setCI({ saleFooterSocial: e.target.value })}
                  />
                </div>
              )}

              {/* Preview */}
              <div className="mt-2 p-4 rounded-lg border-2 border-dashed border-primary/30 bg-gradient-to-b from-muted/40 to-transparent">
                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Vista previa del pie del ticket:</p>
                <div className="text-xs text-center font-mono leading-relaxed">
                  <div className="border-t border-dashed border-foreground/30 my-2" />
                  <p className="font-bold text-sm mb-1">{companyInfo.saleFooterTitle || "¡Gracias!"}</p>
                  {companyInfo.saleFooterMessage && (
                    <p className="opacity-80 whitespace-pre-line">{companyInfo.saleFooterMessage}</p>
                  )}
                  <div className="mt-2 font-semibold space-y-0.5">
                    {companyInfo.saleFooterShowEmail !== false && <p>✉ {companyInfo.email}</p>}
                    {companyInfo.saleFooterShowPhone !== false && <p>☏ {companyInfo.telefono}</p>}
                    {companyInfo.saleFooterShowSocial && companyInfo.saleFooterSocial && <p>📱 {companyInfo.saleFooterSocial}</p>}
                  </div>
                  <p className="mt-3 text-[10px] text-muted-foreground">© {new Date().getFullYear()} {companyInfo.copyright}.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ─── Plantilla global de comprobantes ─── */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Tipos de Comprobante y Títulos
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Estos títulos se aplican automáticamente al imprimir el comprobante seleccionado en POS, Ventas y Contabilidad.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Recepción Técnica</Label>
                  <Input value={template.receptionTitle} onChange={e => updateTpl({ receptionTitle: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Ticket de Servicio</Label>
                  <Input value={template.serviceTitle} onChange={e => updateTpl({ serviceTitle: e.target.value })} />
                </div>
                {DOCUMENT_KINDS.map(d => (
                  <div key={d.value} className="space-y-1.5">
                    <Label className="text-xs">📑 {d.label}</Label>
                    <Input
                      value={(template[d.templateKey] as string) || ""}
                      placeholder={d.label.toUpperCase()}
                      onChange={e => updateTpl({ [d.templateKey]: e.target.value } as any)}
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Pie / Mensaje genérico (Recepción y Servicio)</Label>
                <Textarea
                  rows={2}
                  value={template.footerText}
                  onChange={e => updateTpl({ footerText: e.target.value })}
                />
                <p className="text-[11px] text-muted-foreground">El pie de las ventas usa el "Mensaje de despedida" definido arriba.</p>
              </div>
              <Button onClick={saveTpl} disabled={savingTpl} size="sm">
                {savingTpl ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Guardar Plantilla de Comprobantes
              </Button>
            </CardContent>
          </Card>

          <Button onClick={saveCompanyInfo} disabled={saving} size="lg" className="w-full sm:w-auto">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar cambios de Tickets
          </Button>
        </TabsContent>

        {/* ─── SITIO WEB ─── */}
        <TabsContent value="sitio" className="space-y-6 mt-4">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="h-5 w-5" /> Hero Principal</CardTitle>
              <p className="text-sm text-muted-foreground">Texto grande de la portada (ej. "TODO EN FERRETERÍA PARA TUS PROYECTOS").</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Eyebrow / Etiqueta</Label><Input value={site.hero_eyebrow} onChange={e => updateSiteField("hero_eyebrow", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Texto del botón</Label><Input value={site.hero_cta_text} onChange={e => updateSiteField("hero_cta_text", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Título línea 1</Label><Input value={site.hero_title_1} onChange={e => updateSiteField("hero_title_1", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Título palabra destacada (amarillo)</Label><Input value={site.hero_title_accent} onChange={e => updateSiteField("hero_title_accent", e.target.value)} /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Título línea 2</Label><Input value={site.hero_title_2} onChange={e => updateSiteField("hero_title_2", e.target.value)} /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Subtítulo</Label><Textarea rows={2} value={site.hero_subtitle} onChange={e => updateSiteField("hero_subtitle", e.target.value)} /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Link del botón (ej: /catalogo)</Label><Input value={site.hero_cta_link} onChange={e => updateSiteField("hero_cta_link", e.target.value)} /></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><MessageCircle className="h-5 w-5" /> Sección "¿Tienes un proyecto en mente?"</CardTitle>
              <p className="text-sm text-muted-foreground">CTA con botón a WhatsApp (+51 931 697 638).</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Eyebrow</Label><Input value={site.project_cta_eyebrow} onChange={e => updateSiteField("project_cta_eyebrow", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Texto del botón</Label><Input value={site.project_cta_button} onChange={e => updateSiteField("project_cta_button", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Título</Label><Input value={site.project_cta_title} onChange={e => updateSiteField("project_cta_title", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Título palabra destacada</Label><Input value={site.project_cta_title_accent} onChange={e => updateSiteField("project_cta_title_accent", e.target.value)} /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Descripción</Label><Textarea rows={2} value={site.project_cta_description} onChange={e => updateSiteField("project_cta_description", e.target.value)} /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Mensaje pre-cargado en WhatsApp</Label><Textarea rows={2} value={site.project_cta_whatsapp_message} onChange={e => updateSiteField("project_cta_whatsapp_message", e.target.value)} /></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5" /> Footer · Ubicación</CardTitle>
              <p className="text-sm text-muted-foreground">
                Para el mapa, abrí Google Maps → Compartir → Insertar mapa, copiá la URL del <code>src</code> del iframe y pegala acá.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Dirección visible en el footer</Label>
                <Input value={site.footer_address} onChange={e => updateSiteField("footer_address", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>URL del iframe de Google Maps</Label>
                <Textarea rows={2} className="font-mono text-xs" value={site.footer_map_embed_url} onChange={e => updateSiteField("footer_map_embed_url", e.target.value)} />
              </div>
              {site.footer_map_embed_url && (
                <div className="rounded-lg overflow-hidden border border-primary/20 aspect-video max-w-md">
                  <iframe title="Vista previa mapa" src={site.footer_map_embed_url} className="w-full h-full" loading="lazy" />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveSite} disabled={updateSite.isPending} size="lg" className="gap-2">
              {updateSite.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar cambios del sitio
            </Button>
          </div>
        </TabsContent>

        {/* ─── APARIENCIA ─── */}
        <TabsContent value="apariencia" className="space-y-6 mt-4">
          <Card className="border-primary/10">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Sun className="h-5 w-5" /> Modo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Modo Oscuro</Label>
                  <p className="text-xs text-muted-foreground">Alterna entre modo claro y oscuro</p>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><PartyPopper className="h-5 w-5" /> Temas Estacionales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Activa un tema festivo para toda la tienda.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {themeSettings.map((t: any) => {
                  const val = t.value as any;
                  const emoji = THEME_EMOJIS[t.key] || "🎨";
                  const isActive = t.is_active;
                  return (
                    <div
                      key={t.id}
                      className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isActive ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-border hover:border-primary/30 hover:bg-secondary/30"
                      }`}
                      onClick={() => activateThemeMutation.mutate(t.key)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{emoji}</span>
                        <div>
                          <p className="font-semibold text-sm">{val.name || t.key}</p>
                          {val.particles && <p className="text-xs text-muted-foreground">Con partículas</p>}
                        </div>
                      </div>
                      {isActive && <Badge className="absolute top-2 right-2 text-[10px]">Activo</Badge>}
                      <div className="mt-2 flex gap-1">
                        <div className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: `hsl(${val.primary_hue}, 72%, 45%)` }} />
                        <div className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: `hsl(${val.accent_hue}, 90%, 50%)` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── EMPRESA ─── */}
        <TabsContent value="empresa" className="mt-4">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Building2 className="h-5 w-5" /> Información Corporativa</CardTitle>
              <p className="text-sm text-muted-foreground">
                Para gestionar sedes, equipo, certificaciones y biografía de la empresa, usá el módulo "Empresa" en el menú lateral.
              </p>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <a href="/admin/empresa"><Building2 className="h-4 w-4 mr-2" /> Ir a módulo de Empresa</a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── SISTEMA ─── */}
        <TabsContent value="sistema" className="space-y-6 mt-4">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Database className="h-5 w-5 text-primary" /> Backup del Sistema</CardTitle>
              <p className="text-sm text-muted-foreground">
                Descarga una copia completa de tu base de datos en formato JSON. Mantén este archivo en un lugar seguro.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={backupPwd}
                    onChange={e => setBackupPwd(e.target.value)}
                    placeholder="Contraseña de backup"
                    className="pl-9"
                  />
                </div>
                <Button onClick={downloadBackup} disabled={backupLoading || !backupPwd} className="gap-2">
                  {backupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                  Generar Backup
                </Button>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground">
                <p>💡 ¿Olvidaste la contraseña? Contacta a soporte técnico:</p>
                <p className="mt-1 font-bold text-primary">📞 {SUPPORT_PHONE}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Database className="h-5 w-5 text-primary" /> Conexión Base de Datos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Variables de entorno usadas para conectar el frontend con Supabase. En despliegue (Vercel) configúralas en <strong>Project Settings → Environment Variables</strong>.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">VITE_SUPABASE_URL</Label>
                <Input readOnly value={import.meta.env.VITE_SUPABASE_URL || ""} className="font-mono text-xs" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">VITE_SUPABASE_PUBLISHABLE_KEY</Label>
                <Input readOnly value={import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""} className="font-mono text-xs" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">VITE_SUPABASE_PROJECT_ID</Label>
                <Input readOnly value={import.meta.env.VITE_SUPABASE_PROJECT_ID || ""} className="font-mono text-xs" />
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground">
                <p>🔐 Estos valores son <strong>publishable</strong> (seguros para el cliente). La <code>service_role key</code> nunca debe exponerse en el frontend.</p>
                <p className="mt-1">Para migrar de proyecto Supabase: actualiza estas variables en Vercel y vuelve a desplegar.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><MessageSquareHeart className="h-4 w-4 text-pink-500" /> Soporte Técnico DIMAR</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">¿Necesitas ayuda con el sistema o reportar un problema?</p>
              <p className="font-bold text-primary text-lg">📞 {SUPPORT_PHONE}</p>
              <Button asChild variant="outline" size="sm" className="mt-2">
                <a href={`https://wa.me/51989600490?text=${encodeURIComponent("Hola, necesito soporte técnico del sistema DIMAR.")}`} target="_blank" rel="noreferrer">
                  💬 Escribir por WhatsApp
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
