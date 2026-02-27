import fetch from 'node-fetch';

export const parseSpecifications = async (req, res) => {
    try {
        const { text } = req.body || {};

        if (!text || typeof text !== 'string' || !text.trim()) {
            return res.status(400).json({ message: 'Text with specifications is required' });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: 'OPENAI_API_KEY is not configured on the server' });
        }

        const prompt = `
You are a strict JSON generator.

Input is a block of text with product specifications, one spec per line.
Each line usually looks like:
Front Camera\t5MP
Back Camera\t8MP
Display\t5.0″ inch
Processor\tOcta core

Sometimes the separator may be a tab, multiple spaces, a dash (-), or a colon (:).

TASK:
- Parse the input into an array of { "key": string, "value": string }.
- Preserve the original wording as much as possible.
- Do NOT add, remove, or infer extra specs.
- Ignore completely empty lines.

Return ONLY valid JSON, with this exact shape:
[
  { "key": "Front Camera", "value": "5MP" },
  { "key": "Back Camera", "value": "8MP" }
]

Here is the raw input text to parse:
---
${text}
---`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
                messages: [
                    { role: 'system', content: 'You are a strict JSON generator that only outputs JSON.' },
                    { role: 'user', content: prompt },
                ],
                temperature: 0,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API error:', errorText);
            return res.status(502).json({ message: 'Failed to parse specifications with AI' });
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content?.trim();

        if (!content) {
            return res.status(502).json({ message: 'Empty response from AI' });
        }

        let specs;
        try {
            specs = JSON.parse(content);
        } catch (e) {
            console.error('Failed to parse AI JSON content:', content);
            return res.status(502).json({ message: 'AI returned invalid JSON' });
        }

        if (!Array.isArray(specs)) {
            return res.status(502).json({ message: 'AI response is not an array' });
        }

        const normalized = specs
            .filter((item) => item && typeof item.key === 'string' && typeof item.value === 'string')
            .map((item) => ({
                key: item.key.trim(),
                value: item.value.trim(),
            }))
            .filter((item) => item.key || item.value);

        return res.json({ specifications: normalized });
    } catch (error) {
        console.error('parseSpecifications error:', error);
        return res.status(500).json({ message: 'Failed to parse specifications' });
    }
}

