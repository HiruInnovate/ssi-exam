'use client';

import { useState, useEffect } from 'react';
import { Mail, Bot, CheckSquare, Square, Send, Search, Users, AlertCircle, Sparkles, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useModal } from '@/lib/contexts/ModalContext';

export default function BulkMailPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useModal();

  // Filters & Selection
  const [selectedFilters, setSelectedFilters] = useState(['C', 'Java', 'Python']);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // AI & Drafting
  const [prompt, setPrompt] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Sending
  const [isSending, setIsSending] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  
  const [sendProgress, setSendProgress] = useState({ total: 0, sent: 0, failed: [] });
  const [isSendingComplete, setIsSendingComplete] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/students');
      if (!res.ok) throw new Error('Failed to fetch students');
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      showAlert('Error', err.message, 'DANGER');
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (filter) => {
    setSelectedFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const filteredStudents = students.filter(student => {
    if (!student.batch || !Array.isArray(student.batch)) return false;
    return student.batch.some(b => selectedFilters.includes(b));
  });

  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudentIds([]); 
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s._id)); 
    }
  };

  const handleSelectStudent = (id) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(studentId => studentId !== id) : [...prev, id]
    );
  };

  const handleDraftWithAI = async () => {
    if (!prompt.trim()) {
      showAlert('Warning', 'Please provide a prompt for the AI to draft the email.', 'WARNING');
      return;
    }
    
    try {
      setIsDrafting(true);
      const contextStr = selectedFilters.join(', ') + ' students';
      const res = await fetch('/api/admin/mail/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context: contextStr })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to draft email');
      
      setEmailBody(data.draft);
      if (!emailSubject) {
        setEmailSubject('Important Update from Study Smart Innovations');
      }
      setPreviewMode(true);
    } catch (error) {
      showAlert('Error', error.message, 'DANGER');
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSendEmails = async () => {
    if (selectedStudentIds.length === 0) {
      showAlert('Warning', 'Please select at least one student.', 'WARNING');
      return;
    }
    if (!emailSubject.trim() || !emailBody.trim()) {
      showAlert('Warning', 'Please provide an email subject and body.', 'WARNING');
      return;
    }

    setIsSending(true);
    setIsSendingComplete(false);
    setSendProgress({ total: selectedStudentIds.length, sent: 0, failed: [] });

    // Hostinger Batching logic
    const BATCH_SIZE = 15;
    const batches = [];
    for (let i = 0; i < selectedStudentIds.length; i += BATCH_SIZE) {
      batches.push(selectedStudentIds.slice(i, i + BATCH_SIZE));
    }

    let globalSent = 0;
    const globalFailed = [];

    for (let i = 0; i < batches.length; i++) {
      const batchIds = batches[i];
      try {
        const res = await fetch('/api/admin/mail/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentIds: batchIds,
            subject: emailSubject,
            htmlBody: emailBody
          })
        });

        const data = await res.json();
        
        if (res.ok) {
            globalSent += data.successCount;
            if (data.failedEmails && data.failedEmails.length > 0) {
                globalFailed.push(...data.failedEmails);
            }
        } else {
            // Whole batch failed via backend response error
            globalFailed.push(...batchIds.map(id => ({ id, reason: data.error || 'Batch rejection' })));
        }

      } catch (error) {
        console.error("Batch error:", error);
        // Network or fetch level error
        globalFailed.push(...batchIds.map(id => ({ id, reason: 'Network failure' })));
      }

      setSendProgress({ total: selectedStudentIds.length, sent: globalSent, failed: [...globalFailed] });

      // Delay between batches to prevent spam-blocking
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    setIsSending(false);
    setIsSendingComplete(true);
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Loading Broadcast Studio...</p>
    </div>
  );

  return (
    <div className="relative animate-fade-in" style={{ paddingBottom: '3rem' }}>
      
      <div className="admin-header pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', margin: 0 }}>
            Broadcast Studio
          </h1>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.7 }}>
            Filter groups, craft using AI, and send dynamic communications.
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '1rem', 
          background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1.25rem', 
          borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--border)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>Audience</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', lineHeight: 1 }}>
              {selectedStudentIds.length} <span style={{ fontSize: '0.875rem', fontWeight: 'normal', opacity: 0.5 }}>Selected</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Left Column: Audience Targeting */}
        <div style={{ gridColumn: 'span 1' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden', height: isFiltersOpen ? '100%' : 'auto' }}>
            
            <div 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: isFiltersOpen ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingBottom: isFiltersOpen ? '1rem' : '0', marginBottom: isFiltersOpen ? '1.5rem' : '0', cursor: 'pointer' }}
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', color: 'white', margin: 0 }}>
                <Search size={20} color="var(--primary)" /> Targeting & Filters
              </h3>
              <div style={{ color: 'var(--border)' }}>
                {isFiltersOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>
            
            <div style={{ display: isFiltersOpen ? 'block' : 'none' }}>
              <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--border)', marginBottom: '0.75rem', display: 'block' }}>Filter by Curriculum</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['C', 'Java', 'Python'].map(filter => {
                  const isActive = selectedFilters.includes(filter);
                  return (
                    <button
                      key={filter}
                      onClick={() => toggleFilter(filter)}
                      style={{
                        padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                        background: isActive ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                        boxShadow: isActive ? '0 4px 15px rgba(16, 185, 129, 0.1)' : 'none'
                      }}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', display: 'flex', flexDirection: 'column', height: '420px', overflow: 'hidden' }}>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
                onClick={handleSelectAll}
              >
                 {selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0 ? (
                   <CheckCircle2 size={20} color="var(--primary)" />
                 ) : (
                   <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.3)' }}></div>
                 )}
                 <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                   Select All Directory ({filteredStudents.length})
                 </span>
              </div>
              
              <div className="custom-scrollbar" style={{ overflowY: 'auto', flex: 1 }}>
                {filteredStudents.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.4, padding: '1.5rem', textAlign: 'center' }}>
                    <Users size={32} style={{ marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '0.875rem' }}>No students match current filters.</p>
                  </div>
                ) : (
                  filteredStudents.map((student, idx) => (
                    <div 
                      key={student._id} 
                      className="animate-fade-in"
                      style={{ 
                        animationDelay: `${idx * 0.03}s`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                        padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'background 0.2s'
                      }}
                      onClick={() => handleSelectStudent(student._id)}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {selectedStudentIds.includes(student._id) ? (
                          <CheckCircle2 size={18} color="var(--primary)" />
                        ) : (
                          <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }}></div>
                        )}
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'white' }}>{student.name}</div>
                          <div style={{ fontSize: '0.7rem', opacity: 0.6, maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'monospace', marginTop: '0.1rem' }}>{student.email}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.25rem', opacity: 0.6 }}>
                        {student.batch?.map(b => (
                          <span key={b} style={{ fontSize: '0.65rem', padding: '0.15rem 0.35rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.2rem', textTransform: 'uppercase' }}>
                            {b.charAt(0)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Prompt & Editor */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Section 1: AI Prompting */}
          <div className="glass-panel text-center" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.25rem' }}>
                  <Bot size={24} color="#a855f7" /> Co-Pilot Assistant
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--border)', letterSpacing: '1px' }}>Powered by ChatGPT-3.5</p>
              </div>
              <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 'bold', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Sparkles size={12} /> Magic Draft
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '1.25rem', color: 'var(--foreground)', lineHeight: 1.6, textAlign: 'left' }}>
              Define the persona and purpose. E.g. "Draft an encouraging email welcoming Python students containing expectations."
            </p>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="custom-scrollbar"
              placeholder="Instruct the AI here..."
              rows={3}
              style={{ width: '100%', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '1rem 1.25rem', fontFamily: 'monospace', fontSize: '0.875rem', resize: 'vertical', marginBottom: '1rem', outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = '#a855f7'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleDraftWithAI}
                disabled={isDrafting}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 2rem', borderRadius: '0.5rem', fontWeight: 'bold', letterSpacing: '0.5px', cursor: isDrafting ? 'not-allowed' : 'pointer', border: 'none', transition: 'all 0.3s',
                  background: isDrafting ? 'rgba(255,255,255,0.1)' : 'linear-gradient(to right, #9333ea, #4f46e5)', color: isDrafting ? 'var(--border)' : 'white'
                }}
              >
                {isDrafting ? 'Synthesizing...' : <><Sparkles size={18} /> Generate Draft</>}
              </button>
            </div>
          </div>

          {/* Section 2: Editor & Sending */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--primary)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white', lineHeight: 1.2 }}>Transmission Deck</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--border)', letterSpacing: '1px' }}>Review & Dispatch</div>
                  </div>
                </div>
                
                {emailBody && (
                   <button 
                     onClick={() => setPreviewMode(!previewMode)}
                     style={{
                        fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', padding: '0.5rem 1rem', borderRadius: '0.5rem',
                        border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s',
                        color: previewMode ? 'var(--border)' : 'var(--primary)'
                     }}
                     onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                     onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                   >
                     {previewMode ? 'Switch to Source' : 'Switch to Visual'}
                   </button>
                )}
             </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div>
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--border)', marginBottom: '0.5rem', display: 'block', fontWeight: 'bold' }}>Subject Line</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter Subject..."
                  style={{ width: '100%', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.75rem 1rem', fontSize: '1.125rem', outline: 'none' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                   <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--border)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      Message Content
                      <AlertCircle size={14} color="#60a5fa" title="Use {{name}} in your HTML to instantly inject each student's name securely during dispatch." style={{ cursor: 'help' }} />
                   </label>
                   
                   <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.5)' }}></span>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(234, 179, 8, 0.5)' }}></span>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.5)' }}></span>
                   </div>
                </div>
                
                <div style={{ borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: '#0f111a', position: 'relative' }}>
                  {previewMode ? (
                    <div 
                      className="custom-scrollbar"
                      style={{ padding: '2rem', background: 'white', minHeight: '400px', maxHeight: '600px', overflowY: 'auto', color: '#1e293b', borderLeft: '4px solid var(--primary)' }}
                      title="Preview Mode"
                      dangerouslySetInnerHTML={{ __html: emailBody || '<span style="color:#aaa; font-style:italic;">Visual render canvas empty...</span>' }}
                    />
                  ) : (
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="custom-scrollbar"
                      placeholder="<!-- Inject your HTML blocks here -->&#10;<p>Greetings {{name}},</p>"
                      style={{ width: '100%', background: 'transparent', color: 'var(--primary)', fontFamily: 'monospace', fontSize: '13px', padding: '1rem 1.25rem', minHeight: '400px', border: 'none', outline: 'none', resize: 'vertical' }}
                      spellCheck="false"
                    />
                  )}
                </div>
              </div>

            </div>
          </div>
          
          {/* Dispatch Action & Progress Segment */}
          {isSending || isSendingComplete ? (
            <div className="animate-fade-in" style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                 <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   {isSendingComplete ? <CheckCircle2 size={18} color="var(--primary)" /> : <div className="loader" style={{ width: '14px', height: '14px', borderWidth: '2px', borderColor: 'var(--primary) transparent var(--primary) transparent' }}></div>}
                   {isSending ? 'Transmitting Emails...' : 'Transmission Complete'}
                 </div>
                 <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{sendProgress.sent + sendProgress.failed.length} / {sendProgress.total}</div>
              </div>
              
              {/* Progress Bar Container */}
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                 <div style={{ 
                   height: '100%', 
                   background: isSendingComplete ? 'var(--primary)' : 'linear-gradient(90deg, var(--primary), var(--accent))', 
                   width: `${((sendProgress.sent + sendProgress.failed.length) / sendProgress.total) * 100}%`,
                   transition: 'width 0.5s ease-in-out'
                 }}></div>
              </div>

              {isSendingComplete && (
                 <div className="animate-fade-in" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                       <b>Successfully Delivered: {sendProgress.sent}</b>
                    </div>
                    
                    {sendProgress.failed.length > 0 && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                         <div style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '0.5rem' }}>Failed Deliveries ({sendProgress.failed.length}):</div>
                         <ul className="custom-scrollbar" style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.875rem', maxHeight: '150px', overflowY: 'auto' }}>
                           {sendProgress.failed.map((f, i) => (
                              <li key={i} style={{ marginBottom: '0.25rem', color: 'rgba(255,255,255,0.8)' }}>
                                 {f.name || f.email || f.id} <span style={{ opacity: 0.6 }}>- {f.reason}</span>
                              </li>
                           ))}
                         </ul>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                      <button 
                        onClick={() => { setIsSendingComplete(false); setSendProgress({ total: 0, sent: 0, failed: [] }); }}
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      >
                        Dismiss & Reset Status
                      </button>
                    </div>
                 </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
               <div style={{ flex: 1, padding: '0 1rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Ready for Dispatch?</div>
                  <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>You are about to transmit this message to <b style={{ color: 'var(--primary)' }}>{selectedStudentIds.length}</b> verified students. Sent in batches of 15 to bypass SMTP limits.</p>
               </div>
               <button 
                  className={selectedStudentIds.length > 0 && !isSending ? 'animate-bounce-slight' : ''}
                  onClick={handleSendEmails}
                  disabled={selectedStudentIds.length === 0 || !emailSubject.trim() || !emailBody.trim()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', borderRadius: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', cursor: (selectedStudentIds.length === 0 || !emailSubject.trim() || !emailBody.trim()) ? 'not-allowed' : 'pointer', border: 'none', transition: 'all 0.3s',
                    background: (selectedStudentIds.length === 0 || !emailSubject.trim() || !emailBody.trim()) ? 'rgba(255,255,255,0.05)' : 'linear-gradient(to right, var(--primary), var(--accent))', color: (selectedStudentIds.length === 0 || !emailSubject.trim() || !emailBody.trim()) ? 'rgba(255,255,255,0.3)' : 'white'
                  }}
                >
                  <Send size={20} /> Engage Delivery
                </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
