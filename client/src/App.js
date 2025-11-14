import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import PaymentTracking from './pages/PaymentTracking';
import DefaultedLoansReport from './pages/DefaultedLoansReport';
import AdminReports from './pages/AdminReports';
import TaxSummary from './pages/TaxSummary';
import StateManagement from './pages/StateManagement';
import AccountSettings from './pages/AccountSettings';
import ImportLoan from './pages/ImportLoan';
import CreateCustomLoan from './pages/CreateCustomLoan';
// Protected route component
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="App">
      {!isAdminRoute && <Navbar />}
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
            />
            <Route 
              path="/loans/:id/payments" 
              element={
                <ProtectedRoute>
                  <PaymentHistory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/account-settings" 
              element={
                <ProtectedRoute>
                  <AccountSettings />
                </ProtectedRoute>
              } 
            />
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/properties" element={<PropertyManagement />} />
            <Route path="/admin/properties/:propertyId" element={<PropertyManagement />} />
            <Route path="/admin/customers" element={<CustomerManagement />} />
            <Route path="/admin/loans" element={<AdminLoans />} />
            <Route path="/admin/payments" element={<PaymentTracking />} />
            <Route path="/admin/loans/defaulted" element={<DefaultedLoansReport />} />
            <Route path="/admin/reports" element={<AdminReports />} /> 
            <Route path="/admin/tax-summary" element={<TaxSummary />} />
            <Route path="/admin/states" element={<StateManagement />} />
            <Route path="/admin/loans/import" element={<ImportLoan />} />
            <Route path="/admin/loans/create-custom" element={<CreateCustomLoan />} />
          </Routes>
        </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;