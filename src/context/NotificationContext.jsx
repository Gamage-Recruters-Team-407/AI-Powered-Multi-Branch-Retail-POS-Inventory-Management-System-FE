import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [wsConnected, setWsConnected] = useState(false);
    const [socketInstance, setSocketInstance] = useState(null);

    useEffect(() => {
        // Connect to the backend Socket.io server
        const socket = io('http://localhost:5000', {
            transports: ['websocket', 'polling']
        });
        
        setSocketInstance(socket);

        socket.on('connect', () => {
            console.log('✅ Connected to Notification WebSocket Server');
            setWsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('❌ Disconnected from Notification WebSocket Server');
            setWsConnected(false);
        });

        // Listen for incoming notifications from the backend
        socket.on('new-notification', (newAlert) => {
            console.log('🔔 New Notification Received:', newAlert);
            
            // Format the notification to match our frontend UI structure
            const formattedAlert = {
                id: newAlert._id || Date.now(),
                type: newAlert.type ? newAlert.type.toLowerCase() : 'info',
                msg: newAlert.message || newAlert.title || 'New System Alert',
                time: 'Just now',
                ...newAlert
            };

            setNotifications((prev) => [formattedAlert, ...prev]);
        });

        // Listen for specific lowStockAlerts coming from Inventory
        socket.on('lowStockAlert', (alert) => {
            console.log('⚠️ Low Stock Alert Received:', alert);
            
            const formattedAlert = {
                id: Date.now() + Math.random().toString(36).substring(7),
                type: 'warning',
                msg: `Low Stock: Product #${alert.productId} in Branch #${alert.branchId}`,
                time: 'Just now'
            };

            setNotifications((prev) => [formattedAlert, ...prev]);
        });

        return () => {
            socket.disconnect();
        };
    }, []); // Run ONLY once on mount

    // Separate effect to handle joining rooms when the user logs in/out
    useEffect(() => {
        const userId = user?.id || user?._id;
        if (wsConnected && userId && socketInstance) {
            socketInstance.emit('joinNotifications', userId);
        }
    }, [user, wsConnected, socketInstance]);

    // Helper to mark a specific notification as read (remove it)
    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter(n => n.id !== id));
    };

    // Helper to clear all notifications
    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{ notifications, wsConnected, removeNotification, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
};
