from flask import Flask
from flask_restful import Api
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import jwt  
from dotenv import load_dotenv
import sys
from api.config import DEFAULT_SECRET_KEY

# Load environment variables at the start
load_dotenv()

# Handle command-line argument or use default
SECRET_KEY = DEFAULT_SECRET_KEY

# Import your API resources and utilities
from utilities.swen_344_db_utils import exec_sql_file
from api.Signup_api import SignUpApi
from api.character_creation_api import CharacterCreationApi
from api.character_creation_api import CharacterImage
from api.chat_with_character_api import ChatWithCharacter
from api.chat_with_character_api import ProfilePic
from api.profile_api import ProfileAPI
app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

# Flask app configuration
app.config['SECRET_KEY'] = SECRET_KEY

api = Api(app)

# Add resources to API
api.add_resource(SignUpApi, '/signup', resource_class_kwargs={'bcrypt': bcrypt})
api.add_resource(CharacterCreationApi, '/create_character')
api.add_resource(CharacterImage,'/character_image/<int:character_id>')
api.add_resource(ChatWithCharacter,'/chat_with_character')
api.add_resource(ProfilePic,'/profile_pic/<int:character_id>')
api.add_resource(ProfileAPI,'/profile')


def setup_database():
    print("Setting up the database...")
    exec_sql_file('data/data.sql')

if __name__ == '__main__':
    setup_database()
    app.run(debug=True)
