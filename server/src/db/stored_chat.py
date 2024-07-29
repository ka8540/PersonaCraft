from utilities.swen_344_db_utils import exec_commit, exec_get_one, exec_get_all

def get_characters(user_id):
    query = '''
    SELECT 
        name AS character_name,
        profile_pic AS profile_pic
    FROM 
        CharacterTable
    WHERE 
        user_id = %s;
    '''
    result = exec_get_all(query, (user_id,))
    characters = []
    for row in result:
        character_name, profile_pic = row
        characters.append({
            "character_name": character_name,
            "profile_pic": eval(profile_pic) if isinstance(profile_pic, str) else profile_pic  # Safely parse the profile_pic if it's a string representation of a list
        })
    
    return characters

def get_chat_logs(user_id, character_name):
    query = '''
    SELECT 
        c.timestamp, c.sender, c.message, c.character_id
    FROM 
        ConversationTable c
    JOIN 
        CharacterTable ct ON c.character_id = ct.character_id
    JOIN 
        UserTable u ON c.user_id = u.user_id
    WHERE 
        u.user_id = %s AND ct.name = %s
    ORDER BY 
        c.timestamp ASC;
    '''
    result = exec_get_all(query, (user_id, character_name))
    return result