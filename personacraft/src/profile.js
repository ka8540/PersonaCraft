import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from '@aws-amplify/auth';

const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
                    const profile = data[0]; // Assuming the response format is [('Kush Ahir', 'ka8540@g.rit.edu', '+15859575220')]
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

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    return (
        <div className="profile-container">
            <header className="header">
                <button className="menu-button" onClick={toggleSidebar}>
                    ☰
                </button>
                <h1 className="title">PersonaCraft</h1>
            </header>
            <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <ul>
                    <li onClick={() => navigate('/dashboard')}>Home</li>
                    <li onClick={() => navigate('/profile')}>Profile</li>
                    <li onClick={handleSignOut}>Sign Out</li>
                </ul>
            </nav>
            {profileData && (
                <div className="profile-card">
                    <h1 className="profile-title">Profile</h1>
                    <p><strong>Name:</strong> {profileData.name}</p>
                    <p><strong>Email:</strong> {profileData.email}</p>
                    <p><strong>Phone Number:</strong> {profileData.phone_number}</p>
                </div>
            )}
        </div>
    );
};

export default Profile;
