// Prompt templates for different article styles
const PROMPT_TEMPLATES = {
    standard: `You are an expert Substack writer. Write a complete article based on the following outline and notes.

ARTICLE TOPIC: {topic}
TONE: {tone}
TARGET LENGTH: {length} words
TARGET AUDIENCE: {audience}

KEY POINTS TO COVER:
{keyPoints}

WRITING GUIDELINES:
- Start with a hook that grabs attention
- Use short paragraphs and conversational language
- Include specific examples and anecdotes
- End with a thought-provoking conclusion
- DO NOT use AI-sounding phrases like "In conclusion" or "Furthermore"
- Write like a human expert sharing insights

Now write the complete article:`,

    educational: `Create an educational Substack post that teaches readers about {topic}.

LESSON OBJECTIVE: {objective}
KEY TEACHING POINTS:
{keyPoints}

STRUCTURE:
1. Hook: A surprising fact or question about {topic}
2. The Problem: Why readers should care
3. The Framework: Break down the concept step by step
4. Real Examples: Apply the concept to real situations
5. Action Steps: What readers can do next

TONE: {tone} but authoritative
LENGTH: {length} words

Write the educational post:`,

    storytelling: `Write a narrative-style Substack article about {topic}.

NARRATIVE ELEMENTS:
- Main Character: {audience} or someone they relate to
- Conflict: The challenge related to {topic}
- Journey: How understanding {topic} resolves the conflict
- Resolution: The insight or transformation

STORY BEATS TO INCLUDE:
{keyPoints}

TONE: {tone}, personal and engaging
LENGTH: {length} words

Tell the story:`,

    listicle: `Create a listicle-style Substack article about {topic}.

LIST TITLE: {topic}
NUMBER OF ITEMS: {itemCount}
ITEMS TO COVER:
{keyPoints}

STRUCTURE:
1. Introduction explaining why these {itemCount} points matter
2. Each point with explanation and practical application
3. Conclusion tying everything together

TONE: {tone}, practical and actionable
LENGTH: {length} words

Write the listicle:`,

    opinion: `Write a compelling opinion piece about {topic}.

YOUR STANCE: {stance}
SUPPORTING ARGUMENTS:
{keyPoints}

STRUCTURE:
1. Strong opening statement of your position
2. Counter-arguments and why they're wrong
3. Evidence supporting your view
4. Call to action for readers

TONE: {tone}, confident and persuasive
LENGTH: {length} words

Write the opinion piece:`
};

// System prompts for the LLM
const SYSTEM_PROMPTS = {
    extract: `You are an expert content strategist. Extract key information from summaries and return ONLY valid JSON.`,
    
    analyze: `You are a professional editor. Analyze the summary and suggest the best article structure.`
};

// Provider configurations
const PROVIDER_CONFIGS = {
    openrouter: {
        name: 'OpenRouter',
        baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
        models: [
            'meta-llama/llama-3-8b-instruct',
            'meta-llama/llama-3-70b-instruct',
            'mistralai/mistral-7b-instruct',
            'anthropic/claude-3-haiku',
            'google/gemma-7b-it'
        ],
        headers: (apiKey) => ({
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://substack-prompt-generator.github.io',
            'X-Title': 'Substack Prompt Generator'
        })
    },
    groq: {
        name: 'Groq',
        baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
        models: [
            'llama3-70b-8192',
            'llama3-8b-8192',
            'mixtral-8x7b-32768',
            'gemma-7b-it'
        ],
        headers: (apiKey) => ({
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        })
    },
    together: {
        name: 'Together AI',
        baseUrl: 'https://api.together.xyz/v1/chat/completions',
        models: [
            'mistralai/Mixtral-8x7B-Instruct-v0.1',
            'meta-llama/Llama-3-8b-chat-hf',
            'meta-llama/Llama-3-70b-chat-hf',
            'teknium/OpenHermes-2.5-Mistral-7B'
        ],
        headers: (apiKey) => ({
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        })
    },
    huggingface: {
        name: 'Hugging Face',
        baseUrl: 'https://api-inference.huggingface.co/models/',
        models: [
            'mistralai/Mistral-7B-Instruct-v0.2',
            'meta-llama/Llama-3-8b-chat-hf',
            'HuggingFaceH4/zephyr-7b-beta'
        ],
        headers: (apiKey) => ({
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        })
    }
};