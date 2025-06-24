# utils.py
import json
import re

def extract_json(text):
    """Extracts JSON from a string."""
    # Try to find JSON in code blocks
    code_block_pattern = r'```(?:json)?\s*([\s\S]*?)\s*```'
    code_matches = re.findall(code_block_pattern, text)
    
    if code_matches:
        for match in code_matches:
            try:
                return json.loads(match)
            except json.JSONDecodeError:
                continue
    
    # Try to find JSON with curly braces
    json_pattern = r'({[\s\S]*})'
    json_matches = re.findall(json_pattern, text)
    
    if json_matches:
        for match in json_matches:
            try:
                return json.loads(match)
            except json.JSONDecodeError:
                continue
    
    # Try to extract the entire text as JSON
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    
    # Try to clean up the text and parse again
    cleaned_text = text.strip()
    if cleaned_text.startswith('{') and cleaned_text.endswith('}'):
        try:
            return json.loads(cleaned_text)
        except json.JSONDecodeError:
            pass
    
    print("Failed to extract JSON from text")
    return None