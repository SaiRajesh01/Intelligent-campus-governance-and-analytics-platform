import { useState, useEffect } from "react";
import { useTheme, useDashboardTheme } from "../context/ThemeContext";
import api from "../services/api";

const CATEGORIES = [
  { value: "", label: "Auto-detect (AI Classification)" },
  { value: "Infrastructure", label: "Infrastructure" },
  { value: "Academic", label: "Academic" },
  { value: "Hostel", label: "Hostel" },
  { value: "IT/Network", label: "IT / Network" },
  { value: "Harassment", label: "Harassment" },
  { value: "Administrative", label: "Administrative" },
  { value: "Other", label: "Other" },
];

export default function ComplaintForm({ onCreated }) {
  const { lightMode } = useTheme();
  const d = useDashboardTheme();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    department: "",
    isAnonymous: false,
    attachments: [],
  });
  const [departments, setDepartments] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/departments");
        setDepartments(data);
      } catch {
        // fallback
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const names = files.map((f) => f.name);
    setFileNames(names);
    setForm((prev) => ({ ...prev, attachments: names }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title.trim() || !form.description.trim()) {
      return setError("Title and detailed description are required.");
    }
    if (!form.department) {
      return setError("Please select a target Department.");
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        department: form.department,
        isAnonymous: form.isAnonymous,
      };
      if (form.category) payload.category = form.category;
      if (form.attachments.length > 0) payload.attachments = form.attachments;

      await api.post("/complaints", payload);

      setSuccess("Complaint submitted successfully! Department has been notified.");
      setForm({ title: "", description: "", category: "", department: "", isAnonymous: false, attachments: [] });
      setFileNames([]);

      if (onCreated) onCreated();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to file complaint. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative overflow-hidden rounded-3xl border p-7 backdrop-blur-xl transition-all duration-300 ${d.panelBg}`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between border-b pb-4 mb-6 ${d.panelBorder}`}>
        <div>
          <h2 className={`text-xl font-extrabold tracking-tight ${d.panelHeading}`}>File a Complaint</h2>
          <p className={`text-xs mt-0.5 ${d.panelSub}`}>Submit issues for automatic SLA resolution</p>
        </div>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${lightMode ? "bg-brand-50 text-brand-600 border-brand-200" : "bg-brand-500/10 text-brand-400 border-brand-500/20"}`}>
          ✍️
        </span>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className={`mb-5 flex items-start gap-2.5 rounded-xl border p-3.5 text-xs font-medium animate-fade-in-up ${lightMode ? "border-red-300 bg-red-50 text-red-700" : "border-red-500/30 bg-red-500/10 text-red-300"}`}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className={`mb-5 flex items-start gap-2.5 rounded-xl border p-3.5 text-xs font-medium animate-fade-in-up ${lightMode ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>
          <span>✅</span>
          <span>{success}</span>
        </div>
      )}

      {/* Title */}
      <div className="mb-4">
        <label htmlFor="complaint-title" className={`mb-1.5 block text-xs font-bold uppercase tracking-wider ${d.cardLabel}`}>
          Complaint Subject <span className="text-red-400">*</span>
        </label>
        <input
          id="complaint-title"
          name="title"
          type="text"
          required
          value={form.title}
          onChange={handleChange}
          placeholder="Brief summary of the issue..."
          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-4 ${d.inputBg}`}
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label htmlFor="complaint-desc" className={`mb-1.5 block text-xs font-bold uppercase tracking-wider ${d.cardLabel}`}>
          Detailed Description <span className="text-red-400">*</span>
        </label>
        <textarea
          id="complaint-desc"
          name="description"
          required
          rows={3}
          value={form.description}
          onChange={handleChange}
          placeholder="Provide specific details (location, room number, problem description)..."
          className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-4 ${d.inputBg}`}
        />
      </div>

      {/* Department Dropdown */}
      <div className="mb-4">
        <label htmlFor="complaint-department" className={`mb-1.5 block text-xs font-bold uppercase tracking-wider ${d.cardLabel}`}>
          Target Department <span className="text-red-400">*</span>
        </label>
        <select
          id="complaint-department"
          name="department"
          value={form.department}
          onChange={handleChange}
          required
          className={`w-full cursor-pointer rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-4 ${d.inputBg}`}
        >
          <option value="" className={lightMode ? "bg-white text-slate-900" : "bg-surface-900 text-white"}>
            Select department (e.g. EEE, Mechanical, CSE, Hostel, MBA...)
          </option>
          {departments.map((dItem) => (
            <option key={dItem._id} value={dItem._id} className={lightMode ? "bg-white text-slate-900" : "bg-surface-900 text-white"}>
              {dItem.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category Dropdown */}
      <div className="mb-4">
        <label htmlFor="complaint-category" className={`mb-1.5 block text-xs font-bold uppercase tracking-wider ${d.cardLabel}`}>
          Category <span className={`text-[10px] lowercase font-normal ${d.textMuted}`}>(optional - AI auto-detects)</span>
        </label>
        <select
          id="complaint-category"
          name="category"
          value={form.category}
          onChange={handleChange}
          className={`w-full cursor-pointer rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-4 ${d.inputBg}`}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value} className={lightMode ? "bg-white text-slate-900" : "bg-surface-900 text-white"}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Attachments */}
      <div className="mb-5">
        <label className={`mb-1.5 block text-xs font-bold uppercase tracking-wider ${d.cardLabel}`}>
          Attachments <span className={`text-[10px] lowercase font-normal ${d.textMuted}`}>(optional)</span>
        </label>
        <label className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-3 transition ${
          lightMode 
            ? "border-slate-300 bg-slate-50/70 hover:border-brand-400 hover:bg-brand-50/40" 
            : "border-white/20 bg-white/[0.02] hover:border-brand-400/50 hover:bg-brand-500/5"
        }`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span className={`text-xs truncate ${lightMode ? "text-slate-500" : "text-surface-200/60"}`}>
            {fileNames.length > 0 ? fileNames.join(", ") : "Upload photos or supporting documents..."}
          </span>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Anonymous Toggle */}
      <div className={`mb-6 flex items-center justify-between rounded-xl border p-3.5 ${
        lightMode ? "border-slate-200 bg-slate-50/80" : "border-white/10 bg-white/[0.03]"
      }`}>
        <div>
          <p className={`text-sm font-bold ${d.textPrimary}`}>Submit Anonymously</p>
          <p className={`text-[11px] ${d.textMuted}`}>Your identity will remain private from staff</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.isAnonymous}
          onClick={() => setForm((prev) => ({ ...prev, isAnonymous: !prev.isAnonymous }))}
          className={`relative h-6 w-11 cursor-pointer rounded-full transition-colors duration-200 ${
            form.isAnonymous
              ? "bg-brand-600"
              : lightMode
              ? "bg-slate-300"
              : "bg-surface-700"
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
              form.isAnonymous ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      {/* Submit CTA */}
      <button
        type="submit"
        disabled={loading}
        className={`group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${d.btnPrimary}`}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Submitting Complaint...</span>
          </div>
        ) : (
          <>
            <span>Submit Complaint</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}