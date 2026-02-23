// Utility functions

function cleanSummary(text) {
    if (!text) return '';
    
    // Remove markdown links
    text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
    
    // Remove extra whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    // Remove common note-taking artifacts
    text = text.replace(/(?i)note to self:?/g, '');
    text = text.replace(/(?i)todo:?/g, '');
    
    return text;
}

function wordCount(text) {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function estimateReadingTime(wordCount) {
    const minutes = Math.round(wordCount / 200);
    if (minutes < 1) return 'Less than 1 min read';
    return minutes === 1 ? '1 min read' : `${minutes} min read`;
}

function detectArticleType(text) {
    const lower = text.toLowerCase();
    
    if (lower.includes('how to') || lower.includes('guide') || lower.includes('steps')) {
        return 'educational';
    } else if (lower.includes('story') || lower.includes('experience') || lower.includes('journey')) {
        return 'storytelling';
    } else if (lower.includes('list') || lower.includes('ways') || lower.includes('reasons')) {
        return 'listicle';
    } else if (lower.includes('opinion') || lower.includes('believe') || lower.includes('think')) {
        return 'opinion';
    }
    return 'standard';
}

function saveToHistory(prompt, summary, settings) {
    const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
    history.unshift({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        prompt: prompt,
        summary: summary.substring(0, 100) + '...',
        settings: settings
    });
    
    // Keep only last 10 items
    if (history.length > 10) history.pop();
    
    localStorage.setItem('promptHistory', JSON.stringify(history));
    return history;
}

function loadHistory() {
    return JSON.parse(localStorage.getItem('promptHistory') || '[]');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
    } text-white`;
    toast.style.transform = 'translateY(0)';
    
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
    }, 3000);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('✅ Copied to clipboard!');
    }).catch(() => {
        showToast('❌ Failed to copy', 'error');
    });
}