export type Filter = "vegan" | "rapide" | "facile" | "sans-gluten" | "chaud" | "froid";

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: number; // minutes
  cookTime: number; // minutes
  difficulty: "facile" | "moyen" | "difficile";
  tags: Filter[];
  ingredients: string[];
  steps: string[];
  image: string;
  calories: number;
}

export const MOCK_RECIPES: Recipe[] = [
  {
    id: "1",
    title: "Poêlée de courgettes au basilic",
    description: "Un plat léger et savoureux avec vos courgettes qui commencent à ramollir.",
    prepTime: 10,
    cookTime: 15,
    difficulty: "facile",
    tags: ["vegan", "rapide", "facile", "sans-gluten", "chaud"],
    ingredients: ["2 courgettes", "1 gousse d'ail", "Basilic frais", "Huile d'olive", "Sel, poivre"],
    steps: [
      "Couper les courgettes en rondelles.",
      "Faire chauffer l'huile dans une poêle à feu vif.",
      "Ajouter l'ail émincé et les courgettes.",
      "Faire sauter 12-15 minutes jusqu'à coloration.",
      "Assaisonner et ajouter le basilic frais."
    ],
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&auto=format",
    calories: 120,
  },
  {
    id: "2",
    title: "Salade de tomates mozarella",
    description: "Classique et rafraîchissant, idéal pour les tomates bien mûres.",
    prepTime: 10,
    cookTime: 0,
    difficulty: "facile",
    tags: ["rapide", "facile", "sans-gluten", "froid"],
    ingredients: ["3 tomates", "125g mozzarella", "Basilic", "Huile d'olive", "Vinaigre balsamique"],
    steps: [
      "Couper les tomates et la mozzarella en tranches.",
      "Disposer en alternance sur un plat.",
      "Arroser d'huile d'olive et de vinaigre balsamique.",
      "Ajouter les feuilles de basilic et assaisonner."
    ],
    image: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=400&h=300&fit=crop&auto=format",
    calories: 220,
  },
  {
    id: "3",
    title: "Soupe de carottes au gingembre",
    description: "Veloutée et réconfortante, parfaite pour vos carottes oubliées.",
    prepTime: 15,
    cookTime: 25,
    difficulty: "facile",
    tags: ["vegan", "facile", "sans-gluten", "chaud"],
    ingredients: ["500g carottes", "1 oignon", "2cm gingembre frais", "400ml lait de coco", "Bouillon légumes"],
    steps: [
      "Éplucher et couper les carottes et l'oignon.",
      "Faire revenir l'oignon dans une casserole avec un peu d'huile.",
      "Ajouter les carottes, le gingembre et couvrir de bouillon.",
      "Cuire 20 minutes puis mixer.",
      "Ajouter le lait de coco et rectifier l'assaisonnement."
    ],
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&auto=format",
    calories: 180,
  },
  {
    id: "4",
    title: "Omelette aux champignons",
    description: "Rapide et protéinée, parfaite pour vos champignons à finir.",
    prepTime: 5,
    cookTime: 10,
    difficulty: "facile",
    tags: ["rapide", "facile", "sans-gluten", "chaud"],
    ingredients: ["3 œufs", "150g champignons", "30g beurre", "Persil", "Sel, poivre"],
    steps: [
      "Nettoyer et émincer les champignons.",
      "Faire revenir les champignons dans le beurre 5 minutes.",
      "Battre les œufs avec sel et poivre.",
      "Verser les œufs sur les champignons.",
      "Plier l'omelette et servir avec le persil."
    ],
    image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop&auto=format",
    calories: 290,
  },
  {
    id: "5",
    title: "Curry de pois chiches aux épinards",
    description: "Riche et parfumé, un classique vegan pour épuiser vos légumes verts.",
    prepTime: 10,
    cookTime: 20,
    difficulty: "moyen",
    tags: ["vegan", "sans-gluten", "chaud"],
    ingredients: ["1 boîte pois chiches", "200g épinards", "400ml lait de coco", "2 tomates", "Curry, cumin, coriandre"],
    steps: [
      "Faire revenir l'oignon avec les épices.",
      "Ajouter les tomates concassées et cuire 5 min.",
      "Incorporer les pois chiches égouttés.",
      "Verser le lait de coco et mijoter 10 minutes.",
      "Ajouter les épinards et cuire 3 minutes supplémentaires."
    ],
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&auto=format",
    calories: 350,
  },
  {
    id: "6",
    title: "Gaspacho andalou",
    description: "Soupe froide rafraîchissante pour vos tomates et concombres bien mûrs.",
    prepTime: 15,
    cookTime: 0,
    difficulty: "facile",
    tags: ["vegan", "rapide", "facile", "sans-gluten", "froid"],
    ingredients: ["4 tomates", "1/2 concombre", "1 poivron rouge", "1 gousse d'ail", "Huile d'olive, vinaigre"],
    steps: [
      "Couper grossièrement tous les légumes.",
      "Mixer avec l'ail, l'huile et le vinaigre.",
      "Assaisonner et ajuster la consistance avec de l'eau.",
      "Réfrigérer au moins 1 heure avant de servir.",
      "Servir bien frais avec des croûtons."
    ],
    image: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&h=300&fit=crop&auto=format",
    calories: 95,
  },
];

export const FILTER_LABELS: Record<Filter, string> = {
  vegan: "🌱 Végan",
  rapide: "⚡ Rapide",
  facile: "😊 Facile",
  "sans-gluten": "🌾 Sans gluten",
  chaud: "🔥 Chaud",
  froid: "❄️ Froid",
};

export const DETECTED_INGREDIENTS = [
  ["courgettes", "tomates", "basilic", "ail"],
  ["carottes", "gingembre", "oignon"],
  ["champignons", "œufs", "persil"],
  ["épinards", "pois chiches", "tomates cerises"],
  ["concombre", "tomate", "poivron rouge", "ail"],
];
