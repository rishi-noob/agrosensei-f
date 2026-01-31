# 🌾 Agro Sensei - AI-Powered Agriculture Platform

A comprehensive AI-powered agriculture platform that helps farmers make better decisions through crop recommendations, disease detection, community support, and marketplace integration.

## 📋 Features

### 1. **Crop Recommendation System**
- ML-based crop suggestions using soil and climate data
- 99%+ accuracy with Random Forest Classifier
- Detailed cultivation recommendations
- Soil analysis and improvement suggestions
- Support for 22+ crop types

### 2. **Crop Disease Detection**
- Image-based AI disease diagnosis
- Integration with OpenAI GPT-4o Vision, Google Gemini, and Anthropic Claude
- Treatment and prevention recommendations
- Severity assessment
- Demo mode for testing

### 3. **Farmer Community**
- Discussion forum and knowledge sharing
- Post creation and interaction
- Trending topics
- Expert profiles (coming soon)

### 4. **AgriMarketplace**
- Buy/sell agricultural products
- Category filtering (Seeds, Equipment, Fertilizers, Produce)
- Product listings with pricing

## 🛠️ Tech Stack

### Backend
- **Flask** - Web framework
- **scikit-learn** - Machine learning
- **pandas** - Data processing
- **numpy** - Numerical computing
- **requests** - HTTP client for AI APIs

### Frontend
- **HTML5/CSS3** - Structure and styling
- **Tailwind CSS** - Utility-first CSS framework
- **JavaScript (Vanilla)** - Interactivity
- **Font Awesome** - Icons
- **Google Fonts** - Typography (Playfair Display, Karla)

### Machine Learning
- **Random Forest Classifier** - Crop recommendation model
- **Label Encoder** - Crop name encoding
- **99%+ Accuracy** - Model performance

## 📁 Project Structure

```
agro-sensei/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── train_model.py         # ML model training script
│   ├── models/                # Trained models directory
│   │   ├── crop_recommendation_model.pkl
│   │   ├── label_encoder.pkl
│   │   └── crop_info.json
│   ├── utils/
│   │   ├── ml_helpers.py      # ML prediction functions
│   │   ├── api_helpers.py      # AI Vision API integrations
│   │   └── crop_helpers.py     # Crop recommendation helpers
│   └── requirements.txt
├── frontend/
│   ├── index.html             # Main frontend application
│   └── assets/                # Static assets (optional)
├── data/
│   ├── Crop_recommendation.csv
│   └── crop_production.csv
├── notebooks/
│   └── Crop_Recommendation.ipynb
├── requirements.txt
├── README.md
└── .gitignore
```

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd agro-sensei
```

### Step 2: Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Train the ML Model
```bash
cd backend
python train_model.py
```

This will:
- Load and preprocess the dataset
- Train the Random Forest model
- Save the model and label encoder
- Generate crop_info.json with metadata

### Step 5: Start the Flask Backend
```bash
cd backend
python app.py
```

The API will run on `http://localhost:5000`

### Step 6: Open the Frontend
Simply open `frontend/index.html` in your web browser, or use a local server:

```bash
# Using Python HTTP server
cd frontend
python -m http.server 8000
# Then visit http://localhost:8000
```

## 📡 API Endpoints

### GET `/`
Returns API status and available endpoints.

### GET `/api/crop-info`
Returns list of supported crops, feature ranges, and metadata.

**Response:**
```json
{
  "success": true,
  "data": {
    "crops": ["rice", "wheat", "maize", ...],
    "num_crops": 22,
    "features": ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"],
    "feature_ranges": {...},
    "crop_metadata": {...}
  }
}
```

### POST `/api/predict-crop`
Predicts crop recommendation based on soil and climate parameters.

**Request:**
```json
{
  "N": 90,
  "P": 42,
  "K": 43,
  "temperature": 20.8,
  "humidity": 82.0,
  "ph": 6.5,
  "rainfall": 202.9
}
```

**Response:**
```json
{
  "success": true,
  "predicted_crop": "rice",
  "confidence": 98.5,
  "top_recommendations": [...],
  "detailed_analysis": {
    "crop_name": "Rice",
    "season": "Kharif (June-October)",
    "water_requirement": "High (1200-1500 mm)",
    "fertilizer_recommendation": "NPK ratio 4:2:1",
    "cultivation_tips": [...],
    "soil_analysis": [...]
  }
}
```

### POST `/api/analyze-disease`
Analyzes crop disease from uploaded image.

**Request:**
```json
{
  "image": "base64_encoded_image_string",
  "api_key": "user_api_key",
  "provider": "openai"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "disease": "Late Blight",
    "severity": "Moderate",
    "confidence": 87.5,
    "description": "...",
    "treatment": [...],
    "prevention": [...]
  }
}
```

## 🎨 Design System

### Color Palette
- **Primary Green**: `#2d5016`
- **Accent Gold**: `#d4a574`
- **Earth Brown**: `#8b6f47`
- **Light Cream**: `#faf8f5`
- **Dark Soil**: `#1a1410`

### Typography
- **Display Font**: Playfair Display (serif) - for headers
- **Body Font**: Karla (sans-serif) - for body text

## 🔧 Configuration

### API Keys
The disease detection feature requires API keys from one of the following providers:
- **OpenAI**: Get your key from [platform.openai.com](https://platform.openai.com/api-keys)
- **Google Gemini**: Get your key from [makersuite.google.com](https://makersuite.google.com/app/apikey)
- **Anthropic Claude**: Get your key from [console.anthropic.com](https://console.anthropic.com/)

API keys are stored in browser localStorage and never sent to our servers (only to the respective AI providers).

### Demo Mode
You can use the disease detection feature in demo mode without an API key. This will generate sample analysis results.

## 📊 Model Training

The crop recommendation model is trained using:
- **Algorithm**: Random Forest Classifier
- **Parameters**: n_estimators=100, max_depth=20
- **Accuracy**: 99%+
- **Features**: N, P, K, temperature, humidity, ph, rainfall
- **Output**: 22 crop classes

To retrain the model:
```bash
cd backend
python train_model.py
```

## 🧪 Testing

### Backend Testing
Test the API endpoints using curl or Postman:

```bash
# Test crop prediction
curl -X POST http://localhost:5000/api/predict-crop \
  -H "Content-Type: application/json" \
  -d '{
    "N": 90,
    "P": 42,
    "K": 43,
    "temperature": 20.8,
    "humidity": 82.0,
    "ph": 6.5,
    "rainfall": 202.9
  }'
```

### Frontend Testing
1. Open the frontend in a browser
2. Navigate between pages
3. Test crop recommendation with sample data
4. Test disease detection (demo mode or with API key)

## 🐛 Troubleshooting

### Backend not starting
- Check if port 5000 is available
- Ensure all dependencies are installed
- Verify the model files exist in `backend/models/`

### Model not found
- Run `python backend/train_model.py` to generate model files

### CORS errors
- Ensure Flask-CORS is installed
- Check that the frontend is making requests to the correct API URL

### API key errors
- Verify your API key is correct
- Check that you have sufficient credits/quota
- Try demo mode for testing

## 🚧 Future Enhancements

- [ ] User authentication and profiles
- [ ] Database integration for community posts
- [ ] Real-time chat functionality
- [ ] Payment integration for marketplace
- [ ] Advanced analytics and insights
- [ ] Weather API integration
- [ ] Mobile app version
- [ ] Multi-language support

## 📝 License

This project is open source and available for educational purposes.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues, questions, or suggestions, please open an issue on the repository.

---

**Built with ❤️ for farmers worldwide** 🌾

