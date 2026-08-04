import { useState } from "react";
import api from "../services/api";

const CATEGORIES = [
  { value: "", label: "Auto-detect (AI)" },
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
    isAnonymous: false,
    attachments: [],
  });
  const [fileNames, setFileNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    // Store filenames/URLs — no real upload backend, just store names
    setForm((prev) => ({ ...prev, attachments: names }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title.trim() || !form.description.trim()) {
      return setError("Title and description are required.");
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        isAnonymous: form.isAnonymous,
      };
      if (form.category) payload.category = form.category;
      if (form.attachments.length > 0) payload.attachments = form.attachments;

      await api.post("/complaints", payload);

      setSuccess("Complaint submitted successfully!");
      setForm({ title: "", description: "", category: "", isAnonymous: false, attachments: [] });
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
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
    >
      <h2 className="mb-5 text-lg font-bold text-white">Submit a Complaint</h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
          {success}
        </div>
      )}

      {/* Title */}
      <div className="mb-4">
        <label htmlFor="complaint-title" className="mb-1.5 block text-sm font-medium text-surface-200">
          Title
        </label>
        <input
          id="complaint-title"
          name="title"
          type="text"
          required
          value={form.title}
          onChange={handleChange}
          placeholder="Brief summary of the issue"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-surface-200/40 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25"
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label htmlFor="complaint-desc" className="mb-1.5 block text-sm font-medium text-surface-200">
          Description
        </label>
        <textarea
          id="complaint-desc"
          name="description"
          required
          rows={4}
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the issue in detail…"
          className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-surface-200/40 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25"
        />
      </div>

      {/* Category */}
      <div className="mb-4">
        <label htmlFor="complaint-category" className="mb-1.5 block text-sm font-medium text-surface-200">
          Category
          <span className="ml-1 text-xs text-surface-200/40">(optional — AI auto-detects if blank)</span>
        </label>
        <select
          id="complaint-category"
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full cursor-pointer rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value} className="bg-surface-900 text-white">
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Attachments */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-surface-200">
          Attachments
          <span className="ml-1 text-xs text-surface-200/40">(optional)</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 transition hover:border-brand-500/40 hover:bg-white/5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-surface-200/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span className="text-sm text-surface-200/50">
            {fileNames.length > 0 ? fileNames.join(", ") : "Choose files…"}
          </span>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Anonymous toggle */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={form.isAnonymous}
          onClick={() => setForm((prev) => ({ ...prev, isAnonymous: !prev.isAnonymous }))}
          className={`relative h-6 w-11 cursor-pointer rounded-full transition ${
            form.isAnonymous ? "bg-brand-500" : "bg-surface-700"
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              form.isAnonymous ? "translate-x-5" : ""
            }`}
          />
        </button>
        <span className="text-sm text-surface-200">
          Submit anonymously
          {form.isAnonymous && (
            <span className="ml-1.5 text-xs text-brand-400">(your identity will be hidden)</span>
          )}
        </span>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full cursor-pointer rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Submitting…" : "Submit Complaint"}
      </button>
    </form>
  );
}
