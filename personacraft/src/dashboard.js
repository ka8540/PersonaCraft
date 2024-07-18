import React, { useState } from 'react';
import './dashboard.css';

function Dashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="container">
            <header className="header">
                <button className="menu-button" onClick={toggleSidebar}>
                    ☰
                </button>
                <h1 className="title">PersonaCraft</h1>
            </header>
            <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <ul>
                    <li>Home</li>
                    <li>Profile</li>
                    <li>Sign Out</li>
                </ul>
            </nav>

            <form className="character-creation-form">
                <label>
                    Would you prefer the character to be male, female, or have an option for non-binary or other genders?
                    <select name="gender">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </label>
                <label>
                    What kind of personality traits would you like your character to have? (e.g., humorous, serious, kind, adventurous)
                    <input type="text" name="personalityTraits" placeholder="e.g., humorous, serious" />
                </label>
                <label>
                    Can you provide an example of a name you would like for your character?
                    <input type="text" name="name" placeholder="Character's name" />
                </label>
                <label>
                    What is the background story of your character? Please provide details such as their origin, significant life events, and any key relationships.
                    <textarea name="backgroundStory" placeholder="Character's backstory"></textarea>
                </label>
                <label>
                    What age range should your character fall into? (e.g., child, teenager, adult, elderly)
                    <input type="text" name="ageRange" placeholder="e.g., child, teenager, adult" />
                </label>
                <label>
                    What kind of occupation or role would you like your character to have? (e.g., detective, teacher, superhero)
                    <input type="text" name="occupation" placeholder="Character's occupation" />
                </label>
                <label>
                    Does your character have any specific skills or abilities? If so, please describe them.
                    <input type="text" name="skills" placeholder="Character's skills" />
                </label>
                <label>
                    What hobbies or interests does your character have? (e.g., playing the guitar, painting, hiking)
                    <input type="text" name="hobbies" placeholder="Character's hobbies" />
                </label>
                <label>
                    Are there any physical characteristics or distinctive features you want your character to have? (e.g., height, hair color, eye color, scars, tattoos)
                    <input type="text" name="physicalCharacteristics" placeholder="e.g., height, hair color" />
                </label>
                <label>
                    What kind of relationship dynamics would you like your character to have with other characters? (e.g., friendly, competitive, mentor-student)
                    <input type="text" name="relationshipDynamics" placeholder="e.g., friendly, competitive" />
                </label>
                <label>
                    Does your character have any personal goals or aspirations? If so, what are they?
                    <input type="text" name="personalGoals" placeholder="Character's goals" />
                </label>
                <label>
                    Would you like your character to have any particular strengths or weaknesses? Please provide details.
                    <input type="text" name="strengthsWeaknesses" placeholder="Character's strengths/weaknesses" />
                </label>
                <button type="submit">Create Character</button>
            </form>
        </div>
    );
}

export default Dashboard;
