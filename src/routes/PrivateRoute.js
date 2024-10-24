import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext'; // Adjust this path if needed

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth(); // Assuming your authContext provides currentUser
  return currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
