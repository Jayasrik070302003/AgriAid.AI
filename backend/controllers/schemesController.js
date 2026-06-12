const { getChatResponse } = require('../services/analysisEngine');

const ALLOWED_SCHEME_KEYS = ['name', 'category', 'description', 'eligibility', 'benefits', 'howToApply', 'link'];

function sanitizeScheme(scheme) {
  if (!scheme || typeof scheme !== 'object' || Array.isArray(scheme)) return null;
  const safe = {};
  for (const key of ALLOWED_SCHEME_KEYS) {
    const val = scheme[key];
    if (key === 'eligibility' || key === 'howToApply') {
      safe[key] = Array.isArray(val) ? val.filter(v => typeof v === 'string').slice(0, 10) : [];
    } else if (typeof val === 'string') {
      safe[key] = val.slice(0, 500);
    } else {
      safe[key] = null;
    }
  }
  return safe.name ? safe : null;
}

const searchSchemes = async (req, res) => {
  try {
    const { state, crop, farmSize, category } = req.body;

    const prompt = `You are an expert on Indian government agricultural schemes. Based on the following farmer details, identify any NEW or RECENT government schemes (announced in 2024-2025) that are NOT commonly known:

Farmer Details:
- State: ${state}
- Primary Crop: ${crop}
- Farm Size: ${farmSize} acres
- Category: ${category}

Focus ONLY on:
1. Recently announced schemes (2024-2025)
2. State-specific schemes for ${state}
3. Crop-specific subsidies for ${crop}
4. Lesser-known central schemes

For each scheme, provide in JSON format:
{
  "name": "Scheme name",
  "category": "Central/State",
  "description": "Brief description",
  "eligibility": ["requirement 1", "requirement 2"],
  "benefits": "Benefit amount/description",
  "howToApply": ["step 1", "step 2"],
  "link": "official website URL or null"
}

Return ONLY a JSON array of schemes. If no new schemes found, return empty array [].`;

    const aiResponse = await getChatResponse(prompt, 'EN');

    let aiSchemes = [];
    try {
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        // Safely parse and sanitize — prevents prototype pollution & untrusted deserialization
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          aiSchemes = parsed
            .slice(0, 10) // max 10 schemes
            .map(sanitizeScheme)
            .filter(Boolean);
        }
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
    }

    res.json({ success: true, aiSchemes });

  } catch (error) {
    console.error('Error in searchSchemes:', error);
    res.json({ success: true, aiSchemes: [] });
  }
};

module.exports = { searchSchemes };
