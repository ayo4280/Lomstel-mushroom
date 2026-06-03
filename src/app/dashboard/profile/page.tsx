"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<{
    id: string;
    name: string;
    role: string;
    email: string;
  } | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User';
        setUserProfile({
          id: user.id,
          name,
          role: user.user_metadata?.role || 'FARM_WORKER',
          email: user.email || ''
        });
        setEditName(name);
      }
    }
    loadUser();
  }, []);

  const handleSave = async () => {
    if (!userProfile) return;
    setIsSaving(true);
    try {
      // Update Auth metadata
      await supabase.auth.updateUser({
        data: { full_name: editName }
      });
      // Update public profiles table
      await supabase.from('profiles').update({ full_name: editName }).eq('id', userProfile.id);
      
      setUserProfile({ ...userProfile, name: editName });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const staticStats = [
    { label: "Total Traded", value: "2.4k MT" },
    { label: "Success Rate", value: "98.2%" },
    { label: "Active Hubs", value: "04" }
  ];

  return (
    <div className="px-6 max-w-4xl mx-auto py-12">
      <div className="bg-surface-container-low rounded-[2.5rem] overflow-hidden shadow-xl border border-outline-variant/10">
        <div className="relative h-48 bg-primary">
          <div className="absolute -bottom-16 left-12 w-32 h-32 rounded-full border-8 border-surface-container-low overflow-hidden shadow-lg bg-surface-container-highest flex items-center justify-center">
            {/* Fallback avatar with first letter if image is not dynamic */}
            <div className="w-full h-full bg-primary flex items-center justify-center text-white text-5xl font-black">
              {userProfile?.name?.charAt(0)?.toUpperCase() || 'L'}
            </div>
          </div>
        </div>
        
        <div className="pt-20 px-12 pb-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-grow max-w-md">
              {isEditing ? (
                <div className="mb-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Full Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-outline-variant/30 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-xl font-bold text-on-surface"
                    autoFocus
                  />
                </div>
              ) : (
                <h2 className="text-3xl font-black tracking-tight text-on-surface">
                  {userProfile ? userProfile.name : "Loading..."}
                </h2>
              )}
              
              <p className="text-primary font-bold text-sm uppercase tracking-widest mt-1">
                {userProfile ? userProfile.role : ""}
              </p>
              <div className="flex items-center gap-4 mt-4 text-on-surface-variant text-sm font-medium">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">email</span>
                  {userProfile?.email}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  Central Hub
                </span>
              </div>
            </div>

            {isEditing ? (
              <div className="flex gap-3">
                <button 
                  onClick={() => { setIsEditing(false); setEditName(userProfile?.name || ''); }}
                  className="bg-surface-container text-on-surface px-6 py-3 rounded-xl font-bold active:scale-95 transition-transform border border-outline-variant/20"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="bg-primary text-white px-6 py-3 rounded-xl font-bold active:scale-95 transition-transform shadow-lg shadow-primary/20 flex items-center gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-primary text-white px-6 py-3 rounded-xl font-bold active:scale-95 transition-transform shadow-lg shadow-primary/20 flex items-center gap-2 hover:bg-primary/90"
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
                Edit Profile
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-outline-variant/10">
            {staticStats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-3xl font-black text-on-surface leading-none">{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mt-2">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant px-2">Account Settings</h3>
            <div className="space-y-2">
              {[
                { icon: "security", label: "Security & MFA", desc: "Protect your ledger access" },
                { icon: "notifications", label: "Notification Prefs", desc: "Manage harvest and trade alerts" },
                { icon: "payments", label: "Payment Gateways", desc: "Paystack & Flutterwave integration" },
                { icon: "help_outline", label: "Support Center", desc: "Contact Lomstel logistics" }
              ].map((item, idx) => (
                <button key={idx} className="w-full text-left bg-surface-container-lowest hover:bg-white p-4 rounded-2xl flex items-center gap-4 border border-outline-variant/5 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </div>
                  <div className="flex-grow">
                    <p className="text-on-surface font-bold text-sm">{item.label}</p>
                    <p className="text-on-surface-variant text-xs">{item.desc}</p>
                  </div>
                  <span className="material-symbols-outlined text-outline">chevron_right</span>
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="mt-12 w-full py-4 text-error font-black uppercase tracking-widest text-center hover:bg-error-container/10 rounded-2xl transition-colors cursor-pointer"
          >
            Logout of Command Center
          </button>
        </div>
      </div>
    </div>
  );
}
