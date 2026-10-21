import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Lightbulb } from "lucide-react";

import { categories, stages } from "../ideaOptions";
import "./Ideas.css";

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
  tags: ""
};

// comma text to array
const toList = (text) => {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "");
};

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
          `http://localhost:5000/api/ideas/${id}`
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
          tags: data.idea.tags.join(", ")
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
      ? `http://localhost:5000/api/ideas/${id}`
      : "http://localhost:5000/api/ideas";

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
    <main className="auth-page">

      <div className="auth-card idea-form-card">

        <div className="auth-header">

          <div className="auth-header-icon">
            <Lightbulb size={23} />
          </div>

          <h1>
            {isEdit ? "Edit your idea" : "Post your idea"}
          </h1>

          <p>
            {isEdit
              ? "Update the details of your idea."
              : "Share what you want to build and find your team."}
          </p>

        </div>


        {message && (
          <div className="form-message">
            {message}
          </div>
        )}


        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label className="form-label">
              Title
            </label>

            <input
              className="form-input"
              type="text"
              name="title"
              placeholder="Give your idea a short name"
              value={form.title}
              onChange={handleChange}
              required
              maxLength={100}
            />
          </div>


          <div className="form-group">
            <label className="form-label">
              Description
            </label>

            <textarea
              className="form-input"
              name="description"
              placeholder="What problem does it solve and how?"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="problem">Problem to solve</label>
            <textarea id="problem" className="form-input" name="problem" placeholder="Who has this problem and why does it matter?" value={form.problem} onChange={handleChange} maxLength={2000} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="solution">Your proposed solution</label>
            <textarea id="solution" className="form-input" name="solution" placeholder="How will your product or service help?" value={form.solution} onChange={handleChange} maxLength={2000} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="lookingFor">People and skills you need</label>
            <textarea id="lookingFor" className="form-input" name="lookingFor" placeholder="For example: a designer to help shape the first prototype" value={form.lookingFor} onChange={handleChange} maxLength={1000} />
          </div>


          <div className="form-row">

            <div className="form-group">
              <label className="form-label">
                Category
              </label>

              <select
                className="form-input"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select category
                </option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>


            <div className="form-group">
              <label className="form-label">
                Stage
              </label>

              <select
                className="form-input"
                name="stage"
                value={form.stage}
                onChange={handleChange}
              >
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>

          </div>


          <div className="form-row">

            <div className="form-group">
              <label className="form-label">
                Required Skills
              </label>

              <input
                className="form-input"
                type="text"
                name="requiredSkills"
                placeholder="React, Node, Design"
                value={form.requiredSkills}
                onChange={handleChange}
              />

              <small className="form-hint">
                Separate with commas
              </small>
            </div>


            <div className="form-group">
              <label className="form-label">
                Team Size
              </label>

              <input
                className="form-input"
                type="number"
                name="teamSize"
                min={1}
                value={form.teamSize}
                onChange={handleChange}
              />
            </div>

          </div>


          <div className="form-group">
            <label className="form-label">
              Tags
            </label>

            <input
              className="form-input"
              type="text"
              name="tags"
              placeholder="food, campus, students"
              value={form.tags}
              onChange={handleChange}
            />

            <small className="form-hint">
              Separate with commas
            </small>
          </div>


          <button
            className="btn btn-primary form-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : isEdit ? "Save Changes" : "Post Idea"}
          </button>

        </form>

      </div>

    </main>
  );
};

export default CreateIdea;
