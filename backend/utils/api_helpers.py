"""
API Helper Functions for AI Vision APIs
"""

import requests
import base64
import json

def call_openai_vision(image_base64, api_key):
    """
    Call OpenAI GPT-4o Vision API for disease detection
    
    Args:
        image_base64: Base64 encoded image string
        api_key: OpenAI API key
    
    Returns:
        dict: Disease analysis results
    """
    url = "https://api.openai.com/v1/chat/completions"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    # Extract base64 data if it includes data URL prefix
    if ',' in image_base64:
        image_base64 = image_base64.split(',')[1]
    
    payload = {
        "model": "gpt-4o",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": """Analyze this crop/plant image and provide a detailed disease diagnosis. 
                        Return a JSON object with the following structure:
                        {
                            "disease": "disease name or 'Healthy'",
                            "severity": "Low/Moderate/High",
                            "confidence": 85,
                            "description": "detailed description of the disease or health status",
                            "treatment": ["treatment method 1", "treatment method 2"],
                            "prevention": ["prevention tip 1", "prevention tip 2"]
                        }
                        Return ONLY valid JSON, no additional text."""
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_base64}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 1000
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        content = result['choices'][0]['message']['content']
        
        # Parse JSON from response
        content = content.strip()
        if '```json' in content:
            content = content.split('```json')[1].split('```')[0].strip()
        elif '```' in content:
            content = content.split('```')[1].split('```')[0].strip()
        
        # Extract JSON object
        start_idx = content.find('{')
        end_idx = content.rfind('}')
        if start_idx >= 0 and end_idx >= 0:
            content = content[start_idx:end_idx+1]
        
        analysis = json.loads(content)
        return {
            'success': True,
            'analysis': analysis
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def call_gemini_vision(image_base64, api_key):
    """
    Call Google Gemini Vision API for disease detection
    
    Args:
        image_base64: Base64 encoded image string
        api_key: Gemini API key
    
    Returns:
        dict: Disease analysis results
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    # Extract base64 data if it includes data URL prefix
    if ',' in image_base64:
        image_base64 = image_base64.split(',')[1]
    
    headers = {
        "Content-Type": "application/json"
    }
    
    payload = {
        "contents": [{
            "parts": [
                {
                    "text": """Analyze this crop/plant image and provide a detailed disease diagnosis. 
                    Return a JSON object with the following structure:
                    {
                        "disease": "disease name or 'Healthy'",
                        "severity": "Low/Moderate/High",
                        "confidence": 85,
                        "description": "detailed description of the disease or health status",
                        "treatment": ["treatment method 1", "treatment method 2"],
                        "prevention": ["prevention tip 1", "prevention tip 2"]
                    }
                    Return ONLY valid JSON, no additional text."""
                },
                {
                    "inline_data": {
                        "mime_type": "image/jpeg",
                        "data": image_base64
                    }
                }
            ]
        }]
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        content = result['candidates'][0]['content']['parts'][0]['text']
        
        # Parse JSON from response
        content = content.strip()
        if '```json' in content:
            content = content.split('```json')[1].split('```')[0].strip()
        elif '```' in content:
            content = content.split('```')[1].split('```')[0].strip()
        
        # Extract JSON object
        start_idx = content.find('{')
        end_idx = content.rfind('}')
        if start_idx >= 0 and end_idx >= 0:
            content = content[start_idx:end_idx+1]
        
        analysis = json.loads(content)
        return {
            'success': True,
            'analysis': analysis
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def call_anthropic_vision(image_base64, api_key):
    """
    Call Anthropic Claude Vision API for disease detection
    
    Args:
        image_base64: Base64 encoded image string
        api_key: Anthropic API key
    
    Returns:
        dict: Disease analysis results
    """
    url = "https://api.anthropic.com/v1/messages"
    
    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01"
    }
    
    # Extract base64 data if it includes data URL prefix
    if ',' in image_base64:
        image_base64 = image_base64.split(',')[1]
    
    payload = {
        "model": "claude-3-opus-20240229",
        "max_tokens": 1000,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": image_base64
                        }
                    },
                    {
                        "type": "text",
                        "text": """Analyze this crop/plant image and provide a detailed disease diagnosis. 
                        Return a JSON object with the following structure:
                        {
                            "disease": "disease name or 'Healthy'",
                            "severity": "Low/Moderate/High",
                            "confidence": 85,
                            "description": "detailed description of the disease or health status",
                            "treatment": ["treatment method 1", "treatment method 2"],
                            "prevention": ["prevention tip 1", "prevention tip 2"]
                        }
                        Return ONLY valid JSON, no additional text."""
                    }
                ]
            }
        ]
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        content = result['content'][0]['text']
        
        # Parse JSON from response
        content = content.strip()
        if '```json' in content:
            content = content.split('```json')[1].split('```')[0].strip()
        elif '```' in content:
            content = content.split('```')[1].split('```')[0].strip()
        
        # Extract JSON object
        start_idx = content.find('{')
        end_idx = content.rfind('}')
        if start_idx >= 0 and end_idx >= 0:
            content = content[start_idx:end_idx+1]
        
        analysis = json.loads(content)
        return {
            'success': True,
            'analysis': analysis
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

