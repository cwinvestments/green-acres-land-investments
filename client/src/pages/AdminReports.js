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
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading reports...</div>;
  }

  const revenue = financialData?.revenue || {};
  const taxEscrow = financialData?.taxEscrow || [];
  const hoaTracking = financialData?.hoaTracking || [];
  const trends = financialData?.monthlyTrends || [];
  const outstanding = outstandingData?.summary || {};
  const loans = outstandingData?.loans || [];

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ margin: 0 }}>📊 Financial Reports</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
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
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>Total Revenue</h3>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: 'var(--forest-green)' }}>
                ${formatCurrency(revenue.total_revenue || 0)}
              </p>
            </div>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>Loan Payments</h3>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: 'var(--forest-green)' }}>
                ${formatCurrency(revenue.loan_payments || 0)}
              </p>
            </div>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>Late Fees</h3>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>
                ${formatCurrency(revenue.late_fees || 0)}
              </p>
            </div>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>Notice Fees</h3>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#dc3545' }}>
                ${formatCurrency(revenue.notice_fees || 0)}
              </p>
            </div>
          </div>

          <h2>Revenue Breakdown</h2>
          <div className="card" style={{ padding: '20px', marginBottom: '40px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 0' }}>Down Payments</td>
                  <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 'bold', color: 'var(--forest-green)' }}>
                    ${formatCurrency(revenue.down_payments || 0)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 0' }}>Processing Fees (Doc Fees)</td>
                  <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 'bold', color: 'var(--forest-green)' }}>
                    ${formatCurrency(revenue.processing_fees || 0)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 0' }}>Loan Payments</td>
                  <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 'bold', color: 'var(--forest-green)' }}>
                    ${formatCurrency(revenue.loan_payments || 0)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 0' }}>Tax Collected (Escrow)</td>
                  <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 'bold' }}>
                    ${formatCurrency(revenue.tax_collected || 0)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 0' }}>HOA Fees Collected</td>
                  <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 'bold' }}>
                    ${formatCurrency(revenue.hoa_collected || 0)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 0' }}>Convenience Fees</td>
                  <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 'bold', color: 'var(--forest-green)' }}>
                    ${formatCurrency(revenue.convenience_fees || 0)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 0' }}>Postal Fees (Reimbursed)</td>
                  <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 'bold' }}>
                    ${formatCurrency(revenue.postal_fees || 0)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <td style={{ padding: '12px 0', color: '#dc3545' }}>Square Processing Fees (Expense)</td>
                  <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 'bold', color: '#dc3545' }}>
                    -${formatCurrency(revenue.square_fees || 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Monthly Trends (Last 12 Months)</h2>
          
          {/* Desktop Table */}
          <div className="card desktop-only" style={{ padding: '20px' }}>
            {trends.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Month</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Total Revenue</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Loan Payments</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Fees</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Payments</th>
                  </tr>
                </thead>
                <tbody>
                  {trends.map((trend, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>
                        {new Date(trend.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                        ${formatCurrency(trend.total_revenue)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        ${formatCurrency(trend.loan_revenue)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        ${formatCurrency(trend.fee_revenue)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {trend.payment_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ textAlign: 'center', color: '#666' }}>No payment data yet</p>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="mobile-only">
            {trends.length > 0 ? (
              trends.map((trend, idx) => (
                <div key={idx} className="card" style={{ padding: '15px', marginBottom: '15px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '10px', color: 'var(--forest-green)' }}>
                    {new Date(trend.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Total Revenue</div>
                      <div style={{ fontWeight: 'bold' }}>${formatCurrency(trend.total_revenue)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Loan Payments</div>
                      <div style={{ fontWeight: 'bold' }}>${formatCurrency(trend.loan_revenue)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Fees</div>
                      <div style={{ fontWeight: 'bold' }}>${formatCurrency(trend.fee_revenue)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Payments</div>
                      <div style={{ fontWeight: 'bold' }}>{trend.payment_count}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#666' }}>No payment data yet</p>
            )}
          </div>
        </>
      )}

      {/* Tax Escrow Tab */}
      {activeTab === 'tax' && (
        <>
          <h2>Property Tax Escrow Tracking</h2>
          
          {/* Desktop Table */}
          <div className="card desktop-only" style={{ padding: '20px' }}>
            {taxEscrow.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Property</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Annual Tax</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Collected</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Taxes Paid</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {taxEscrow.map((prop) => (
                    <tr key={prop.property_id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{prop.title}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        ${formatCurrency(prop.annual_tax_amount)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#10b981', fontWeight: 'bold' }}>
                  ${formatCurrency(prop.tax_collected)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#dc3545', fontWeight: 'bold' }}>
                  ${formatCurrency(prop.taxes_paid || 0)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                  ${formatCurrency(prop.tax_balance)}
                </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ textAlign: 'center', color: '#666' }}>No properties with tax tracking</p>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="mobile-only">
            {taxEscrow.length > 0 ? (
              taxEscrow.map((prop) => (
                <div key={prop.property_id} className="card" style={{ padding: '15px', marginBottom: '15px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '10px', color: 'var(--forest-green)' }}>
                    {prop.title}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Annual Tax</div>
                      <div style={{ fontWeight: 'bold' }}>${formatCurrency(prop.annual_tax_amount)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Collected</div>
                      <div style={{ fontWeight: 'bold', color: 'var(--forest-green)' }}>${formatCurrency(prop.tax_collected)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Balance</div>
                      <div style={{ fontWeight: 'bold' }}>${formatCurrency(prop.tax_balance)}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#666' }}>No properties with tax tracking</p>
            )}
          </div>
        </>
      )}

      {/* HOA Tab */}
      {activeTab === 'hoa' && (
        <>
          <h2>HOA Fee Tracking</h2>
          
          {/* Desktop Table */}
          <div className="card desktop-only" style={{ padding: '20px' }}>
            {hoaTracking.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Property</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Monthly Fee</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Total Collected</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Payments</th>
                  </tr>
                </thead>
                <tbody>
                  {hoaTracking.map((prop) => (
                    <tr key={prop.property_id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{prop.title}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        ${formatCurrency(prop.monthly_hoa_fee)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: 'var(--forest-green)' }}>
                        ${formatCurrency(prop.hoa_collected)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {prop.payments_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ textAlign: 'center', color: '#666' }}>No properties with HOA fees</p>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="mobile-only">
            {hoaTracking.length > 0 ? (
              hoaTracking.map((prop) => (
                <div key={prop.property_id} className="card" style={{ padding: '15px', marginBottom: '15px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '10px', color: 'var(--forest-green)' }}>
                    {prop.title}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Monthly Fee</div>
                      <div style={{ fontWeight: 'bold' }}>${formatCurrency(prop.monthly_hoa_fee)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Collected</div>
                      <div style={{ fontWeight: 'bold', color: 'var(--forest-green)' }}>${formatCurrency(prop.hoa_collected)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Payments</div>
                      <div style={{ fontWeight: 'bold' }}>{prop.payments_count}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#666' }}>No properties with HOA fees</p>
            )}
          </div>
        </>
      )}

      {/* Outstanding Tab */}
      {activeTab === 'outstanding' && (
        <>
          <h2>Outstanding Balances</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>Total Outstanding</h3>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: 'var(--forest-green)' }}>
                ${formatCurrency(outstanding.total_outstanding || 0)}
              </p>
            </div>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>Total Loans</h3>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
                {outstanding.total_loans || 0}
              </p>
            </div>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>Overdue</h3>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#ffc107' }}>
                {outstanding.overdue_loans || 0}
              </p>
            </div>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>In Default</h3>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#dc3545' }}>
                {outstanding.in_default || 0}
              </p>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="card desktop-only" style={{ padding: 0, overflow: 'auto' }}>
            <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--light-green)', borderBottom: '2px solid var(--forest-green)' }}>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Property</th>
                  <th style={{ padding: '15px', textAlign: 'right' }}>Balance</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Days Overdue</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.loan_id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: '600' }}>{loan.customer_name}</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>{loan.email}</div>
                    </td>
                    <td style={{ padding: '15px' }}>{loan.property_title}</td>
                    <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold' }}>
                      ${formatCurrency(loan.balance_remaining)}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      {loan.days_overdue > 0 ? (
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          backgroundColor: loan.days_overdue >= 30 ? '#dc3545' : '#ffc107',
                          color: 'white',
                          fontWeight: 'bold'
                        }}>
                          {loan.days_overdue} days
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      {loan.notice_sent_date ? (
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          IN DEFAULT
                        </span>
                      ) : loan.days_overdue > 0 ? (
                        <span style={{ color: '#ffc107', fontWeight: 'bold' }}>OVERDUE</span>
                      ) : (
                        <span style={{ color: 'var(--forest-green)', fontWeight: 'bold' }}>CURRENT</span>
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
              <div key={loan.loan_id} className="card" style={{ padding: '15px', marginBottom: '15px' }}>
                <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '2px solid var(--forest-green)' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--forest-green)' }}>
                    {loan.customer_name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>{loan.email}</div>
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{loan.property_title}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Balance</div>
                    <div style={{ fontWeight: 'bold' }}>${formatCurrency(loan.balance_remaining)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Days Overdue</div>
                    {loan.days_overdue > 0 ? (
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        backgroundColor: loan.days_overdue >= 30 ? '#dc3545' : '#ffc107',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '12px'
                      }}>
                        {loan.days_overdue} days
                      </span>
                    ) : (
                      <div style={{ fontWeight: 'bold' }}>—</div>
                    )}
                  </div>
                </div>

                <div>
                  {loan.notice_sent_date ? (
                    <span style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      IN DEFAULT
                    </span>
                  ) : loan.days_overdue > 0 ? (
                    <span style={{ color: '#ffc107', fontWeight: 'bold', fontSize: '14px' }}>OVERDUE</span>
                  ) : (
                    <span style={{ color: 'var(--forest-green)', fontWeight: 'bold', fontSize: '14px' }}>CURRENT</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Export PDF Modal */}
      {showExportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>📄 Export Financial Report</h2>
              <button 
                onClick={() => setShowExportModal(false)}
                className="btn"
                style={{ padding: '8px 20px' }}
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
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="overview">Overview</option>
                  <option value="tax">Tax Escrow</option>
                  <option value="hoa">HOA Tracking</option>
                  <option value="outstanding">Outstanding Balances</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={exportFilters.startDate}
                    onChange={(e) => setExportFilters({...exportFilters, startDate: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>Leave blank for all time</small>
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={exportFilters.endDate}
                    onChange={(e) => setExportFilters({...exportFilters, endDate: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Properties *</label>
                <select
                  value={exportFilters.properties}
                  onChange={(e) => setExportFilters({...exportFilters, properties: e.target.value, selectedPropertyIds: []})}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="all">All Properties</option>
                  <option value="selected">Select Specific Properties</option>
                </select>
              </div>

              {exportFilters.properties === 'selected' && (
                <div className="form-group">
                  <label>Select Properties *</label>
                  <div style={{ 
                    maxHeight: '200px', 
                    overflowY: 'auto', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px', 
                    padding: '10px',
                    backgroundColor: '#f9f9f9'
                  }}>
                    {properties.map(property => (
                      <label key={property.id} style={{ display: 'block', padding: '5px 0', cursor: 'pointer' }}>
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
                          style={{ marginRight: '8px' }}
                        />
                        {property.title} - {property.county}, {property.state}
                      </label>
                    ))}
                  </div>
                  {exportFilters.selectedPropertyIds.length === 0 && (
                    <small style={{ color: '#dc3545', fontSize: '12px' }}>Please select at least one property</small>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '20px' }}
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