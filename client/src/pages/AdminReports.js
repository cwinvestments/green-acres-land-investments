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
      <div style={{ marginBottom: '30px' }}>
        <h1 className="admin-page-title">📊 Financial Reports</h1>
        <button onClick={() => setShowExportModal(true)} className="btn" style={{ backgroundColor: 'var(--forest-green)', color: 'white', width: '100%', marginBottom: '10px' }}>
          📄 Export PDF
        </button>
        <button onClick={() => navigate('/admin/dashboard')} className="btn btn-secondary" style={{ width: '100%' }}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Tabs */}
      <div className="admin-reports-tabs" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
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

          <h2>Monthly Trends (Last 12 Months)</h2>
          
          {/* Desktop Table */}
          <div className="card desktop-only admin-reports-trends-desktop">
            {trends.length > 0 ? (
              <table className="admin-reports-table">
                <thead>
                  <tr className="admin-reports-trends-header">
                    <th>Month</th>
                    <th>Total Revenue</th>
                    <th>Loan Payments</th>
                    <th>Fees</th>
                    <th>Payments</th>
                  </tr>
                </thead>
                <tbody>
                  {trends.map((trend, idx) => (
                    <tr key={idx}>
                      <td>
                        {new Date(trend.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </td>
                      <td className="admin-reports-trends-revenue">
                        ${formatCurrency(trend.total_revenue)}
                      </td>
                      <td className="admin-reports-trends-value">
                        ${formatCurrency(trend.loan_revenue)}
                      </td>
                      <td className="admin-reports-trends-value">
                        ${formatCurrency(trend.fee_revenue)}
                      </td>
                      <td className="admin-reports-trends-center">
                        {trend.payment_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="admin-reports-trends-empty">No payment data yet</p>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="mobile-only">
            {trends.length > 0 ? (
              trends.map((trend, idx) => (
                <div key={idx} className="card admin-reports-trend-mobile-card">
                  <div className="admin-reports-trend-mobile-month">
                    {new Date(trend.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                  <div className="admin-reports-trend-mobile-grid">
                    <div>
                      <div className="admin-reports-trend-mobile-label">Total Revenue</div>
                      <div className="admin-reports-trend-mobile-value">${formatCurrency(trend.total_revenue)}</div>
                    </div>
                    <div>
                      <div className="admin-reports-trend-mobile-label">Loan Payments</div>
                      <div className="admin-reports-trend-mobile-value">${formatCurrency(trend.loan_revenue)}</div>
                    </div>
                    <div>
                      <div className="admin-reports-trend-mobile-label">Fees</div>
                      <div className="admin-reports-trend-mobile-value">${formatCurrency(trend.fee_revenue)}</div>
                    </div>
                    <div>
                      <div className="admin-reports-trend-mobile-label">Payments</div>
                      <div className="admin-reports-trend-mobile-value">{trend.payment_count}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="admin-reports-trends-empty">No payment data yet</p>
            )}
          </div>
        </>
      )}

      {/* Tax Escrow Tab */}
      {activeTab === 'tax' && (
        <>
          <h2>Property Tax Escrow Tracking</h2>
          
          {/* Desktop Table */}
          <div className="card desktop-only admin-reports-tax-desktop">
            {taxEscrow.length > 0 ? (
              <table className="admin-reports-table">
                <thead>
                  <tr className="admin-reports-tax-header">
                    <th>Property</th>
                    <th>Annual Tax</th>
                    <th>Collected</th>
                    <th>Taxes Paid</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {taxEscrow.map((prop) => (
                    <tr key={prop.property_id}>
                      <td>{prop.title}</td>
                      <td className="admin-reports-tax-value">
                        ${formatCurrency(prop.annual_tax_amount)}
                      </td>
                      <td className="admin-reports-tax-collected">
                        ${formatCurrency(prop.tax_collected)}
                      </td>
                      <td className="admin-reports-tax-paid">
                        ${formatCurrency(prop.taxes_paid || 0)}
                      </td>
                      <td className="admin-reports-tax-balance">
                        ${formatCurrency(prop.tax_balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="admin-reports-tax-empty">No properties with tax tracking</p>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="mobile-only">
            {taxEscrow.length > 0 ? (
              taxEscrow.map((prop) => (
                <div key={prop.property_id} className="card admin-reports-tax-mobile-card">
                  <div className="admin-reports-tax-mobile-title">
                    {prop.title}
                  </div>
                  <div className="admin-reports-tax-mobile-grid">
                    <div>
                      <div className="admin-reports-tax-mobile-label">Annual Tax</div>
                      <div className="admin-reports-tax-mobile-value">${formatCurrency(prop.annual_tax_amount)}</div>
                    </div>
                    <div>
                      <div className="admin-reports-tax-mobile-label">Collected</div>
                      <div className="admin-reports-tax-mobile-collected">${formatCurrency(prop.tax_collected)}</div>
                    </div>
                    <div>
                      <div className="admin-reports-tax-mobile-label">Balance</div>
                      <div className="admin-reports-tax-mobile-value">${formatCurrency(prop.tax_balance)}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="admin-reports-tax-empty">No properties with tax tracking</p>
            )}
          </div>
        </>
      )}

      {/* HOA Tab */}
      {activeTab === 'hoa' && (
        <>
          <h2>HOA Fee Tracking</h2>
          
          {/* Desktop Table */}
          <div className="card desktop-only admin-reports-hoa-desktop">
            {hoaTracking.length > 0 ? (
              <table className="admin-reports-table">
                <thead>
                  <tr className="admin-reports-hoa-header">
                    <th>Property</th>
                    <th>Monthly Fee</th>
                    <th>Total Collected</th>
                    <th>Payments</th>
                  </tr>
                </thead>
                <tbody>
                  {hoaTracking.map((prop) => (
                    <tr key={prop.property_id}>
                      <td>{prop.title}</td>
                      <td className="admin-reports-hoa-table-value">
                        ${formatCurrency(prop.monthly_hoa_fee)}
                      </td>
                      <td className="admin-reports-hoa-table-value">
                        ${formatCurrency(prop.hoa_collected)}
                      </td>
                      <td className="admin-reports-hoa-table-center">
                        {prop.payments_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="admin-reports-hoa-empty">No properties with HOA fees</p>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="mobile-only">
            {hoaTracking.length > 0 ? (
              hoaTracking.map((prop) => (
                <div key={prop.property_id} className="card admin-reports-hoa-mobile-card">
                  <div className="admin-reports-hoa-mobile-title">
                    {prop.title}
                  </div>
                  <div className="admin-reports-hoa-mobile-grid">
                    <div>
                      <div className="admin-reports-hoa-mobile-label">Monthly Fee</div>
                      <div className="admin-reports-hoa-mobile-value">${formatCurrency(prop.monthly_hoa_fee)}</div>
                    </div>
                    <div>
                      <div className="admin-reports-hoa-mobile-label">Total Collected</div>
                      <div className="admin-reports-hoa-mobile-value">${formatCurrency(prop.hoa_collected)}</div>
                    </div>
                    <div>
                      <div className="admin-reports-hoa-mobile-label">Payments</div>
                      <div className="admin-reports-hoa-mobile-value">{prop.payments_count}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="admin-reports-hoa-empty">No properties with HOA fees</p>
            )}
          </div>
        </>
      )}

      {/* Outstanding Balances Tab */}
      {activeTab === 'outstanding' && (
        <>
          <h2>Outstanding Loan Balances</h2>
          <div className="admin-reports-outstanding-summary">
            <div className="card admin-reports-outstanding-card">
              <h3>Total Outstanding</h3>
              <p>${formatCurrency(outstanding.total_balance || 0)}</p>
            </div>
            <div className="card admin-reports-outstanding-card">
              <h3>Overdue Loans</h3>
              <p>{outstanding.overdue_count || 0}</p>
            </div>
            <div className="card admin-reports-outstanding-card">
              <h3>In Default</h3>
              <p>{outstanding.default_count || 0}</p>
            </div>
            <div className="card admin-reports-outstanding-card">
              <h3>Total Loans</h3>
              <p>{outstanding.total_loans || 0}</p>
            </div>
          </div>

          <h2>Loan Details</h2>
          
          {/* Desktop Table */}
          <div className="card desktop-only admin-reports-outstanding-desktop">
            <table className="admin-reports-table">
              <thead>
                <tr className="admin-reports-outstanding-header">
                  <th>Customer</th>
                  <th>Property</th>
                  <th>Balance</th>
                  <th>Days Overdue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.loan_id}>
                    <td className="admin-reports-outstanding-customer">
                      <div className="admin-reports-outstanding-customer-name">{loan.customer_name}</div>
                      <div className="admin-reports-outstanding-customer-email">{loan.email}</div>
                    </td>
                    <td>{loan.property_title}</td>
                    <td className="admin-reports-outstanding-balance">
                      ${formatCurrency(loan.balance_remaining)}
                    </td>
                    <td className="admin-reports-outstanding-days">
                      {loan.days_overdue > 0 ? (
                        <span className="admin-reports-outstanding-badge" style={{
                          backgroundColor: loan.days_overdue >= 30 ? '#dc3545' : '#ffc107'
                        }}>
                          {loan.days_overdue} days
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="admin-reports-outstanding-status">
                      {loan.notice_sent_date ? (
                        <span className="admin-reports-outstanding-status-default">
                          IN DEFAULT
                        </span>
                      ) : loan.days_overdue > 0 ? (
                        <span className="admin-reports-outstanding-status-overdue">OVERDUE</span>
                      ) : (
                        <span className="admin-reports-outstanding-status-current">CURRENT</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="mobile-only">
            {loans.map((loan) => (
              <div key={loan.loan_id} className="card admin-reports-outstanding-mobile-card">
                <div className="admin-reports-outstanding-mobile-header">
                  <div>
                    <div className="admin-reports-outstanding-mobile-name">{loan.customer_name}</div>
                    <div className="admin-reports-outstanding-mobile-email">{loan.email}</div>
                  </div>
                  <div className="admin-reports-outstanding-mobile-status">
                    {loan.notice_sent_date ? (
                      <span className="admin-reports-outstanding-status-default">
                        IN DEFAULT
                      </span>
                    ) : loan.days_overdue > 0 ? (
                      <span className="admin-reports-outstanding-status-overdue">OVERDUE</span>
                    ) : (
                      <span className="admin-reports-outstanding-status-current">CURRENT</span>
                    )}
                  </div>
                </div>

                <div className="admin-reports-outstanding-mobile-property">
                  {loan.property_title}
                </div>

                <div className="admin-reports-outstanding-mobile-grid">
                  <div>
                    <div className="admin-reports-outstanding-mobile-label">Balance</div>
                    <div className="admin-reports-outstanding-mobile-value">${formatCurrency(loan.balance_remaining)}</div>
                  </div>
                  <div>
                    <div className="admin-reports-outstanding-mobile-label">Days Overdue</div>
                    {loan.days_overdue > 0 ? (
                      <span className="admin-reports-outstanding-badge" style={{
                        backgroundColor: loan.days_overdue >= 30 ? '#dc3545' : '#ffc107'
                      }}>
                        {loan.days_overdue} days
                      </span>
                    ) : (
                      <div className="admin-reports-outstanding-mobile-value">—</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
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