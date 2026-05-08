const { onCall, HttpsError } = require('firebase-functions/v2/https');
const fetch = require('node-fetch');

/**
 * 1. summarizeReviews — AI Review Summarizer
 * Called from PropertyDetails.jsx
 */
exports.summarizeReviews = onCall(
  { cors: true }, 
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be signed in.');
    }

    const { reviews } = request.data;
    if (!Array.isArray(reviews) || reviews.length === 0) {
      throw new HttpsError('invalid-argument', 'No reviews provided.');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY missing.");
      throw new HttpsError('internal', 'AI configuration error.');
    }

    const reviewTexts = reviews
      .map((r) => `Rating: ${r.rating}/5 — ${r.description}`)
      .join('\n');

    const prompt = `You are an assistant for 'findmyspace'. 
    Summarize these reviews for a rental property. 
    Format: One short sentence for 'Overall Vibe', then two bullet points for 'Pros' and 'Cons'. 
    Keep it under 60 words total.\n\nReviews:\n${reviewTexts}`;

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300 },
        }),
      });

      const data = await response.json();
      const summary = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Could not generate summary.';
      return { summary };
    } catch (error) {
      console.error("Summarizer Error:", error);
      throw new HttpsError('internal', 'AI Summarizer failed.');
    }
  }
);

exports.getRecommendations = onCall(
  { cors: true }, 
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be signed in.');
    }

    const { savedSummary, otherProperties } = request.data;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new HttpsError('internal', 'AI configuration error.');
    }

    const prompt = `A user has saved these rental properties:
    ${savedSummary}

    From the following available properties, recommend the top 3 that best match the user's preferences based on price range, amenities, and bed type.

    Respond with ONLY a JSON array, no other text, no markdown fences.
    [{"id":"property-id","reason":"Brief reason why this matches"}]

    Available properties:
    ${otherProperties}`;

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 }
        }),
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      
      // Clean up the response to ensure it's valid JSON
      const cleanedText = text.replace(/```json|```/g, "").trim();
      return { recommendations: JSON.parse(cleanedText) };
    } catch (error) {
      console.error("Recommendation Error:", error);
      throw new HttpsError('internal', 'AI Recommendations failed.');
    }
  }
);