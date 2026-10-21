import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Lightbulb } from "lucide-react";

import { categories, stages } from "../ideaOptions";
import { API_BASE_URL } from "../config/api";
import "./Ideas.css";
import "./CreateIdea.css";

const API_URL = `${API_BASE_URL}/api`;

const BUDGET_RANGES = [
  { value: "", label: "Select estimated budget" },
  { value: "Under ₹50,000", label: "Under ₹50,000  — Bootstrap / Personal funds" },
  { value: "₹50,000 – ₹2,00,000", label: "₹50,000 – ₹2,00,000  — Early-stage seed" },
  { value: "₹2,00,000 – ₹10,00,000", label: "₹2,00,000 – ₹10,00,000  — Seed / Angel round" },
  { value: "₹10,00,000 – ₹50,00,000", label: "₹10,00,000 – ₹50,00,000  — Pre-Series A" },
  { value: "₹50,00,000+", label: "₹50,00,000+  — Series A and beyond" },
  { value: "Not determined", label: "Not yet determined" },
];

const emptyForm = {
  title: "",
  description: "",
  problem: "",
  solution: "",
  lookingFor: "",
  category: "",
  stage: "Idea",
  requiredSkills: "",
  teamSize: 1,
  tags: "",
  // Budget fields — frontend display only, not sent to backend
  budgetRange: "",
  budgetNote: "",
};

// comma text to array
const toList = (text) => {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "");
};

const SectionHeading = ({ number, title, subtitle }) => (
  <div className="ci-section-heading">
    <div className="ci-section-number">{number}</div>
    <div>
      <h2 className="ci-section-title">{title}</h2>
      {subtitle && <p className="ci-section-subtitle">{subtitle}</p>}
    </div>
  </div>
);

