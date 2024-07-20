from flask import Flask
from flask_restful import Api
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

try:
    from utilities.swen_344_db_utils import exec_sql_file
    from api.Signup_api import SignUpApi
    from api.character_creation_api import CharacterCreationApi

except ImportError:
    from utilities.swen_344_db_utils import exec_sql_file
    from api.Signup_api import SignUpApi
    from api.character_creation_api import CharacterCreationApi

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'
app.config['S3_BUCKET_NAME'] = 'profile-picture-docs'
jwt = JWTManager(app)
api = Api(app)
load_dotenv()


api.add_resource(SignUpApi, '/signup', resource_class_kwargs={'bcrypt': bcrypt})
api.add_resource(CharacterCreationApi, '/create_character')

def setup_database():
    print("Loading db")
    exec_sql_file('data/data.sql')
    
if __name__ == '__main__':
    print("Starting flask")
    setup_database()
    app.run(debug=True)
