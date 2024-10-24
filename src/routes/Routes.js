import React from 'react';
import { Route, Routes as RouterRoutes } from 'react-router-dom';
import { AuthProvider } from "../contexts/authContext";
import Addroom from '../components/bookings/addroom';
import ModifyRoom from '../components/bookings/ModifyRoom';
import DeleteRoom from '../components/bookings/DeleteRoom';
import BookMeeting from '../components/bookings/BookMeeting';
import Login from "../components/auth/login";
import Register from "../components/auth/register";
import Home from "../components/home";
import RoomList from '../components/bookings/RoomList';
import FreeRoom from '../components/bookings/FreeRoom';
import PrivateRoute from './PrivateRoute'; // Import PrivateRoute
import MeetRecordList from '../components/bookings/MeetRecordList';

const Routes = () => {
  return (
    <AuthProvider>
      <RouterRoutes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/allroom"
          element={
            <PrivateRoute>
              <RoomList />
            </PrivateRoute>
          }
        />
        <Route
          path="/addroom"
          element={
            <PrivateRoute>
              <Addroom />
            </PrivateRoute>
          }
        />
        <Route
          path="/modifyroom"
          element={
            <PrivateRoute>
              <ModifyRoom />
            </PrivateRoute>
          }
        />
        <Route
          path="/deleteroom"
          element={
            <PrivateRoute>
              <DeleteRoom />
            </PrivateRoute>
          }
        />
        <Route
          path="/bookmeeting"
          element={
            <PrivateRoute>
              <BookMeeting />
            </PrivateRoute>
          }
        />
        <Route
          path="/freeroom"
          element={
            <PrivateRoute>
              <FreeRoom />
            </PrivateRoute>
          }
        />

        <Route
          path="/meetrecord"
          element={
            <PrivateRoute>
              <MeetRecordList />
            </PrivateRoute>
          }
        />

      </RouterRoutes>
    </AuthProvider>
  );
};

export default Routes;
