// src/components/dashboard/HomeTab.jsx

import React from "react";  

export default function HomeTab({ onNavigate }) {
  const docs = [
    { title: "john mwangi - CV", template: "Modern Professional", date: "Mar 1, 2026" },
    { title: "Cover Letter - Tech Solutions", template: "Classic Elegant", date: "Feb 28, 2026" }
  ];

  return (
    <div style={{ padding: "32px 40px" }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1e3a5f", marginBottom: 4 }}>Dashboard</h2> 
      <p style={{ color: "#64748b", marginBottom: 28 }}>Welcome back! Manage your documents below.</p> 
      
      <div style={{ display: "flex", gap: 16, marginBottom: 32 }}> 
        {[["Total Docs", "2"], ["Exports", "1"], ["Drafts", "1"]].map(([label, val]) => (
          <div key={label} style={{ flex: 1, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px", boxShadow: "0 1px 4px #0001" }}> 
            <div style={{ fontSize: 28, fontWeight: 800, color: "#1e3a5f" }}>{val}</div> 
            <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>{label}</div> 
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}> 
        <span style={{ fontWeight: 700, color: "#1e3a5f" }}>Recent Documents</span> 
        <button onClick={() => onNavigate("create")} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>+ New Document</button> 
      </div>

      {docs.map((d, i) => (
        <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 20px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}> 
          <div>
            <div style={{ fontWeight: 600, color: "#1e293b" }}>{d.title}</div> 
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{d.template} · {d.date}</div> 
          </div>
          <button onClick={() => onNavigate("create")} style={{ background: "#f1f5f9", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12, color: "#475569" }}>Edit</button> 
        </div>
      ))}
    </div>
  );
}