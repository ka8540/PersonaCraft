from flask import Flask, request, jsonify, make_response
from flask_restful import Resource, reqparse
from db.character_creation import get_user_id
from db.profile_pic import update_user_image_url, update_character_image_url, get_profile_pic, update_background_image, get_background_image
import cognitojwt  
import boto3
from botocore.exceptions import NoCredentialsError
import werkzeug
from dotenv import load_dotenv
import sys
import os

load_dotenv()
API_KEY = os.getenv('OPENAPI_KEY')

REGION = 'us-east-1'
USERPOOL_ID = 'us-east-1_EJkY3NEF3'
APP_CLIENT_ID = None

class UploadProfilePicAPI(Resource):
    def __init__(self, **kwargs):
        self.s3 = boto3.client('s3')
        self.s3_bucket = kwargs['s3_bucket']

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
        
        response = get_profile_pic(user_id)

        if not response:
            return make_response(jsonify({"message":"No image Found"}),201)
        
        return jsonify(response)


    def post(self):
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
        
        parser = reqparse.RequestParser()
        parser.add_argument('file', type=werkzeug.datastructures.FileStorage, location='files', required=True, help="File is required")
        args = parser.parse_args()
        file = args['file']

        if file:
            file_name = file.filename
            content_type = file.content_type
            try:
                self.s3.upload_fileobj(
                    file,
                    self.s3_bucket,
                    file_name,
                    ExtraArgs={'ContentType': content_type}
                )
                image_url = f"https://{self.s3_bucket}.s3.amazonaws.com/{file_name}"
                response = update_user_image_url(user_id, image_url)
                return make_response(jsonify({"url": image_url, "db": response}), 200)
            except NoCredentialsError as e:
                return make_response(jsonify({"error": "Credentials not available"}), 403)
            except Exception as e:
                return make_response(jsonify({"error": str(e)}), 500)
        else:
            return make_response(jsonify({"error": "No file part"}), 400)


class UploadCharacterImageAPI(Resource):
    def __init__(self, **kwargs):
        self.s3 = boto3.client('s3')
        self.s3_bucket = kwargs['s3_bucket']

    def post(self,character_id):
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
        
        parser = reqparse.RequestParser()
        parser.add_argument('file', type=werkzeug.datastructures.FileStorage, location='files', required=True, help="File is required")
        args = parser.parse_args()
        file = args['file']

        if file:
            file_name = file.filename
            content_type = file.content_type
            try:
                self.s3.upload_fileobj(
                    file,
                    self.s3_bucket,
                    file_name,
                    ExtraArgs={'ContentType': content_type}
                )
                image_url = f"https://{self.s3_bucket}.s3.amazonaws.com/{file_name}"
                response = update_character_image_url(character_id, image_url)
                return make_response(jsonify({"url": image_url, "db": response}), 200)
            except NoCredentialsError as e:
                return make_response(jsonify({"error": "Credentials not available"}), 403)
            except Exception as e:
                return make_response(jsonify({"error": str(e)}), 500)
        else:
            return make_response(jsonify({"error": "No file part"}), 400)
        

class BackgroundImageAPI(Resource):
    def __init__(self, **kwargs):
        self.s3 = boto3.client('s3')
        self.s3_bucket = kwargs['s3_bucket']
    
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
        
        response = get_background_image(user_id)

        if not response:
            return make_response(jsonify({"message":"No image Found"}),201)
        
        return jsonify(response)

    def post(self):
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
        
        parser = reqparse.RequestParser()
        parser.add_argument('file', type=werkzeug.datastructures.FileStorage, location='files', required=True, help="File is required")
        args = parser.parse_args()
        file = args['file']

        if file:
            file_name = file.filename
            content_type = file.content_type
            try:
                self.s3.upload_fileobj(
                    file,
                    self.s3_bucket,
                    file_name,
                    ExtraArgs={'ContentType': content_type}
                )
                image_url = f"https://{self.s3_bucket}.s3.amazonaws.com/{file_name}"
                response = update_background_image(user_id, image_url)
                return make_response(jsonify({"url": image_url, "db": response}), 200)
            except NoCredentialsError as e:
                return make_response(jsonify({"error": "Credentials not available"}), 403)
            except Exception as e:
                return make_response(jsonify({"error": str(e)}), 500)
        else:
            return make_response(jsonify({"error": "No file part"}), 400)

