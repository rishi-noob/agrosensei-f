"""
ML Helper Functions for Crop Recommendation
"""

import pickle
import os
import json
import numpy as np

MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')

def load_model():
    """Load the trained crop recommendation model"""
    model_path = os.path.join(MODEL_DIR, 'crop_recommendation_model.pkl')
    with open(model_path, 'rb') as f:
        return pickle.load(f)

def load_encoder():
    """Load the label encoder"""
    encoder_path = os.path.join(MODEL_DIR, 'label_encoder.pkl')
    with open(encoder_path, 'rb') as f:
        return pickle.load(f)

def load_crop_info():
    """Load crop information metadata"""
    info_path = os.path.join(MODEL_DIR, 'crop_info.json')
    with open(info_path, 'r') as f:
        return json.load(f)

def predict_crop(N, P, K, temperature, humidity, ph, rainfall, top_n=3):
    """
    Predict crop recommendation with top N alternatives
    
    Args:
        N, P, K: Soil nutrients (kg/ha)
        temperature: Temperature in Celsius
        humidity: Humidity percentage
        ph: Soil pH value
        rainfall: Rainfall in mm
        top_n: Number of top recommendations to return
    
    Returns:
        dict: Prediction results with top recommendations
    """
    model = load_model()
    encoder = load_encoder()
    
    # Prepare input features
    features = np.array([[N, P, K, temperature, humidity, ph, rainfall]])
    
    # Get prediction probabilities
    probabilities = model.predict_proba(features)[0]
    
    # Get top N predictions
    top_indices = np.argsort(probabilities)[::-1][:top_n]
    
    # Build recommendations list
    recommendations = []
    for idx in top_indices:
        crop_name = encoder.classes_[idx]
        confidence = float(probabilities[idx] * 100)
        recommendations.append({
            'crop': crop_name,
            'confidence': round(confidence, 2)
        })
    
    # Get primary prediction
    primary_idx = top_indices[0]
    predicted_crop = encoder.classes_[primary_idx]
    confidence = float(probabilities[primary_idx] * 100)
    
    return {
        'predicted_crop': predicted_crop,
        'confidence': round(confidence, 2),
        'top_recommendations': recommendations
    }

