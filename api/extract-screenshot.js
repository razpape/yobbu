/**
 * Vercel Serverless Function: /api/extract-screenshot
 *
 * Accepts a base64-encoded screenshot image and sends it to
 * OpenAI GPT-4 Vision for structured data extraction.
 *
 * Environment variables required:
 *   OPENAI_API_KEY — Your OpenAI API key with GPT-4 Vision access
 */

const SYSTEM_PROMPT = `Role: You are a specialized Data Extraction Engine for a West African logistics marketplace called Yobbu.

Objective: Analyze the provided Facebook screenshot and extract trip details into a valid JSON object.

Extraction Rules:

Origin/Destination: Convert city names to their full city name. The FIRST city in the post is always the departure (from), and the SECOND is the arrival (to). Known cities (can be either origin or destination):
- Americas/Europe: New York, Paris, Atlanta, Houston, Washington DC, London, Montreal, Brussels, Madrid, Barcelona, Bilbao, Marseille, Lyon, Milan, Rome, Lisbon
- Africa: Dakar, Conakry, Abidjan, Bamako, Lomé, Accra, Cotonou, Casablanca, Nouakchott, Bissau, Freetown, Banjul
- "Espagne" or "Spain" means Spain — use the specific city if mentioned (e.g., "Bilbao", "Madrid"), otherwise use "Madrid" as default.

Dates: Format as YYYY-MM-DD. If the year is missing, assume 2026. Parse French date formats too (e.g., "15 janvier" -> "2026-01-15", "le 3 mars" -> "2026-03-03").

Price: Extract numerical value only. Convert "10 dollars" to 10.

Phone: Standardize to E.164 format (e.g., +12125550199).

Space: Extract available kilograms as a number.

Name: Extract the person's name from the post.

Strictness: If a field is not found, return null. Do not hallucinate data.

Output: Return ONLY a valid JSON object with exactly these fields:
{
  "name": string | null,
  "phone": string | null,
  "from_city": string | null,
  "to_city": string | null,
  "date": string | null,
  "space": string | null,
  "price": string | null,
  "note": string | null,
  "confidence": number
}

The "note" field should contain a brief summary of the post text (max 300 chars).
The "confidence" field should be 0-100 indicating how confident you are in the extraction.

Return ONLY the JSON object, no markdown, no explanation.`

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured on server' })
  }

  const { image } = req.body
  if (!image) {
    return res.status(400).json({ error: 'Missing "image" field (base64 data URL)' })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 800,
        temperature: 0.1,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract trip details from this Facebook screenshot.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: image,
                  detail: 'high',
                },
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('OpenAI API error:', response.status, err)
      return res.status(502).json({ error: `OpenAI API error: ${response.status}` })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content?.trim()

    if (!content) {
      return res.status(502).json({ error: 'Empty response from OpenAI' })
    }

    // Parse the JSON — handle potential markdown code fences
    let cleaned = content
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    }

    let extracted
    try {
      extracted = JSON.parse(cleaned)
    } catch (parseErr) {
      console.error('Failed to parse AI response:', content)
      return res.status(502).json({
        error: 'AI returned invalid JSON',
        raw: content,
      })
    }

    // Validate expected fields
    const fields = ['name', 'phone', 'from_city', 'to_city', 'date', 'space', 'price', 'note']
    for (const field of fields) {
      if (!(field in extracted)) extracted[field] = null
    }
    if (!('confidence' in extracted)) extracted.confidence = 0

    return res.status(200).json({
      success: true,
      data: extracted,
      usage: data.usage || null,
    })
  } catch (err) {
    console.error('extract-screenshot error:', err)
    return res.status(500).json({ error: err.message })
  }
}
