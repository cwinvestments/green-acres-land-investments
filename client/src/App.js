import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LoanDetail from './pages/LoanDetail';
import PaymentHistory from './pages/PaymentHistory';
import SoldProperties from './pages/SoldProperties';

// Protected route component
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/sold-properties" element={<SoldProperties />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/loans/:id" 
              element={
                <ProtectedRoute>
                  <LoanDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/loans/:id/payments" 
              element={
                <ProtectedRoute>
                  <PaymentHistory />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
