from flask import Flask, request, jsonify, make_response
from flask_restful import Resource, reqparse
import requests
import cognitojwt
from dotenv import load_dotenv
import sys
from db.character_creation import get_user_id, get_character_details, get_response, get_image,store_chat
import os 
load_dotenv()
API_KEY = os.getenv('OPENAPI_KEY')

REGION = 'us-east-1'
USERPOOL_ID = 'us-east-1_EJkY3NEF3'
APP_CLIENT_ID = None

class ChatWithCharacter(Resource):
    def post(self):
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
            parser.add_argument('character_id', type=int, required=True, help="character_id is required", location='json')
            parser.add_argument('message', type=str, required=True, help="message is required", location='json')
            args = parser.parse_args()
            character_id = args['character_id']
            user_message = args['message']
            message_stored = store_chat(user_message,user_id,character_id,'user')
            print(message_stored)

            if not message_stored:
                return make_response(jsonify({"Error":"Internal Error "}),400)
            

            fetch_data = get_character_details(character_id)

            if not fetch_data:
                return make_response(jsonify({"message":"No Data Available"}), 401)
            
            name, gender, traits, background, age_range, occupation, skills, hobbies, physical_characteristics, relationship_dynamics, personal_goals, strengths_weaknesses = fetch_data
            prompt = (f"You are {name}, a {gender} with the following traits: {traits}. "
                      f"Background story: {background}. Age range: {age_range}. Occupation: {occupation}. "
                      f"Skills: {skills}. Hobbies: {hobbies}. Physical characteristics: {physical_characteristics}. "
                      f"Relationship dynamics: {relationship_dynamics}. Personal goals: {personal_goals}. "
                      f"Strengths and weaknesses: {strengths_weaknesses}. "
                      f"You should respond as this character. The user says: {user_message}")

            chat_result = get_response(prompt,user_id,character_id)
            return chat_result

        except cognitojwt.exceptions.CognitoJWTException as e:
            return make_response(jsonify({'message': str(e)}), 401)
        except Exception as e:
            return make_response(jsonify({'message': str(e)}), 500)

class ProfilePic(Resource):
    def get(self,character_id):
        token = request.headers.get('Authorization', '').split(' ')[1]
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
        response = get_image(character_id)

        if not response:
            return make_response(jsonify({"message":"No image Found"}),201)
        
        return jsonify(response)

            