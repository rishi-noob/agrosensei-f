"""
Agro Sensei Flask Backend API
Main application file with all endpoints
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import os
import sys

# Add utils to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'utils'))

from utils.ml_helpers import predict_crop, load_crop_info
from utils.api_helpers import call_openai_vision, call_gemini_vision, call_anthropic_vision
from utils.crop_helpers import generate_crop_recommendations, analyze_soil_parameters

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# API Configuration
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:5000')

@app.route('/', methods=['GET'])
def index():
    """API status and available endpoints"""
    return jsonify({
        'status': 'success',
        'message': 'Agro Sensei API is running',
        'version': '1.0.0',
        'endpoints': {
            'GET /': 'API status',
            'GET /api/crop-info': 'Get crop information and metadata',
            'POST /api/predict-crop': 'Predict crop recommendation',
            'POST /api/analyze-disease': 'Analyze crop disease from image',
            'GET /api/community/posts': 'Get community posts (future)',
            'POST /api/community/posts': 'Create community post (future)',
            'GET /api/marketplace/products': 'Get marketplace products (future)'
        }
    }), 200

@app.route('/api/crop-info', methods=['GET'])
def get_crop_info():
    """Return list of supported crops and feature ranges"""
    try:
        crop_info = load_crop_info()
        
        return jsonify({
            'success': True,
            'data': {
                'crops': crop_info['crops'],
                'num_crops': crop_info['num_crops'],
                'features': crop_info['features'],
                'feature_ranges': crop_info['feature_ranges'],
                'crop_metadata': crop_info.get('crop_metadata', {})
            }
        }), 200
    except Exception as e:
        logger.error(f"Error in get_crop_info: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to load crop information',
            'message': str(e)
        }), 500

@app.route('/api/predict-crop', methods=['POST'])
def predict_crop_endpoint():
    """Predict crop recommendation based on soil and climate parameters"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Extract parameters
        N = float(data['N'])
        P = float(data['P'])
        K = float(data['K'])
        temperature = float(data['temperature'])
        humidity = float(data['humidity'])
        ph = float(data['ph'])
        rainfall = float(data['rainfall'])
        
        # Validate ranges (basic validation)
        if not (0 <= N <= 200) or not (0 <= P <= 200) or not (0 <= K <= 250):
            return jsonify({
                'success': False,
                'error': 'Nutrient values out of valid range'
            }), 400
        
        if not (0 <= temperature <= 50) or not (0 <= humidity <= 100):
            return jsonify({
                'success': False,
                'error': 'Temperature or humidity out of valid range'
            }), 400
        
        if not (3 <= ph <= 10) or not (0 <= rainfall <= 500):
            return jsonify({
                'success': False,
                'error': 'pH or rainfall out of valid range'
            }), 400
        
        # Get prediction
        prediction = predict_crop(N, P, K, temperature, humidity, ph, rainfall, top_n=3)
        
        # Generate detailed recommendations
        parameters = {
            'N': N,
            'P': P,
            'K': K,
            'temperature': temperature,
            'humidity': humidity,
            'ph': ph,
            'rainfall': rainfall
        }
        
        detailed_analysis = generate_crop_recommendations(
            prediction['predicted_crop'],
            parameters
        )
        
        return jsonify({
            'success': True,
            'predicted_crop': prediction['predicted_crop'],
            'confidence': prediction['confidence'],
            'top_recommendations': prediction['top_recommendations'],
            'detailed_analysis': detailed_analysis,
            'input_parameters': {
                'N': N,
                'P': P,
                'K': K,
                'temperature': temperature,
                'humidity': humidity,
                'ph': ph,
                'rainfall': rainfall
            }
        }), 200
        
    except ValueError as e:
        logger.error(f"Validation error in predict_crop: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Invalid parameter values',
            'message': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Error in predict_crop: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to predict crop',
            'message': str(e)
        }), 500

@app.route('/api/analyze-disease', methods=['POST'])
def analyze_disease():
    """Analyze crop disease from uploaded image"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'image' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: image'
            }), 400
        
        image_base64 = data['image']
        api_key = data.get('api_key', '')
        provider = data.get('provider', 'openai').lower()
        
        # Validate provider
        valid_providers = ['openai', 'gemini', 'anthropic']
        if provider not in valid_providers:
            return jsonify({
                'success': False,
                'error': f'Invalid provider. Must be one of: {", ".join(valid_providers)}'
            }), 400
        
        if not api_key:
            return jsonify({
                'success': False,
                'error': 'API key is required'
            }), 400
        
        # Call appropriate API
        if provider == 'openai':
            result = call_openai_vision(image_base64, api_key)
        elif provider == 'gemini':
            result = call_gemini_vision(image_base64, api_key)
        elif provider == 'anthropic':
            result = call_anthropic_vision(image_base64, api_key)
        else:
            return jsonify({
                'success': False,
                'error': 'Invalid provider'
            }), 400
        
        if not result['success']:
            return jsonify({
                'success': False,
                'error': 'Failed to analyze image',
                'message': result.get('error', 'Unknown error')
            }), 500
        
        return jsonify({
            'success': True,
            'analysis': result['analysis']
        }), 200
        
    except Exception as e:
        logger.error(f"Error in analyze_disease: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to analyze disease',
            'message': str(e)
        }), 500

@app.route('/api/community/posts', methods=['GET'])
def get_community_posts():
    """Get community posts (Future feature)"""
    # Placeholder for future implementation
    return jsonify({
        'success': True,
        'message': 'Community feature coming soon',
        'posts': []
    }), 200

@app.route('/api/community/posts', methods=['POST'])
def create_community_post():
    """Create a new community post (Future feature)"""
    # Placeholder for future implementation
    return jsonify({
        'success': True,
        'message': 'Community feature coming soon',
        'post_id': None
    }), 200

@app.route('/api/marketplace/products', methods=['GET'])
def get_marketplace_products():
    """Get marketplace products (Future feature)"""
    # Placeholder for future implementation
    return jsonify({
        'success': True,
        'message': 'Marketplace feature coming soon',
        'products': []
    }), 200

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    # Check if model exists
    model_path = os.path.join(os.path.dirname(__file__), 'models', 'crop_recommendation_model.pkl')
    if not os.path.exists(model_path):
        logger.warning("Model not found. Please run train_model.py first.")
        logger.info("Training model...")
        from train_model import train_model
        train_model()
    
    # Run the app
    port = int(os.getenv('PORT', 5000))
    logger.info(f"Starting Agro Sensei API on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)

