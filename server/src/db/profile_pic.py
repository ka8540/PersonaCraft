from utilities.swen_344_db_utils import exec_commit,exec_get_all, exec_get_one

def update_user_image_url(user_id,image_url):
    query = '''UPDATE UserTable SET profile_pic = %s WHERE user_id = %s;'''
    result = exec_commit(query,(image_url,user_id))
    check_query = '''SELECT user_id FROM UserTable WHERE profile_pic = %s;'''
    check_result = exec_get_one(check_query,(image_url,))
    return check_result

def update_character_image_url(character_id, image_url):
    query = '''UPDATE CharacterTable SET profile_pic = %s WHERE character_id = %s;'''
    result = exec_commit(query,(image_url,character_id))
    check_query = '''SELECT user_id FROM CharacterTable WHERE profile_pic = %s;'''
    check_result = exec_get_one(check_query,(image_url,))
    return check_result

def get_profile_pic(user_id):
    query = '''SELECT profile_pic FROM UserTable WHERE user_id = %s;'''
    result = exec_get_one(query,(user_id,))
    print(result)
    return result

def update_background_image(user_id,image_url):
    query = '''UPDATE UserTable SET background_image = %s WHERE user_id = %s;'''
    result = exec_commit(query,(image_url,user_id))
    check_query = '''SELECT user_id FROM UserTable WHERE background_image = %s;'''
    check_result = exec_get_one(check_query,(image_url,))
    return check_result

def get_background_image(user_id):
    query = '''SELECT background_image FROM UserTable WHERE user_id = %s;'''
    result = exec_get_one(query,(user_id,))
    print(result)
    return result