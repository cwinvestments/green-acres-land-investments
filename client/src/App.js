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
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import PropertyManagement from './pages/PropertyManagement';
import CustomerManagement from './pages/CustomerManagement';
import AdminLoans from './pages/AdminLoans';
import DefaultedLoansReport from './pages/DefaultedLoansReport';

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
            {/* Customer Routes */}
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
            />import AdminLoans from './pages/AdminLoans';
              import DefaultedLoansReport from './pages/DefaultedLoansReport';  
            <Route 
              path="/loans/:id/payments" 
              element={
                <ProtectedRoute>
                  <PaymentHistory />
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/properties" element={<PropertyManagement />} />
            <Route path="/admin/customers" element={<CustomerManagement />} />
            <Route path="/admin/loans" element={<AdminLoans />} />
            <Route path="/admin/loans/defaulted" element={<DefaultedLoansReport />} /> 
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;