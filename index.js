import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🌿 Flowertelier Canopy is awake");
});

app.get("/view", (req, res) => {
  res.send(`
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Flowertelier Canopy Viewer</title>
  <style>
    body { font-family: system-ui, Arial; padding: 24px; max-width: 900px; margin: auto; }
    .box { border: 1px solid #ddd; border-radius: 12px; padding: 16px; margin-top: 16px; white-space: pre-wrap; }
    input, select, button { padding: 10px; margin: 6px 0; width: 100%; max-width: 520px; }
    button { cursor: pointer; }
  </style>
</head>
<body>
  <h2>🌿 Flowertelier Canopy Viewer</h2>

  <label>Fern Type</label>
  <select id="fernType">
    <option value="">Any</option>
    <option value="Potion">Potion</option>
    <option value="Eatery">Eatery</option>
    <option value="Experience">Experience</option>
  </select>

  <label>Ingredient (optional)</label>
  <input id="ingredient" placeholder="Neem, millet, jasmine..." />

  <label>Service Mode (optional)</label>
  <select id="serviceMode">
    <option value="">Any</option>
    <option value="Online">Online</option>
    <option value="Offline">Offline</option>
  </select>

  <label>Service Area (optional)</label>
  <input id="serviceArea" placeholder="Pan India, Dehradun, Worldwide..." />

  <button id="btn">Hum FernBio 🍈</button>

  <div class="box" id="out">Waiting for your hum…</div>

<script>
  const out = document.getElementById("out");
  document.getElementById("btn").onclick = async () => {
    out.textContent = "Leafing… 🌿";
    const body = {
      fernType: document.getElementById("fernType").value || undefined,
      ingredient: document.getElementById("ingredient").value || undefined,
      serviceMode: document.getElementById("serviceMode").value || undefined,
      serviceArea: document.getElementById("serviceArea").value || undefined,
    };
    const r = await fetch("/canopy/hum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    if (!j.ok) { out.textContent = "❌ " + (j.error || "Unknown error"); return; }
    out.textContent = j.results?.[0]?.hum || JSON.stringify(j, null, 2);
  };
</script>
</body>
</html>
  `);
});


app.post("/canopy/echo", (req, res) => {
  res.json({
    ok: true,
    received: req.body,
    note: "🌿 Echo branch is alive",
  });
});

app.post("/canopy/search", async (req, res) => {
  try {
    const { fernType } = req.body;

    const response = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          filter: fernType ? {
            property: "Fern Type",
            select: { equals: fernType }
          } : undefined
        })
      }
    );

    const data = await response.json();
    res.json({ ok: true, results: data.results });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post("/canopy/hum", async (req, res) => {
  try {
    const { fernType } = req.body;

    const notionRes = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          filter: fernType ? {
            property: "Fern Type",
            select: { equals: fernType }
          } : undefined,
          page_size: 3
        })
      }
    );

    const data = await notionRes.json();
    const results = (data.results || []).map(humFernBio);

    res.json({ ok: true, results });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

function pickPlainText(rich = []) {
  return rich.map(t => t.plain_text).join("");
}

function safeSelect(prop) {
  return prop?.select?.name || "";
}

function safeMulti(prop) {
  return (prop?.multi_select || []).map(x => x.name);
}

function safeUrl(prop) {
  return prop?.url || "";
}

function safeTitle(prop) {
  const t = prop?.title || [];
  return pickPlainText(t) || "Untitled FernBio";
}

function makeBloombytes() {
  const base = 222;
  const bonus = Math.floor(Math.random() * 112);
  return Math.min(333, base + bonus);
}

function humFernBio(page) {
  const p = page.properties || {};

  const name = safeTitle(p["Fern Name"]);
  const fernType = safeSelect(p["Fern Type"]);
  const category = safeSelect(p["Category"]);
  const ingredients = safeMulti(p["Ingredients"]);
  const link = page.url;

  const bloombytes = makeBloombytes();

  const ingredientLine = ingredients.length
    ? ingredients.map(x => `• ${x}`).join("\n")
    : "• Whispergrown ingredients not listed yet";

  return {
    fernName: name,
    fernType,
    category,
    bloombytes,
    link,
    hum: `
🍈 FernBio
${name}
Type. ${fernType || "Leaf"}
Category. ${category || "Canopy"}

Bloombytes. ${bloombytes} / 333 🌿✨

Whispergrown
${ingredientLine}

Chloroscene Ritual
• Open this FernBio under soft light or rain-sound 🎧🌧️
• Read the name once, slowly. Let it land like pollen
• Then tap the link. Let the Canopy show the full leaf 🍃

Link. ${link}
`.trim()
  };
}


app.post("/canopy/search", async (req, res) => {
  try {
    const { fernType, ingredient, serviceMode, serviceArea } = req.body;
    const filters = [];

    if (fernType) {
      filters.push({
        property: "Fern Type",
        select: { equals: fernType }
      });
    }

    if (ingredient) {
      filters.push({
        property: "Ingredients",
        multi_select: { contains: ingredient }
      });
    }

    if (serviceMode) {
      filters.push({
        property: "Service Mode",
        select: { equals: serviceMode }
      });
    }

    if (serviceArea) {
      filters.push({
        property: "Service Area",
        multi_select: { contains: serviceArea }
      });
    }

    const response = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          filter: filters.length ? { and: filters } : undefined
        })
      }
    );

    const data = await response.json();

    const results = data.results.map(item => ({
      fern_name: item.properties["Fern Name"]?.title?.[0]?.plain_text || "",
      fern_type: item.properties["Fern Type"]?.select?.name || "",
      category: item.properties["Category"]?.select?.name || "",
      ingredients: item.properties["Ingredients"]?.multi_select?.map(i => i.name) || [],
      service_mode: item.properties["Service Mode"]?.select?.name || "",
      service_area: item.properties["Service Area"]?.multi_select?.map(a => a.name) || [],
      link: item.properties["Link"]?.url || "",
      bloombyte_range: item.properties["Bloombyte Range"]?.rich_text?.[0]?.plain_text || ""
    }));

    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: "Canopy trunk error", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log("🌳 Canopy trunk listening on port", PORT);
  });
}

// 🌿 Gateleaf Guard (Petal 6A)
const requireCanopyKey = (req, res, next) => {
  const serverKey = process.env.CANOPY_API_KEY;
  // If you forgot to set the key on Vercel, keep it loud:
  if (!serverKey) {
    return res.status(500).json({ ok: false, error: "CANOPY_API_KEY is missing on server" });
  }

  const incomingKey = req.header("x-canopy-key");
  if (!incomingKey || incomingKey !== serverKey) {
    return res.status(401).json({
      ok: false,
      error: "Gateleaf denied",
      hint: "Send header x-canopy-key",
    });
  }

  next();
};

// 🍃 CORS – allow Canopy to be spoken to
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type, x-canopy-key");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// 🌿 Ask OpenAI helper
async function askOpenAI({ system, user }) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature: 0.4
    })
  });

  const j = await r.json();
  return j.choices?.[0]?.message?.content || null;
}

// 🍀 Canopy GPT voice
app.post("/canopy/ask", requireCanopyKey, async (req, res) => {
  const { question } = req.body;

  const answer = await askOpenAI({
    system: "You are Canopy ChatStore, poetic, gentle, and precise.",
    user: question
  });

  if (!answer) {
    return res.json({
      ok: true,
      fallback: "🌿 Canopy listened, but GPT key is silent."
    });
  }

  res.json({
    ok: true,
    answer
  });
});

export default app;
