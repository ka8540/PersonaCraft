from flask import Flask, request, jsonify, make_response
from flask_restful import Resource, reqparse
import requests
import cognitojwt
from dotenv import load_dotenv
import sys
from db.character_creation import get_user_id, get_profile

REGION = 'us-east-1' 
USERPOOL_ID = 'us-east-1_EJkY3NEF3' 
APP_CLIENT_ID = None 

class ProfileAPI(Resource):
    def get(self):
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
        
        response = get_profile(user_id)

        if not response:
            return make_response(jsonify({"Error":"No Data Available"}),404)
        print(response)
        return jsonify(response)
    