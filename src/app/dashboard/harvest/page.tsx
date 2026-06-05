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
    if (!weight || !moisture) { alert("Please fill in all fields."); return; }
    setIsSyncing(true);
    try {
      await logHarvest({ weight: parseFloat(weight), moisture: parseFloat(moisture), grade, location });
      alert("Harvest Logged & Synced successfully!");
      setWeight(""); setMoisture("");
    } catch (error) {
      console.error(error);
      alert("Failed to sync harvest log. Please try again.");
    } finally { setIsSyncing(false); }
  };

  return (
    <div className="harvest-page">
      <style>{`
        .harvest-page {
          max-width: 680px;
          margin: 0 auto;
          padding-bottom: 3rem;
        }

        /* ── Input cards grid ── */
        .harvest-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        @media (min-width: 520px) {
          .harvest-grid { grid-template-columns: 1fr 1fr; }
          .harvest-span-2 { grid-column: span 2; }
        }

        /* ── Big number input ── */
        .harvest-input {
          width: 100%;
          background: white;
          border: 2px solid transparent;
          border-radius: 16px;
          padding: 1rem 4.5rem 1rem 1.25rem;
          font-size: clamp(1.8rem, 8vw, 2.75rem);
          font-weight: 800;
          color: var(--color-forest-500, #4B7F52);
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          -moz-appearance: textfield;
        }
        .harvest-input::-webkit-inner-spin-button,
        .harvest-input::-webkit-outer-spin-button { -webkit-appearance: none; }
        .harvest-input:focus { border-color: var(--color-forest-500, #4B7F52); }

        .input-unit {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: var(--color-earth-200, #EFEBE0);
          padding: 0.3rem 0.75rem;
          border-radius: 8px;
          font-weight: 800;
          font-size: 0.8rem;
          color: var(--color-earth-700);
          pointer-events: none;
        }

        /* ── Grade buttons ── */
        .grade-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.875rem 1rem;
          border-radius: 12px;
          border: 2px solid transparent;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
          color: var(--color-earth-500);
        }
        .grade-btn.selected {
          background: var(--color-forest-500, #4B7F52);
          color: white;
          border-color: var(--color-forest-500);
          box-shadow: 0 4px 14px rgba(75,127,82,0.25);
        }
        .grade-btn:not(.selected):hover {
          border-color: var(--color-forest-100);
        }

        /* ── Submit button ── */
        .sync-btn {
          width: 100%;
          padding: 1.1rem;
          border-radius: 16px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-weight: 800;
          font-size: clamp(0.95rem, 3vw, 1.15rem);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(200,90,60,0.15);
        }
        .sync-btn:active { transform: scale(0.98); }

        .harvest-card {
          background: var(--color-earth-100, #FAF8F5);
          border: 1px solid var(--color-earth-200, #EFEBE0);
          border-radius: 16px;
          padding: 1.25rem;
        }
        .harvest-label {
          display: block;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--color-earth-500, #9B8B74);
          margin-bottom: 0.875rem;
        }

        .location-map {
          height: 100px;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
          margin-bottom: 0.875rem;
        }
        @media (min-width: 400px) { .location-map { height: 120px; } }

        .select-input {
          width: 100%;
          background: white;
          border: 2px solid transparent;
          border-radius: 12px;
          padding: 0.875rem 3rem 0.875rem 1rem;
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--color-earth-900);
          appearance: none;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .select-input:focus { border-color: var(--color-forest-500); }

        .photo-upload {
          background: var(--color-earth-100);
          border: 2px dashed var(--color-earth-300, #D8CFC0);
          border-radius: 16px;
          padding: 2rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .photo-upload:hover {
          background: var(--color-earth-200);
          border-color: var(--color-forest-500);
        }
      `}</style>

      {/* Header */}
      <section style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 6vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-earth-900)', margin: 0 }}>
          Harvest Log
        </h1>
        <p style={{ color: 'var(--color-earth-500)', fontWeight: 600, marginTop: '0.25rem', fontSize: '0.9rem' }}>
          Field Data Entry Terminal
        </p>
      </section>

      <div className="harvest-grid">

        {/* Weight */}
        <div className="harvest-card harvest-span-2">
          <label className="harvest-label">Harvest Weight</label>
          <div style={{ position: 'relative' }}>
            <input
              className="harvest-input"
              placeholder="0.00"
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
            />
            <span className="input-unit">KG</span>
          </div>
        </div>

        {/* Moisture */}
        <div className="harvest-card harvest-span-2">
          <label className="harvest-label">Moisture Content</label>
          <div style={{ position: 'relative' }}>
            <input
              className="harvest-input"
              placeholder="12.0"
              type="number"
              value={moisture}
              onChange={e => setMoisture(e.target.value)}
            />
            <span className="input-unit">% MC</span>
          </div>
        </div>

        {/* Quality Grade */}
        <div className="harvest-card">
          <label className="harvest-label">Quality Grade</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {['Premium', 'Grade A', 'Grade B'].map(g => (
              <button
                key={g}
                onClick={() => setGrade(g)}
                className={`grade-btn ${grade === g ? 'selected' : ''}`}
              >
                <span>{g}</span>
                {grade === g && (
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="harvest-card">
          <label className="harvest-label">Hub / Location</label>
          <div className="location-map">
            <img
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuALH1vedQtRYh26wzotXaranDwl_xbK-fw7UCq0C78oU7kDCVLb7f2dZ6Okpk1SD8093Ero-y6g9YFnIPtF87hizLcbc7HGAmZVfmm6WB0dw_Rb3Uj1gtmsXULb01gh0V-L7f_Ad_caskdunZOhmB--4mckHHSLrx6PvD27XNfQfHk51_1kjbZredX1V-hhszWZ33JkLa7wwPepylDarH_Qi4DPz014vl_XvGdDmIhD_aeiqTGyCB8udaiV4Y7gDaAJthkFmZZ7v5-u"
              alt="Map"
            />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(75,127,82,0.08)', backdropFilter: 'blur(1px)' }}>
              <span style={{ background: 'rgba(255,255,255,0.92)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-forest-500)', border: '1px solid rgba(75,127,82,0.2)', letterSpacing: '0.1em' }}>GPS ACTIVE</span>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="select-input"
            >
              <option>Central Processing Hub</option>
              <option>Northern Silo Site</option>
              <option>Eastern Collection Point</option>
            </select>
            <span className="material-symbols-outlined" style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-earth-500)', pointerEvents: 'none', fontSize: '20px' }}>expand_more</span>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="harvest-span-2">
          <div className="photo-upload">
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'var(--color-forest-100)', color: 'var(--color-forest-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', transition: 'transform 0.2s' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>add_a_photo</span>
            </div>
            <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--color-forest-500)', fontSize: '1rem' }}>Verification Photo</h3>
            <p style={{ margin: '0.375rem 0 0', fontSize: '0.8rem', color: 'var(--color-earth-500)', maxWidth: '260px', lineHeight: 1.5 }}>
              Capture high-resolution imagery for automated grade verification.
            </p>
          </div>
        </div>

      </div>

      {/* Submit */}
      <div style={{ marginTop: '1.5rem' }}>
        <button
          className="sync-btn"
          style={{ backgroundColor: isSyncing ? 'var(--color-earth-300)' : 'var(--color-accent, #C85A3C)', color: 'white', cursor: isSyncing ? 'not-allowed' : 'pointer' }}
          onClick={handleSubmit}
          disabled={isSyncing}
        >
          <span>{isSyncing ? 'Syncing Data...' : 'Confirm & Execute Sync'}</span>
          {!isSyncing && <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-earth-500)', marginTop: '1rem', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.6 }}>
          Transaction secured via precision protocol v4.2
        </p>
      </div>
    </div>
  );
}
