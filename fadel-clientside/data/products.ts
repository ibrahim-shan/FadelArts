export type Product = {
  slug: string;
  title: string;
  artist: string;
  price: number;
  description: string;
  images: string[];
  dimensions?: string;
  medium?: string;
  year?: number;
  materials?: string;
};

export const products: Product[] = [
  {
    slug: "morning-light",
    title: "Morning Light",
    artist: "A. Drawer",
    price: 350,
    description:
      "A serene composition exploring the warmth of first light through layered textures and balanced color.",
    images: ["/hero-1.svg", "/hero-2.svg", "/hero-3.svg", "/hero-4.svg"],
    dimensions: "60 × 80 cm",
    medium: "Acrylic on canvas",
    year: 2023,
    materials: "Canvas, acrylic pigments",
  },
  {
    slug: "urban-echoes",
    title: "Urban Echoes",
    artist: "B. Painter",
    price: 420,
    description:
      "Rhythmic shapes and muted tones that capture the pulse of city life in an abstract language.",
    images: ["/hero-2.svg", "/hero-3.svg", "/hero-1.svg"],
    dimensions: "50 × 70 cm",
    medium: "Mixed media",
    year: 2022,
    materials: "Canvas, ink, acrylic",
  },
  {
    slug: "quiet-waters",
    title: "Quiet Waters",
    artist: "C. Maker",
    price: 440,
    description:
      "Calm gradations and soft contrasts evoke the stillness and depth of a reflective surface.",
    images: ["/hero-3.svg", "/hero-1.svg", "/hero-4.svg"],
    dimensions: "70 × 70 cm",
    medium: "Oil on panel",
    year: 2021,
    materials: "Wood panel, oil paints",
  },
  {
    slug: "golden-hour",
    title: "Golden Hour",
    artist: "D. Artist",
    price: 610,
    description: "Warm, glowing tones capture the fleeting light just before dusk.",
    images: ["/hero-4.svg", "/hero-1.svg", "/hero-2.svg"],
    dimensions: "80 × 100 cm",
    medium: "Acrylic on canvas",
    year: 2024,
    materials: "Canvas, acrylic pigments",
  },
  {
    slug: "city-mist",
    title: "City Mist",
    artist: "E. Color",
    price: 390,
    description: "Soft gradients and cool layers suggest a skyline cloaked in fog.",
    images: ["/hero-2.svg", "/hero-3.svg"],
    dimensions: "45 × 60 cm",
    medium: "Gouache on paper",
    year: 2020,
    materials: "Cotton paper, gouache",
  },
  {
    slug: "waking-dawn",
    title: "Waking Dawn",
    artist: "F. Lines",
    price: 510,
    description: "A crisp palette and gentle contrasts evoke dawn’s first energies.",
    images: ["/hero-1.svg", "/hero-3.svg"],
    dimensions: "65 x 85 cm",
    medium: "Oil on canvas",
    year: 2023,
    materials: "Canvas, oil paints",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
