const OpenAI = require("openai");
const extractJSON = require("../utils/parseJSON");
const getImage = require("../utils/getImage");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

exports.getPlaceDetails = async (req, res) => {
  const place = req.params.place;

  if (!place) {
    return res.status(400).json({ error: "Place is required" });
  }

  try {
    const [aiResponse, imageUrl] = await Promise.all([
      client.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: `
Return ONLY valid JSON.
NO markdown.
NO explanation.

STRICT RULES:
- Do not wrap in \`\`\`
- Do not add text before/after JSON
- Output must start with { and end with }

IMPORTANT:
- Include REAL latitude and longitude for tourist spots

Provide detailed travel data for ${place}.

FORMAT:
{
  "name": "",
  "description": "",
  "hotels": [
    {
      "name": "",
      "address": "",
      "priceRange": "",
      "description": ""
    }
  ],
  "cuisines": [
    {
      "cuisine": "",
      "mustTryDishes": ["", ""],
      "restaurants": [
        {
          "name": "",
          "address": "",
          "description": "",
          "lat":0,
          "lng":0
        }
      ]
    }
  ],
  "touristSpots": [
    {
      "name": "",
      "address": "",
      "description": "",
      "lat": 0,
      "lng": 0
    }
  ],
  "averageCost": "",
  "bestTime": ""
}
`
          }
        ]
      }),
      getImage(place)
    ]);

    const raw = aiResponse.choices[0].message.content;

    // 🔥 SAFE PARSE
    let data;
    try {
      data = extractJSON(raw);
      console.log("RAW AI:", raw);

      if (!data || typeof data !== "object") {
        throw new Error("Invalid JSON");
      }
    } catch (e) {
      console.log("⚠️ RAW AI OUTPUT:\n", raw);

      data = {
        name: place,
        description: "Popular destination",
        hotels: [],
        cuisines: [],
        touristSpots: [],
        averageCost: "N/A",
        bestTime: "All year"
      };
    }

    // =========================
    // 🔥 NORMALIZATION
    // =========================

    data.name = data.name || place;

    // 🏨 HOTELS
    data.hotels = Array.isArray(data.hotels)
      ? data.hotels.map(h => ({
          name: h?.name || "Hotel",
          address: h?.address || "Not available",
          priceRange: h?.priceRange || "N/A",
          description: h?.description || ""
        }))
      : [];

    // 🍽️ CUISINES
    data.cuisines = Array.isArray(data.cuisines)
      ? data.cuisines.map(c => ({
          cuisine: c?.cuisine || c?.name || "Cuisine",
          mustTryDishes: Array.isArray(c?.mustTryDishes)
            ? c.mustTryDishes
            : ["Popular dishes"],
          restaurants: Array.isArray(c?.restaurants)
  ? c.restaurants.map(r => ({
      name: r?.name || "Restaurant",
      address: r?.address || "Not available",
      description: r?.description || "",
      lat: Number(r?.lat) || null,
      lng: Number(r?.lng) || null
    }))
  : []
        }))
      : [];

    // 📍 TOURIST SPOTS (🔥 FIXED WITH COORDINATES)
    data.touristSpots = Array.isArray(data.touristSpots)
      ? data.touristSpots.map(s => {
          // fallback center (India)
          const fallbackLat = 20.5937;
          const fallbackLng = 78.9629;

          if (typeof s === "string") {
            return {
              name: s,
              address: "Not available",
              description: "Popular attraction",
              lat: fallbackLat,
              lng: fallbackLng
            };
          }

          return {
            name: s?.name || "Tourist Spot",
            address: s?.address || "Not available",
            description: s?.description || "",
            lat: Number(s?.lat) || fallbackLat,
            lng: Number(s?.lng) || fallbackLng
          };
        })
      : [];

    data.averageCost = data.averageCost || "N/A";
    data.bestTime = data.bestTime || "All year";

    data.image = imageUrl || "/images/default.jpg";

    res.json(data);

  } catch (error) {
    console.error("Backend Error:", error.message);

    res.status(500).json({
      error: "Failed",
      fallback: {
        name: place,
        image: "/images/default.jpg",
        hotels: [],
        cuisines: [],
        touristSpots: [],
        averageCost: "N/A",
        bestTime: "N/A"
      }
    });
  }
};