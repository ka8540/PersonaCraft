from utilities.swen_344_db_utils import exec_commit,exec_get_one

def store_chat(message,user_id,character_id,sender):
    query = '''INSERT INTO ConversationTable (user_id,character_id,message,sender,timestamp) VALUE(%s,%s,%s,%s,NOW());'''
    result = exec_commit(query,(user_id,character_id,message,sender))
    check_query = '''SELECT conversation_id FROM ConversationTable WHERE character_id = %s;'''
    check_result = exec_get_one(check_query,(character_id,))
    return check_result


    
