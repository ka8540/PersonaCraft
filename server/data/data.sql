DROP TABLE IF EXISTS UserTable CASCADE;
DROP TABLE IF EXISTS CharacterTable CASCADE;
DROP TABLE IF EXISTS CharacterImages CASCADE;

CREATE TABLE UserTable (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    session_key VARCHAR(255) UNIQUE DEFAULT NULL,
    phone_number VARCHAR(20)
);

CREATE TABLE CharacterTable (
    character_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES UserTable(user_id),
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(50),
    personality_traits TEXT,
    background_story TEXT,
    age_range VARCHAR(50),
    occupation VARCHAR(255),
    skills TEXT,
    hobbies TEXT,
    physical_characteristics TEXT,
    relationship_dynamics TEXT,
    personal_goals TEXT,
    strengths_weaknesses TEXT
);

CREATE TABLE CharacterImages (
    image_id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES CharacterTable(character_id),
    image_url TEXT,
    description TEXT
);