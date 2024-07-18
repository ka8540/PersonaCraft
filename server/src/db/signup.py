try:
    from src.utilities.swen_344_db_utils import exec_get_all, exec_commit
except ImportError:
    from utilities.swen_344_db_utils import exec_get_all, exec_commit


def user_signup(bcrypt, **kwargs):
    name_kwargs = kwargs.get('name')
    password_kwargs = kwargs.get('password')
    email = kwargs.get('email')
    phone_number_kwargs = kwargs.get('phoneNumber') 
    password = bcrypt.generate_password_hash(password_kwargs).decode('utf-8')

    user_exists_query = 'SELECT email FROM UserTable WHERE email = %s;'
    user_exists = exec_get_all(user_exists_query, (email,))
    if user_exists:
        return {"message": "User already exists"}, 409 

    tuple_to_insert = (name_kwargs,password, email,phone_number_kwargs)
    query_insert = 'INSERT INTO UserTable(name,password, email,phone_number) VALUES (%s, %s, %s, %s);'
    exec_commit(query_insert, tuple_to_insert)
    return {"message": "User registered successfully"}, 200
