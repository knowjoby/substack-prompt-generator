# Substack Prompt Generator ✍️

A static web app that transforms your research into perfect writing prompts for Substack articles using open source LLMs.

## 🌟 Features

- **Bring Your Own API Key**: Use your own keys from OpenRouter, Groq, or Together AI
- **Multiple LLM Providers**: Choose from various free/open source models
- **Smart Prompt Generation**: Automatically structures your summary into perfect writing prompts
- **Local Storage**: History saved in your browser
- **No Backend**: Pure static frontend, deploy anywhere
- **Privacy First**: Your API key and data never leave your browser

## 🚀 Quick Start

### Option 1: Use the Live Version
Visit [https://substack-prompt-generator.github.io](https://substack-prompt-generator.github.io) (you'll host this)

### Option 2: Deploy to GitHub Pages

1. **Fork this repository**
2. **Go to Settings → Pages**
3. **Select "main" branch as source**
4. **Your app will be live at `username.github.io/repo-name`**

### Option 3: Run Locally
```bash
git clone https://github.com/yourusername/substack-prompt-generator.git
cd substack-prompt-generator
python -m http.server 8000
# Open http://localhost:8000