const CreateIdea = () => {
  const navigate = useNavigate();

  // id is only there on the edit page
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // login check
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  // fill form when editing
  useEffect(() => {
    if (!isEdit) return;

    const getIdea = async () => {
      try {
        const response = await fetch(
          `${API_URL}/ideas/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Could not load idea");
          return;
        }

        setForm({
          title: data.idea.title,
          description: data.idea.description,
          problem: data.idea.problem || "",
          solution: data.idea.solution || "",
          lookingFor: data.idea.lookingFor || "",
          category: data.idea.category,
          stage: data.idea.stage,
          requiredSkills: data.idea.requiredSkills.join(", "),
          teamSize: data.idea.teamSize,
          tags: data.idea.tags.join(", "),
          budgetRange: "",
          budgetNote: "",
        });

      } catch {
        setMessage(
          "Unable to connect to the server"
        );
      }
    };

    getIdea();
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    const url = isEdit
      ? `${API_URL}/ideas/${id}`
      : `${API_URL}/ideas`;

    try {
      const response = await fetch(
        url,
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            problem: form.problem,
            solution: form.solution,
            lookingFor: form.lookingFor,
            category: form.category,
            stage: form.stage,
            requiredSkills: toList(form.requiredSkills),
            teamSize: Number(form.teamSize),
            tags: toList(form.tags)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not save idea");
        return;
      }

      navigate(`/ideas/${data.idea._id}`);

    } catch {
      setMessage(
        "Unable to connect to the server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ci-page">

      {/* Page header */}
      <div className="ci-page-header">
        <div className="ci-header-icon">
          <Lightbulb size={22} />
        </div>
        <div>
          <h1 className="ci-page-title">
            {isEdit ? "Edit your idea" : "Post your idea"}
          </h1>
          <p className="ci-page-subtitle">
            {isEdit
              ? "Update the details below to refine your idea."
              : "Fill in the details below to share your idea and attract collaborators."}
          </p>
        </div>
      </div>

      <div className="ci-layout">

        {/* Sidebar progress indicator */}
        <aside className="ci-sidebar">
          <nav className="ci-nav">
            {[
              { n: "1", label: "Overview" },
              { n: "2", label: "Problem & Solution" },
              { n: "3", label: "Team & Skills" },
              { n: "4", label: "Budget" },
              { n: "5", label: "Discovery" },
            ].map(({ n, label }) => (
              <a key={n} href={`#section-${n}`} className="ci-nav-item">
                <span className="ci-nav-dot">{n}</span>
                <span className="ci-nav-label">{label}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Main form */}
        <div className="ci-form-wrapper">

          {message && (
            <div className="ci-error-banner" role="alert">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="ci-form">

            {/* ── Section 1: Overview ── */}
            <section id="section-1" className="ci-section">
              <SectionHeading
                number="1"
                title="Overview"
                subtitle="Give your idea a clear identity so collaborators can instantly understand what you're building."
              />

              <div className="ci-fields">

                <div className="ci-field-group">
                  <label className="ci-label" htmlFor="title">
                    Idea Title <span className="ci-required">*</span>
                  </label>
                  <input
                    id="title"
                    className="ci-input"
                    type="text"
                    name="title"
                    placeholder="e.g. AI-powered campus food delivery platform"
                    value={form.title}
                    onChange={handleChange}
                    required
                    maxLength={100}
                  />
                  <small className="ci-hint">Keep it under 10 words — punchy and memorable</small>
                </div>

                <div className="ci-field-group">
                  <label className="ci-label" htmlFor="description">
                    Summary <span className="ci-required">*</span>
                  </label>
                  <textarea
                    id="description"
                    className="ci-input ci-textarea"
                    name="description"
                    placeholder="Describe your idea in 2–4 sentences. What is it, who is it for, and what makes it different?"
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows={4}
                  />
                </div>

                <div className="ci-row">
                  <div className="ci-field-group">
                    <label className="ci-label" htmlFor="category">
                      Category <span className="ci-required">*</span>
                    </label>
                    <select
                      id="category"
                      className="ci-input ci-select"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="ci-field-group">
                    <label className="ci-label" htmlFor="stage">
                      Current Stage
                    </label>
                    <select
                      id="stage"
                      className="ci-input ci-select"
                      name="stage"
                      value={form.stage}
                      onChange={handleChange}
                    >
                      {stages.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>
            </section>


            {/* ── Section 2: Problem & Solution ── */}
            <section id="section-2" className="ci-section">
              <SectionHeading
                number="2"
                title="Problem & Solution"
                subtitle="Help collaborators understand the real-world pain point you're tackling and how you plan to solve it."
              />

              <div className="ci-fields">

                <div className="ci-field-group">
                  <label className="ci-label" htmlFor="problem">
                    The Problem
                  </label>
                  <textarea
                    id="problem"
                    className="ci-input ci-textarea"
                    name="problem"
                    placeholder="Who experiences this problem? How significant is it? Why does it remain unsolved?"
                    value={form.problem}
                    onChange={handleChange}
                    maxLength={2000}
                    rows={4}
                  />
                </div>

                <div className="ci-field-group">
                  <label className="ci-label" htmlFor="solution">
                    Your Proposed Solution
                  </label>
                  <textarea
                    id="solution"
                    className="ci-input ci-textarea"
                    name="solution"
                    placeholder="How does your idea specifically address the problem? What is the core mechanism or approach?"
                    value={form.solution}
                    onChange={handleChange}
                    maxLength={2000}
                    rows={4}
                  />
                </div>

              </div>
            </section>


            {/* ── Section 3: Team & Skills ── */}
            <section id="section-3" className="ci-section">
              <SectionHeading
                number="3"
                title="Team & Skills"
                subtitle="Tell collaborators what kind of people and expertise you're looking for to bring this to life."
              />

              <div className="ci-fields">

                <div className="ci-field-group">
                  <label className="ci-label" htmlFor="lookingFor">
                    Who You're Looking For
                  </label>
                  <textarea
                    id="lookingFor"
                    className="ci-input ci-textarea ci-textarea--sm"
                    name="lookingFor"
                    placeholder="e.g. A full-stack developer comfortable with React and Node, and a UI/UX designer who can shape the MVP experience."
                    value={form.lookingFor}
                    onChange={handleChange}
                    maxLength={1000}
                    rows={3}
                  />
                </div>

                <div className="ci-row">
                  <div className="ci-field-group">
                    <label className="ci-label" htmlFor="requiredSkills">
                      Required Skills
                    </label>
                    <input
                      id="requiredSkills"
                      className="ci-input"
                      type="text"
                      name="requiredSkills"
                      placeholder="React, Node.js, Figma, Python…"
                      value={form.requiredSkills}
                      onChange={handleChange}
                    />
                    <small className="ci-hint">Separate each skill with a comma</small>
                  </div>

                  <div className="ci-field-group">
                    <label className="ci-label" htmlFor="teamSize">
                      Total Team Size
                    </label>
                    <input
                      id="teamSize"
                      className="ci-input"
                      type="number"
                      name="teamSize"
                      min={1}
                      max={50}
                      value={form.teamSize}
                      onChange={handleChange}
                    />
                    <small className="ci-hint">Including yourself</small>
                  </div>
                </div>

              </div>
            </section>


            {/* ── Section 4: Budget ── */}
            <section id="section-4" className="ci-section">
              <SectionHeading
                number="4"
                title="Budget"
                subtitle="Give potential collaborators a sense of the financial scale of this venture. This helps set expectations upfront."
              />

              <div className="ci-fields">

                <div className="ci-field-group">
                  <label className="ci-label" htmlFor="budgetRange">
                    Estimated Budget Range
                  </label>
                  <select
                    id="budgetRange"
                    className="ci-input ci-select"
                    name="budgetRange"
                    value={form.budgetRange}
                    onChange={handleChange}
                  >
                    {BUDGET_RANGES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <small className="ci-hint">This is indicative — exact funding can be discussed with your team</small>
                </div>

                <div className="ci-field-group">
                  <label className="ci-label" htmlFor="budgetNote">
                    Funding Context <span className="ci-optional">(optional)</span>
                  </label>
                  <textarea
                    id="budgetNote"
                    className="ci-input ci-textarea ci-textarea--sm"
                    name="budgetNote"
                    placeholder="e.g. Currently self-funded; open to bootstrapping with co-founders. Exploring grants and angel investors."
                    value={form.budgetNote}
                    onChange={handleChange}
                    maxLength={500}
                    rows={3}
                  />
                </div>

              </div>
            </section>


            {/* ── Section 5: Discovery ── */}
            <section id="section-5" className="ci-section">
              <SectionHeading
                number="5"
                title="Discovery"
                subtitle="Add tags so your idea surfaces in the right searches and reaches the right people."
              />

              <div className="ci-fields">

                <div className="ci-field-group">
                  <label className="ci-label" htmlFor="tags">
                    Tags
                  </label>
                  <input
                    id="tags"
                    className="ci-input"
                    type="text"
                    name="tags"
                    placeholder="food, campus, students, sustainability…"
                    value={form.tags}
                    onChange={handleChange}
                  />
                  <small className="ci-hint">Separate each tag with a comma</small>
                </div>

              </div>
            </section>


            {/* ── Submit ── */}
            <div className="ci-submit-bar">
              {message && (
                <p className="ci-submit-error">{message}</p>
              )}
              <button
                className="ci-submit-btn"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Saving…"
                  : isEdit ? "Save Changes" : "Post Idea"}
              </button>
            </div>

          </form>
        </div>
      </div>

    </main>
  );
};

export default CreateIdea;
