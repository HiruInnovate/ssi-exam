'use client';

import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

export default function EditExamPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [formData, setFormData] = useState({
    title: '',
    batch: 'C',
    duration: 60,
    maxAttempts: 3,
    passingPercentage: 50,
    rules: '',
    mcqs: [],
    codingQuestions: []
  });
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`/api/admin/exams/${id}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Failed to fetch exam');
        
        setFormData({
          ...data,
          rules: Array.isArray(data.rules) ? data.rules.join('\n') : data.rules
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExam();
  }, [id]);

  const handleAddMCQ = () => {
    setFormData(prev => ({
      ...prev,
      mcqs: [...prev.mcqs, { id: Date.now().toString(), question: '', options: ['', '', '', ''], answer: 0, marks: 1 }]
    }));
  };

  const handleAddCoding = () => {
    setFormData(prev => ({
      ...prev,
      codingQuestions: [...prev.codingQuestions, { id: Date.now().toString(), question: '', sampleAnswer: '', marks: 5 }]
    }));
  };

  const downloadTemplate = () => {
    const mcqTemplate = [
      { Question: 'Sample MCQ Question?', 'Option 1': 'Opt A', 'Option 2': 'Opt B', 'Option 3': 'Opt C', 'Option 4': 'Opt D', 'Correct Option (1-4)': 1, Marks: 1 }
    ];
    const codingTemplate = [
      { Question: 'Write a program to...', 'Sample Answer': 'int main() { ... }', Marks: 5 }
    ];

    const wb = XLSX.utils.book_new();
    const wsMCQ = XLSX.utils.json_to_sheet(mcqTemplate);
    const wsCoding = XLSX.utils.json_to_sheet(codingTemplate);

    XLSX.utils.book_append_sheet(wb, wsMCQ, "MCQs");
    XLSX.utils.book_append_sheet(wb, wsCoding, "Coding Questions");

    XLSX.writeFile(wb, "Exam_Template.xlsx");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });

      // Process MCQs
      const wsMCQ = wb.Sheets["MCQs"];
      let newMcqs = [];
      if (wsMCQ) {
        const dataMCQ = XLSX.utils.sheet_to_json(wsMCQ);
        newMcqs = dataMCQ.map((row, idx) => ({
          id: `xl-mcq-${Date.now()}-${idx}`,
          question: row.Question || '',
          options: [row['Option 1'] || '', row['Option 2'] || '', row['Option 3'] || '', row['Option 4'] || ''],
          answer: (parseInt(row['Correct Option (1-4)']) || 1) - 1,
          marks: parseInt(row.Marks) || 1
        }));
      }

      // Process Coding
      const wsCoding = wb.Sheets["Coding Questions"];
      let newCoding = [];
      if (wsCoding) {
        const dataCoding = XLSX.utils.sheet_to_json(wsCoding);
        newCoding = dataCoding.map((row, idx) => ({
          id: `xl-cq-${Date.now()}-${idx}`,
          question: row.Question || '',
          sampleAnswer: row['Sample Answer'] || '',
          marks: parseInt(row.Marks) || 5
        }));
      }

      setFormData(prev => ({
        ...prev,
        mcqs: [...prev.mcqs, ...newMcqs],
        codingQuestions: [...prev.codingQuestions, ...newCoding]
      }));
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/exams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rules: formData.rules.split('\n').filter(r => r.trim() !== '')
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update exam');

      router.push('/admin/exams');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container p-8 text-center">Loading exam configuration...</div>;

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-gradient">Edit Exam</h1>
        <div className="flex gap-2">
          <button type="button" onClick={downloadTemplate} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            Download Template
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx" 
            style={{ display: 'none' }} 
          />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            Upload Excel
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}

        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3>Basic Info</h3>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Exam Title</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>

          <div className="flex gap-4">
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Batch</label>
              <select required value={formData.batch} onChange={e => setFormData({...formData, batch: e.target.value})}>
                <option value="C">C Programming</option>
                <option value="Java">Java Programming</option>
                <option value="Python">Python Programming</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Duration (Mins)</label>
              <input type="number" required min="1" value={formData.duration} onChange={e => setFormData({...formData, duration: parseInt(e.target.value) || 0})} />
            </div>
          </div>

          <div className="flex gap-4">
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Max Attempts per Student</label>
              <input type="number" required min="1" value={formData.maxAttempts || 3} onChange={e => setFormData({...formData, maxAttempts: parseInt(e.target.value) || 1})} />
              <p style={{ fontSize: '0.8rem', color: 'var(--border)', marginTop: '0.25rem' }}>Set how many times a student can attempt this specific exam.</p>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Passing Threshold (%)</label>
              <input type="number" required min="1" max="100" value={formData.passingPercentage || 50} onChange={e => setFormData({...formData, passingPercentage: parseFloat(e.target.value) || 50})} />
              <p style={{ fontSize: '0.8rem', color: 'var(--border)', marginTop: '0.25rem' }}>Minimum percentage score required to log a 'pass' and generate a certificate.</p>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Exam Rules (One per line)</label>
            <textarea rows="4" value={formData.rules} onChange={e => setFormData({...formData, rules: e.target.value})} />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
           <div className="flex justify-between items-center mb-4">
              <h3>MCQ Questions</h3>
              <button type="button" className="btn btn-secondary" onClick={handleAddMCQ} style={{ padding: '0.5rem 1rem' }}>+ Add MCQ</button>
           </div>
           {formData.mcqs.map((mcq, idx) => (
             <div key={mcq.id || idx} className="mb-4" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)'}}>
                <div className="flex justify-between items-center mb-2">
                   <label>Question {idx + 1}</label>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Marks:</label>
                      <input type="number" style={{ width: '60px', padding: '0.2rem' }} value={mcq.marks} onChange={e => {
                        const newMcqs = [...formData.mcqs];
                        newMcqs[idx].marks = parseInt(e.target.value) || 0;
                        setFormData({...formData, mcqs: newMcqs});
                      }} />
                      <button type="button" className="text-danger" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => {
                        const newMcqs = formData.mcqs.filter((_, i) => i !== idx);
                        setFormData({...formData, mcqs: newMcqs});
                      }}>✕</button>
                   </div>
                </div>
                <input type="text" className="mb-2" value={mcq.question} onChange={e => {
                  const newMcqs = [...formData.mcqs];
                  newMcqs[idx].question = e.target.value;
                  setFormData({...formData, mcqs: newMcqs});
                }} placeholder="Question Text" required />

                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {mcq.options.map((opt, oIdx) => (
                    <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <input type="radio" style={{ width: 'auto' }} name={`mcq-ans-${idx}`} checked={mcq.answer === oIdx} onChange={() => {
                          const newMcqs = [...formData.mcqs];
                          newMcqs[idx].answer = oIdx;
                          setFormData({...formData, mcqs: newMcqs});
                       }} />
                       <input type="text" placeholder={`Option ${oIdx + 1}`} value={opt} onChange={e => {
                          const newMcqs = [...formData.mcqs];
                          newMcqs[idx].options[oIdx] = e.target.value;
                          setFormData({...formData, mcqs: newMcqs});
                       }} required />
                    </div>
                  ))}
                </div>
             </div>
           ))}
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
           <div className="flex justify-between items-center mb-4">
              <h3>Coding Questions</h3>
              <button type="button" className="btn btn-secondary" onClick={handleAddCoding} style={{ padding: '0.5rem 1rem' }}>+ Add Coding Q</button>
           </div>
           {formData.codingQuestions.map((cq, idx) => (
             <div key={cq.id || idx} className="mb-4" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)'}}>
                <div className="flex justify-between items-center mb-2">
                   <label>Coding Question {idx + 1}</label>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Marks:</label>
                      <input type="number" style={{ width: '60px', padding: '0.2rem' }} value={cq.marks} onChange={e => {
                        const newCQ = [...formData.codingQuestions];
                        newCQ[idx].marks = parseInt(e.target.value) || 0;
                        setFormData({...formData, codingQuestions: newCQ});
                      }} />
                      <button type="button" className="text-danger" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => {
                        const newCQ = formData.codingQuestions.filter((_, i) => i !== idx);
                        setFormData({...formData, codingQuestions: newCQ});
                      }}>✕</button>
                   </div>
                </div>
                <textarea rows="3" className="mb-2 mt-2" value={cq.question} onChange={e => {
                  const newCQ = [...formData.codingQuestions];
                  newCQ[idx].question = e.target.value;
                  setFormData({...formData, codingQuestions: newCQ});
                }} placeholder="Problem statement..." required />
                
                <label>Sample Answer (For Evaluation Reference)</label>
                <textarea rows="3" className="mt-2" value={cq.sampleAnswer} onChange={e => {
                  const newCQ = [...formData.codingQuestions];
                  newCQ[idx].sampleAnswer = e.target.value;
                  setFormData({...formData, codingQuestions: newCQ});
                }} placeholder="Reference code..." required />

             </div>
           ))}
        </div>

        <div className="flex gap-4 mb-8">
           <button type="button" onClick={() => router.back()} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
           <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
             {saving ? 'Saving...' : 'Update Exam Configuration'}
           </button>
        </div>
      </form>
    </div>
  );
}
