import React, { useState, useEffect } from 'react';
import './chatdashboard.css';
import { useNavigate, useLocation } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from '@aws-amplify/auth';

function ChatDashboard() {
    const [selectedDiv, setSelectedDiv] = useState(null);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [profilePic, setProfilePic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [characters, setCharacters] = useState([]);
    const { characterId } = location.state || {};

    useEffect(() => {
        const fetchProfilePic = async () => {
            try {
                const idToken = await AsyncStorage.getItem('idToken');
                const response = await fetch(`http://127.0.0.1:5000/profile_pic/${characterId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    const jsonString = data[0].replace(/'/g, '"'); // Replace single quotes with double quotes
                    const parsedUrl = JSON.parse(jsonString)[0];
                    console.log("Parsed URL:", parsedUrl);
                    setProfilePic(parsedUrl);
                } else {
                    throw new Error('Failed to fetch profile picture');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error fetching profile picture');
            }
        };

        fetchProfilePic();
    }, [characterId]);

    const handleInputChange = (e) => {
        setMessage(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) {
            alert('Please enter a message');
            return;
        }
        setChatHistory(prevHistory => [...prevHistory, { sender: 'user', text: message }]);
        setMessage('');
        setIsLoading(true);
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const response = await fetch('http://127.0.0.1:5000/chat_with_character', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ character_id: characterId, message })
            });

            if (response.ok) {
                const data = await response.json();
                setChatHistory(prevHistory => [
                    ...prevHistory,
                    { sender: 'character', text: data.response }
                ]);
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error sending message');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login'); 
        } catch (error) {
            console.error('Error signing out:', error);
            alert('Error signing out');
        }
    };

    const handleDivClick = (characterName, navigateTo, characterId) => {
        setSelectedDiv(characterName); 
        navigate(navigateTo, { state: { characterId, characterName } });
    };

    const toggleDropdown = (menu) => {
        if (selectedDiv === menu) {
            setSelectedDiv(''); 
        } else {
            setSelectedDiv(menu); 
        }
    } 

    const fetchCharacters = async () => {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            console.log("Token in Page:", idToken);
            const response = await fetch('http://127.0.0.1:5000/getchacters', { 
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (response.ok) {
                setCharacters(data.characters || []);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching characters:', error);
        }
    };

    useEffect(() => {
        if (selectedDiv === 'chat-history') {
            fetchCharacters();
        }
    }, [selectedDiv]);




    return (
        <div className="container">
            
            <div className='c-sidebar'>
                <h1 className='p-name'>PersonaCraft</h1>
                <div
                className={`c-home ${selectedDiv === 'home' ? 'selected' : ''}`}
                onClick={() => handleDivClick('home', '/characterpage')}
                >
                <span className="material-symbols-outlined">
                    home
                </span>
                Home
                </div>

                <div
                className={`c-profile ${selectedDiv === 'profile' ? 'selected' : ''}`}
                onClick={() => handleDivClick('profile', '/profile')}
                >
                <span className="material-symbols-outlined">
                    account_circle
                </span>
                Profile
                </div>
                
        <div className='dropdown'>
             <div
            className={`dropdown-header ${selectedDiv === 'chat-history' ? 'selected' : ''}`}
            onClick={() => toggleDropdown('chat-history')}
        >
            <span className="material-symbols-outlined">
                forum
            </span>
            History
                </div>
                {selectedDiv === 'chat-history' && (
                    <div className='dropdown-content'>
                        {characters.map((char, index) => (
                            <div key={index} onClick={() => handleDivClick(char.character_name, '/characterchat', char.character_id)}>{char.character_name}</div>
                        ))}
                        <div onClick={() => handleDivClick('+ New', '/dashboard')}>
                        <span class="material-symbols-outlined">
                            add
                            </span>
                            New</div>
                    </div>
                )}
            </div>
                <div
                className={`c-signout ${selectedDiv === 'signout' ? 'selected' : ''}`}
                onClick={handleSignOut}
                >
                <span className="material-symbols-outlined">
                    logout
                </span>
                Signout
                </div>
            </div>
            <div className="character-creation-form">
                <div className="chat-container">
                    <div className="chat-history">
                        {chatHistory.map((chat, index) => (
                            <div key={index} className={`chat-message ${chat.sender}`}>
                                {chat.sender === 'character' ? (
                                    profilePic ? (
                                        <>
                                            <img src={profilePic} alt="Character" className="profile-pic" />
                                            <p>{chat.text}</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="profile-initials">R</div>
                                            <p>{chat.text}</p>
                                        </>
                                    )
                                ) : (
                                    <>
                                        <p>{chat.text}</p>
                                        <div className="profile-initials">M</div>
                                    </>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chat-message character">
                                <div className="profile-initials">R</div>
                                <p>...</p>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="chat-input-form">
                        <input
                            type="text"
                            value={message}
                            onChange={handleInputChange}
                            placeholder="Type your message..."
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <svg className="spinner" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <circle className="path" cx="12" cy="12" r="10" stroke="#007bff" stroke-width="4" stroke-linecap="round" />
                                </svg>
                            ) : (
                                <i className="fas fa-paper-plane"></i>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ChatDashboard;
