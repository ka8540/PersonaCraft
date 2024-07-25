import React, { useState, useEffect } from 'react';
import './chatdashboard.css';
import { useNavigate, useLocation } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from '@aws-amplify/auth';

function ChatDashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [profilePic, setProfilePic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
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
                    <li onClick={() => navigate('/dashboard')}>Home</li>
                    <li>Profile</li>
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
                            {isLoading ? 'Sending...' : 'Send'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ChatDashboard;