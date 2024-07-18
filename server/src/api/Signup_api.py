from flask import jsonify, make_response
from flask_restful import Resource, reqparse

try:
    from src.db.signup import user_signup
except ImportError:
    from db.signup import user_signup

class SignUpApi(Resource):
    def __init__(self, bcrypt):
        self.bcrypt = bcrypt

    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, location ='json')
        parser.add_argument('email', type=str, required=True, location='json')
        parser.add_argument('password', type=str, required=True, location='json')
        parser.add_argument('phoneNumber', type=str, required=True, location='json')
        args = parser.parse_args()

        print(args['phoneNumber'])
        user_data = {
            'name': args['name'],
            'password': args['password'],
            'email': args['email'],
            'phoneNumber': args['phoneNumber']
        }
        
        response, status_code = user_signup(self.bcrypt, **user_data)
        return make_response(jsonify(response), status_code)