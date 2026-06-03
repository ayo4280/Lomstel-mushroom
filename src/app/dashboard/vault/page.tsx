"use client"

import { useState, useEffect } from "react";
import { fetchCertificates, uploadCertificate, deleteCertificate, Certificate } from "@/lib/services/vault";
import { supabase } from "@/utils/supabase/client";

export default function VaultPage() {
  const [documents, setDocuments] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userRole, setUserRole] = useState<string>('BUYER');

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Export');
  const [issued, setIssued] = useState('');
  const [expiry, setExpiry] = useState('');
  const [result, setResult] = useState('');

  const loadCertificates = async () => {
    setLoading(true);
    const certs = await fetchCertificates();
    setDocuments(certs);
    setLoading(false);
  };

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role) {
          setUserRole(profile.role);
        }
      }
    };
    checkRole();
    loadCertificates();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setUploading(true);
    const res = await uploadCertificate(file, title, type, issued, expiry, result);
    
    if (res.success) {
      setIsModalOpen(false);
      setFile(null);
      setTitle('');
      setIssued('');
      setExpiry('');
      setResult('');
      await loadCertificates(); // Refresh list
    } else {
      alert(`Upload failed: ${res.error}`);
    }
    setUploading(false);
  };

  return (
    <div className="px-6 max-w-5xl mx-auto py-8">
      {/* Page Hero / Identity */}
      <section className="mb-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="text-primary font-bold tracking-widest text-[10px] uppercase block mb-1">Global Compliance</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">Certificate Vault</h2>
          </div>
          <div className="hidden md:flex gap-3">
            <button 
              className="glass text-primary px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-white/60 transition-all shadow-sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Vault link copied to clipboard!");
              }}
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
              Share Vault Link
            </button>
            {['ADMIN', 'FARM_WORKER'].includes(userRole) && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-primary-container hover:text-primary transition-colors shadow-lg shadow-primary/10"
              >
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                Upload New CoA
              </button>
            )}
          </div>
        </div>
        <p className="text-on-surface-variant max-w-xl body-md leading-relaxed">
          Immutable verification for international trade. Your Certificate of Analysis (CoA) records are cryptographically secured and ready for shipment verification.
        </p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass p-6 rounded-xl relative overflow-hidden group border border-outline-variant/10">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-[120px] fill-current">verified</span>
          </div>
          <p className="text-xs text-on-surface-variant font-medium mb-1 uppercase tracking-widest">Active Certs</p>
          <h3 className="text-4xl font-bold text-primary">{documents.length}</h3>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-primary-fixed text-on-primary-fixed-variant text-[10px] px-2 py-0.5 rounded-full font-bold">ALL VERIFIED</span>
          </div>
        </div>
        <div className="glass p-6 rounded-xl border border-outline-variant/10">
          <p className="text-xs text-on-surface-variant font-medium mb-1 uppercase tracking-widest">Expiring Soon</p>
          <h3 className="text-4xl font-bold text-tertiary-container">02</h3>
          <p className="text-[11px] text-on-surface-variant mt-4 font-medium">Next: Organic Renewal (14 days)</p>
        </div>
        <div className="glass p-6 rounded-xl border border-outline-variant/10">
          <p className="text-xs text-on-surface-variant font-medium mb-1 uppercase tracking-widest">Vault Storage</p>
          <h3 className="text-4xl font-bold text-secondary">82%</h3>
          <div className="w-full bg-outline-variant/20 h-1.5 rounded-full mt-5 overflow-hidden">
            <div className="bg-primary h-full w-[82%]"></div>
          </div>
        </div>
      </div>

      {/* Certificate List */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-on-surface-variant tracking-widest uppercase mb-4 px-2">Document Registry</h4>
        
        {loading ? (
          <div className="text-center py-10 text-on-surface-variant">Loading certificates...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-10 bg-surface-container-lowest rounded-xl border border-outline-variant/10">
            <p className="text-on-surface-variant">No certificates uploaded yet.</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="group glass hover:-translate-y-0.5 transition-all duration-300 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-6 shadow-sm hover:shadow-md border border-outline-variant/5">
              <div className={`w-14 h-14 ${doc.colorClass || 'bg-surface-container-highest text-on-surface-variant'} rounded-xl flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-3xl">{doc.icon || 'description'}</span>
              </div>
              <div className="flex-grow">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold text-on-surface text-lg">{doc.title}</h3>
                  <span className={`${doc.colorClass || 'bg-surface-container-highest text-on-surface-variant'} text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider`}>
                    {doc.type}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-on-surface-variant text-sm font-medium">
                  {doc.issued && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">calendar_today</span> 
                      Issued {doc.issued}
                    </span>
                  )}
                  {doc.expiry && (
                    <span className={`flex items-center gap-1 ${doc.warning ? "text-tertiary font-bold" : ""}`}>
                      <span className="material-symbols-outlined text-sm">{doc.warning ? "warning" : "database"}</span>
                      {doc.expiry}
                    </span>
                  )}
                  {doc.result && (
                     <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">opacity</span>
                      {doc.result}
                     </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={doc.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none border border-outline-variant/30 hover:bg-surface-container-low text-on-surface px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">visibility</span> View File
                </a>
                {['ADMIN', 'FARM_WORKER'].includes(userRole) && (
                  <button
                    onClick={async () => {
                      if (!confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
                      const res = await deleteCertificate(doc.id, doc.file_url);
                      if (res.success) {
                        await loadCertificates();
                      } else {
                        alert(`Delete failed: ${res.error}`);
                      }
                    }}
                    className="flex-none border border-red-200 hover:bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    title="Delete certificate"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span> Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-xl font-bold mb-4">Upload New Certificate</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input 
                  required
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 rounded-lg bg-surface-container border border-outline-variant focus:outline-none focus:border-primary" 
                  placeholder="e.g., NAFDAC Quality Export Permit" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-2 rounded-lg bg-surface-container border border-outline-variant focus:outline-none focus:border-primary"
                  >
                    <option>Export</option>
                    <option>Global Std</option>
                    <option>Batch Ref</option>
                    <option>Organic</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Issued Date</label>
                  <input 
                    type="text" 
                    value={issued}
                    onChange={(e) => setIssued(e.target.value)}
                    className="w-full p-2 rounded-lg bg-surface-container border border-outline-variant focus:outline-none focus:border-primary" 
                    placeholder="e.g., Oct 12, 2023" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry</label>
                  <input 
                    type="text" 
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full p-2 rounded-lg bg-surface-container border border-outline-variant focus:outline-none focus:border-primary" 
                    placeholder="e.g., Expires in 14 days" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lab Result (Optional)</label>
                  <input 
                    type="text" 
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    className="w-full p-2 rounded-lg bg-surface-container border border-outline-variant focus:outline-none focus:border-primary" 
                    placeholder="e.g., 12.4% CMC" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">File (PDF/Image)</label>
                <input 
                  required
                  type="file" 
                  accept=".pdf,image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full p-2 rounded-lg bg-surface-container border border-outline-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-container file:text-primary hover:file:bg-primary-container/80" 
                />
              </div>
              <button 
                type="submit" 
                disabled={uploading || !file || !title}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <>Uploading...</>
                ) : (
                  <>
                    <span className="material-symbols-outlined">cloud_upload</span>
                    Upload Certificate
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lab Test CTA Card */}
      <div className="mt-12 bg-primary-container p-8 rounded-[2rem] text-on-primary-container flex flex-col md:flex-row items-center gap-8 overflow-hidden relative">
        <div className="absolute -right-10 -bottom-10 opacity-10">
          <span className="material-symbols-outlined text-[200px] fill-current">shield_with_heart</span>
        </div>
        <div className="relative z-10 flex-grow text-center md:text-left">
          <h4 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Need specific batch testing?</h4>
          <p className="text-primary-fixed-dim max-w-sm mb-6">Order high-precision moisture, purity, or chemical analysis for any active shipment batch.</p>
          <button className="bg-tertiary-container text-on-tertiary-container px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 mx-auto md:mx-0 active:scale-95 transition-transform">
            Request Lab Test
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
        <div className="w-full md:w-64 h-48 rounded-2xl overflow-hidden shadow-2xl relative z-10 shrink-0 border border-white/10">
          <img 
            alt="Laboratory" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJEIWdIPVf7mPetSvmdhnmV8PVoa2FfL43TMYBE8X0Vmj2tcdjo79b7RdYQb21Z0UvdZNp3_SbwQ_Xc8Fo_GwWbx7efstS4nQ7Y2KD-UwO8zhGJUvr3QMyohAGOWs73epLFLmQaeEbXXOmpSIqFE559y29rYCu6eJXASmCa71zF-oQLe_NHbKKHoXdKJqbhTKTTWKqIdBsKjLEMJHBm6Dm0IMShrhpPxOPDALQmWD1eIyxlcJ4yl-VYFWXa2_YCXcVfu7zzrBNWkPb"
          />
        </div>
      </div>
    </div>
  );
}
