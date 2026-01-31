"""
ML Model Training Script for Crop Recommendation
Based on Crop_Recommendation.ipynb
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import pickle
import json
import os

# Set paths
DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'Crop_recommendation.csv')
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

# Create models directory if it doesn't exist
os.makedirs(MODEL_DIR, exist_ok=True)

def train_model():
    """Train the Random Forest model for crop recommendation"""
    
    print("Loading dataset...")
    # Load the dataset
    crop = pd.read_csv(DATA_PATH)
    
    # Remove muskmelon if present (as done in notebook)
    if 'muskmelon' in crop['label'].values:
        crop = crop.drop(crop[crop.label == 'muskmelon'].index)
    
    print(f"Dataset shape: {crop.shape}")
    print(f"Number of unique crops: {crop['label'].nunique()}")
    
    # Copy data
    data = crop.copy()
    
    # Check for null values
    if data.isnull().sum().any():
        print("Warning: Null values found in dataset")
        data = data.dropna()
    
    # Remove duplicates
    data = data.drop_duplicates()
    print(f"Data shape after cleaning: {data.shape}")
    
    # Label encoding
    print("Encoding labels...")
    encoder = LabelEncoder()
    data['Encoded_label'] = encoder.fit_transform(data['label'])
    
    # Get feature columns (all except label and Encoded_label)
    feature_columns = [col for col in data.columns if col not in ['label', 'Encoded_label']]
    X = data[feature_columns]
    y = data['Encoded_label']
    
    print(f"Features: {feature_columns}")
    print(f"Number of classes: {len(encoder.classes_)}")
    
    # Split data
    print("Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=2
    )
    
    print(f"Train set: {X_train.shape}, Test set: {X_test.shape}")
    
    # Train Random Forest model
    print("Training Random Forest model...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        random_state=2,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate model
    print("Evaluating model...")
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\nModel Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=encoder.classes_))
    
    # Save model
    model_path = os.path.join(MODEL_DIR, 'crop_recommendation_model.pkl')
    encoder_path = os.path.join(MODEL_DIR, 'label_encoder.pkl')
    
    print(f"\nSaving model to {model_path}...")
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    print(f"Saving label encoder to {encoder_path}...")
    with open(encoder_path, 'wb') as f:
        pickle.dump(encoder, f)
    
    # Create crop info JSON
    print("Creating crop_info.json...")
    crop_info = {
        'crops': encoder.classes_.tolist(),
        'num_crops': len(encoder.classes_),
        'features': feature_columns,
        'feature_ranges': {}
    }
    
    # Calculate feature ranges
    for feature in feature_columns:
        crop_info['feature_ranges'][feature] = {
            'min': float(data[feature].min()),
            'max': float(data[feature].max()),
            'mean': float(data[feature].mean()),
            'std': float(data[feature].std())
        }
    
    # Add crop metadata
    crop_info['crop_metadata'] = {}
    for crop_name in encoder.classes_:
        crop_data = data[data['label'] == crop_name]
        crop_info['crop_metadata'][crop_name] = {
            'avg_N': float(crop_data['N'].mean()),
            'avg_P': float(crop_data['P'].mean()),
            'avg_K': float(crop_data['K'].mean()),
            'avg_temperature': float(crop_data['temperature'].mean()),
            'avg_humidity': float(crop_data['humidity'].mean()),
            'avg_ph': float(crop_data['ph'].mean()),
            'avg_rainfall': float(crop_data['rainfall'].mean())
        }
    
    info_path = os.path.join(MODEL_DIR, 'crop_info.json')
    with open(info_path, 'w') as f:
        json.dump(crop_info, f, indent=2)
    
    print(f"Crop info saved to {info_path}")
    print("\n✅ Model training completed successfully!")
    
    return model, encoder, crop_info

if __name__ == '__main__':
    train_model()

