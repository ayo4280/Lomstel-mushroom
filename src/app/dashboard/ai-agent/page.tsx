"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bot, Play, Building2, MapPin, Phone, ExternalLink, Activity, Clock, Zap, CheckCircle, Loader2, Globe, Flag, Edit, Send, X } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';

const NIGERIA_KEYWORDS = [
  'nigeria', 'lagos', 'abuja', 'kano', 'ibadan', 'port harcourt', 'benin city',
  'onitsha', 'kaduna', 'enugu', 'aba', 'jos', 'ilorin', 'owerri', 'warri',
  'sokoto', 'maiduguri', 'uyo', 'abeokuta', 'akure'
];

function isNigerian(location: string): boolean {
  const loc = location.toLowerCase();
  return NIGERIA_KEYWORDS.some(kw => loc.includes(kw));
}

type Lead = {
  id: string;
  business_name: string;
  business_type: string;
  contact_info: string;
  location: string;
  source_url: string;
  status: string;
  created_at: string;
};

type AITask = {
  id: string;
  task_name: string;
  status: string;
  leads_found: number;
  logs: string;
  started_at: string;
  completed_at: string;
};

function getNextMonday(): string {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 1=Mon
  const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7;
  const next = new Date(now);
  next.setUTCDate(now.getUTCDate() + daysUntilMonday);
  next.setUTCHours(8, 0, 0, 0);
  return next.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ' at 08:00 UTC';
}

