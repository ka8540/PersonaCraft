import React, { useState }  from 'react';
import './characterpage.css';
import { useNavigate } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from '@aws-amplify/auth';

function CharacterPage () {  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);  
  const navigate = useNavigate();
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
    <div className='character-container'>
      <header className="character-header">
                <button className="character-menu-button" onClick={toggleSidebar}>
                    ☰
                </button>
                <h1 className="character-title">PersonaCraft</h1>
      </header>
      <nav className={`character-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <ul>
                    <li onClick={() => navigate('/dashboard')}>Home</li>
                    <li onClick={() => navigate('/profile')}>Profile</li>
                    <li onClick={handleSignOut}>Sign Out</li>
                </ul>

      </nav>

      <div className="div-sidebard">
        <p>Hello</p>
      </div>

    </div>
  );
};

export default CharacterPage;
