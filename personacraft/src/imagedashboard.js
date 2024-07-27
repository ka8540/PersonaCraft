import React, { useEffect, useState } from 'react';
import './imagedashboard.css';
import { useNavigate, useLocation } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from '@aws-amplify/auth';

function ImageDashboard() {
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
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
                    <li onClick={() => navigate('/dashboard')} >Home</li>
                    <li onClick={() => navigate('/profile')}>Profile</li>
                    <li onClick={handleSignOut}>Sign Out</li>
                </ul>
            </nav>

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
