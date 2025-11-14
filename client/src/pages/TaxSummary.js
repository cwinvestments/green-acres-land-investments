import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../api';

function TaxSummary() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [taxRate, setTaxRate] = useState(30);

  useEffect(() => {
    loadTaxData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

useEffect(() => {
    loadTaxRate();
  }, []);

  const loadTaxRate = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/tax-rate`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setTaxRate(data.taxRate);
    } catch (err) {
      console.error('Failed to load tax rate:', err);
    }
  };

  const loadTaxData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/reports/tax-summary?year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Failed to load tax data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (monthNum) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNum - 1];
  };

  const printReport = () => {
    window.print();
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading tax report...</div>;
  }

  if (!data) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>No data available</div>;
  }

  const currentMonth = new Date().getMonth() + 1;
  const currentMonthData = data.monthly.find(m => m.month === currentMonth) || data.monthly[data.monthly.length - 1];
  const suggestedWithholding = currentMonthData.net_profit * (taxRate / 100);
  const yearToDateWithholding = data.annual.net_profit * (taxRate / 100);

  const handleTaxRateChange = async (e) => {
    const newRate = parseFloat(e.target.value);
    setTaxRate(newRate);
    
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(
        `${process.env.REACT_APP_API_URL}/admin/tax-rate`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ taxRate: newRate })
        }
      );
    } catch (err) {
      console.error('Failed to save tax rate:', err);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header - Hide when printing */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '1rem' }}> }}>
        <h1>💼 Income Tax Summary</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{ padding: '8px', fontSize: '16px' }}
          >
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button onClick={printReport} className="btn btn-primary">
            🖨️ Print Report
          </button>
          <button onClick={() => navigate('/admin/dashboard')} className="btn btn-secondary">
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Print Header - Only shows when printing */}
      <div className="print-only" style={{ display: 'none', marginBottom: '30px', textAlign: 'center' }}>
        <h1>Green Acres Land Investments, LLC</h1>
        <h2>Income Tax Summary - {selectedYear}</h2>
        <p>Generated: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Monthly Tax Withholding Recommendation */}
      <div className="no-print" style={{ 
        backgroundColor: '#fff3cd',
        border: '2px solid #ffc107',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0 }}>📊 Monthly Tax Withholding Calculator</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Your Tax Rate:</label>
            <select 
              value={taxRate} 
              onChange={handleTaxRateChange}
              style={{ 
                padding: '8px 12px', 
                fontSize: '16px', 
                fontWeight: 'bold',
                border: '2px solid #ffc107',
                borderRadius: '5px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="25">25%</option>
              <option value="30">30%</option>
              <option value="35">35%</option>
              <option value="40">40%</option>
            </select>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={taxRate}
              onChange={handleTaxRateChange}
              placeholder="Custom"
              style={{
                width: '80px',
                padding: '8px',
                fontSize: '16px',
                border: '2px solid #ffc107',
                borderRadius: '5px',
                textAlign: 'center'
              }}
            />
            <span style={{ fontSize: '14px', color: '#856404' }}>%</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#666' }}>Current Month Net Profit:</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              ${formatCurrency(currentMonthData.net_profit)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#666' }}>Amount to Set Aside ({taxRate}%):</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
              ${formatCurrency(suggestedWithholding)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#666' }}>Year-to-Date Net Profit:</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--forest-green)' }}>
              ${formatCurrency(data.annual.net_profit)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#666' }}>Year-to-Date Total to Withhold:</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
              ${formatCurrency(yearToDateWithholding)}
            </div>
          </div>
        </div>
        <p style={{ margin: '15px 0 0 0', fontSize: '14px', color: '#856404' }}>
          💡 <strong>Tip:</strong> Adjust your tax rate based on your business structure and tax bracket. 
          Your withholding preference is saved automatically. Consult with your CPA for personalized tax advice.
        </p>
      </div>

      {/* Annual Summary */}
      <h2>Annual Summary - {selectedYear}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>Total Revenue</h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: 'var(--forest-green)' }}>
            ${formatCurrency(data.annual.revenue)}
          </p>
        </div>
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>Total Expenses</h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#dc3545' }}>
            ${formatCurrency(data.annual.expenses)}
          </p>
        </div>
        <div className="card" style={{ padding: '20px', textAlign: 'center', backgroundColor: 'var(--light-green)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>Net Profit (Taxable)</h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: 'var(--forest-green)' }}>
            ${formatCurrency(data.annual.net_profit)}
          </p>
        </div>
      </div>

      {/* Quarterly Summary */}
      <h2>Quarterly Breakdown</h2>
      <div className="card" style={{ padding: '20px', marginBottom: '40px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--forest-green)' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Quarter</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Revenue</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Expenses</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Net Profit</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Est. Tax ({taxRate}%)</th>
            </tr>
          </thead>
          <tbody>
            {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
              <tr key={q} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{q}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  ${formatCurrency(data.quarterly[q].revenue)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#dc3545' }}>
                  ${formatCurrency(data.quarterly[q].expenses)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: 'var(--forest-green)' }}>
                  ${formatCurrency(data.quarterly[q].net_profit)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#ffc107' }}>
                  ${formatCurrency(data.quarterly[q].net_profit * (taxRate / 100))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Monthly Detail */}
      <h2>Monthly Detail - {selectedYear}</h2>
      
      {/* Desktop Table */}
      <div className="card desktop-only" style={{ padding: 0, marginBottom: '40px', overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--light-green)', borderBottom: '2px solid var(--forest-green)' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Month</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Revenue</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Expenses</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Net Profit</th>
            </tr>
          </thead>
          <tbody>
            {data.monthly.map(month => (
              <tr key={month.month} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>
                  {getMonthName(month.month)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  ${formatCurrency(month.revenue.total)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#dc3545' }}>
                  ${formatCurrency(month.expenses.total)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: 'var(--forest-green)' }}>
                  ${formatCurrency(month.net_profit)}
                </td>
              </tr>
            ))}
            <tr style={{ borderTop: '3px solid var(--forest-green)', backgroundColor: 'var(--light-green)' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>TOTAL</td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                ${formatCurrency(data.annual.revenue)}
              </td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#dc3545' }}>
                ${formatCurrency(data.annual.expenses)}
              </td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: 'var(--forest-green)' }}>
                ${formatCurrency(data.annual.net_profit)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="mobile-only">
        {data.monthly.map(month => (
          <div key={month.month} className="card" style={{ padding: '15px', marginBottom: '15px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '10px', color: 'var(--forest-green)' }}>
              {getMonthName(month.month)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#666' }}>Revenue</div>
                <div style={{ fontWeight: 'bold' }}>${formatCurrency(month.revenue.total)}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#666' }}>Expenses</div>
                <div style={{ fontWeight: 'bold', color: '#dc3545' }}>${formatCurrency(month.expenses.total)}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#666' }}>Net Profit</div>
                <div style={{ fontWeight: 'bold', color: 'var(--forest-green)' }}>${formatCurrency(month.net_profit)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CPA Notes */}
      <div className="card" style={{ padding: '20px', backgroundColor: '#f0f8f0', marginTop: '30px' }}>
        <h3 style={{ margin: '0 0 15px 0' }}>📝 Notes for Your CPA</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li><strong>Revenue</strong> includes: Loan payments (principal + interest), late fees, notice fees, convenience fees, postal reimbursements</li>
          <li><strong>Expenses</strong> include: Square processing fees, property acquisition costs, selling expenses, recovery costs</li>
          <li><strong>Excluded:</strong> Tax escrow and HOA fees (pass-through only, not income)</li>
          <li><strong>Business Structure:</strong> Green Acres Land Investments, LLC</li>
          <li><strong>Accounting Method:</strong> Cash basis (income recognized when received)</li>
        </ul>
      </div>
    </div>
  );
}

export default TaxSummary;