# Flask and OpenAI API setup
from flask import Flask, request, jsonify, make_response
from flask_restful import Resource, reqparse
from db.character_creation import create_character,get_character_description, image_storage

class CharacterCreationApi(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, location='json')
        parser.add_argument('gender', type=str, required=True, location='json')
        parser.add_argument('personalityTraits', type=str, required=True, location='json')
        parser.add_argument('backgroundStory', type=str, required=True, location='json')
        parser.add_argument('ageRange', type=str, required=True, location='json')
        parser.add_argument('occupation', type=str, required=True, location='json')
        parser.add_argument('skills', type=str, required=True, location='json')
        parser.add_argument('hobbies', type=str, required=True, location='json')
        parser.add_argument('physicalCharacteristics', type=str, required=True, location='json')
        parser.add_argument('relationshipDynamics', type=str, required=True, location='json')
        parser.add_argument('personalGoals', type=str, required=True, location='json')
        parser.add_argument('strengthsWeaknesses', type=str, required=True, location='json')
        args = parser.parse_args()
        
        prompt = f"Create a detailed character description for a {args['gender']} named {args['name']} with the following traits: {args['personalityTraits']}. Background story: {args['backgroundStory']}. This character is a {args['ageRange']} {args['occupation']} with skills in {args['skills']} and hobbies including {args['hobbies']}. They have {args['physicalCharacteristics']} and {args['relationshipDynamics']} relationships. Their personal goals are {args['personalGoals']}, and they have these strengths and weaknesses: {args['strengthsWeaknesses']}."

        user_data = {
            'name': args['name'],
            'gender': args['gender'],
            'personalityTraits': args['personalityTraits'],
            'backgroundStory': args['backgroundStory'],
            'ageRange': args['ageRange'],
            'occupation': args['occupation'],
            'skills': args['skills'],
            'hobbies': args['hobbies'],
            'physicalCharacteristics': args['physicalCharacteristics'],
            'relationshipDynamics': args['relationshipDynamics'],
            'personalGoals': args['personalGoals'],
            'strengthsWeaknesses': args['strengthsWeaknesses'],  
        }

        result = create_character(**user_data)

        if not result:
            return make_response(jsonify({"Error":"error storing the data"}),401)
        
        image = get_character_description(prompt)
        if not image:
            return make_response(jsonify({"Error": "Failed to generate Image"}), 500)
        
        store_image = image_storage(result,image)

        if not store_image:
            return make_response(jsonify({"Error":"Failed to store the images"}),404)
        
        return make_response(jsonify({"message":"image stored successfully"}),200)
    


        
        
        

        

        
        
    
        
        
        
