// Main application logic
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const providerSelect = document.getElementById('provider');
    const modelSelect = document.getElementById('model');
    const apiKeyInput = document.getElementById('apiKey');
    const testConnectionBtn = document.getElementById('testConnection');
    const connectionStatus = document.getElementById('connectionStatus');
    const generateBtn = document.getElementById('generateBtn');
    const summaryTextarea = document.getElementById('summary');
    const wordCountSpan = document.getElementById('wordCount');
    const outputContainer = document.getElementById('outputContainer');
    const placeholder = document.getElementById('placeholder');
    const loading = document.getElementById('loading');
    const outputTextarea = document.getElementById('output');
    const copyBtn = document.getElementById('copyBtn');
    const promptMetadata = document.getElementById('promptMetadata');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistory');
    const toneSelect = document.getElementById('tone');
    const lengthSelect = document.getElementById('length');
    const styleSelect = document.getElementById('style');
    const audienceInput = document.getElementById('audience');
    const focusInput = document.getElementById('focus');

    // State
    let currentLLMClient = null;
    let currentPrompt = '';

    // Initialize models based on provider
    function updateModels() {
        const provider = providerSelect.value;
        const config = PROVIDER_CONFIGS[provider];
        modelSelect.innerHTML = config.models.map(model => 
            `<option value="${model}">${model}</option>`
        ).join('');
    }

    // Word count update
    function updateWordCount() {
        const count = wordCount(summaryTextarea.value);
        wordCountSpan.textContent = count;
    }

    // Load history
    function renderHistory() {
        const history = loadHistory();
        if (history.length === 0) {
            historyList.innerHTML = '<p class="text-gray-400 text-center py-4">No prompts yet</p>';
            return;
        }
        
        historyList.innerHTML = history.map(item => `
            <div class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer history-item" data-prompt="${item.prompt.replace(/"/g, '&quot;')}">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-sm font-medium text-gray-800">${item.settings?.tone || 'Article'} - ${new Date(item.timestamp).toLocaleDateString()}</p>
                        <p class="text-xs text-gray-500">${item.summary}</p>
                    </div>
                    <button class="text-indigo-600 hover:text-indigo-800 text-sm" onclick="loadHistoryPrompt('${item.id}')">
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Generate prompt
    async function generatePrompt() {
        const summary = summaryTextarea.value.trim();
        if (!summary) {
            showToast('Please enter a summary', 'error');
            return;
        }

        if (!apiKeyInput.value.trim()) {
            showToast('Please enter your API key', 'error');
            return;
        }

        // Show loading
        placeholder.classList.add('hidden');
        outputContainer.classList.add('hidden');
        loading.classList.remove('hidden');

        try {
            // Initialize LLM client if needed
            if (!currentLLMClient || currentLLMClient.apiKey !== apiKeyInput.value) {
                currentLLMClient = new LLMClient(
                    providerSelect.value,
                    apiKeyInput.value,
                    modelSelect.value
                );
            }

            // Clean summary
            const cleanedSummary = cleanSummary(summary);

            // Detect article style
            const selectedStyle = styleSelect.value;
            const actualStyle = selectedStyle === 'auto' ? 
                detectArticleType(cleanedSummary) : selectedStyle;

            // Extract structured data
            const structuredData = await currentLLMClient.extractStructured(cleanedSummary);

            // Get template
            const template = PROMPT_TEMPLATES[actualStyle] || PROMPT_TEMPLATES.standard;

            // Format key points
            const keyPointsText = structuredData.key_points ? 
                structuredData.key_points.map(p => `• ${p}`).join('\n') : 
                cleanedSummary.split('\n').map(l => `• ${l}`).join('\n');

            // Fill template
            const finalPrompt = template
                .replace('{topic}', structuredData.topic || 'this topic')
                .replace('{tone}', toneSelect.value)
                .replace('{length}', lengthSelect.value)
                .replace('{audience}', audienceInput.value || structuredData.target_audience || 'interested readers')
                .replace('{keyPoints}', keyPointsText)
                .replace('{objective}', focusInput.value || structuredData.topic || 'understanding this topic')
                .replace('{stance}', focusInput.value || 'the main argument')
                .replace('{itemCount}', structuredData.key_points?.length || 5);

            // Add metadata
            const readingTime = estimateReadingTime(parseInt(lengthSelect.value));
            const finalPromptWithMeta = finalPrompt + `\n\n[Reading time: ${readingTime}]`;

            // Display result
            outputTextarea.value = finalPromptWithMeta;
            currentPrompt = finalPromptWithMeta;
            
            promptMetadata.innerHTML = `
                <span class="mr-3"><i class="far fa-clock"></i> ${readingTime}</span>
                <span><i class="fas fa-tag"></i> ${actualStyle}</span>
            `;

            // Save to history
            const settings = {
                tone: toneSelect.value,
                length: lengthSelect.value,
                style: actualStyle,
                audience: audienceInput.value,
                focus: focusInput.value
            };
            saveToHistory(finalPromptWithMeta, cleanedSummary, settings);
            renderHistory();

            // Show output
            loading.classList.add('hidden');
            outputContainer.classList.remove('hidden');

        } catch (error) {
            loading.classList.add('hidden');
            placeholder.classList.remove('hidden');
            showToast(`Error: ${error.message}`, 'error');
            console.error(error);
        }
    }

    // Event Listeners
    providerSelect.addEventListener('change', updateModels);
    summaryTextarea.addEventListener('input', updateWordCount);
    
    generateBtn.addEventListener('click', generatePrompt);
    
    copyBtn.addEventListener('click', () => {
        copyToClipboard(currentPrompt);
    });

    testConnectionBtn.addEventListener('click', async () => {
        if (!apiKeyInput.value) {
            showToast('Please enter an API key', 'error');
            return;
        }

        connectionStatus.classList.remove('hidden', 'bg-green-100', 'bg-red-100', 'text-green-800', 'text-red-800');
        connectionStatus.textContent = 'Testing connection...';
        connectionStatus.classList.add('bg-gray-100', 'text-gray-800');

        try {
            const client = new LLMClient(
                providerSelect.value,
                apiKeyInput.value,
                modelSelect.value
            );
            
            const result = await client.testConnection();
            
            connectionStatus.classList.remove('bg-gray-100', 'text-gray-800');
            if (result.success) {
                connectionStatus.textContent = `✅ Connected! ${result.message}`;
                connectionStatus.classList.add('bg-green-100', 'text-green-800');
            } else {
                connectionStatus.textContent = `❌ Failed: ${result.message}`;
                connectionStatus.classList.add('bg-red-100', 'text-red-800');
            }
        } catch (error) {
            connectionStatus.textContent = `❌ Error: ${error.message}`;
            connectionStatus.classList.add('bg-red-100', 'text-red-800');
        }
    });

    clearHistoryBtn.addEventListener('click', () => {
        localStorage.removeItem('promptHistory');
        renderHistory();
        showToast('History cleared');
    });

    // Load saved API key from localStorage (optional, user can choose)
    const savedApiKey = localStorage.getItem('savedApiKey');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }

    // Save API key to localStorage if checkbox (we can add this later)
    apiKeyInput.addEventListener('change', () => {
        // Optional: let user decide to save
        // localStorage.setItem('savedApiKey', apiKeyInput.value);
    });

    // Initialize
    updateModels();
    updateWordCount();
    renderHistory();
});

// Global function for history loading
window.loadHistoryPrompt = function(id) {
    const history = loadHistory();
    const item = history.find(h => h.id == id);
    if (item) {
        outputTextarea.value = item.prompt;
        currentPrompt = item.prompt;
        outputContainer.classList.remove('hidden');
        placeholder.classList.add('hidden');
        summaryTextarea.value = item.summary.replace('...', '');
        updateWordCount();
    }
};