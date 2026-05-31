export const WHATSAPP_NUMBER = "51931697638";
export const COMPANY_NAME = "DIMAR Ferretería";
export const COMPANY_EMAIL = "dimarferreteria@gmail.com";
export const COMPANY_PHONE = "+51 931 697 638";
export const COMPANY_ADDRESS = "Ilo, Moquegua - Perú";
export const CURRENCY = "S/";

// Usuario super-admin protegido (no puede ser revocado sin código)
export const PROTECTED_ADMIN_USER_ID = "ad84d591-4d14-4b1d-943c-25288850906d";
export const PROTECTED_ADMIN_EMAIL = "cruzj6134@gmail.com";
export const REVOCATION_CODE = "004";

export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/dimarferreteria",
  tiktok: "",
  youtube: "",
};

export const COMPANY_INFO = {
  mission: "Satisfacer las necesidades de nuestros clientes en materiales de construcción, herramientas y artículos para el hogar, brindando productos de calidad, precios competitivos y una atención cercana que genera confianza y fidelidad.",
  vision: "Ser la ferretería de referencia en Ilo y la región Moquegua, reconocida por la variedad de nuestro inventario, la calidad de nuestros productos y la excelencia en el servicio al cliente, acompañando cada proyecto desde sus inicios hasta su culminación.",
  description: "Ferretería DIMAR, tu aliado en construcción y hogar. Ofrecemos una amplia gama de productos para profesionales y familias, con atención personalizada y los mejores precios de la región.",
};

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  isFeatured?: boolean;
  stock: number;
  discount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  subcategories?: Category[];
}

export const MOCK_CATEGORIES: Category[] = [
  { id: "1", name: "Herramientas", slug: "herramientas", subcategories: [
    { id: "1a", name: "Eléctricas", slug: "herramientas-electricas" },
    { id: "1b", name: "Manuales", slug: "herramientas-manuales" },
    { id: "1c", name: "Neumáticas", slug: "herramientas-neumaticas" },
  ]},
  { id: "2", name: "Materiales de Construcción", slug: "materiales-construccion", subcategories: [
    { id: "2a", name: "Cemento y Agregados", slug: "cemento-agregados" },
    { id: "2b", name: "Ladrillos y Bloques", slug: "ladrillos-bloques" },
    { id: "2c", name: "Aceros y Alambrón", slug: "aceros-alambron" },
  ]},
  { id: "3", name: "Pinturas y Acabados", slug: "pinturas-acabados", subcategories: [
    { id: "3a", name: "Pinturas Látex", slug: "pinturas-latex" },
    { id: "3b", name: "Esmaltes y Barnices", slug: "esmaltes-barnices" },
    { id: "3c", name: "Impermeabilizantes", slug: "impermeabilizantes" },
  ]},
  { id: "4", name: "Plomería y Grifería", slug: "plomeria-griferia" },
  { id: "5", name: "Electricidad e Iluminación", slug: "electricidad-iluminacion" },
  { id: "6", name: "Ferretería General", slug: "ferreteria-general" },
  { id: "7", name: "Jardín y Exterior", slug: "jardin-exterior" },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: "1", name: "Taladro Percutor 13mm 710W Profesional", brand: "Bosch", price: 289, originalPrice: 349, image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop", category: "herramientas", isFeatured: true, stock: 15, discount: 17 },
  { id: "2", name: "Cemento Portland Tipo I 42.5kg", brand: "Sol", price: 32, originalPrice: 36, image: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=400&h=400&fit=crop", category: "materiales-construccion", isFeatured: true, stock: 80, discount: 11 },
  { id: "3", name: "Pintura Látex Blanco 18L", brand: "Glidden", price: 189, originalPrice: 229, image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=400&fit=crop", category: "pinturas-acabados", isFeatured: true, stock: 25, discount: 17 },
  { id: "4", name: "Llave de Paso 1/2\" PVC", brand: "Tigre", price: 15, originalPrice: 19, image: "https://images.unsplash.com/photo-1581578731548-c64695ca5e96?w=400&h=400&fit=crop", category: "plomeria-griferia", isFeatured: true, stock: 40, discount: 21 },
  { id: "5", name: "Set Destornilladores 6 piezas Magnéticos", brand: "Truper", price: 45, originalPrice: 59, image: "https://images.unsplash.com/photo-1581166397057-235af2b7c6ef?w=400&h=400&fit=crop", category: "herramientas", isFeatured: true, stock: 30, discount: 24 },
  { id: "6", name: "Ladrillo King Kong 18 huecos", brand: "Lark", price: 3.5, image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=400&fit=crop", category: "materiales-construccion", isNew: true, stock: 500 },
  { id: "7", name: "Foco LED 9W Luz Fría E27", brand: "Philips", price: 12, originalPrice: 16, image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=400&h=400&fit=crop", category: "electricidad-iluminacion", isNew: true, stock: 100, discount: 25 },
  { id: "8", name: "Manguera de Riego 1/2\" 50m Reforzada", brand: "Ferco", price: 89, image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop", category: "jardin-exterior", isNew: true, stock: 20 },
  { id: "9", name: "Cerradura de Pomo para Baño", brand: "Yale", price: 65, originalPrice: 79, image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop", category: "ferreteria-general", isNew: true, stock: 18, discount: 18 },
  { id: "10", name: "Sierra Caladora 550W Velocidad Variable", brand: "Makita", price: 459, originalPrice: 529, image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop", category: "herramientas", isNew: true, stock: 8, discount: 13 },
];

export const MOCK_BRANDS = [
  { name: "Bosch", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Bosch-logo.svg/200px-Bosch-logo.svg.png" },
  { name: "Truper", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Truper_logo.png/200px-Truper_logo.png" },
  { name: "Makita", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Makita_logo.svg/200px-Makita_logo.svg.png" },
  { name: "Philips", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Philips_logo.svg/200px-Philips_logo.svg.png" },
  { name: "Dewalt", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/DeWalt_logo.svg/200px-DeWalt_logo.svg.png" },
  { name: "Glidden", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Glidden_logo.svg/200px-Glidden_logo.svg.png" },
  { name: "Yale", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Yale_Locks_logo.svg/200px-Yale_Locks_logo.svg.png" },
  { name: "Sol", logo: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=100&h=60&fit=crop" },
];
