import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Confirm from './components/auth/Confirmation';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import DeviceInfo from './pages/Device_Info';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/auth/PrivateRoute';
import Layout from './components/Layout';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/confirm" element={<Confirm />} />

      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/device-info" element={<DeviceInfo/>} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
