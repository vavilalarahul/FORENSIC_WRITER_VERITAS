import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        try {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (storedUser) setUser(storedUser);
        } catch (error) {
            console.error("AUTH: Failed to parse user", error);
        }
    }, []);

    const login = (userData, token) => {
        console.log("AUTH: Logging in user:", userData);
        
        // Store under new keys as requested
        localStorage.setItem("user", JSON.stringify(userData));
        if (token) localStorage.setItem("token", token);
        
        // Maintain backward compatibility for existing features
        localStorage.setItem("forensic-user", JSON.stringify(userData));
        if (token) localStorage.setItem("forensic-token", token);
        
        setUser(userData);
    };

    const logout = () => {
        console.log("AUTH: Logging out");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("forensic-user");
        localStorage.removeItem("forensic-token");
        setUser(null);
    };

    // Debugging
    useEffect(() => {
        console.log("AUTH USER:", user);
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