export default function AIAgentDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'national' | 'international'>('national');
  const [selectedLeadForReview, setSelectedLeadForReview] = useState<Lead | null>(null);
  const [customSubject, setCustomSubject] = useState('');
  const [customHtml, setCustomHtml] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [mounted, setMounted] = useState(false);

  const nationalLeads = leads.filter(l => isNigerian(l.location));
  const internationalLeads = leads.filter(l => !isNigerian(l.location));
  const displayedLeads = activeTab === 'national' ? nationalLeads : internationalLeads;

  useEffect(() => {
    setMounted(true);
    fetchData();

    const leadsSubscription = supabase
      .channel('leads_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchData();
      })
      .subscribe();

    const tasksSubscription = supabase
      .channel('tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_tasks' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(leadsSubscription);
      supabase.removeChannel(tasksSubscription);
    };
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [leadsResponse, tasksResponse] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('ai_tasks').select('*').order('started_at', { ascending: false }).limit(5)
      ]);
      if (leadsResponse.data) setLeads(leadsResponse.data);
      if (tasksResponse.data) setTasks(tasksResponse.data);
    } catch (error) {
      console.error('Error fetching AI data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunNow = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setRunStatus('running');
    try {
      const res = await fetch('/api/ai-agent/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start agent');
      setRunStatus('success');
      setTimeout(() => fetchData(), 3000);
    } catch (error: any) {
      console.error('Error running agent:', error);
      setRunStatus('error');
    } finally {
      setIsRunning(false);
      setTimeout(() => setRunStatus('idle'), 5000);
    }
  };

  const handleSendIntro = async (leadId: string, subject?: string, html?: string) => {
    try {
      setIsSending(true);
      setLeads(currentLeads =>
        currentLeads.map(l => l.id === leadId ? { ...l, status: 'Sending...' } : l)
      );
      const res = await fetch('/api/leads/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, customSubject: subject, customHtml: html })
      });
      if (!res.ok) throw new Error('Failed to send email');
      setLeads(currentLeads =>
        currentLeads.map(l => l.id === leadId ? { ...l, status: 'Contacted' } : l)
      );
      setSelectedLeadForReview(null);
    } catch (error) {
      console.error('Error sending intro:', error);
      alert('Failed to send intro email.');
      fetchData();
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenReview = (lead: Lead) => {
    setSelectedLeadForReview(lead);
    setCustomSubject(`Partnership Opportunity: Bulk Oyster Mushroom Supply for ${lead.business_name}`);
    setCustomHtml(`
<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
  <h2>Hello from Lomstel Limited!</h2>
  <p>We noticed that <strong>${lead.business_name}</strong> is a prominent player in the food industry.</p>
  <p>We are a premium supplier of high-quality White Oyster Mushrooms, and we currently have a <strong>2-ton (2,000kg) harvest of premium dry mushrooms</strong> available for immediate off-take.</p>
  <p>Our mushrooms are organically grown, NAFDAC certified, and perfect for industrial food processing, healthy retail, or institutional catering.</p>
  <p>Would you be interested in a sample or discussing a bulk supply contract?</p>
  <br/>
  <p>Best regards,<br/>
  <strong>Lomstel Limited Sales Team</strong><br/>
  <a href="mailto:sales@lomstel.com">sales@lomstel.com</a> | <a href="https://lomstel.com">lomstel.com</a></p>
</div>
    `.trim());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }} className="animate-fade-in">
      <header>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '0.5rem', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bot style={{ color: 'var(--color-forest-500)' }} size={40} />
          AI Lead Generator
        </h1>
        <p style={{ fontSize: '1.1rem' }}>Automatically find and contact potential buyers worldwide.</p>
      </header>

      {/* Control Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

        {/* Manual Run Card */}
        <div className="glass" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: 'var(--color-forest-100)', borderRadius: '12px', padding: '0.75rem', color: 'var(--color-forest-600)' }}>
              <Zap size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-earth-900)' }}>Manual Run</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Trigger the agent right now</div>
            </div>
          </div>

          <button
            id="run-agent-now-btn"
            onClick={handleRunNow}
            disabled={isRunning}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              backgroundColor: isRunning ? 'var(--color-earth-200)' : 'var(--color-forest-600)',
              color: 'white', border: 'none', borderRadius: '10px',
              padding: '0.875rem 1.25rem', fontSize: '0.95rem', fontWeight: 700,
              cursor: isRunning ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
              opacity: isRunning ? 0.8 : 1,
            }}
          >
            {isRunning
              ? <><Loader2 size={18} className="animate-spin" /> Running Agent...</>
              : <><Play size={18} /> Run Agent Now</>
            }
          </button>

          {runStatus === 'success' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-forest-600)', fontSize: '0.9rem', fontWeight: 600 }}>
              <CheckCircle size={16} /> Agent started! Check Activity Log below.
            </div>
          )}
          {runStatus === 'error' && (
            <div style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 600 }}>
              ❌ Failed to start. Please try again.
            </div>
          )}
        </div>

        {/* Auto Schedule Card */}
        <div className="glass" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#f0f4ff', borderRadius: '12px', padding: '0.75rem', color: '#4361ee' }}>
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-earth-900)' }}>Auto Schedule</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Every Monday at 08:00 UTC</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(67,97,238,0.06)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#4361ee', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Next Scheduled Run</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-earth-900)' }}>{getNextMonday()}</div>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            ✅ Runs automatically when deployed to <strong>Vercel</strong>.<br />
            New leads appear in the table after each weekly run.
          </div>
        </div>

        {/* Stats Card */}
        <div className="glass" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: 'var(--color-earth-100)', borderRadius: '12px', padding: '0.75rem', color: 'var(--color-earth-600)' }}>
              <Building2 size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-earth-900)' }}>Lead Stats</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>All-time overview</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-forest-600)' }}>{leads.length}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Leads</div>
            </div>
            <div style={{ textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4361ee' }}>{leads.filter(l => l.status === 'Contacted').length}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contacted</div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section: Leads Table + Activity Log */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>

        {/* Leads Table */}
        <div className="glass" style={{ flex: '1 1 600px', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-earth-900)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Building2 size={24} style={{ color: 'var(--color-forest-500)' }} />
              Generated Leads
            </h2>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '12px', padding: '4px' }}>
              <button
                onClick={() => setActiveTab('national')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 1rem', borderRadius: '9px', border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s',
                  backgroundColor: activeTab === 'national' ? 'white' : 'transparent',
                  color: activeTab === 'national' ? 'var(--color-forest-700)' : 'var(--text-muted)',
                  boxShadow: activeTab === 'national' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <Flag size={15} />
                🇳🇬 National
                <span style={{ backgroundColor: activeTab === 'national' ? 'var(--color-forest-100)' : 'rgba(0,0,0,0.08)', color: activeTab === 'national' ? 'var(--color-forest-700)' : 'var(--text-muted)', borderRadius: '999px', padding: '1px 8px', fontSize: '0.75rem' }}>
                  {nationalLeads.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('international')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 1rem', borderRadius: '9px', border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s',
                  backgroundColor: activeTab === 'international' ? 'white' : 'transparent',
                  color: activeTab === 'international' ? '#4361ee' : 'var(--text-muted)',
                  boxShadow: activeTab === 'international' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <Globe size={15} />
                🌍 International
                <span style={{ backgroundColor: activeTab === 'international' ? '#f0f4ff' : 'rgba(0,0,0,0.08)', color: activeTab === 'international' ? '#4361ee' : 'var(--text-muted)', borderRadius: '999px', padding: '1px 8px', fontSize: '0.75rem' }}>
                  {internationalLeads.length}
                </span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <Loader2 size={18} className="animate-spin" /> Loading leads...
            </div>
          ) : leads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Bot size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p style={{ fontWeight: 600 }}>No leads yet.</p>
              <p>Click <strong>"Run Agent Now"</strong> above to get started!</p>
            </div>
          ) : displayedLeads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              {activeTab === 'national'
                ? <><Flag size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} /><p style={{ fontWeight: 600 }}>No Nigerian leads yet.</p><p>Run the agent to find local buyers.</p></>
                : <><Globe size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} /><p style={{ fontWeight: 600 }}>No international leads yet.</p><p>Run the agent to find global buyers.</p></>}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.05)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '1rem 0.5rem' }}>Business Name</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Contact</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Location</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                    <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedLeads.map(lead => (
                    <tr key={lead.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <div style={{ fontWeight: 500, color: 'var(--color-earth-900)' }}>{lead.business_name}</div>
                        <a href={lead.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--color-forest-500)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          Source <ExternalLink size={12} />
                        </a>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                          <Phone size={16} style={{ color: 'var(--text-muted)' }} />
                          {lead.contact_info}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', maxWidth: '200px' }}>
                          <MapPin size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.location}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          backgroundColor: lead.status === 'Contacted' ? 'var(--color-forest-100)' : 'var(--color-earth-100)',
                          color: lead.status === 'Contacted' ? 'var(--color-forest-700)' : 'var(--color-earth-700)'
                        }}>
                          {lead.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                        {lead.status === 'New' && (
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleOpenReview(lead)}
                              style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'transparent', border: '1px solid var(--color-forest-500)', color: 'var(--color-forest-700)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                            >
                              <Edit size={14} /> Review
                            </button>
                            <button
                              onClick={() => handleSendIntro(lead.id)}
                              className="btn-primary"
                              style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <Send size={14} /> Auto Send
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div className="glass" style={{ flex: '1 1 300px', padding: '2rem', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--color-earth-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} style={{ color: 'var(--color-forest-500)' }} />
            Agent Activity Log
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tasks.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No recent agent activity.</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} style={{ borderLeft: `3px solid ${task.status === 'Running' ? '#f59e0b' : task.status === 'Completed' ? 'var(--color-forest-500)' : '#ef4444'}`, paddingLeft: '1rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>{task.task_name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>
                    Status: <strong style={{ color: task.status === 'Running' ? '#f59e0b' : task.status === 'Completed' ? 'var(--color-forest-500)' : '#ef4444' }}>{task.status}</strong>
                  </div>
                  {task.status === 'Completed' && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-earth-700)' }}>
                      Found {task.leads_found} new leads.
                    </div>
                  )}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {new Date(task.started_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Review & Edit Modal */}
      {mounted && selectedLeadForReview && createPortal(
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '650px', padding: '2.5rem', position: 'relative', borderRadius: '16px', backgroundColor: 'white', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <button onClick={() => setSelectedLeadForReview(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={24} />
            </button>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-earth-900)', marginTop: 0 }}>
              Review Letter to {selectedLeadForReview.business_name}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Edit the subject and body below before sending.</p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-earth-900)', marginBottom: '0.5rem' }}>Subject</label>
              <input 
                type="text" 
                value={customSubject}
                onChange={e => setCustomSubject(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none', fontSize: '0.95rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-earth-900)', marginBottom: '0.5rem' }}>HTML Body</label>
              <textarea 
                value={customHtml}
                onChange={e => setCustomHtml(e.target.value)}
                rows={12}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none', fontSize: '0.9rem', fontFamily: 'monospace', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setSelectedLeadForReview(null)}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', background: 'white', cursor: 'pointer', fontWeight: 600, color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleSendIntro(selectedLeadForReview.id, customSubject, customHtml)}
                disabled={isSending}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: 'none', background: 'var(--color-forest-600)', color: 'white', cursor: isSending ? 'not-allowed' : 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isSending ? 'Sending...' : 'Send Letter'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
