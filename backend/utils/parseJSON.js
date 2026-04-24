module.exports = function extractJSON(text) {
  try {
    // remove markdown if present
    let cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // 🔥 FIX: auto-close missing braces
    const openBraces = (cleaned.match(/{/g) || []).length;
    const closeBraces = (cleaned.match(/}/g) || []).length;

    if (openBraces > closeBraces) {
      cleaned += "}".repeat(openBraces - closeBraces);
    }

    return JSON.parse(cleaned);

  } catch (err) {
    try {
      // fallback: extract JSON block
      const match = text.match(/\{[\s\S]*/);
      if (match) {
        let partial = match[0];

        const open = (partial.match(/{/g) || []).length;
        const close = (partial.match(/}/g) || []).length;

        if (open > close) {
          partial += "}".repeat(open - close);
        }

        return JSON.parse(partial);
      }
    } catch (e) {
      console.log("❌ JSON still broken");
    }

    return null;
  }
};