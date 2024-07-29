import React, { useState, useEffect } from 'react';
import './chatdashboard.css';
import { useNavigate, useLocation } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from '@aws-amplify/auth';

function CharacterChat() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [profilePic, setProfilePic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fetchedCharacterId, setFetchedCharacterId] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { characterName } = location.state || {};

    useEffect(() => {
        const fetchProfilePic = async (characterId) => {
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
                    const jsonString = data[0].replace(/'/g, '"'); // Replace single quotes with double quotes
                    const parsedUrl = JSON.parse(jsonString)[0];
                    setProfilePic(parsedUrl);
                } else {
                    throw new Error('Failed to fetch profile picture');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error fetching profile picture');
            }
        };

        const fetchChatHistory = async () => {
            try {
                const idToken = await AsyncStorage.getItem('idToken');
                const response = await fetch(`http://127.0.0.1:5000/stored_chat?character_name=${characterName}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.chat_logs.length > 0) {
                        setFetchedCharacterId(data.chat_logs[0].character_id);
                        setChatHistory(data.chat_logs);
                        fetchProfilePic(data.chat_logs[0].character_id);
                    }
                } else {
                    throw new Error('Failed to fetch chat history');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error fetching chat history');
            }
        };

        if (characterName) {
            fetchChatHistory();
        }
    }, [characterName]);

    const handleInputChange = (e) => {
        setMessage(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) {
            alert('Please enter a message');
            return;
        }
        setChatHistory(prevHistory => [...prevHistory, { sender: 'user', message }]);
        setMessage(''); // Clear the input field
        setIsLoading(true);
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const response = await fetch('http://127.0.0.1:5000/chat_with_character', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ character_id: fetchedCharacterId, message })
            });

            if (response.ok) {
                const data = await response.json();
                setChatHistory(prevHistory => [
                    ...prevHistory,
                    { sender: 'character', message: data.response }
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

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
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
                    <li onClick={() => navigate('/characterpage')}>Home</li>
                    <li onClick={() => navigate('/profile')}>Profile</li>
                    <li onClick={handleSignOut}>Sign Out</li>
                </ul>
            </nav>

            <div className="character-creation-form">
                <div className="chat-container">
                    <div className="chat-history">
                        {chatHistory.map((chat, index) => (
                            <div key={index} className={`chat-message ${chat.sender}`}>
                                {chat.sender === 'character' ? (
                                    profilePic ? (
                                        <>
                                            <img src={profilePic} alt="Character" className="profile-pic" />
                                            <p>{chat.message}</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="profile-initials">R</div>
                                            <p>{chat.message}</p>
                                        </>
                                    )
                                ) : (
                                    <>
                                        <p>{chat.message}</p>
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
                                    <circle className="path" cx="12" cy="12" r="10" stroke="#007bff" strokeWidth="4" strokeLinecap="round" />
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

export default CharacterChat;
