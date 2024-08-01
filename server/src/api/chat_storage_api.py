from flask import Flask, request, jsonify, make_response
from flask_restful import Resource, reqparse
import requests
import cognitojwt
from dotenv import load_dotenv
import sys
from db.character_creation import get_user_id
from db.stored_chat import get_characters, get_chat_logs
load_dotenv()
import os 

API_KEY = os.getenv('OPENAPI_KEY')

REGION = 'us-east-1'
USERPOOL_ID = 'us-east-1_EJkY3NEF3'
APP_CLIENT_ID = None

class StoredCharactersAPI(Resource):
    def get(self):
        token = request.headers.get('Authorization', '').split(' ')[1]
        try:
            jwt_user = cognitojwt.decode(
                token,
                REGION,
                USERPOOL_ID,
                app_client_id=APP_CLIENT_ID,
                testmode=False
            )

            user_id = get_user_id(jwt_user['email'])
            if not user_id:
                return make_response(jsonify({"message": "User not found"}), 404)
            print("inside the API")
            response = get_characters(user_id)

            if not response:
                return make_response(jsonify({"Message":"No Chacters Available"}),201)
            
            return jsonify({"characters": response})
        
        except cognitojwt.exceptions.CognitoJWTException as e:
            return make_response(jsonify({'message': str(e)}), 401)
        except Exception as e:
            return make_response(jsonify({'message': str(e)}), 500)
        

class StoredChatAPI(Resource):
    def get(self):
        token = request.headers.get('Authorization', '').split(' ')[1]
        try:
            jwt_user = cognitojwt.decode(
                token,
                REGION,
                USERPOOL_ID,
                app_client_id=APP_CLIENT_ID,
                testmode=False
            )

            user_id = get_user_id(jwt_user['email'])
            if not user_id:
                return make_response(jsonify({"message": "User not found"}), 404)
            parser = reqparse.RequestParser()
            parser.add_argument('character_name', type=str, required=True, help="character_name is required", location='args')
            args = parser.parse_args()
            character_name = args['character_name']
            response = get_chat_logs(user_id,character_name)

            if not response:
                return make_response(jsonify({"message":"no records found"}),404)
            
            chat_logs = []
            for log in response:
                chat_logs.append({
                    "timestamp": log[0],
                    "sender": log[1],
                    "message": log[2],
                    "character_id":log[3]
                })

            return jsonify({"chat_logs": chat_logs})    
            
        except cognitojwt.exceptions.CognitoJWTException as e:
            return make_response(jsonify({'message': str(e)}), 401)
        except Exception as e:
            return make_response(jsonify({'message': str(e)}), 500)