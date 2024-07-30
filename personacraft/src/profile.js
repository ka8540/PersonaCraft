import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from '@aws-amplify/auth';

const Profile = () => {
    const [selectedDiv, setSelectedDiv] = useState('profile');
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [characters, setCharacters] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const idToken = await AsyncStorage.getItem('idToken');
                const response = await fetch('http://127.0.0.1:5000/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const profile = data[0];
                    setProfileData({
                        name: profile[0],
                        email: profile[1],
                        phone_number: profile[2]
                    });
                } else {
                    throw new Error('Failed to fetch profile');
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

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
        <div className="profile-container">
            <div className='profile-sidebar'>
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
                {profileData && (
                <div className="profile-card">
                    <h1 className="profile-title">Profile</h1>
                    <p><strong>Name:</strong> {profileData.name}</p>
                    <p><strong>Email:</strong> {profileData.email}</p>
                    <p><strong>Phone Number:</strong> {profileData.phone_number}</p>
                </div>
            )}
            </div>
        </div>
    );
};

export default Profile;
