// Dynamic API Base URL logic
import { Capacitor } from '@capacitor/core';

// ==========================================
// SERVER CONFIGURATION
// ==========================================
// 1. DEVELOPMENT (Local):
//    - Your PC's Local IP Address (e.g., 192.168.1.35)
//    - Find it by running `ipconfig` (Windows) or `ifconfig` (Mac/Linux) in terminal
const LOCAL_IP = '192.168.1.35'; 
const PORT = '3000';

// 2. PRODUCTION (Online):
//    - The URL where your server is hosted (e.g., Render, Heroku, Railway)
//    - Example: 'https://knight-chase-server.onrender.com'
//    - LEAVE EMPTY '' if you are testing locally!
const PRODUCTION_URL = 'https://knightchase.onrender.com'; 

// ==========================================

const getBaseUrl = () => {
    // If a production URL is set, ALWAYS use it (unless we want special dev logic)
    if (PRODUCTION_URL && PRODUCTION_URL.length > 0) {
        return PRODUCTION_URL;
    }

    if (!Capacitor.isNativePlatform()) {
        return `http://localhost:${PORT}`;
    }
    
    // For Android Emulator
    // return `http://10.0.2.2:${PORT}`;

    // For Physical Device (same Wi-Fi)
    return `http://${LOCAL_IP}:${PORT}`; 
};

export const API_URL = getBaseUrl();
export const SOCKET_URL = getBaseUrl();

import { safeStorage } from './storage';

// Helper to get or create a unique device ID
const getDeviceId = () => {
    const STORAGE_KEY = 'knight_chase_device_id';
    let deviceId = safeStorage.getItem(STORAGE_KEY);
    
    if (!deviceId) {
        // Generate a random ID: timestamp + random string
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        safeStorage.setItem(STORAGE_KEY, deviceId);
    }
    
    return deviceId;
};

// --- API Functions ---

export const registerUser = async (username: string) => {
    try {
        const deviceId = getDeviceId();
        const response = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, deviceId })
        });
        return await response.json();
    } catch (error) {

        console.error('Registration error:', error);
        return { success: false, error: 'Network error' };
    }
};

export const fetchLeaderboard = async () => {
    try {
        const response = await fetch(`${API_URL}/api/leaderboard`);
        return await response.json();
    } catch (error) {
        console.error('Leaderboard error:', error);
        return [];
    }
};

export const submitScore = async (username: string, score: number, isWin: boolean) => {
    try {
        await fetch(`${API_URL}/api/score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, score, isWin })
        });
    } catch (error) {
        console.error('Score submission error:', error);
    }
};
