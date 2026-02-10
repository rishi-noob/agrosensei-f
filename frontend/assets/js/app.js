/**
 * Agro Sensei - Frontend Application Script
 */

// API Configuration
// In production (Vercel), the Flask backend is exposed under `/api`
// via the serverless function in `api/index.py`. Locally, you can still
// run the backend on http://localhost:5000 by overriding this if needed.
const API_BASE_URL =
    (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost'))
        ? window.location.origin.replace(/\/$/, '')
        : 'http://localhost:5000';

// Direct AI API config (used when backend is unavailable)
const API_CONFIGS = {
    openai: { name: 'OpenAI GPT-4o', endpoint: 'https://api.openai.com/v1/chat/completions', headers: (key) => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` }) },
    gemini: { name: 'Google Gemini', endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', headers: () => ({ 'Content-Type': 'application/json' }) },
    anthropic: { name: 'Anthropic Claude', endpoint: 'https://api.anthropic.com/v1/messages', headers: (key) => ({ 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' }) }
};

// City centers for location detection (Ghaziabad vs Lucknow)
const GHAZIABAD_CENTER = { lat: 28.6692, lng: 77.4538 };
const LUCKNOW_CENTER = { lat: 26.8467, lng: 80.9462 };

// Mock shops: Ghaziabad + Lucknow (location-based)
const MOCK_SHOPS = [
    { id: 101, name: 'Krishi Seva Kendra', address: '123 Raj Nagar, Ghaziabad', lat: 28.6720, lng: 77.4480, category: 'general', phone: '+91 98765 43210', city: 'Ghaziabad' },
    { id: 102, name: 'Green Earth Seeds', address: '45 Kaushambi, Ghaziabad', lat: 28.6510, lng: 77.4320, category: 'seeds', phone: '+91 98765 43211', city: 'Ghaziabad' },
    { id: 103, name: 'UP Fertilizers & Co', address: '78 Vaishali, Ghaziabad', lat: 28.6580, lng: 77.4410, category: 'fertilizers', phone: '+91 98765 43212', city: 'Ghaziabad' },
    { id: 104, name: 'Kisan Tractor Hub', address: '12 Sahibabad, Ghaziabad', lat: 28.6910, lng: 77.4010, category: 'equipment', phone: '+91 98765 43213', city: 'Ghaziabad' },
    { id: 105, name: 'Organic Farm Store', address: '56 Indirapuram, Ghaziabad', lat: 28.6410, lng: 77.3710, category: 'general', phone: '+91 98765 43214', city: 'Ghaziabad' },
    { id: 106, name: 'Rabi Seeds & Pesticides', address: '90 Vasundhara, Ghaziabad', lat: 28.6350, lng: 77.3980, category: 'seeds', phone: '+91 98765 43215', city: 'Ghaziabad' },
    { id: 107, name: 'Agro Chemicals Ltd', address: '34 Muradnagar, Ghaziabad', lat: 28.7780, lng: 77.4980, category: 'fertilizers', phone: '+91 98765 43216', city: 'Ghaziabad' },
    { id: 108, name: 'Farm Tools & Equipment', address: '67 Noida Sector 18, NCR', lat: 28.5690, lng: 77.3210, category: 'equipment', phone: '+91 98765 43217', city: 'Ghaziabad' },
    { id: 1, name: 'Krishi Seva Kendra', address: '123 MG Road, Lucknow', lat: 26.8467, lng: 80.9462, category: 'general', phone: '+91 98765 43220', city: 'Lucknow' },
    { id: 2, name: 'Green Earth Seeds', address: '45 Hazratganj, Lucknow', lat: 26.8500, lng: 80.9400, category: 'seeds', phone: '+91 98765 43221', city: 'Lucknow' },
    { id: 3, name: 'UP Fertilizers & Co', address: '78 Aminabad, Lucknow', lat: 26.8600, lng: 80.9300, category: 'fertilizers', phone: '+91 98765 43222', city: 'Lucknow' },
    { id: 4, name: 'Kisan Tractor Hub', address: '12 Aliganj, Lucknow', lat: 26.8350, lng: 80.9550, category: 'equipment', phone: '+91 98765 43223', city: 'Lucknow' },
    { id: 5, name: 'Organic Farm Store', address: '56 Gomti Nagar, Lucknow', lat: 26.8550, lng: 80.9650, category: 'general', phone: '+91 98765 43224', city: 'Lucknow' },
    { id: 6, name: 'Rabi Seeds & Pesticides', address: '90 Indira Nagar, Lucknow', lat: 26.8650, lng: 80.9750, category: 'seeds', phone: '+91 98765 43225', city: 'Lucknow' },
    { id: 7, name: 'Agro Chemicals Ltd', address: '34 Chinhat, Lucknow', lat: 26.8250, lng: 80.9350, category: 'fertilizers', phone: '+91 98765 43226', city: 'Lucknow' },
    { id: 8, name: 'Farm Tools & Equipment', address: '67 Kapoorthala, Lucknow', lat: 26.8400, lng: 80.9500, category: 'equipment', phone: '+91 98765 43227', city: 'Lucknow' }
];

// Global State
let currentPage = 'home';
let apiKey = localStorage.getItem('agro_sensei_api_key') || '';
let apiProvider = localStorage.getItem('agro_sensei_api_provider') || 'gemini';
let isDemoMode = localStorage.getItem('agro_sensei_demo_mode') === 'true';
let userCoords = null;
let currentLocationName = '';
let currentShopFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    syncApiKeyFromStorage();
    showPage('home');
    setupEventListeners();
});

function syncApiKeyFromStorage() {
    apiKey = localStorage.getItem('agro_sensei_api_key') || '';
    apiProvider = localStorage.getItem('agro_sensei_api_provider') || 'gemini';
    isDemoMode = localStorage.getItem('agro_sensei_demo_mode') === 'true';
    const providerSelect = document.getElementById('api-provider');
    if (providerSelect) providerSelect.value = apiProvider;
}

function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function getLocationCityName(lat, lng) {
    const dGhaziabad = haversineKm(lat, lng, GHAZIABAD_CENTER.lat, GHAZIABAD_CENTER.lng);
    const dLucknow = haversineKm(lat, lng, LUCKNOW_CENTER.lat, LUCKNOW_CENTER.lng);
    return dGhaziabad <= dLucknow ? 'Ghaziabad' : 'Lucknow';
}

// Page Navigation
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const page = document.getElementById(`${pageName}-page`);
    if (page) {
        page.classList.add('active');
        currentPage = pageName;
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('font-bold', 'text-green-700');
        });
    }
    window.scrollTo(0, 0);
}

function setupEventListeners() {
    const diseaseInput = document.getElementById('disease-image-input');
    if (diseaseInput) diseaseInput.addEventListener('change', handleDiseaseImageUpload);
    const saveKeyBtn = document.getElementById('save-api-key');
    if (saveKeyBtn) saveKeyBtn.addEventListener('click', saveApiKey);
    const demoBtn = document.getElementById('demo-mode-btn');
    if (demoBtn) demoBtn.addEventListener('click', enableDemoMode);
    const allowLocBtn = document.getElementById('marketplace-allow-location');
    if (allowLocBtn) allowLocBtn.addEventListener('click', requestMarketplaceLocation);
}

// Crop Recommendation
async function submitCropForm(event) {
    event.preventDefault();
    const formData = {
        N: parseFloat(document.getElementById('N').value),
        P: parseFloat(document.getElementById('P').value),
        K: parseFloat(document.getElementById('K').value),
        temperature: parseFloat(document.getElementById('temperature').value),
        humidity: parseFloat(document.getElementById('humidity').value),
        ph: parseFloat(document.getElementById('ph').value),
        rainfall: parseFloat(document.getElementById('rainfall').value)
    };
    const submitBtn = document.getElementById('submit-crop-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Analyzing...';
    try {
        const response = await fetch(`${API_BASE_URL}/api/predict-crop`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (data.success) {
            displayCropResults(data);
            showNotification('Crop recommendation generated successfully!', 'success');
        } else {
            showNotification(data.error || 'Failed to get recommendation', 'error');
        }
    } catch (error) {
        showNotification('Server error. Please make sure the backend is running.', 'error');
        console.error('Error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-search mr-2"></i>Get Recommendation';
    }
}

function displayCropResults(data) {
    const resultsDiv = document.getElementById('crop-results');
    if (!resultsDiv) return;
    resultsDiv.classList.remove('hidden');
    const analysis = data.detailed_analysis;
    const recommendations = data.top_recommendations;
    resultsDiv.innerHTML = `
        <div class="crop-result-card rounded-2xl p-8 mb-6">
            <div class="bg-gradient-to-r from-green-600 to-green-800 text-white p-6 rounded-xl mb-6">
                <h2 class="text-3xl font-bold mb-2">Recommended Crop: ${data.predicted_crop.toUpperCase()}</h2>
                <div class="text-2xl font-bold">Confidence: ${data.confidence}%</div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div class="bg-blue-50 p-6 rounded-xl">
                    <h3 class="font-bold text-lg mb-3"><i class="fas fa-calendar mr-2"></i>Season</h3>
                    <p class="text-gray-700">${analysis.season}</p>
                </div>
                <div class="bg-green-50 p-6 rounded-xl">
                    <h3 class="font-bold text-lg mb-3"><i class="fas fa-tint mr-2"></i>Water Requirement</h3>
                    <p class="text-gray-700">${analysis.water_requirement}</p>
                </div>
            </div>
            <div class="bg-yellow-50 p-6 rounded-xl mb-6">
                <h3 class="font-bold text-lg mb-3"><i class="fas fa-flask mr-2"></i>Fertilizer Recommendation</h3>
                <p class="text-gray-700">${analysis.fertilizer_recommendation}</p>
            </div>
            <div class="mb-6">
                <h3 class="font-bold text-lg mb-3"><i class="fas fa-lightbulb mr-2"></i>Cultivation Tips</h3>
                <ul class="space-y-2">
                    ${analysis.cultivation_tips.map(tip => `
                        <li class="flex items-start text-gray-700">
                            <i class="fas fa-check-circle text-green-600 mr-2 mt-1"></i>
                            <span>${tip}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
            <div class="mb-6">
                <h3 class="font-bold text-lg mb-3"><i class="fas fa-chart-line mr-2"></i>Soil Analysis</h3>
                <div class="space-y-2">
                    ${analysis.soil_analysis.map(msg => {
                        const type = msg.includes('✅') ? 'alert-success' : msg.includes('⚠️') ? 'alert-warning' : 'alert-error';
                        return `<div class="${type} p-4 rounded-lg border-l-4">${msg}</div>`;
                    }).join('')}
                </div>
            </div>
            <div class="bg-gray-50 p-6 rounded-xl">
                <h3 class="font-bold text-lg mb-3">Alternative Recommendations</h3>
                <div class="space-y-2">
                    ${recommendations.slice(1).map(rec => `
                        <div class="flex justify-between items-center p-3 bg-white rounded-lg">
                            <span class="font-medium">${rec.crop.toUpperCase()}</span>
                            <span class="text-green-600 font-bold">${rec.confidence}%</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <button onclick="resetCropForm()" class="mt-6 w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300">
                <i class="fas fa-redo mr-2"></i>Try Again
            </button>
        </div>
    `;
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

function resetCropForm() {
    const form = document.getElementById('crop-form');
    const results = document.getElementById('crop-results');
    if (form) form.reset();
    if (results) results.classList.add('hidden');
}

// Disease Detection
async function handleDiseaseImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        await analyzeDisease(e.target.result);
    };
    reader.readAsDataURL(file);
}

async function analyzeDisease(imageBase64) {
    if (!apiKey && !isDemoMode) {
        showApiKeyModal();
        return;
    }
    document.getElementById('disease-upload-section').classList.add('hidden');
    document.getElementById('disease-loading').classList.remove('hidden');
    document.getElementById('disease-results').classList.add('hidden');
    try {
        if (isDemoMode) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const demoAnalysis = {
                disease: 'Late Blight',
                severity: 'Moderate',
                confidence: 87.5,
                description: 'Fungal disease affecting leaves and stems. Characterized by dark spots and wilting.',
                treatment: ['Apply copper-based fungicide', 'Remove infected plants', 'Improve air circulation'],
                prevention: ['Ensure proper spacing', 'Avoid overhead watering', 'Use resistant varieties']
            };
            displayDiseaseResults(demoAnalysis, imageBase64);
            document.getElementById('disease-loading').classList.add('hidden');
            return;
        }
        let backendError = null;
        try {
            const response = await fetch(`${API_BASE_URL}/api/analyze-disease`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageBase64, api_key: apiKey, provider: apiProvider })
            });
            const data = await response.json().catch(() => ({}));
            if (data.success) {
                displayDiseaseResults(normalizeDiseaseAnalysis(data.analysis), imageBase64);
                document.getElementById('disease-loading').classList.add('hidden');
                return;
            }
            backendError = data.error || data.message || (response.status === 400 ? 'Bad request (check API key).' : response.status === 500 ? 'Server error.' : 'Request failed.');
        } catch (e) {
            backendError = e.message || 'Server unreachable. Start the backend (e.g. run python app.py in the backend folder) and try again.';
        }
        try {
            const direct = await analyzeImageWithAIDirect(imageBase64);
            displayDiseaseResults(normalizeDiseaseAnalysis(direct), imageBase64);
        } catch (directErr) {
            const msg = directErr && directErr.message ? directErr.message : String(directErr);
            if (backendError && !msg.includes('API') && !msg.includes('key')) {
                showNotification(backendError + ' Direct API also failed: ' + msg.slice(0, 80), 'error');
            } else {
                showNotification(msg.slice(0, 120) || 'Analysis failed. Try demo mode or check your API key.', 'error');
            }
            document.getElementById('disease-upload-section').classList.remove('hidden');
        }
    } catch (error) {
        const msg = (error && error.message) ? error.message : String(error);
        showNotification(msg.slice(0, 120) || 'Analysis failed. Try demo mode or check your API key.', 'error');
        document.getElementById('disease-upload-section').classList.remove('hidden');
    } finally {
        document.getElementById('disease-loading').classList.add('hidden');
    }
}

function normalizeDiseaseAnalysis(a) {
    if (!a) return { disease: 'Unknown', severity: 'Low', confidence: 0, description: '', treatment: [], prevention: [] };
    const treatment = Array.isArray(a.treatment) ? a.treatment : [].concat(a.treatments && a.treatments.organic || [], a.treatments && a.treatments.chemical || []);
    const prevention = Array.isArray(a.prevention) ? a.prevention : [];
    const description = a.description || (Array.isArray(a.symptoms) ? a.symptoms.join('. ') : '') || (a.prognosis || '');
    return {
        disease: a.disease || a.disease_name || a.crop_type || 'Unknown',
        severity: a.severity || 'Moderate',
        confidence: a.confidence != null ? a.confidence : 85,
        description: description,
        treatment: treatment.length ? treatment : ['Consult local agronomist for treatment.'],
        prevention: prevention.length ? prevention : ['Maintain field hygiene and monitor crop health.']
    };
}

async function analyzeImageWithAIDirect(imageDataUrl) {
    const config = API_CONFIGS[apiProvider];
    if (apiProvider === 'openai') {
        const res = await fetch(config.endpoint, {
            method: 'POST',
            headers: config.headers(apiKey),
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: [
                    { type: 'text', text: 'Analyze this plant image and return ONLY a JSON object with: disease (or disease_name), severity (Low/Moderate/High), confidence (number), description, treatment (array), prevention (array). Return only valid JSON.' },
                    { type: 'image_url', image_url: { url: imageDataUrl } }
                ]}],
                max_tokens: 1000
            })
        });
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        let content = json.choices[0].message.content.trim();
        const start = content.indexOf('{'), end = content.lastIndexOf('}');
        if (start >= 0 && end >= 0) content = content.slice(start, end + 1);
        return JSON.parse(content);
    }
    if (apiProvider === 'gemini') {
        const base64 = imageDataUrl.split(',')[1];
        if (!base64) throw new Error('Invalid image data.');
        const mime = (imageDataUrl.match(/data:([^;]+)/) || [])[1] || 'image/jpeg';
        const res = await fetch(`${config.endpoint}?key=${apiKey}`, {
            method: 'POST',
            headers: config.headers(),
            body: JSON.stringify({
                contents: [{ parts: [
                    { text: 'Analyze this crop/plant image. Return ONLY a JSON object with: disease, severity (Low/Moderate/High), confidence (number), description, treatment (array), prevention (array). No other text.' },
                    { inline_data: { mime_type: mime, data: base64 } }
                ]}],
                generationConfig: { maxOutputTokens: 1024, temperature: 0.2 }
            })
        });
        const text = await res.text();
        if (!res.ok) {
            let errMsg = text;
            try {
                const errJson = JSON.parse(text);
                errMsg = errJson.error && errJson.error.message ? errJson.error.message : text;
            } catch (_) {}
            throw new Error(errMsg || 'Gemini API error ' + res.status);
        }
        const json = JSON.parse(text);
        const candidates = json.candidates;
        if (!candidates || !candidates.length) {
            const reason = (json.promptFeedback && json.promptFeedback.blockReason) ? ' Blocked: ' + json.promptFeedback.blockReason : '';
            throw new Error('Gemini returned no result.' + reason);
        }
        const parts = candidates[0].content && candidates[0].content.parts;
        if (!parts || !parts.length || !parts[0].text) {
            const finishReason = candidates[0].finishReason || '';
            throw new Error('Gemini returned empty or blocked content. ' + (finishReason ? 'Reason: ' + finishReason : ''));
        }
        let content = parts[0].text.trim();
        if ('```json' in content) content = content.split('```json')[1].split('```')[0].trim();
        else if ('```' in content) content = content.split('```')[1].split('```')[0].trim();
        const start = content.indexOf('{'), end = content.lastIndexOf('}');
        if (start >= 0 && end >= 0) content = content.slice(start, end + 1);
        return JSON.parse(content);
    }
    throw new Error('Anthropic direct call not implemented; use backend or switch to OpenAI/Gemini.');
}

function displayDiseaseResults(analysis, imageBase64) {
    const resultsDiv = document.getElementById('disease-results');
    if (!resultsDiv) return;
    resultsDiv.classList.remove('hidden');
    const severityColor = analysis.severity === 'High' ? 'red' : analysis.severity === 'Moderate' ? 'yellow' : 'green';
    resultsDiv.innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl p-8">
            <div class="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-xl mb-6">
                <h2 class="text-3xl font-bold mb-2">Diagnosis Complete</h2>
                <p class="text-green-100">Confidence: ${analysis.confidence}%</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <img src="${imageBase64}" alt="Analyzed crop" class="w-full rounded-xl shadow-lg mb-4">
                </div>
                <div>
                    <div class="bg-gray-50 p-6 rounded-xl">
                        <h3 class="font-bold text-xl mb-2">${analysis.disease || 'Healthy'}</h3>
                        <div class="text-lg mb-2">Severity: <span class="font-bold" style="color: ${severityColor};">${analysis.severity}</span></div>
                        <p class="text-gray-700">${analysis.description}</p>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div class="bg-green-50 p-6 rounded-xl">
                    <h3 class="font-bold text-lg mb-3"><i class="fas fa-pills mr-2"></i>Treatment</h3>
                    <ul class="space-y-2">
                        ${(analysis.treatment || []).map(t => `<li class="flex items-start"><i class="fas fa-check text-green-600 mr-2 mt-1"></i><span>${t}</span></li>`).join('')}
                    </ul>
                </div>
                <div class="bg-blue-50 p-6 rounded-xl">
                    <h3 class="font-bold text-lg mb-3"><i class="fas fa-shield-alt mr-2"></i>Prevention</h3>
                    <ul class="space-y-2">
                        ${(analysis.prevention || []).map(p => `<li class="flex items-start"><i class="fas fa-check text-blue-600 mr-2 mt-1"></i><span>${p}</span></li>`).join('')}
                    </ul>
                </div>
            </div>
            <button onclick="resetDiseaseForm()" class="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300">
                <i class="fas fa-redo mr-2"></i>New Analysis
            </button>
        </div>
    `;
}

function resetDiseaseForm() {
    const input = document.getElementById('disease-image-input');
    const uploadSection = document.getElementById('disease-upload-section');
    const results = document.getElementById('disease-results');
    if (input) input.value = '';
    if (uploadSection) uploadSection.classList.remove('hidden');
    if (results) results.classList.add('hidden');
}

async function runDemoAnalysis() {
    isDemoMode = true;
    const demoImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzRhNWQ2OCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U2FtcGxlIFBsYW50PC90ZXh0Pjwvc3ZnPg==';
    await analyzeDisease(demoImage);
}

// API Key Management
function showApiKeyModal() {
    syncApiKeyFromStorage();
    const modal = document.getElementById('api-key-modal');
    if (modal) modal.classList.add('show');
}

function hideApiKeyModal() {
    const modal = document.getElementById('api-key-modal');
    if (modal) modal.classList.remove('show');
}

function saveApiKey() {
    const keyInput = document.getElementById('api-key-input');
    const providerSelect = document.getElementById('api-provider');
    const key = keyInput ? keyInput.value.trim() : '';
    const provider = providerSelect ? providerSelect.value : 'gemini';
    if (!key) {
        showNotification('Please enter an API key', 'error');
        return;
    }
    apiKey = key;
    apiProvider = provider;
    isDemoMode = false;
    localStorage.setItem('agro_sensei_api_key', key);
    localStorage.setItem('agro_sensei_api_provider', provider);
    localStorage.setItem('agro_sensei_demo_mode', 'false');
    hideApiKeyModal();
    showNotification('API key saved successfully!', 'success');
}

function enableDemoMode() {
    isDemoMode = true;
    localStorage.setItem('agro_sensei_demo_mode', 'true');
    hideApiKeyModal();
    showNotification('Demo mode activated', 'info');
}

// Marketplace: location-based shops (Ghaziabad / Lucknow)
function requestMarketplaceLocation() {
    const errEl = document.getElementById('marketplace-location-error');
    const statusEl = document.getElementById('marketplace-location-status');
    const locationLabel = document.getElementById('marketplace-current-location');
    if (errEl) errEl.classList.add('hidden');
    if (!navigator.geolocation) {
        if (errEl) { errEl.textContent = 'Geolocation is not supported by your browser.'; errEl.classList.remove('hidden'); }
        return;
    }
    navigator.geolocation.getCurrentPosition(
        function(pos) {
            userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            currentLocationName = getLocationCityName(userCoords.lat, userCoords.lng);
            document.getElementById('marketplace-location-prompt').classList.add('hidden');
            document.getElementById('marketplace-shops-section').classList.remove('hidden');
            if (statusEl) statusEl.textContent = 'Showing agriculture shops near you (sorted by distance).';
            if (locationLabel) {
                locationLabel.textContent = 'Current location: ' + currentLocationName;
                locationLabel.classList.remove('hidden');
            }
            renderNearbyShops();
        },
        function(e) {
            userCoords = { lat: GHAZIABAD_CENTER.lat, lng: GHAZIABAD_CENTER.lng };
            currentLocationName = 'Ghaziabad (default)';
            document.getElementById('marketplace-location-prompt').classList.add('hidden');
            document.getElementById('marketplace-shops-section').classList.remove('hidden');
            if (statusEl) statusEl.textContent = 'Location denied. Showing sample shops (Ghaziabad area). Allow location next time for accurate results.';
            if (locationLabel) {
                locationLabel.textContent = 'Current location: ' + currentLocationName;
                locationLabel.classList.remove('hidden');
            }
            renderNearbyShops();
        }
    );
}

function renderNearbyShops() {
    if (!userCoords) return;
    const grid = document.getElementById('marketplace-shops-grid');
    if (!grid) return;
    const withDistance = MOCK_SHOPS.map(s => ({
        ...s,
        distanceKm: haversineKm(userCoords.lat, userCoords.lng, s.lat, s.lng)
    })).sort((a, b) => a.distanceKm - b.distanceKm);
    const filtered = currentShopFilter === 'all' ? withDistance : withDistance.filter(s => s.category === currentShopFilter);
    grid.innerHTML = filtered.map(shop => `
        <div class="product-card bg-white rounded-2xl shadow-xl p-6" data-category="${shop.category}">
            <div class="w-full h-32 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <i class="fas fa-store text-4xl text-green-600"></i>
            </div>
            <h3 class="font-bold text-lg mb-2">${shop.name}</h3>
            <p class="text-gray-600 text-sm mb-1">${shop.address}</p>
            <p class="text-gray-500 text-xs mb-2">${shop.city}</p>
            <p class="text-green-600 font-semibold mb-4">${shop.distanceKm.toFixed(1)} km away</p>
            <a href="tel:${shop.phone.replace(/\s/g,'')}" class="block w-full btn-primary text-white py-2 rounded-lg font-medium text-center">Contact</a>
        </div>
    `).join('');
}

function filterShops(category, ev) {
    currentShopFilter = category;
    document.querySelectorAll('#marketplace-shops-section .category-btn').forEach(btn => {
        btn.classList.remove('bg-green-600', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    if (ev && ev.target) {
        ev.target.classList.remove('bg-gray-200', 'text-gray-700');
        ev.target.classList.add('bg-green-600', 'text-white');
    }
    if (userCoords) renderNearbyShops();
}

function showNotification(message, type) {
    type = type || 'info';
    const container = document.getElementById('notification-container');
    if (!container) return;
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    container.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function toggleMobileMenu() {
    showNotification('Mobile menu coming soon', 'info');
}

// Expose for onclick handlers
window.showPage = showPage;
window.submitCropForm = submitCropForm;
window.resetCropForm = resetCropForm;
window.runDemoAnalysis = runDemoAnalysis;
window.resetDiseaseForm = resetDiseaseForm;
window.filterShops = filterShops;
window.toggleMobileMenu = toggleMobileMenu;
window.showApiKeyModal = showApiKeyModal;
