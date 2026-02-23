class LLMClient {
    constructor(provider, apiKey, model) {
        this.provider = provider;
        this.apiKey = apiKey;
        this.model = model;
        this.config = PROVIDER_CONFIGS[provider];
    }

    async generate(prompt, systemPrompt = null) {
        const messages = [];
        
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        const payload = {
            model: this.model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000
        };

        // Different handling for Hugging Face
        if (this.provider === 'huggingface') {
            return this.callHuggingFace(prompt);
        }

        try {
            const response = await fetch(this.config.baseUrl, {
                method: 'POST',
                headers: this.config.headers(this.apiKey),
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`API error: ${error}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            throw new Error(`Failed to call LLM: ${error.message}`);
        }
    }

    async callHuggingFace(prompt) {
        const modelUrl = `${this.config.baseUrl}${this.model}`;
        
        try {
            const response = await fetch(modelUrl, {
                method: 'POST',
                headers: this.config.headers(this.apiKey),
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 1000,
                        temperature: 0.7
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Hugging Face error: ${await response.text()}`);
            }

            const data = await response.json();
            return Array.isArray(data) ? data[0].generated_text : data.generated_text;
        } catch (error) {
            throw new Error(`Failed to call Hugging Face: ${error.message}`);
        }
    }

    async extractStructured(text, format = 'bullet_points') {
        const systemPrompt = `You are an expert content strategist. Extract key information from summaries and return ONLY valid JSON.`;
        
        let userPrompt;
        if (format === 'bullet_points') {
            userPrompt = `Extract the main topic and 3-5 key points from this summary. Return as JSON with keys: "topic", "key_points" (array), "target_audience" (guess who would read this).

Summary: ${text}

JSON:`;
        } else {
            userPrompt = `Create a 3-section article outline from this summary. Return as JSON with keys: "title", "introduction_topic", "sections" (array of section titles), "conclusion_focus".

Summary: ${text}

JSON:`;
        }

        const response = await this.generate(userPrompt, systemPrompt);
        
        // Extract JSON from response
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return { error: 'No JSON found', raw: response };
        } catch (e) {
            return { error: 'Failed to parse JSON', raw: response };
        }
    }

    async testConnection() {
        try {
            const response = await this.generate('Say "Connection successful!" in one sentence.');
            return { success: true, message: response };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}