import { Link } from "react-router-dom";
import { 
  Wrench, Hammer, Paintbrush, Droplets, Zap, Settings, Flower2,
  Package, Pickaxe, BrickWall, PaintBucket, HardHat, Ruler, Truck, TreePine, Shovel, ShoppingBag
} from "lucide-react";
import { useCategories } from "@/features/shop/hooks/useCategories";
import { MOCK_CATEGORIES } from "@/lib/constants";

const iconMap: Record<string, any> = {
  // Herramientas
  herramientas: Wrench, herramienta: Wrench,
  "herramientas-electricas": Zap, "herramientas-manuales": Hammer, "herramientas-neumaticas": Settings,
  // Materiales de construcción
  "materiales-construccion": BrickWall, "material-construccion": BrickWall,
  "cemento-agregados": Package, "ladrillos-bloques": BrickWall, "aceros-alambron": Ruler,
  // Pinturas y acabados
  "pinturas-acabados": Paintbrush, pintura: Paintbrush, pinturas: Paintbrush,
  "pinturas-latex": PaintBucket, "esmaltes-barnices": Paintbrush, impermeabilizantes: Droplets,
  // Plomería y grifería
  "plomeria-griferia": Droplets, plomeria: Droplets, griferia: Droplets,
  // Electricidad e iluminación
  "electricidad-iluminacion": Zap, electricidad: Zap, iluminacion: Zap,
  // Ferretería general
  "ferreteria-general": Settings, ferreteria: Settings,
  // Jardín y exterior
  "jardin-exterior": Flower2, jardin: Flower2, exterior: TreePine,
  // Fallbacks
  package: Package,
  shopping: ShoppingBag,
  truck: Truck,
  pickaxe: Pickaxe,
  "hard-hat": HardHat,
};

const CategoryBar = () => {
  const { categories, loading } = useCategories();

  const cats = categories.length > 0 ? categories : MOCK_CATEGORIES.map(c => ({ ...c, children: c.subcategories }));

  return (
    <section className="py-8 bg-secondary/20 relative">
      <div className="absolute inset-0 bg-cyber-lines" />
      <div className="container relative">
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {cats.map((cat) => {
            const iconKey = cat.icon?.toLowerCase() || cat.slug?.toLowerCase() || "";
            const Icon = iconMap[iconKey] || iconMap[cat.slug] || Package;
            return (
              <Link key={cat.id} to={`/catalogo?cat=${cat.slug}`} className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-card/80 border border-transparent hover:border-primary/20 transition-all group hover:glow-green-sm">
                <div className="h-12 w-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-all">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-medium text-center">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryBar;
