try:
    from utilities.swen_344_db_utils import exec_commit, exec_get_all,exec_get_one
except ImportError:
    from utilities.swen_344_db_utils import exec_commit, exec_get_all,exec_get_one
import requests
import sys
from dotenv import load_dotenv
from flask import Flask, request, jsonify, make_response

load_dotenv()
API_KEY = sys.argv[1]
def create_character(**kwargs):
    character_exists_query = 'SELECT name FROM CharacterTable WHERE name = %s;'
    character_exists = exec_get_all(character_exists_query, (kwargs['name'],))
    if character_exists:
        return None

    insert_query = '''
        INSERT INTO CharacterTable (name, gender, personality_traits, background_story, age_range,
                                    occupation, skills, hobbies, physical_characteristics, relationship_dynamics,
                                    personal_goals, strengths_weaknesses)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
    '''
    exec_commit(insert_query, (
        kwargs['name'], kwargs['gender'], kwargs['personalityTraits'], kwargs['backgroundStory'],
        kwargs['ageRange'], kwargs['occupation'], kwargs['skills'], kwargs['hobbies'],
        kwargs['physicalCharacteristics'], kwargs['relationshipDynamics'], kwargs['personalGoals'],
        kwargs['strengthsWeaknesses']
    ))
    
    character_exists_check = 'SELECT character_id FROM CharacterTable WHERE name = %s'

    result = exec_get_one(character_exists_check,(kwargs['name'],))
    
    return result

def get_character_description(prompt):
    response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o',
                'messages': [{'role': 'user', 'content': prompt}], 
                'max_tokens': 50
            }
        )
    if response.status_code == 200:
        generated_text = response.json().get('choices')[0].get('message', {}).get('content', 'No response generated')
        print(generated_text)
        image = generate_image(generated_text)
        return image
    else:
        error_info = response.json()
        print("Error from OpenAI:", error_info)
        return make_response(jsonify({'error': 'Failed to generate character description', 'details': error_info}), response.status_code)


def generate_image(description):
    response = requests.post(
        'https://api.openai.com/v1/images/generations',
        headers={
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json'
        },
        json={
            'model': 'dall-e-2',
            'prompt': description,
            'n': 5,  # Number of images to generate
            'size': '1024x1024'  # Image resolution
        }
    )
    if response.status_code == 200:
        images = [img['url'] for img in response.json().get('data', [])] 
        return images
    else:
        error_info = response.json()
        print("Error from OpenAI:", error_info)
        return make_response(jsonify({'error': 'Failed to generate character description', 'details': error_info}), response.status_code)
    

def image_storage(character_id, image_urls):
    insert_query = '''
        INSERT INTO CharacterImages (character_id, image_url) VALUES (%s, %s);
    '''
    try:
        for url in image_urls:
            exec_commit(insert_query, (character_id, url))
        print("Image URLs stored successfully.")
        image_check = '''SELECT image_id FROM CharacterImages WHERE character_id = %s;'''
        result = exec_get_one(image_check,(character_id,))
        return result
    except Exception as e:
        print(f"Failed to store image URLs: {e}")