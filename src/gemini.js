const WORKER_URL = import.meta.env.VITE_GEMINI_WORKER_URL;

const callGemini = async (prompt, temperature = 0.7) => {
  if (!WORKER_URL) {
    throw new Error('VITE_GEMINI_WORKER_URL is not set. Add it to your .env file.');
  }
  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, temperature }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Worker request failed');
  }

  const data = await response.json();
  if (!data.text) throw new Error('No response from Gemini');
  return data.text;
};

// Summarize reviews for a property
export const summarizeReviews = async (reviews) => {
  // Only use reviews that actually have written text — rating-only entries
  // give the model nothing to work with and cause hallucination
  const writtenReviews = reviews.filter(r => {
    const text = (r.description || r.comment || '').trim();
    return text.length > 0;
  });

  if (writtenReviews.length === 0) {
    return 'No written reviews yet — ratings only, nothing to summarize.';
  }

  const reviewTexts = writtenReviews
    .map(r => `Rating: ${r.rating}/5 — ${(r.description || r.comment).trim()}`)
    .join('\n');

  const prompt = `You are an assistant for 'FindMySpace', a student housing app near NDHU in Taiwan.
Summarize ONLY what tenants actually wrote in the reviews below. Do NOT invent, assume, or add anything not explicitly stated.
If the reviews don't mention a pro or a con, write "Not mentioned" for that field.

Format your response exactly as:
Overall Vibe: [one short sentence based only on what is written]
• Pro: [one thing tenants explicitly liked, or "Not mentioned"]
• Con: [one thing tenants explicitly disliked, or "Not mentioned"]
Max 60 words total.

Reviews:
${reviewTexts}`;

  return await callGemini(prompt, 0.2);
};

// Recommend properties based on user's saved listings
export const getRecommendations = async (savedProperties, otherProperties) => {
  if (otherProperties.length === 0) return [];

  const savedSummary = savedProperties
    .map(p => `- ${p.name}: NT$${p.price}, beds: ${p.bedOptions?.join('/')}, amenities: ${p.amenities?.join(', ')}`)
    .join('\n');

  const otherSummary = otherProperties
    .map(p => `ID:${p.id} | ${p.name} | NT$${p.price} | beds: ${p.bedOptions?.join('/')} | amenities: ${p.amenities?.join(', ')}`)
    .join('\n');

  const avgPrice = Math.round(savedProperties.reduce((s, p) => s + (p.price || 0), 0) / savedProperties.length);
  const commonAmenities = savedProperties
    .flatMap(p => p.amenities || [])
    .filter((a, _, arr) => arr.filter(x => x === a).length >= Math.ceil(savedProperties.length / 2));
  const uniqueCommon = [...new Set(commonAmenities)];
  
  const prompt = `You are a housing assistant for 'FindMySpace', a student housing app near NDHU in Hualien, Taiwan.

The user has saved these properties:
${savedSummary}

Their apparent preferences:
- Average price: NT$${avgPrice}
- Commonly wanted amenities: ${uniqueCommon.join(', ') || 'none identified'}

From the available properties below, suggest up to 3 that the user might like based on their preferences.
Be honest — if the matches aren't strong, say so in the reason.
Write the reason naturally, e.g. "You seem to prefer furnished places around NT$7,500 — this one fits that budget and includes AC."
Keep each reason under 20 words.

Respond ONLY with a valid JSON array, no markdown, no extra text:
[{"id":"property-id","reason":"natural reason"}]

Available properties:
${otherSummary}`;

  const text = await callGemini(prompt, 0.2);
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
};