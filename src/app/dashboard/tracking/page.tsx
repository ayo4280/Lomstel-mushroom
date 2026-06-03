export default function TrackingPage() {
  return (
    <div className="pt-8 px-4 md:px-8 max-w-5xl mx-auto pb-12">
      {/* Header Info */}
      <div className="mb-8 mt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Transaction #PL-8821</span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary mt-1">Order Tracking</h1>
        </div>
        <div className="bg-primary-fixed px-4 py-2 rounded-xl flex items-center gap-2 border border-primary/10">
          <span className="material-symbols-outlined text-primary">local_shipping</span>
          <span className="text-on-primary-fixed-variant font-semibold">Estimated: Oct 24, 14:00</span>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Map View */}
        <div className="md:col-span-8 rounded-2xl overflow-hidden shadow-[0px_12px_32px_rgba(11,28,48,0.06)] bg-surface-container-low relative h-[400px]">
          <div className="absolute inset-0 z-0">
            <img 
              className="w-full h-full object-cover grayscale opacity-60" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDX8_IbScy1x1_cwnW5UZPbYR7ykbGdzgBltX0uUy0UzBPSl_VK-EAIlbZPM0KhU8ujnPGRLhKgl99oFcb4LeCNwgwFWY0FkYKjxc7IHVO5fPjqY7VtbsLrqZTD-sAuY0Zqhi_8SWd58Hxi3vvEocb_ZeVTpMivUyI2RBhJFroksTU1uRtCGhaExvIpQhrkIX7_t1lXALWURqD1g8qguAMz_MuW5uuggzWyW9QaUNfF0BCc4VvB85GZvBMqWSG06U_P-CgexB-1fwn5"
              alt="Map"
            />
          </div>
          {/* Delivery Overlay */}
          <div className="absolute bottom-6 left-6 right-6 p-4 glass-panel rounded-xl flex items-center justify-between border border-white/20 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined">moped</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Current Location</p>
                <p className="font-bold text-on-surface leading-tight">Oshodi Interchange Hub</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Next Stop</p>
              <p className="font-bold text-primary leading-tight">VI Distribution Center</p>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="md:col-span-4 bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
          <h3 className="text-xl font-bold mb-6 tracking-tight">Delivery Status</h3>
          <div className="space-y-8 relative">
            <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-surface-container-high"></div>
            
            <div className="relative flex items-start gap-4 pl-8">
              <div className="absolute left-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10 shadow-sm">
                <span className="material-symbols-outlined text-[14px] text-white font-bold fill-current">check</span>
              </div>
              <div>
                <p className="font-bold text-on-surface leading-none">Order Placed</p>
                <p className="text-xs text-on-surface-variant mt-1 font-medium">Oct 21, 09:30 AM</p>
              </div>
            </div>

            <div className="relative flex items-start gap-4 pl-8">
              <div className="absolute left-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10 shadow-sm">
                <span className="material-symbols-outlined text-[14px] text-white font-bold fill-current">check</span>
              </div>
              <div>
                <p className="font-bold text-on-surface leading-none">Processing</p>
                <p className="text-xs text-on-surface-variant mt-1 font-medium">Oct 21, 14:15 PM</p>
              </div>
            </div>

            <div className="relative flex items-start gap-4 pl-8">
              <div className="absolute left-0 w-6 h-6 rounded-full bg-white border-2 border-primary flex items-center justify-center z-10 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              </div>
              <div>
                <p className="font-bold text-primary leading-none">In Transit</p>
                <p className="text-xs text-on-surface-variant mt-1 font-medium">Oct 22, 08:00 AM</p>
                <div className="mt-3 bg-primary-fixed/20 p-3 rounded-lg border border-primary/10">
                  <p className="text-[11px] text-on-primary-fixed-variant font-medium leading-relaxed">Package is being sorted at the Lagos Mainland logistics hub.</p>
                </div>
              </div>
            </div>

            <div className="relative flex items-start gap-4 pl-8 opacity-40">
              <div className="absolute left-0 w-6 h-6 rounded-full bg-surface-container-high z-10"></div>
              <div>
                <p className="font-bold text-on-surface leading-none">Delivered</p>
                <p className="text-xs text-on-surface-variant mt-1">Expected Tomorrow</p>
              </div>
            </div>
          </div>
        </div>

        {/* Item Summary Card */}
        <div className="md:col-span-12 bg-primary-container text-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-full bg-white/5 skew-x-12 -translate-y-12"></div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-white/10 shrink-0 border border-white/20 shadow-xl">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoa_N_2p-eE0k9_3C-u_Oa5T6fU7x5o3jN6x8T1e_vPq7y2L4M-1N4z0r5-wT6m_S3u_V5b_C8n_P9q_R7i_L1c_hC_PqP4z-I55If9CRfY8dwNx9B07c9PVtBwl7Odorcg80dZb_jVK5I4McOpIVa9hPJDQ4C-zep5WHtVoX8QlsCdSn8mts25mLXocviqmwxiR0o6Qxj-TP0MhlAupzgDp2U6uuIR8NaT1mxJSfxnnf_RDPgkUjrL1ZXtBzju4d-r5-mW7jE1Xt3k0"
                alt="Product"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Fresh Oyster Mushrooms</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Quantity: 500kg</span>
                <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Grade: Premium</span>
                <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Origin: Jos Plateau Farm</span>
              </div>
            </div>
          </div>
          <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-12 relative z-10">
            <p className="text-primary-fixed/60 font-bold uppercase tracking-widest text-[10px]">Total Market Value</p>
            <p className="text-4xl font-extrabold mt-1 text-primary-fixed tracking-tighter">₦1,920,000</p>
          </div>
        </div>

        {/* Shipping Details */}
        <div className="md:col-span-6 bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10">
          <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-4">Shipping Destination</h4>
          <p className="font-bold text-xl leading-tight text-on-surface">Nexus Culinary Center<br/>15 Adeola Odeku Street<br/>Victoria Island, Lagos 101241</p>
          <div className="mt-8 flex gap-4">
            <button className="bg-surface-container-highest px-5 py-2.5 rounded-xl text-on-surface font-bold text-sm hover:bg-surface-dim transition-all active:scale-95">
              Change Address
            </button>
          </div>
        </div>

        {/* Support Card */}
        <div className="md:col-span-6 bg-tertiary-container rounded-2xl p-8 flex flex-col justify-between items-start border border-tertiary/10 shadow-lg shadow-tertiary/5">
          <div>
            <h4 className="text-[10px] font-black text-on-tertiary-container uppercase tracking-widest mb-2">Logistics Support</h4>
            <p className="text-on-tertiary font-bold leading-relaxed">Chat with Tunde, our local logistics manager, for real-time delivery updates.</p>
          </div>
          <button className="mt-8 bg-tertiary text-on-tertiary px-6 py-4 rounded-xl font-black text-sm uppercase tracking-tighter flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-tertiary/20">
            <span className="material-symbols-outlined">support_agent</span>
            Contact Support (WhatsApp)
          </button>
        </div>
      </div>
    </div>
  );
}
