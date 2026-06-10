import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";

const app = new Hono();

app.use('*', logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.get("/make-server-871aede6/health", (c) => {
  return c.json({ status: "ok" });
});

// POST /make-server-871aede6/detect-ingredients
// Body: { imageBase64: string } (base64 JPEG/PNG, no data URI prefix)
// Returns: { ingredients: string[] }
app.post("/make-server-871aede6/detect-ingredients", async (c) => {
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiApiKey) {
    return c.json({ error: "GEMINI_API_KEY not configured" }, 500);
  }

  let body: { imageBase64?: string; mimeType?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { imageBase64, mimeType = "image/jpeg" } = body;
  if (!imageBase64) {
    return c.json({ error: "imageBase64 is required" }, 400);
  }

  const prompt = `Analyse cette photo et identifie UNIQUEMENT les ingrédients alimentaires visibles.
Réponds UNIQUEMENT avec un tableau JSON de noms d'ingrédients en français, par exemple :
["tomates", "courgettes", "ail", "basilic"]
Ne retourne rien d'autre que ce tableau JSON. Si aucun aliment n'est visible, retourne [].`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: imageBase64 } },
            ],
          }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.log(`Gemini detect error: ${response.status} - ${err}`);
      return c.json({ error: `Gemini API error: ${response.status}`, detail: err }, 502);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    const ingredients = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    return c.json({ ingredients });
  } catch (err) {
    console.log(`Error detecting ingredients: ${err}`);
    return c.json({ error: `Server error: ${err}` }, 500);
  }
});

// POST /make-server-871aede6/recipes
// Body: { ingredients: string[], filters?: string[] }
// Returns: { recipes: Recipe[] }
app.post("/make-server-871aede6/recipes", async (c) => {
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiApiKey) {
    return c.json({ error: "GEMINI_API_KEY not configured" }, 500);
  }

  let body: { ingredients?: string[]; filters?: string[] };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { ingredients = [], filters = [] } = body;
  if (ingredients.length === 0) {
    return c.json({ error: "No ingredients provided" }, 400);
  }

  const filterDesc = filters.length > 0
    ? `Contraintes obligatoires : ${filters.map(f => ({
        vegan: "recettes 100% véganes (sans viande, poisson, œufs, produits laitiers)",
        rapide: "temps total (préparation + cuisson) ≤ 20 minutes",
        facile: "difficulté = facile",
        "sans-gluten": "sans gluten (pas de blé, orge, seigle, épeautre)",
        chaud: "plats servis chauds",
        froid: "plats servis froids ou à température ambiante",
      }[f] ?? f)).join(". ")}.`
    : "";

  const prompt = `Tu es un chef cuisinier expert. L'utilisateur a ces ingrédients qui vont bientôt périmer : ${ingredients.join(", ")}.
${filterDesc}
Propose exactement 8 recettes créatives et réelles qui utilisent au maximum ces ingrédients. Varie les types (entrées, plats, desserts, soupes).
Réponds UNIQUEMENT avec un tableau JSON valide, sans texte avant ni après, sans balises markdown :
[
  {
    "id": "1",
    "title": "Nom de la recette",
    "description": "Description courte et appétissante (max 2 phrases)",
    "prepTime": 10,
    "cookTime": 15,
    "difficulty": "facile",
    "tags": ["vegan", "rapide"],
    "ingredients": ["200g de tomates", "2 gousses d'ail"],
    "steps": ["Étape 1.", "Étape 2.", "Étape 3."],
    "image": "",
    "calories": 280
  }
]
Règles strictes :
- difficulty : exactement "facile", "moyen" ou "difficile"
- tags : valeurs autorisées uniquement : "vegan", "rapide", "facile", "sans-gluten", "chaud", "froid"
- "rapide" uniquement si prepTime + cookTime ≤ 20
- prepTime et cookTime : entiers en minutes
- calories : entier
- 4 à 6 steps, 4 à 8 ingredients avec quantités précises
- Réponds UNIQUEMENT avec le JSON brut, aucun texte autour`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 8192 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.log(`Gemini recipes error: ${response.status} - ${err}`);
      return c.json({ error: `Gemini API error: ${response.status}`, detail: err }, 502);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.log(`Could not parse Gemini response: ${text}`);
      return c.json({ error: "Could not parse Gemini response", raw: text }, 502);
    }

    const recipes = JSON.parse(jsonMatch[0]);

    const imageMap: Record<string, string> = {
      default: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&auto=format",
      soupe: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&auto=format",
      velout: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&auto=format",
      salade: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&auto=format",
      omelette: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop&auto=format",
      curry: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&auto=format",
      "pât": "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop&auto=format",
      riz: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&h=300&fit=crop&auto=format",
      poulet: "https://images.unsplash.com/photo-1598103442097-8b74394b95c4?w=400&h=300&fit=crop&auto=format",
      pizza: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&auto=format",
      tarte: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400&h=300&fit=crop&auto=format",
      "gâteau": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&auto=format",
      tomate: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=400&h=300&fit=crop&auto=format",
      poisson: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&auto=format",
      wok: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop&auto=format",
      gratin: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop&auto=format",
      gaspacho: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&h=300&fit=crop&auto=format",
    };

    const recipesWithImages = recipes.map((r: Record<string, unknown>) => {
      const title = String(r.title ?? "").toLowerCase();
      let image = imageMap.default;
      for (const [keyword, url] of Object.entries(imageMap)) {
        if (keyword !== "default" && title.includes(keyword)) {
          image = url;
          break;
        }
      }
      return { ...r, id: crypto.randomUUID(), image };
    });

    return c.json({ recipes: recipesWithImages });
  } catch (err) {
    console.log(`Error calling Gemini: ${err}`);
    return c.json({ error: `Server error: ${err}` }, 500);
  }
});

Deno.serve(app.fetch);
