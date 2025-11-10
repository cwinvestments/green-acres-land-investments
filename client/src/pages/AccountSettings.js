import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AccountSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [profile, setProfile] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    mailing_address: '',
    mailing_city: '',
    mailing_state: '',
    mailing_zip: ''
  });
  
  const [deedInfo, setDeedInfo] = useState([]);
  const [editingLoan, setEditingLoan] = useState(null);
  const [deedFormData, setDeedFormData] = useState({
    deed_name: '',
    deed_mailing_address: ''
  });

  useEffect(() => {
    loadProfile();
    loadDeedInfo();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(response.data);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const loadDeedInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/deed-info`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeedInfo(response.data);
    } catch (err) {
      console.error('Failed to load deed info:', err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/user/profile`,
        {
          phone: profile.phone,
          mailing_address: profile.mailing_address,
          mailing_city: profile.mailing_city,
          mailing_state: profile.mailing_state,
          mailing_zip: profile.mailing_zip
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ Profile updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeedEdit = (loan) => {
    setEditingLoan(loan.loan_id);
    setDeedFormData({
      deed_name: loan.deed_name || '',
      deed_mailing_address: loan.deed_mailing_address || ''
    });
  };

  const handleDeedSubmit = async (loanId) => {
    setSaving(true);
    setMessage('');
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/user/loans/${loanId}/deed-info`,
        deedFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ Deed information updated successfully!');
      setEditingLoan(null);
      loadDeedInfo();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to update deed info:', err);
      setError('Failed to update deed information');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading your account settings...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>⚙️ Account Settings</h1>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
          ← Back to Dashboard
        </button>
      </div>

      {message && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#d4edda', 
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          color: '#155724',
          marginBottom: '20px'
        }}>
          {message}
        </div>
      )}

      {error && (
        <div className="error-message" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Contact Information */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <h2 style={{ marginTop: 0 }}>📞 Contact Information</h2>
        <form onSubmit={handleProfileSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                backgroundColor: '#f5f5f5',
                cursor: 'not-allowed'
              }}
            />
            <small style={{ color: '#666' }}>Email cannot be changed</small>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>First Name</label>
              <input
                type="text"
                value={profile.first_name}
                disabled
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  backgroundColor: '#f5f5f5',
                  cursor: 'not-allowed'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Last Name</label>
              <input
                type="text"
                value={profile.last_name}
                disabled
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  backgroundColor: '#f5f5f5',
                  cursor: 'not-allowed'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Phone Number</label>
            <input
              type="tel"
              value={profile.phone || ''}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              placeholder="(555) 123-4567"
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid var(--border-color)',
                borderRadius: '5px'
              }}
            />
          </div>

          <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Mailing Address</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Street Address</label>
            <input
              type="text"
              value={profile.mailing_address || ''}
              onChange={(e) => setProfile({...profile, mailing_address: e.target.value})}
              placeholder="123 Main St"
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid var(--border-color)',
                borderRadius: '5px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>City</label>
              <input
                type="text"
                value={profile.mailing_city || ''}
                onChange={(e) => setProfile({...profile, mailing_city: e.target.value})}
                placeholder="Appleton"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid var(--border-color)',
                  borderRadius: '5px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>State</label>
              <select
                value={profile.mailing_state || ''}
                onChange={(e) => setProfile({...profile, mailing_state: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid var(--border-color)',
                  borderRadius: '5px'
                }}
              >
                <option value="">--</option>
                <option value="AL">AL</option>
                <option value="AK">AK</option>
                <option value="AZ">AZ</option>
                <option value="AR">AR</option>
                <option value="CA">CA</option>
                <option value="CO">CO</option>
                <option value="CT">CT</option>
                <option value="DE">DE</option>
                <option value="FL">FL</option>
                <option value="GA">GA</option>
                <option value="HI">HI</option>
                <option value="ID">ID</option>
                <option value="IL">IL</option>
                <option value="IN">IN</option>
                <option value="IA">IA</option>
                <option value="KS">KS</option>
                <option value="KY">KY</option>
                <option value="LA">LA</option>
                <option value="ME">ME</option>
                <option value="MD">MD</option>
                <option value="MA">MA</option>
                <option value="MI">MI</option>
                <option value="MN">MN</option>
                <option value="MS">MS</option>
                <option value="MO">MO</option>
                <option value="MT">MT</option>
                <option value="NE">NE</option>
                <option value="NV">NV</option>
                <option value="NH">NH</option>
                <option value="NJ">NJ</option>
                <option value="NM">NM</option>
                <option value="NY">NY</option>
                <option value="NC">NC</option>
                <option value="ND">ND</option>
                <option value="OH">OH</option>
                <option value="OK">OK</option>
                <option value="OR">OR</option>
                <option value="PA">PA</option>
                <option value="RI">RI</option>
                <option value="SC">SC</option>
                <option value="SD">SD</option>
                <option value="TN">TN</option>
                <option value="TX">TX</option>
                <option value="UT">UT</option>
                <option value="VT">VT</option>
                <option value="VA">VA</option>
                <option value="WA">WA</option>
                <option value="WV">WV</option>
                <option value="WI">WI</option>
                <option value="WY">WY</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>ZIP</label>
              <input
                type="text"
                value={profile.mailing_zip || ''}
                onChange={(e) => setProfile({...profile, mailing_zip: e.target.value})}
                placeholder="54911"
                maxLength="5"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid var(--border-color)',
                  borderRadius: '5px'
                }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save Contact Information'}
          </button>
        </form>
      </div>

      {/* Deed Information */}
      {deedInfo.length > 0 && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>📜 Deed Information</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Update where your deed should be sent when your loan is paid off.
          </p>

          {deedInfo.map(loan => (
            <div 
              key={loan.loan_id} 
              style={{ 
                padding: '20px', 
                backgroundColor: '#f9f9f9', 
                borderRadius: '8px', 
                marginBottom: '20px',
                border: '2px solid var(--border-color)'
              }}
            >
              <h3 style={{ margin: '0 0 15px 0', color: 'var(--forest-green)' }}>
                {loan.property_title}
              </h3>

              {editingLoan === loan.loan_id ? (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                      Name(s) for Deed
                    </label>
                    <input
                      type="text"
                      value={deedFormData.deed_name}
                      onChange={(e) => setDeedFormData({...deedFormData, deed_name: e.target.value})}
                      placeholder="John and Jane Smith"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid var(--border-color)',
                        borderRadius: '5px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                      Mailing Address for Deed
                    </label>
                    <textarea
                      rows="3"
                      value={deedFormData.deed_mailing_address}
                      onChange={(e) => setDeedFormData({...deedFormData, deed_mailing_address: e.target.value})}
                      placeholder="123 Main St&#10;Appleton, WI 54911"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid var(--border-color)',
                        borderRadius: '5px',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleDeedSubmit(loan.loan_id)}
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : '💾 Save'}
                    </button>
                    <button
                      onClick={() => setEditingLoan(null)}
                      className="btn"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Deed Name:</strong> {loan.deed_name || 'Not set'}
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Mailing Address:</strong> {loan.deed_mailing_address || 'Not set'}
                  </div>
                  <button
                    onClick={() => handleDeedEdit(loan)}
                    className="btn"
                  >
                    ✏️ Edit Deed Information
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AccountSettings;