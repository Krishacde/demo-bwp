import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";

import IdeaCard from "../components/IdeaCard";
import { categories, stages } from "../ideaOptions";
import "./Ideas.css";

const Ideas = () => {
  const [ideas, setIdeas] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [stage, setStage] = useState("");
  const [sort, setSort] = useState("newest");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // skip old responses when filters change fast
    let ignore = false;

    const getIdeas = async () => {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search) params.append("search", search);
      if (category) params.append("category", category);
      if (stage) params.append("stage", stage);
      params.append("sort", sort);

      try {
        const response = await fetch(
          `http://localhost:5000/api/ideas?${params.toString()}`
        );

        const data = await response.json();

        if (ignore) return;

        if (!response.ok) {
          setError(data.message || "Could not load ideas");
          setLoading(false);
          return;
        }

        setIdeas(data.ideas);
        setLoading(false);

      } catch (error) {
        if (ignore) return;

        setError(
          "Unable to connect to the server"
        );
        setLoading(false);
      }
    };

    getIdeas();

    return () => {
      ignore = true;
    };
  }, [search, category, stage, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchText.trim());
  };

  return (
    <main className="ideas-page">

      <div className="ideas-container">

        <div className="ideas-header">

          <div>
            <h1>Explore Ideas</h1>

            <p>
              Find startup ideas and the people building them.
            </p>
          </div>

          <Link to="/create-idea" className="btn btn-primary">
            <Plus size={18} />
            Post Idea
          </Link>

        </div>


        <div className="ideas-toolbar">

          <form className="search-form" onSubmit={handleSearch}>
            <input
              className="form-input"
              type="text"
              placeholder="Search ideas..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            <button
              className="btn btn-primary"
              type="submit"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </form>

          <select
            className="form-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            className="form-input"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
          >
            <option value="">All stages</option>

            {stages.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            className="form-input"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>

        </div>


        {loading && (
          <div className="ideas-status">
            Loading ideas...
          </div>
        )}

        {!loading && error && (
          <div className="form-message">
            {error}
          </div>
        )}

        {!loading && !error && ideas.length === 0 && (
          <div className="ideas-status">
            No ideas found.
          </div>
        )}

        {!loading && !error && ideas.length > 0 && (
          <div className="ideas-grid">
            {ideas.map((idea) => (
              <IdeaCard key={idea._id} idea={idea} />
            ))}
          </div>
        )}

      </div>

    </main>
  );
};

export default Ideas;
