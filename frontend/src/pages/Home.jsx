import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Home.css";

const defaultPlaces = [
  { name: "Goa", image: "/images/goa.jpg" },
  { name: "Paris", image: "/images/paris.jpg" },
  { name: "Mumbai", image: "/images/mumbai.jpg" },
  { name: "Tokyo", image: "/images/tokyo.jpg" },
  { name: "New York", image: "/images/newyork.jpg" },
  { name: "Dubai", image: "/images/dubai.jpg" }
];

function Home() {
  const [search, setSearch] = useState("");
  const [places, setPlaces] = useState(defaultPlaces);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🔥 AUTO RESET when search is cleared
  useEffect(() => {
    if (search.trim() === "") {
      setPlaces(defaultPlaces);
    }
  }, [search]);

  // 🔍 Search handler
  const handleSearch = async () => {
    if (!search.trim()) return;

    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:5000/ai/place-details/${search}`
        
      );

      const resultPlace = {
        name: res.data.name || search,
        image: res.data.image || "/images/default.jpg"
      };

      setPlaces([resultPlace]); // show only searched result

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">

      {/* HERO */}
      <div className="hero-section">
        <h1 className="title">Travel Explorer</h1>
       

        <div className="search-box">
          <input
            className="search"
            placeholder="Discover your next destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />

          <button onClick={handleSearch}>
            {loading ? "Loading..." : "Explore"}
          </button>
        </div>
      </div>

      {/* CARDS */}
      <div className="card-container">
        {places.map((place, index) => (
          <div
            key={index}
            className="glass-card"
            onClick={() => navigate(`/place/${place.name}`)}
          >
            <img src={place.image} alt={place.name} />
            <h3>{place.name}</h3>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Home;