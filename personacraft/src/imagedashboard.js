import React, { useEffect, useState } from 'react';
import './imagedashboard.css';
import { useNavigate, useLocation } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from '@aws-amplify/auth';

function ImageDashboard() {
    const [selectedDiv, setSelectedDiv] = useState(null);
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [characters, setCharacters] = useState([]);
    const { characterId } = location.state || {};

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const idToken = await AsyncStorage.getItem('idToken');
                const response = await fetch(`http://127.0.0.1:5000/character_image/${characterId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setImages(data);
                } else {
                    throw new Error('Failed to fetch images');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error fetching images');
            }
        };

        fetchImages();
    }, [characterId]);

    const handleImageSelect = (image) => {
        setSelectedImage(image);
    };

    const handleSubmit = async () => {
        if (!selectedImage) {
            alert('Please select an image');
            return;
        }
        setIsLoading(true);
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const response = await fetch(`http://127.0.0.1:5000/character_image/${characterId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ profile_pic: selectedImage })
            });

            if (response.ok) {
                alert('Profile picture updated successfully');
                navigate('/chatdashboard', { state: { characterId } } ); 
            } else {
                throw new Error('Failed to update profile picture');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating profile picture');
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
            <div className='characters-sidebar'>
            <h1 className='pages-name'>PersonaCraft</h1>
            <div
            className={`characters-home ${selectedDiv === 'home' ? 'selected' : ''}`}
            onClick={() => handleDivClick('home', '/characterpage')}
            >
            <span className="material-symbols-outlined">
                home
            </span>
            Home
            </div>

            <div
            className={`characters-profile ${selectedDiv === 'profile' ? 'selected' : ''}`}
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
            className={`characters-signout ${selectedDiv === 'signout' ? 'selected' : ''}`}
            onClick={handleSignOut}
            >
            <span className="material-symbols-outlined">
                logout
            </span>
            Signout
            </div>
        </div>

            <div className="character-creation-form">
                {isLoading ? (
                    <div className="loading-indicator">
                        <p>Loading...</p>
                    </div>
                ) : (
                    <>
                        {images.length > 0 ? (
                            <div className="image-grid">
                                {images.map((image, index) => (
                                    <div 
                                        key={index} 
                                        className={`image-item ${selectedImage === image ? 'selected' : ''}`} 
                                        onClick={() => handleImageSelect(image)}
                                    >
                                        <img src={image} alt={`Character ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No images available</p>
                        )}
                        <button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? 'Submitting...' : 'Submit Selected Image'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default ImageDashboard;
