@echo off
echo Starting Agro Sensei Backend...
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies if needed
echo Installing dependencies...
pip install -r requirements.txt

REM Check if model exists
if not exist "backend\models\crop_recommendation_model.pkl" (
    echo Model not found. Training model...
    cd backend
    python train_model.py
    cd ..
)

REM Start Flask server
echo.
echo Starting Flask server on http://localhost:5000
echo Press Ctrl+C to stop
echo.
cd backend
python app.py

