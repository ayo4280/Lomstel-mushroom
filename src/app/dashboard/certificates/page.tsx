"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, FileText, Upload, Download, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';

type Certificate = {
  id: string;
  title: string;
  file_url: string;
  created_at: string;
};

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchUserRoleAndCertificates = useCallback(async () => {
    setIsLoading(true);

    // Step 1: Get user role (safe — won't block certificates if it fails)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle(); // safe — returns null instead of throwing if no row found

        if (profile) setUserRole(profile.role);
      }
    } catch (profileErr: any) {
      console.warn('Could not load profile role:', profileErr?.message);
    }

    // Step 2: Fetch certificates independently
    try {
      const { data: certs, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Certificates fetch error:', error.message, '|', error.details, '|', error.hint);
      } else {
        setCertificates(certs || []);
      }
    } catch (certErr: any) {
      console.error('Certificates exception:', certErr?.message || certErr);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserRoleAndCertificates();
  }, [fetchUserRoleAndCertificates]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    setIsUploading(true);

    try {
      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('certificates')
        .getPublicUrl(filePath);

      // 3. Get logged-in user for uploaded_by field
      const { data: { user } } = await supabase.auth.getUser();

      // 4. Save to Database
      const { error: dbError } = await supabase
        .from('certificates')
        .insert([{ 
          title: file.name, 
          file_url: publicUrlData.publicUrl,
          uploaded_by: user?.id ?? null,
        }]);

      if (dbError) {
        console.error('DB insert error:', dbError.message, dbError.details);
        throw dbError;
      }

      // 5. Refresh List
      await fetchUserRoleAndCertificates();

    } catch (error: any) {
      console.error('Error uploading file:', error?.message || JSON.stringify(error));
      alert('Failed to upload file: ' + (error?.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleDelete = async (cert: Certificate) => {
    if (!confirm(`Are you sure you want to delete "${cert.title}"?`)) return;

    try {
      const fileName = cert.file_url.split('/').pop();
      if (fileName) {
        const { error: storageError } = await supabase.storage.from('certificates').remove([fileName]);
        if (storageError) console.error('Storage deletion error:', storageError);
      }

      const { error: dbError } = await supabase.from('certificates').delete().eq('id', cert.id);
      if (dbError) throw dbError;

      await fetchUserRoleAndCertificates();
    } catch (error: any) {
      console.error('Error deleting certificate:', error?.message || error);
      alert('Failed to delete certificate: ' + (error?.message || 'Unknown error'));
    }
  };

  const canUpload = true; // userRole === 'ADMIN' || userRole === 'FARM_WORKER';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }} className="animate-fade-in">
      <header>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '0.5rem', letterSpacing: '-1px' }}>Certificate Vault</h1>
        <p style={{ fontSize: '1.1rem' }}>Securely manage your NAFDAC certifications, organic status, and lab results.</p>
      </header>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Upload Section */}
        {canUpload && (
          <div className="glass" style={{ flex: '1 1 300px', padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}>
            <div style={{ backgroundColor: 'var(--color-forest-100)', padding: '1rem', borderRadius: '50%', color: 'var(--color-forest-500)' }}>
              <Upload size={32} />
            </div>
            <div>
              <h2 style={{ color: 'var(--color-earth-900)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Upload Document</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Upload new compliance certificates (PDFs, Images).</p>
            </div>
            
            <label className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isUploading ? 'not-allowed' : 'pointer', opacity: isUploading ? 0.7 : 1 }}>
              {isUploading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
              {isUploading ? 'Uploading...' : 'Select File'}
              <input 
                type="file" 
                accept=".pdf,image/*" 
                style={{ display: 'none' }} 
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        )}

        {/* Certificate List Section */}
        <div className="glass" style={{ flex: '2 1 500px', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <Shield size={24} style={{ color: 'var(--color-forest-500)' }} />
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-earth-900)' }}>Vault Contents</h2>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-forest-500)' }} />
            </div>
          ) : certificates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <p>No certificates have been uploaded yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {certificates.map((cert) => (
                <div key={cert.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'var(--color-earth-100)', padding: '0.75rem', borderRadius: '8px', color: 'var(--color-earth-600)' }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--color-earth-900)' }}>{cert.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(cert.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a 
                      href={cert.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                    >
                      <Download size={16} />
                      View
                    </a>
                    {userRole === 'ADMIN' && (
                      <button
                        onClick={() => handleDelete(cert)}
                        className="btn-secondary"
                        style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#e74c3c', borderColor: '#fadbd8', backgroundColor: '#fdf2e9' }}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
