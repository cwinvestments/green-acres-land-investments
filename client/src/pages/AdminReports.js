import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../api';

function AdminReports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState(null);
  const [outstandingData, setOutstandingData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    reportType: 'overview',
    startDate: '',
    endDate: new Date().toISOString().split('T')[0],
    properties: 'all',
    selectedPropertyIds: []
  });
  const [properties, setProperties] = useState([]);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    loadReports();
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/properties`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setProperties(data);
    } catch (err) {
      console.error('Failed to load properties:', err);
    }
  };

  const loadReports = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Load financial report
      const financialResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/reports/financial`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const financial = await financialResponse.json();
      setFinancialData(financial);

      // Load outstanding report
      const outstandingResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/reports/outstanding`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const outstanding = await outstandingResponse.json();
      setOutstandingData(outstanding);

    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-reports-loading">Loading reports...</div>;
  }

  const revenue = financialData?.revenue || {};
  const taxEscrow = financialData?.taxEscrow || [];
  const hoaTracking = financialData?.hoaTracking || [];
  const trends = financialData?.monthlyTrends || [];
  const outstanding = outstandingData?.summary || {};
  const loans = outstandingData?.loans || [];

  return (
    <div className="admin-reports-container">
      {/* Header */}
      <div className="admin-reports-header">
        <h1>📊 Financial Reports</h1>
        <div className="admin-reports-header-buttons">
          <button 
            onClick={() => setShowExportModal(true)} 
            className="btn btn-primary"
          >
            📄 Export PDF
          </button>
          <button onClick={() => navigate('/admin/dashboard')} className="btn btn-secondary">
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-reports-tabs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('tax')}
          className={`btn ${activeTab === 'tax' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Tax Escrow
        </button>
        <button
          onClick={() => setActiveTab('hoa')}
          className={`btn ${activeTab === 'hoa' ? 'btn-primary' : 'btn-secondary'}`}
        >
          HOA Tracking
        </button>
        <button
          onClick={() => setActiveTab('outstanding')}
          className={`btn ${activeTab === 'outstanding' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Outstanding Balances
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <h2>Revenue Summary</h2>
          <div className="admin-reports-revenue-grid">
            <div className="card admin-reports-stat-card">
              <h3>Total Revenue</h3>
              <p className="admin-reports-stat-green">
                ${formatCurrency(revenue.total_revenue || 0)}
              </p>
            </div>
            <div className="card admin-reports-stat-card">
              <h3>Loan Payments</h3>
              <p className="admin-reports-stat-green">
                ${formatCurrency(revenue.loan_payments || 0)}
              </p>
            </div>
            <div className="card admin-reports-stat-card">
              <h3>Late Fees</h3>
              <p className="admin-reports-stat-yellow">
                ${formatCurrency(revenue.late_fees || 0)}
              </p>
            </div>
            <div className="card admin-reports-stat-card">
              <h3>Notice Fees</h3>
              <p className="admin-reports-stat-red">
                ${formatCurrency(revenue.notice_fees || 0)}
              </p>
            </div>
          </div>

          <h2>Revenue Breakdown</h2>
          <div className="card admin-reports-breakdown-card">
            <table className="admin-reports-table">
              <tbody>
                <tr>
                  <td>Down Payments</td>
                  <td>
                    ${formatCurrency(revenue.down_payments || 0)}
                  </td>
                </tr>
                <tr>
                  <td>Processing Fees (Doc Fees)</td>
                  <td>
                    ${formatCurrency(revenue.processing_fees || 0)}
                  </td>
                </tr>
                <tr>
                  <td>Loan Payments</td>
                  <td>
                    ${formatCurrency(revenue.loan_payments || 0)}
                  </td>
                </tr>
                <tr>
                  <td>Convenience Fees</td>
                  <td>
                    ${formatCurrency(revenue.convenience_fees || 0)}
                  </td>
                </tr>
                <tr>
                  <td>Late Fees</td>
                  <td>
                    ${formatCurrency(revenue.late_fees || 0)}
                  </td>
                </tr>
                <tr>
                  <td>Notice Fees</td>
                  <td>
                    ${formatCurrency(revenue.notice_fees || 0)}
                  </td>
                </tr>
                <tr>
                  <td>Postal Fees</td>
                  <td>
                    ${formatCurrency(revenue.postal_fees || 0)}
                  </td>
                </tr>
                <tr className="admin-reports-table-total">
                  <td>Total Revenue</td>
                  <td>
                    ${formatCurrency(revenue.total_revenue || 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Monthly Trends</h2>
          <div className="card admin-reports-trends-card">
            <div className="admin-reports-trends-grid">
              {trends.map((trend, idx) => (
                <div key={idx} className="admin-reports-trend-item">
                  <div className="admin-reports-trend-month">{trend.month}</div>
                  <div className="admin-reports-trend-amount">
                    ${formatCurrency(trend.total || 0)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Tax Escrow Tab */}
      {activeTab === 'tax' && (
        <>
          <h2>Tax Escrow Tracking</h2>
          <div className="card admin-reports-escrow-card">
            <div className="admin-reports-escrow-header">
              <div className="admin-reports-escrow-property">Property</div>
              <div className="admin-reports-escrow-value">Collected</div>
              <div className="admin-reports-escrow-value">Paid</div>
              <div className="admin-reports-escrow-value">Balance</div>
            </div>
            {taxEscrow.map((item, idx) => (
              <div key={idx} className="admin-reports-escrow-row">
                <div className="admin-reports-escrow-property">
                  {item.property_title}
                </div>
                <div className="admin-reports-escrow-value">
                  ${formatCurrency(item.total_collected || 0)}
                </div>
                <div className="admin-reports-escrow-value">
                  ${formatCurrency(item.total_paid || 0)}
                </div>
                <div className="admin-reports-escrow-value">
                  ${formatCurrency(item.balance || 0)}
                </div>
              </div>
            ))}
            <div className="admin-reports-escrow-row admin-reports-escrow-total">
              <div className="admin-reports-escrow-property">Total</div>
              <div className="admin-reports-escrow-value admin-reports-escrow-total-amount">
                ${formatCurrency(taxEscrow.reduce((sum, item) => sum + parseFloat(item.total_collected || 0), 0))}
              </div>
              <div className="admin-reports-escrow-value admin-reports-escrow-total-amount">
                ${formatCurrency(taxEscrow.reduce((sum, item) => sum + parseFloat(item.total_paid || 0), 0))}
              </div>
              <div className="admin-reports-escrow-value admin-reports-escrow-total-amount">
                ${formatCurrency(taxEscrow.reduce((sum, item) => sum + parseFloat(item.balance || 0), 0))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* HOA Tracking Tab */}
      {activeTab === 'hoa' && (
        <>
          <h2>HOA Tracking</h2>
          {hoaTracking.length === 0 ? (
            <div className="card admin-reports-breakdown-card">
              <p>No properties with HOA fees.</p>
            </div>
          ) : (
            <div className="admin-reports-hoa-grid">
              {hoaTracking.map((item, idx) => (
                <div key={idx} className="card admin-reports-hoa-property-card">
                  <div className="admin-reports-hoa-property-title">
                    {item.property_title}
                  </div>
                  
                  <div className="admin-reports-hoa-details-grid">
                    <div className="admin-reports-hoa-detail-item">
                      <div className="admin-reports-hoa-detail-label">HOA Name</div>
                      <div className="admin-reports-hoa-detail-value">{item.hoa_name || 'N/A'}</div>
                    </div>
                    <div className="admin-reports-hoa-detail-item">
                      <div className="admin-reports-hoa-detail-label">Monthly Fee</div>
                      <div className="admin-reports-hoa-detail-value">${formatCurrency(item.hoa_monthly_fee || 0)}</div>
                    </div>
                    <div className="admin-reports-hoa-detail-item">
                      <div className="admin-reports-hoa-detail-label">Contact</div>
                      <div className="admin-reports-hoa-detail-value">{item.hoa_contact || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="admin-reports-hoa-payment-grid">
                    <div className="admin-reports-hoa-payment-item">
                      <div className="admin-reports-hoa-payment-label">Total Collected</div>
                      <div className="admin-reports-hoa-payment-value">
                        ${formatCurrency(item.total_collected || 0)}
                      </div>
                    </div>
                    <div className="admin-reports-hoa-payment-item">
                      <div className="admin-reports-hoa-payment-label">Total Paid</div>
                      <div className="admin-reports-hoa-payment-value">
                        ${formatCurrency(item.total_paid || 0)}
                      </div>
                    </div>
                    <div className="admin-reports-hoa-payment-item">
                      <div className="admin-reports-hoa-payment-label">Balance</div>
                      <div className="admin-reports-hoa-payment-value">
                        ${formatCurrency(item.balance || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Outstanding Balances Tab */}
      {activeTab === 'outstanding' && (
        <>
          <h2>Outstanding Loan Balances</h2>
          <div className="admin-reports-outstanding-summary">
            <div className="card admin-reports-outstanding-card">
              <h3>Total Outstanding</h3>
              <p>${formatCurrency(outstanding.total_outstanding || 0)}</p>
            </div>
            <div className="card admin-reports-outstanding-card">
              <h3>Total Principal</h3>
              <p>${formatCurrency(outstanding.total_principal || 0)}</p>
            </div>
            <div className="card admin-reports-outstanding-card">
              <h3>Total Interest</h3>
              <p>${formatCurrency(outstanding.total_interest || 0)}</p>
            </div>
            <div className="card admin-reports-outstanding-card">
              <h3>Active Loans</h3>
              <p>{outstanding.active_loans || 0}</p>
            </div>
          </div>

          <h2>Loan Details</h2>
          <div className="card admin-reports-loans-card">
            <table className="admin-reports-loans-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Property</th>
                  <th>Original Amount</th>
                  <th>Principal Remaining</th>
                  <th>Interest Remaining</th>
                  <th>Total Outstanding</th>
                  <th>% Paid</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan, idx) => (
                  <tr key={idx}>
                    <td>{loan.customer_name}</td>
                    <td>{loan.property_title}</td>
                    <td className="admin-reports-loans-table-right">
                      ${formatCurrency(loan.original_amount || 0)}
                    </td>
                    <td className="admin-reports-loans-table-right admin-reports-loans-table-bold admin-reports-loans-table-green">
                      ${formatCurrency(loan.principal_remaining || 0)}
                    </td>
                    <td className="admin-reports-loans-table-right admin-reports-loans-table-bold">
                      ${formatCurrency(loan.interest_remaining || 0)}
                    </td>
                    <td className="admin-reports-loans-table-right admin-reports-loans-table-bold">
                      ${formatCurrency(loan.total_outstanding || 0)}
                    </td>
                    <td className="admin-reports-loans-table-right">
                      {loan.percent_paid || 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="admin-reports-export-modal-overlay">
          <div className="admin-reports-export-modal-content">
            <div className="admin-reports-export-modal-header">
              <h2>📄 Export Financial Report</h2>
              <button 
                onClick={() => setShowExportModal(false)}
                className="btn admin-reports-export-modal-close"
              >
                Close
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setGeneratingPDF(true);
              try {
                const token = localStorage.getItem('adminToken');
                const queryParams = new URLSearchParams({
                  reportType: exportFilters.reportType,
                  startDate: exportFilters.startDate,
                  endDate: exportFilters.endDate,
                  properties: exportFilters.properties,
                  ...(exportFilters.properties === 'selected' && {
                    propertyIds: exportFilters.selectedPropertyIds.join(',')
                  })
                });

                const response = await fetch(
                  `${process.env.REACT_APP_API_URL}/admin/reports/export?${queryParams}`,
                  { 
                    headers: { Authorization: `Bearer ${token}` },
                    method: 'GET'
                  }
                );

                if (!response.ok) throw new Error('Failed to generate PDF');

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `financial-report-${exportFilters.reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                alert('Report downloaded successfully!');
                setShowExportModal(false);
              } catch (err) {
                console.error('Failed to generate PDF:', err);
                alert('Failed to generate PDF report');
              } finally {
                setGeneratingPDF(false);
              }
            }}>
              <div className="form-group">
                <label>Report Type *</label>
                <select
                  value={exportFilters.reportType}
                  onChange={(e) => setExportFilters({...exportFilters, reportType: e.target.value})}
                  required
                  className="admin-reports-export-input"
                >
                  <option value="overview">Overview</option>
                  <option value="tax">Tax Escrow</option>
                  <option value="hoa">HOA Tracking</option>
                  <option value="outstanding">Outstanding Balances</option>
                </select>
              </div>

              <div className="admin-reports-export-date-grid">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={exportFilters.startDate}
                    onChange={(e) => setExportFilters({...exportFilters, startDate: e.target.value})}
                    className="admin-reports-export-input"
                  />
                  <small className="admin-reports-export-date-small">Leave blank for all time</small>
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={exportFilters.endDate}
                    onChange={(e) => setExportFilters({...exportFilters, endDate: e.target.value})}
                    className="admin-reports-export-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Properties *</label>
                <select
                  value={exportFilters.properties}
                  onChange={(e) => setExportFilters({...exportFilters, properties: e.target.value, selectedPropertyIds: []})}
                  required
                  className="admin-reports-export-input"
                >
                  <option value="all">All Properties</option>
                  <option value="selected">Select Specific Properties</option>
                </select>
              </div>

              {exportFilters.properties === 'selected' && (
                <div className="form-group">
                  <label>Select Properties *</label>
                  <div className="admin-reports-export-properties-list">
                    {properties.map(property => (
                      <label key={property.id} className="admin-reports-export-property-label">
                        <input
                          type="checkbox"
                          checked={exportFilters.selectedPropertyIds.includes(property.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setExportFilters({
                                ...exportFilters,
                                selectedPropertyIds: [...exportFilters.selectedPropertyIds, property.id]
                              });
                            } else {
                              setExportFilters({
                                ...exportFilters,
                                selectedPropertyIds: exportFilters.selectedPropertyIds.filter(id => id !== property.id)
                              });
                            }
                          }}
                          className="admin-reports-export-property-checkbox"
                        />
                        {property.title} - {property.county}, {property.state}
                      </label>
                    ))}
                  </div>
                  {exportFilters.selectedPropertyIds.length === 0 && (
                    <small className="admin-reports-export-error">Please select at least one property</small>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary admin-reports-export-submit"
                disabled={generatingPDF || (exportFilters.properties === 'selected' && exportFilters.selectedPropertyIds.length === 0)}
              >
                {generatingPDF ? '⏳ Generating PDF...' : '📥 Generate & Download PDF'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReports;