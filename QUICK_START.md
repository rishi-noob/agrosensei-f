# 🚀 Quick Start Guide

## Prerequisites
- Python 3.8 or higher installed
- pip package manager

## Windows Quick Start

### Option 1: Using the Batch Script
1. Double-click `start_backend.bat`
2. Wait for the backend to start (it will train the model if needed)
3. Open `frontend/index.html` in your browser

### Option 2: Manual Setup

1. **Create Virtual Environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Train the Model** (if not already trained)
   ```bash
   cd backend
   python train_model.py
   cd ..
   ```

4. **Start the Backend**
   ```bash
   cd backend
   python app.py
   ```

5. **Open the Frontend**
   - Simply open `frontend/index.html` in your browser
   - Or use a local server:
     ```bash
     cd frontend
     python -m http.server 8000
     ```
     Then visit `http://localhost:8000`

## Linux/Mac Quick Start

1. **Create Virtual Environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Train the Model** (if not already trained)
   ```bash
   cd backend
   python train_model.py
   cd ..
   ```

4. **Start the Backend**
   ```bash
   cd backend
   python app.py
   ```

5. **Open the Frontend**
   - Open `frontend/index.html` in your browser
   - Or use a local server:
     ```bash
     cd frontend
     python3 -m http.server 8000
     ```

## Testing the Application

### 1. Test Crop Recommendation
- Navigate to "Crop Advice" page
- Fill in the form with sample data:
  - N: 90
  - P: 42
  - K: 43
  - Temperature: 20.8
  - Humidity: 82.0
  - pH: 6.5
  - Rainfall: 202.9
- Click "Get Recommendation"
- You should see rice as the recommended crop

### 2. Test Disease Detection
- Navigate to "Disease Detection" page
- Click "Try Demo Analysis" to test without API key
- Or upload an image and configure an API key

### 3. Explore Other Features
- Check out the Community page
- Browse the Marketplace
- Navigate between pages using the header menu

## Troubleshooting

### Port 5000 Already in Use
If you get an error that port 5000 is in use:
- Change the port in `backend/app.py`:
  ```python
  app.run(host='0.0.0.0', port=5001, debug=True)  # Change 5000 to 5001
  ```
- Update `API_BASE_URL` in `frontend/index.html`:
  ```javascript
  const API_BASE_URL = 'http://localhost:5001';
  ```

### Model Training Takes Time
The first time you run the application, model training may take 1-2 minutes. This is normal.

### CORS Errors
If you see CORS errors in the browser console:
- Make sure Flask-CORS is installed: `pip install flask-cors`
- Verify the backend is running on the correct port

## Next Steps

1. **Configure API Keys** (for disease detection):
   - Get an API key from OpenAI, Gemini, or Anthropic
   - Click the settings icon in Disease Detection page
   - Enter your API key

2. **Explore the Features**:
   - Try different crop parameters
   - Test disease detection with real crop images
   - Post in the community (coming soon)

3. **Read the Full Documentation**:
   - See `README.md` for complete documentation
   - Check API endpoints documentation

---

Happy Farming! 🌾

