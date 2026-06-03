"use client"

import { useState } from "react";
import { logHarvest } from "@/lib/services/inventory";

export default function HarvestLogPage() {
  const [weight, setWeight] = useState("");
  const [moisture, setMoisture] = useState("");
  const [grade, setGrade] = useState("Premium");
  const [location, setLocation] = useState("Central Processing Hub");
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSubmit = async () => {
    if (!weight || !moisture) {
      alert("Please fill in all fields.");
      return;
    }

    setIsSyncing(true);
    try {
      await logHarvest({
        weight: parseFloat(weight),
        moisture: parseFloat(moisture),
        grade,
        location,
      });
      alert("Harvest Logged & Synced successfully!");
      setWeight("");
      setMoisture("");
    } catch (error) {
      console.error(error);
      alert("Failed to sync harvest log. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="pt-8 px-4 max-w-2xl mx-auto pb-12">
      {/* Header Section */}
      <section className="mb-8">
        <h2 className="text-[32px] font-extrabold tracking-tight text-on-surface leading-tight">Harvest Log</h2>
        <p className="text-on-surface-variant font-medium mt-1">Field Data Entry Terminal</p>
      </section>

      {/* Bento Form Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main Metrics Card */}
        <div className="md:col-span-2 bg-surface-container-low p-6 rounded-2xl space-y-6 border border-outline-variant/10 shadow-sm">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-3">Harvest Weight (kg)</label>
            <div className="relative">
              <input 
                className="w-full bg-white border-2 border-transparent focus:border-primary rounded-2xl py-6 px-6 text-4xl font-extrabold text-primary placeholder:text-outline-variant outline-none transition-all shadow-sm" 
                placeholder="0.00" 
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-secondary-container px-4 py-2 rounded-xl text-on-secondary-container font-black text-sm tracking-tighter">KG</div>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-3">Moisture Content (%)</label>
            <div className="relative">
              <input 
                className="w-full bg-white border-2 border-transparent focus:border-primary rounded-2xl py-6 px-6 text-4xl font-extrabold text-primary placeholder:text-outline-variant outline-none transition-all shadow-sm" 
                placeholder="12.0" 
                type="number"
                value={moisture}
                onChange={(e) => setMoisture(e.target.value)}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-secondary-container px-4 py-2 rounded-xl text-on-secondary-container font-black text-sm tracking-tighter">% MC</div>
            </div>
          </div>
        </div>

        {/* Quality Selection */}
        <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
          <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4">Quality Grade</label>
          <div className="space-y-3">
            {[
              { label: "Premium" },
              { label: "Grade A" },
              { label: "Grade B" }
            ].map((g, idx) => (
              <button 
                key={idx}
                onClick={() => setGrade(g.label)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  grade === g.label 
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                    : "bg-white text-on-surface-variant border-transparent hover:border-primary-fixed-dim"
                }`}
              >
                <span className="font-bold">{g.label}</span>
                {grade === g.label && <span className="material-symbols-outlined fill-current text-[20px]">check_circle</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Location Selection */}
        <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col">
          <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4">Hub/Location</label>
          <div className="flex-grow flex flex-col gap-4">
            <div className="h-32 w-full rounded-xl overflow-hidden relative group shadow-inner border border-outline-variant/10">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuALH1vedQtRYh26wzotXaranDwl_xbK-fw7UCq0C78oU7kDCVLb7f2dZ6Okpk1SD8093Ero-y6g9YFnIPtF87hizLcbc7HGAmZVfmm6WB0dw_Rb3Uj1gtmsXULb01gh0V-L7f_Ad_caskdunZOhmB--4mckHHSLrx6PvD27XNfQfHk51_1kjbZredX1V-hhszWZ33JkLa7wwPepylDarH_Qi4DPz014vl_XvGdDmIhD_aeiqTGyCB8udaiV4Y7gDaAJthkFmZZ7v5-u"
                alt="Map View"
              />
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center backdrop-blur-[2px]">
                <span className="bg-white/90 px-3 py-1 rounded-full text-[10px] font-black text-primary border border-primary/20 shadow-xl">GPS ACTIVE</span>
              </div>
            </div>
            <div className="relative">
              <select 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white border-2 border-transparent focus:border-primary rounded-xl py-4 px-4 font-bold text-on-surface appearance-none outline-none shadow-sm cursor-pointer"
              >
                <option>Central Processing Hub</option>
                <option>Northern Silo Site</option>
                <option>Eastern Collection Point</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="md:col-span-2 bg-surface-container-highest p-8 rounded-2xl border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-variant transition-all group active:scale-[0.99]">
          <div className="w-16 h-16 bg-primary-container text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-primary/10">
            <span className="material-symbols-outlined text-3xl">add_a_photo</span>
          </div>
          <h3 className="text-lg font-bold text-primary">Verification Photo</h3>
          <p className="text-xs text-on-surface-variant max-w-xs mt-1 font-medium leading-relaxed">Capture high-resolution imagery of the harvest for automated grade verification.</p>
        </div>
      </div>

      {/* Submit Action */}
      <div className="mt-8 pb-12">
        <button 
          className={`w-full py-6 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl shadow-tertiary/10 group ${
            isSyncing ? "bg-outline-variant cursor-not-allowed" : "bg-tertiary-container"
          }`}
          onClick={handleSubmit}
          disabled={isSyncing}
        >
          <span className="text-on-tertiary-container font-black text-xl tracking-tighter uppercase">
            {isSyncing ? "Syncing Data..." : "Confirm & Execute Sync"}
          </span>
          {!isSyncing && <span className="material-symbols-outlined text-on-tertiary-container group-hover:translate-x-1 transition-transform">arrow_forward</span>}
        </button>
        <p className="text-center text-[10px] font-black text-outline mt-6 uppercase tracking-[0.2em] opacity-60">Transaction secured via precision protocol v4.2</p>
      </div>
    </div>
  );
}
