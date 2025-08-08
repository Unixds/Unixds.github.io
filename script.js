// Telegram WebApp integration
const tg = window.Telegram.WebApp;

// Initialize WebApp
tg.expand();
tg.enableClosingConfirmation();
tg.MainButton.setParams({ color: '#2ea6ff' });

// DOM elements
const lengthInput = document.getElementById('length');
const keywordsInput = document.getElementById('keywords');
const countInput = document.getElementById('count');
const generateBtn = document.getElementById('generate-btn');
const loadingDiv = document.getElementById('loading');
const resultsDiv = document.getElementById('results');
const availableList = document.getElementById('available-list');
const copyBtn = document.getElementById('copy-btn');
const progressText = document.getElementById('progress');

// Available usernames array
let availableUsernames = [];

// Generate usernames based on criteria
function generateUsernames(length, keywords, count) {
    const generated = new Set();
    const keywordList = keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
    
    while (generated.size < count) {
        let username = '';
        
        if (keywordList.length > 0) {
            // Combine keywords with random numbers/letters
            const keyword = keywordList[Math.floor(Math.random() * keywordList.length)];
            const remainingLength = length - keyword.length;
            
            if (remainingLength > 0) {
                const randomChars = generateRandomChars(remainingLength);
                // Decide where to put the keyword (start, middle, end)
                const position = Math.floor(Math.random() * 3);
                
                if (position === 0) {
                    username = keyword + randomChars;
                } else if (position === 1) {
                    const split = Math.floor(randomChars.length / 2);
                    username = randomChars.substring(0, split) + keyword + randomChars.substring(split);
                } else {
                    username = randomChars + keyword;
                }
            } else {
                username = keyword.substring(0, length);
            }
        } else {
            // Completely random username
            username = generateRandomChars(length);
        }
        
        // Ensure username starts with a letter and only contains a-z, 0-9, _
        username = 'a' + username.substring(1); // Force first char to be letter
        username = username.replace(/[^a-z0-9_]/g, '');
        
        if (username.length >= 5) { // Telegram minimum username length
            generated.add(username);
        }
    }
    
    return Array.from(generated);
}

function generateRandomChars(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789_';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Check username availability via Telegram
async function checkUsernameAvailability(username) {
    // In a real implementation, this would call your backend which checks with Telegram API
    // For demo purposes, we'll simulate the check with random results
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Simulate 80% chance of being available for demo
    const isAvailable = Math.random() > 0.2;
    
    return isAvailable;
}

// Main function to generate and check usernames
async function generateAndCheckUsernames() {
    const length = parseInt(lengthInput.value);
    const keywords = keywordsInput.value;
    const count = parseInt(countInput.value);
    
    if (length < 5 || length > 32) {
        alert('Username length must be between 5 and 32 characters');
        return;
    }
    
    if (count < 1 || count > 100) {
        alert('Number of usernames to generate must be between 1 and 100');
        return;
    }
    
    // Show loading state
    generateBtn.disabled = true;
    loadingDiv.classList.remove('hidden');
    resultsDiv.classList.add('hidden');
    availableUsernames = [];
    availableList.innerHTML = '';
    
    // Generate usernames
    const usernamesToCheck = generateUsernames(length, keywords, count);
    
    // Check each username
    for (let i = 0; i < usernamesToCheck.length; i++) {
        const username = usernamesToCheck[i];
        progressText.textContent = `${i + 1}/${usernamesToCheck.length} checked`;
        
        const isAvailable = await checkUsernameAvailability(username);
        
        if (isAvailable) {
            availableUsernames.push(username);
            addUsernameToResults(username);
        }
    }
    
    // Hide loading, show results
    loadingDiv.classList.add('hidden');
    resultsDiv.classList.remove('hidden');
    generateBtn.disabled = false;
    
    // Send results to Telegram bot
    if (availableUsernames.length > 0) {
        tg.sendData(JSON.stringify({
            action: 'username_results',
            usernames: availableUsernames
        }));
    }
}

function addUsernameToResults(username) {
    const div = document.createElement('div');
    div.className = 'username-item';
    div.innerHTML = `
        <span>@${username}</span>
        <span class="copy-icon" onclick="copyToClipboard('${username}')">Copy</span>
    `;
    availableList.appendChild(div);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show some feedback
        const originalText = event.target.textContent;
        event.target.textContent = 'Copied!';
        setTimeout(() => {
            event.target.textContent = originalText;
        }, 2000);
    });
}

function copyAllUsernames() {
    if (availableUsernames.length > 0) {
        const text = availableUsernames.map(u => `@${u}`).join('\n');
        copyToClipboard(text);
        
        // Show feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }
}

// Event listeners
generateBtn.addEventListener('click', generateAndCheckUsernames);
copyBtn.addEventListener('click', copyAllUsernames);

// Expose function to global scope for HTML onclick
window.copyToClipboard = copyToClipboard;

// Handle Telegram events
tg.ready();