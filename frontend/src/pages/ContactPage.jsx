// src/pages/ContactPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

// Import icons
import locationIcon from "../assets/images/location.png";
import phoneIcon from "../assets/images/call.png";
import webIcon from "../assets/images/web.png";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

function Field({ children }) {
  return <div style={{ marginBottom: 14 }}>{children}</div>;
}

export default function ContactPage() {
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
    found_us: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState({ open: false, title: "", message: "", okOnly: true });

  useEffect(() => {
    let mounted = true;
    setLoadingConfig(true);
    axios.get(`${API_BASE}/contact-config/`)
      .then(res => {
        if (!mounted) return;
        setConfig(res.data);
        setForm(prev => ({
          ...prev,
          reason: (res.data.reason_choices && res.data.reason_choices[0]) || "",
          found_us: (res.data.found_us_choices && res.data.found_us_choices[0]) || ""
        }));
      })
      .catch(err => {
        console.warn("Failed to load contact config:", err?.response?.data || err.message);
      })
      .finally(() => mounted && setLoadingConfig(false));
    return () => { mounted = false; };
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function validate() {
    if (!form.name?.trim()) return "Please enter your name";
    if (!form.email?.trim()) return "Please enter your email";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email";
    return null;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setModal({ open: true, title: "Validation error", message: err, okOnly: true });
      return;
    }
    setSubmitting(true);
    axios.post(`${API_BASE}/contact-submit/`, form)
      .then(res => {
        setModal({ open: true, title: "Sent", message: "Thank you — your message has been sent and saved.", okOnly: true });
        setForm({
          name: "",
          email: "",
          phone: "",
          reason: (config && config.reason_choices && config.reason_choices[0]) || "",
          found_us: (config && config.found_us_choices && config.found_us_choices[0]) || "",
          message: ""
        });
      })
      .catch(error => {
        console.error("submit error", error?.response?.data || error.message);
        setModal({ open: true, title: "Error", message: "Failed to submit — please try again later.", okOnly: true });
      })
      .finally(() => setSubmitting(false));
  }

  const containerStyle = {
    maxWidth: 1100,
    margin: "30px auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 28,
    alignItems: "start",
    fontFamily: "Arial, Helvetica, sans-serif",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #1f2937",
    outline: "none",
    fontSize: 16,
  };

  const selectStyle = { ...inputStyle, appearance: "none", WebkitAppearance: "none" };
  const textareaStyle = { ...inputStyle, minHeight: 140, resize: "vertical" };

  const buttonStyle = {
    background: "#0f4b56",
    color: "#fff",
    padding: "10px 26px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  };

  return (
    <div style={{ padding: "18px 12px" }}>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <h2 className="text-3xl font-bold py-4" style={{ color: "#0f4b56", margin: 0 }}>{config?.heading || "Contact Us"}</h2>
      </div>

      <div style={containerStyle}>
        {/* LEFT: form */}
        <div>
          <form onSubmit={handleSubmit}>
            <Field>
              <input name="name" value={form.name} onChange={onChange} style={inputStyle} placeholder="Name" />
            </Field>

            <Field>
              <input name="email" value={form.email} onChange={onChange} style={inputStyle} placeholder="E-mail Address" />
            </Field>

            <Field>
              <input name="phone" value={form.phone} onChange={onChange} style={inputStyle} placeholder="Phone Number" />
            </Field>

            <Field>
              <select name="reason" value={form.reason} onChange={onChange} style={selectStyle}>
                <option value="">Reason to Contact</option>
                {config?.reason_choices?.map((r, idx) => (
                  <option key={idx} value={r}>{r}</option>
                ))}
              </select>
            </Field>

            <Field>
              <select name="found_us" value={form.found_us} onChange={onChange} style={selectStyle}>
                <option value="">How did you find us?</option>
                {config?.found_us_choices?.map((r, idx) => (
                  <option key={idx} value={r}>{r}</option>
                ))}
              </select>
            </Field>

            <Field>
              <textarea name="message" value={form.message} onChange={onChange} style={textareaStyle} placeholder="Message" />
            </Field>

            <div style={{ marginTop: 6 }}>
              <button style={buttonStyle} type="submit" disabled={submitting}>
                {submitting ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: map + address */}
        <div>
          <div style={{ width: "100%", height: 360, position: "relative", marginBottom: 18 }}>
            {config?.map_embed_url ? (
              <iframe title="map" src={config.map_embed_url} style={{ width: "100%", height: "100%", border: 0 }} allowFullScreen loading="lazy"></iframe>
            ) : (
              <div style={{ width: "100%", height: "100%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#6b7280" }}>Map not configured</span>
              </div>
            )}
          </div>

          <div style={{ padding: "6px 8px", lineHeight: 1.6 }}>
            <h1 className="ms-8 text-lg">Address</h1>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
              <img src={locationIcon} alt="location" width={20} height={20} />
              <div style={{ whiteSpace: "pre-line" }}>{config?.address || "Address not set"}</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
              <img src={webIcon} alt="website" width={20} height={20} />
              <div>{config?.website || "-"}</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
              <img src={phoneIcon} alt="phone" width={20} height={20} />
              <div>{config?.phone || "-"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <div style={{
          position: "fixed", left: 0, top: 0, right: 0, bottom: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.5)", zIndex: 60
        }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 20, width: 420, maxWidth: "90%" }}>
            <h3 style={{ marginTop: 0 }}>{modal.title}</h3>
            <p style={{ color: "#374151" }}>{modal.message}</p>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              <button onClick={() => setModal({ open: false })} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer" }}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
