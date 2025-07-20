import { useState, useEffect } from 'react';
import { systemAPI } from '../lib/api';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const password = localStorage.getItem('admin_password');
      if (!password) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Vérifier si le mot de passe est toujours valide
      const isValid = await systemAPI.authenticate(password);
      setIsAuthenticated(isValid);
    } catch (error) {
      console.error('Erreur vérification auth:', error);
      setIsAuthenticated(false);
      localStorage.removeItem('admin_password');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (password) => {
    try {
      setIsLoading(true);
      const isValid = await systemAPI.authenticate(password);
      
      if (isValid) {
        localStorage.setItem('admin_password', password);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: 'Mot de passe incorrect' };
      }
    } catch (error) {
      console.error('Erreur login:', error);
      return { 
        success: false, 
        error: 'Erreur de connexion au serveur' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_password');
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth
  };
};