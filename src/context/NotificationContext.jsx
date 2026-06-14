import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationApi';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [wsConnected, setWsConnected] = useState(false);
    const [socketInstance, setSocketInstance] = useState(null);

    useEffect(() => {
        // Connect to the backend Socket.io server
        const socket = io('http://localhost:5000');
        
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

    useEffect(() => {
        // Fetch unread history from database
        const fetchHistory = async () => {
            try {
                if (user) {
                    const res = await getNotifications();
                    if (res.data) {
                        // Only show unread notifications in the top bar
                        const unread = res.data.filter(n => !n.isRead).map(n => ({
                            id: n._id,
                            type: n.type ? n.type.toLowerCase() : 'info',
                            msg: n.message || n.title || 'System Alert',
                            time: 'Just now',
                            ...n
                        }));
                        setNotifications(unread);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch notification history:", error);
            }
        };

        fetchHistory();
    }, [user]);

    // Helper to mark a specific notification as read (remove it from TopBar)
    const removeNotification = async (id) => {
        try {
            await markAsRead(id);
            setNotifications((prev) => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
            // Optmistic UI update fallback
            setNotifications((prev) => prev.filter(n => n.id !== id));
        }
    };

    // Helper to clear all notifications from TopBar
    const clearAll = async () => {
        try {
            await markAllAsRead();
            setNotifications([]);
        } catch (error) {
            console.error("Failed to clear notifications", error);
            // Optmistic UI update fallback
            setNotifications([]);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, wsConnected, removeNotification, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
};
