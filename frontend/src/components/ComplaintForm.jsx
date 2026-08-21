import { useState, useEffect } from "react";
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
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit complaint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#080d20]/80 p-7 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-brand-500/30"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white">File a Complaint</h2>
          <p className="text-xs text-surface-200/60 mt-0.5">Submit issues for automatic SLA resolution</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
          ✍️
        </span>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-medium text-red-300 animate-fade-in-up">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-medium text-emerald-300 animate-fade-in-up">
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}

      {/* Title */}
      <div className="mb-4">
        <label htmlFor="complaint-title" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-surface-200/70">
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
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-surface-200/30 outline-none transition focus:border-brand-400 focus:bg-white/[0.08] focus:ring-4 focus:ring-brand-500/20"
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label htmlFor="complaint-desc" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-surface-200/70">
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
          className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-surface-200/30 outline-none transition focus:border-brand-400 focus:bg-white/[0.08] focus:ring-4 focus:ring-brand-500/20"
        />
      </div>

      {/* Department Dropdown */}
      <div className="mb-4">
        <label htmlFor="complaint-department" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-surface-200/70">
          Target Department <span className="text-red-400">*</span>
        </label>
        <select
          id="complaint-department"
          name="department"
          value={form.department}
          onChange={handleChange}
          required
          className="w-full cursor-pointer rounded-xl border border-white/10 bg-surface-900 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/20"
        >
          <option value="" className="bg-surface-900 text-white">
            Select department (e.g. EEE, Mechanical, CSE, Hostel, MBA...)
          </option>
          {departments.map((d) => (
            <option key={d._id} value={d._id} className="bg-surface-900 text-white">
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category Dropdown */}
      <div className="mb-4">
        <label htmlFor="complaint-category" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-surface-200/70">
          Category <span className="text-[10px] lowercase font-normal text-surface-200/40">(optional — AI auto-detects)</span>
        </label>
        <select
          id="complaint-category"
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full cursor-pointer rounded-xl border border-white/10 bg-surface-900 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/20"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value} className="bg-surface-900 text-white">
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Attachments */}
      <div className="mb-5">
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-surface-200/70">
          Attachments <span className="text-[10px] lowercase font-normal text-surface-200/40">(optional)</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/20 bg-white/[0.02] px-4 py-3 transition hover:border-brand-400/50 hover:bg-brand-500/5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span className="text-xs text-surface-200/60 truncate">
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
      <div className="mb-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
        <div>
          <p className="text-sm font-bold text-white">Submit Anonymously</p>
          <p className="text-[11px] text-surface-200/50">Your identity will remain private from staff</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.isAnonymous}
          onClick={() => setForm((prev) => ({ ...prev, isAnonymous: !prev.isAnonymous }))}
          className={`relative h-6 w-11 cursor-pointer rounded-full transition-colors duration-200 ${
            form.isAnonymous ? "bg-brand-500" : "bg-surface-700"
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
        className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition-all hover:brightness-110 hover:shadow-brand-500/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
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
