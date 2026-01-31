"""
Crop Recommendation Helper Functions
"""

def generate_crop_recommendations(crop_name, parameters):
    """
    Generate detailed cultivation recommendations for a crop
    
    Args:
        crop_name: Name of the crop
        parameters: Dictionary with N, P, K, temperature, humidity, ph, rainfall
    
    Returns:
        dict: Detailed crop recommendations
    """
    # Crop-specific information database
    crop_info_db = {
        'rice': {
            'season': 'Kharif (June-October)',
            'water_requirement': 'High (1200-1500 mm)',
            'fertilizer_recommendation': 'NPK ratio 4:2:1',
            'cultivation_tips': [
                'Maintain flooded conditions during growth',
                'Control weeds early in the season',
                'Use certified seeds for better yield',
                'Apply nitrogen in split doses'
            ]
        },
        'wheat': {
            'season': 'Rabi (October-March)',
            'water_requirement': 'Moderate (400-500 mm)',
            'fertilizer_recommendation': 'NPK ratio 2:1:1',
            'cultivation_tips': [
                'Sow at proper time for best results',
                'Ensure good drainage',
                'Apply irrigation at critical growth stages',
                'Control rust and smut diseases'
            ]
        },
        'maize': {
            'season': 'Kharif (June-September)',
            'water_requirement': 'Moderate (500-800 mm)',
            'fertilizer_recommendation': 'NPK ratio 4:2:1',
            'cultivation_tips': [
                'Maintain proper spacing (60x20 cm)',
                'Apply irrigation at tasseling stage',
                'Control stem borer pests',
                'Harvest when kernels are hard'
            ]
        },
        'cotton': {
            'season': 'Kharif (April-October)',
            'water_requirement': 'Moderate (600-800 mm)',
            'fertilizer_recommendation': 'NPK ratio 3:1:2',
            'cultivation_tips': [
                'Use Bt cotton varieties',
                'Control bollworm pests',
                'Apply irrigation at flowering',
                'Harvest when bolls open'
            ]
        },
        'sugarcane': {
            'season': 'Year-round (12-18 months)',
            'water_requirement': 'High (1500-2000 mm)',
            'fertilizer_recommendation': 'NPK ratio 4:2:1',
            'cultivation_tips': [
                'Plant in well-drained soil',
                'Maintain adequate moisture',
                'Control red rot disease',
                'Harvest at proper maturity'
            ]
        }
    }
    
    # Get crop-specific info or use defaults
    crop_lower = crop_name.lower()
    if crop_lower in crop_info_db:
        info = crop_info_db[crop_lower]
    else:
        # Default recommendations for unknown crops
        info = {
            'season': 'Varies by region',
            'water_requirement': 'Moderate',
            'fertilizer_recommendation': 'NPK ratio 2:1:1',
            'cultivation_tips': [
                'Follow local agricultural practices',
                'Maintain proper soil moisture',
                'Control pests and diseases',
                'Harvest at optimal maturity'
            ]
        }
    
    # Analyze soil parameters
    soil_analysis = analyze_soil_parameters(
        parameters.get('N', 0),
        parameters.get('P', 0),
        parameters.get('K', 0),
        parameters.get('ph', 7.0)
    )
    
    return {
        'crop_name': crop_name.capitalize(),
        'season': info['season'],
        'water_requirement': info['water_requirement'],
        'fertilizer_recommendation': info['fertilizer_recommendation'],
        'cultivation_tips': info['cultivation_tips'],
        'soil_analysis': soil_analysis
    }

def analyze_soil_parameters(N, P, K, ph):
    """
    Analyze soil quality and provide improvement suggestions
    
    Args:
        N: Nitrogen level (kg/ha)
        P: Phosphorus level (kg/ha)
        K: Potassium level (kg/ha)
        ph: Soil pH value
    
    Returns:
        list: List of soil analysis messages
    """
    analysis = []
    
    # Nitrogen analysis
    if N < 50:
        analysis.append('⚠️ Nitrogen levels are low. Consider adding nitrogen-rich fertilizers.')
    elif N > 120:
        analysis.append('⚠️ Nitrogen levels are very high. May cause excessive vegetative growth.')
    else:
        analysis.append('✅ Nitrogen levels are optimal.')
    
    # Phosphorus analysis
    if P < 20:
        analysis.append('⚠️ Phosphorus levels are low. Add phosphate fertilizers.')
    elif P > 100:
        analysis.append('⚠️ Phosphorus levels are very high. May cause nutrient imbalance.')
    else:
        analysis.append('✅ Phosphorus levels are optimal.')
    
    # Potassium analysis
    if K < 30:
        analysis.append('⚠️ Potassium levels are low. Add potash fertilizers.')
    elif K > 150:
        analysis.append('⚠️ Potassium levels are very high.')
    else:
        analysis.append('✅ Potassium levels are optimal.')
    
    # pH analysis
    if ph < 5.5:
        analysis.append('⚠️ Soil is too acidic. Consider adding lime to raise pH.')
    elif ph > 8.5:
        analysis.append('⚠️ Soil is too alkaline. Consider adding sulfur or organic matter.')
    elif 6.0 <= ph <= 7.5:
        analysis.append('✅ Soil pH is optimal for most crops.')
    else:
        analysis.append('⚠️ Soil pH is slightly outside optimal range (6.0-7.5).')
    
    # Overall assessment
    optimal_count = sum(1 for msg in analysis if '✅' in msg)
    if optimal_count >= 3:
        analysis.insert(0, '✅ Soil parameters are generally optimal for crop cultivation.')
    else:
        analysis.insert(0, '⚠️ Some soil parameters need attention for optimal crop growth.')
    
    return analysis

