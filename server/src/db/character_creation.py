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
def create_character(user_id, **kwargs):
    insert_query = '''
        INSERT INTO CharacterTable (name, gender, personality_traits, background_story, age_range,
                                    occupation, skills, hobbies, physical_characteristics, relationship_dynamics,
                                    personal_goals, strengths_weaknesses, user_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
    '''
    exec_commit(insert_query, (
        kwargs['name'], kwargs['gender'], kwargs['personalityTraits'], kwargs['backgroundStory'],
        kwargs['ageRange'], kwargs['occupation'], kwargs['skills'], kwargs['hobbies'],
        kwargs['physicalCharacteristics'], kwargs['relationshipDynamics'], kwargs['personalGoals'],
        kwargs['strengthsWeaknesses'], user_id
    ))
    
    character_exists_check = 'SELECT character_id FROM CharacterTable WHERE name = %s'
    result = exec_get_one(character_exists_check, (kwargs['name'],))
    
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
        return_result = {"image_id":result,"character_id":character_id}
        return return_result
    except Exception as e:
        print(f"Failed to store image URLs: {e}")


def get_images(character_id):
    pass

def get_user_id(email):
    user_id_query = '''SELECT user_id FROM UserTable WHERE email = %s;'''
    user_id_result = exec_get_one(user_id_query, (email,))
    return user_id_result[0] if user_id_result else None

def get_image_by_id(character_id):
    query = '''SELECT image_url FROM CharacterImages WHERE character_id = %s;'''
    get_image = exec_get_all(query,(character_id,))
    result = get_image
    print(result)
    return result

def get_character_details(character_id):
    query = '''
    SELECT name, gender, personality_traits, background_story, age_range, occupation, skills, hobbies,
           physical_characteristics, relationship_dynamics, personal_goals, strengths_weaknesses 
    FROM CharacterTable 
    WHERE character_id = %s;
    '''
    result = exec_get_one(query, (character_id,))
    print(result)
    return result

def get_response(prompt):
    print("Inside response")
    response = requests.post(
        'https://api.openai.com/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json'
        },
        json={
            'model': 'gpt-4o',
            'messages': [{'role': 'user', 'content': prompt}],
            'max_tokens': 150
        }
    )

    if response.status_code == 200:
        generated_response = response.json().get('choices')[0].get('message', {}).get('content', 'No response generated')
        return jsonify({"response": generated_response})
    else:
        error_info = response.json()
        print("Error from OpenAI:", error_info)
        return make_response(jsonify({'error': 'Failed to generate response', 'details': error_info}), response.status_code)


def set_profile_pic(character_id,profile_pic):
    query='''UPDATE CharacterTable SET profile_pic = %s WHERE character_id = %s;'''
    result = exec_commit(query,(profile_pic,character_id))
    check_query = '''SELECT character_id FROM CharacterTable WHERE profile_pic = %s;'''
    final_result = exec_get_one(check_query,(profile_pic,))
    return final_result

def get_image(character_id):
    query = '''SELECT profile_pic FROM CharacterTable WHERE character_id = %s;'''
    result = exec_get_one(query,(character_id,))
    print("Result:",result)
    return result 


def get_profile(email):
    query = '''SELECT name,email,phone_number FROM UserTable WHERE user_id = %s;'''
    result = exec_get_all(query,(email,))
    return result 


