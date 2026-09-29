'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function NewStudentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('single'); // 'single' or 'bulk'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    batches: { C: false, Java: false, Python: false }
  });
  
  const [bulkData, setBulkData] = useState([]); // array of parsed students
  const [bulkBatches, setBulkBatches] = useState({ C: false, Java: false, Python: false });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleBatchChange = (batch, isBulk = false) => {
    if (isBulk) {
        setBulkBatches(prev => ({ ...prev, [batch]: !prev[batch] }));
    } else {
        setFormData(prev => ({
          ...prev,
          batches: { ...prev.batches, [batch]: !prev.batches[batch] }
        }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 2) {
         setError('CSV must contain headers and at least one student row.');
         return;
      }
      
      const parsedStudents = [];
      for (let i = 1; i < lines.length; i++) {
         const cols = lines[i].split(',').map(c => c.trim());
         if (cols.length >= 3) {
            parsedStudents.push({
               name: cols[0],
               email: cols[1],
               phone: cols[2]
            });
         }
      }
      setBulkData(parsedStudents);
      setError('');
    };
    reader.readAsText(file);
  };

  const clearBulkFile = () => {
     setBulkData([]);
     if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let payload;

    if (activeTab === 'single') {
        const selectedBatches = Object.keys(formData.batches).filter(k => formData.batches[k]);
        if (selectedBatches.length === 0) {
          setError('Please select at least one batch.');
          setLoading(false);
          return;
        }
        payload = {
          students: [{ name: formData.name, email: formData.email, phone: formData.phone }],
          batch: selectedBatches
        };
    } else {
        const selectedBatches = Object.keys(bulkBatches).filter(k => bulkBatches[k]);
        if (selectedBatches.length === 0) {
          setError('Please select at least one batch for bulk import.');
          setLoading(false);
          return;
        }
        if (bulkData.length === 0) {
           setError('Please upload a valid CSV and preview the data before submitting.');
           setLoading(false);
           return;
        }
        payload = {
           students: bulkData,
           batch: selectedBatches
        };
    }

    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create student(s)');

      alert(`Successfully saved ${data.insertedCount || 1} student(s) to DB!`);
      router.push('/admin/students');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <h1 className="text-gradient">Add New Students</h1>
      <p style={{ color: 'var(--border)', marginBottom: '2rem' }}>Enroll new students either individually or via bulk upload.</p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
        <button 
           type="button" 
           onClick={() => setActiveTab('single')}
           style={{ 
              padding: '0.75rem 1.5rem', 
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'single' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'single' ? 'var(--primary)' : 'var(--border)',
              cursor: 'pointer',
              fontWeight: activeTab === 'single' ? 'bold' : 'normal'
           }}
        >
           Single Student
        </button>
        <button 
           type="button" 
           onClick={() => setActiveTab('bulk')}
           style={{ 
              padding: '0.75rem 1.5rem', 
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'bulk' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'bulk' ? 'var(--primary)' : 'var(--border)',
              cursor: 'pointer',
              fontWeight: activeTab === 'bulk' ? 'bold' : 'normal'
           }}
        >
           Bulk Upload (CSV)
        </button>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}

        {/* --- SINGLE TAB --- */}
        {activeTab === 'single' && (
           <>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
              <input 
                type="email" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone Number</label>
              <input 
                type="tel" 
                required 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Enroll in Batches</label>
              <div className="flex gap-4">
                {['C', 'Java', 'Python'].map(batch => (
                  <label key={batch} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      style={{ width: 'auto' }}
                      checked={formData.batches[batch]}
                      onChange={() => handleBatchChange(batch, false)}
                    />
                    {batch}
                  </label>
                ))}
              </div>
            </div>
           </>
        )}

        {/* --- BULK TAB --- */}
        {activeTab === 'bulk' && (
           <>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--primary)' }}>
               <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>How it works</h4>
               <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--border)' }}>
                 1. Download the <a href="/student_template.csv" download style={{ color: '#fff', textDecoration: 'underline' }}>CSV Template</a>.<br/>
                 2. Fill it out with student information (Name, Email, Phone).<br/>
                 3. Select the courses below and upload your completed CSV.<br/>
                 4. Preview your data and hit Save.
               </p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Enroll All Imported Students in Batches</label>
              <div className="flex gap-4">
                {['C', 'Java', 'Python'].map(batch => (
                  <label key={batch} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      style={{ width: 'auto' }}
                      checked={bulkBatches[batch]}
                      onChange={() => handleBatchChange(batch, true)}
                    />
                    {batch}
                  </label>
                ))}
              </div>
            </div>

            <div>
               <label style={{ display: 'block', marginBottom: '0.5rem' }}>Upload CSV File</label>
               <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                 <input 
                    type="file" 
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    style={{ flex: 1 }}
                 />
                 {bulkData.length > 0 && (
                    <button type="button" onClick={clearBulkFile} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Clear</button>
                 )}
               </div>
            </div>

            {bulkData.length > 0 && (
               <div>
                  <label style={{ display: 'block', margin: '1rem 0 0.5rem 0' }}>Data Preview ({bulkData.length} students)</label>
                  <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                     <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.05)', position: 'sticky', top: 0 }}>
                           <tr>
                              <th style={{ padding: '0.75rem' }}>Name</th>
                              <th style={{ padding: '0.75rem' }}>Email</th>
                              <th style={{ padding: '0.75rem' }}>Phone</th>
                           </tr>
                        </thead>
                        <tbody>
                           {bulkData.map((s, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                 <td style={{ padding: '0.5rem 0.75rem' }}>{s.name}</td>
                                 <td style={{ padding: '0.5rem 0.75rem' }}>{s.email}</td>
                                 <td style={{ padding: '0.5rem 0.75rem' }}>{s.phone}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}
           </>
        )}

        <div className="flex gap-4 mt-4">
           <button type="button" onClick={() => router.back()} className="btn btn-secondary" style={{ flex: 1 }}>
             Cancel
           </button>
           <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
             {loading ? 'Saving to Database...' : activeTab === 'single' ? 'Add Student' : 'Bulk Upload & Save'}
           </button>
        </div>
      </form>
    </div>
  );
}
