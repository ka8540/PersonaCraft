from flask import Flask
from flask_restful import Api
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

try:
    from utilities.swen_344_db_utils import exec_sql_file

except ImportError:
    from utilities.swen_344_db_utils import exec_sql_file

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'
app.config['S3_BUCKET_NAME'] = 'profile-picture-docs'
jwt = JWTManager(app)
api = Api(app)

def setup_database():
    print("Loading db")
    # exec_sql_file('data/data.sql')
if __name__ == '__main__':
    print("Starting flask")
    setup_database()
    app.run(debug=True)
