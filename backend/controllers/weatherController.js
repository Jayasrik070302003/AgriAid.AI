const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.refineWeather = async (req, res) => {
    try {
        const { location, current, daily } = req.body;
        
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Normalization Rules (Applied before AI for consistency)
        let normalizedPrecip = current.precipitation || 0;
        const condition = current.condition || "Clear";
        
        if (condition.includes("Rain") || condition.includes("Showers") || condition.includes("Thunderstorm")) {
            normalizedPrecip = Math.max(normalizedPrecip, 40);
        } else if (condition === "Clear") {
            normalizedPrecip = Math.min(normalizedPrecip, 10);
        }

        let adjustedUV = current.uvIndex;
        if (condition.includes("Rain") && adjustedUV > 5) {
            adjustedUV = 3; // Rain usually means clouds
        }

        const strictPrompt = `You are an agricultural AI assistant and Weather Data Formatter for AgriAid.AI.

STRICT RULES (GENERAL):
1. Use ONLY the provided weather data. DO NOT assume or hallucinate values.
2. Ensure all outputs are consistent.
3. If weather condition indicates rain (Rain, Showers, Thunderstorm), precipitation MUST NOT be 0%.
4. Advice MUST strictly depend on weather conditions.
5. Keep explanations simple and farmer-friendly.

STRICT RULES (7-DAY FORECAST FORMATTING):
1. Each day MUST be processed independently.
2. DO NOT repeat the same weather condition for more than 2 consecutive days.
3. If the same condition appears for consecutive days, normalize based on progression:
   Thunderstorm → Rain → Showers → Cloudy
4. Ensure forecast looks realistic and naturally varying.
5. Weather progression must feel natural. Do not contradict temperature (e.g., fog + very high temp).

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "location": "",
  "summary": "",
  "temperature": "",
  "condition": "",
  "humidity": "",
  "wind": "",
  "precipitation": "",
  "uv_index": "",
  "advisory": "",
  "alerts": "",
  "refined_forecast": [
    {
      "day": "Today",
      "condition": "Thunderstorm",
      "temperature": "32° / 24°"
    }
  ]
}`;

        const userInput = `
Input Data:
Location: ${location}
Temperature: ${current.temp}°C
Condition: ${condition}
Feels Like: ${current.feelsLike}°C
Humidity: ${current.humidity}%
Wind Speed: ${current.wind} km/h
Pressure: ${current.pressure} hPa
Visibility: ${current.visibility} km
UV Index: ${adjustedUV}
Precipitation: ${normalizedPrecip}%
7-Day Forecast: ${JSON.stringify(daily)}
`;

        const result = await model.generateContent(strictPrompt + "\n" + userInput);
        const response = await result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        
        const aiResult = JSON.parse(text);

        res.json({
            success: true,
            data: aiResult
        });

    } catch (error) {
        console.error("Weather Refinement Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
