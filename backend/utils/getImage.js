// utils/getImage.js

async function getImage(place) {
  try {
    const query = `${place} city skyline landmark tourism`;

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        "Accept-Version": "v1"
      }
    });

    const data = await res.json();

    // Debug once
    console.log("Unsplash response:", data);

    if (!data || !data.results || data.results.length === 0) {
      console.log("No image found for:", place);
      return null;
    }

    return data.results[0].urls.regular;

  } catch (err) {
    console.error("Image fetch error:", err.message);
    return null;
  }
}

module.exports = getImage;