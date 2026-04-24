import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/details.css";

import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";

// ✅ Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

// 🔴 Restaurant icon
const restaurantIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

// 🔥 Fit map to markers
function FitBounds({ spots }) {
  const map = useMap();

  useEffect(() => {
    if (!spots.length) return;

    const bounds = spots.map(s => [s.lat, s.lng]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [spots, map]);

  return null;
}

function PlaceDetails() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/ai/place-details/${name}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, [name]);

  if (!data) return <h2 className="loading">Loading...</h2>;

  return (
    <div className="details">

      {/* TOP BAR */}
      <div className="top-bar">
        <button className="home-btn" onClick={() => navigate("/")}>
          ← Home
        </button>
      </div>

      {/* HERO */}
      <div className="hero">
        <img src={data.image} alt={data.name} />
        <h1>{data.name}</h1>
      </div>

      <div className="content">

        {/* ABOUT */}
        <section>
          <h2>📖 About</h2>
          <p>{data.description}</p>
        </section>

        {/* HOTELS */}
        <section>
          <h2>🏨 Hotels</h2>
          <div className="grid">
            {data.hotels.map((h, i) => (
              <div key={i} className="card">
                <h3>{h.name}</h3>
                <p>{h.address}</p>
                <p>{h.priceRange}</p>
                <p>{h.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CUISINES */}
        <section>
          <h2>🍽️ Cuisines</h2>

          {data.cuisines.map((c, i) => (
            <div key={i} className="card">
              <h3>{c.cuisine}</h3>

              <p><strong>Dishes:</strong> {c.mustTryDishes.join(", ")}</p>

              {c.restaurants.map((r, idx) => (
                <div key={idx}>
                  <p><strong>{r.name}</strong></p>
                  <p>{r.address}</p>
                  <p>{r.description}</p>
                </div>
              ))}
            </div>
          ))}
        </section>

        {/* TOURIST SPOTS */}
        <section>
          <h2>📍 Tourist Spots</h2>
          <div className="grid">
            {data.touristSpots.map((s, i) => (
              <div key={i} className="card">
                <h3>{s.name}</h3>
                <p>{s.address}</p>
                <p>{s.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 🗺️ MAP */}
        <section className="map-section">
          <h2>🗺️ Map</h2>

          <div className="map-container">

            {/* LEGEND */}
            <div className="map-legend">
              <div className="legend-item">
                <span className="legend-dot green"></span>
                Tourist Spots
              </div>
              <div className="legend-item">
                <span className="legend-dot red"></span>
                Restaurants
              </div>
            </div>

            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              className="leaflet-map"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              <FitBounds spots={data.touristSpots} />

              {/* 🟢 Tourist */}
              {data.touristSpots.map((spot, i) => (
                <Marker key={"spot-" + i} position={[spot.lat, spot.lng]}>
                  <Popup>
                    <strong>{spot.name}</strong><br />
                    {spot.address}
                  </Popup>
                </Marker>
              ))}

              {/* 🔴 Restaurants */}
              {data.cuisines.flatMap(c =>
                c.restaurants
                  .filter(r => r.lat && r.lng)
                  .map((r, i) => (
                    <Marker
                      key={"rest-" + i}
                      position={[r.lat, r.lng]}
                      icon={restaurantIcon}
                    >
                      <Popup>
                        <strong>{r.name}</strong><br />
                        {r.address}<br />
                        🍽️ {c.cuisine}
                      </Popup>
                    </Marker>
                  ))
              )}
            </MapContainer>

          </div>
        </section>

        {/* COST */}
       <section className="info-row">
        <div className="info-box">
          <h3>💰 Cost</h3>
          <p>{data.averageCost}</p>
        </div>

        <div className="info-box">
          <h3>🌤️ Best Time</h3>
          <p>{data.bestTime}</p>
        </div>
      </section>

      </div>
    </div>
  );
}

export default PlaceDetails;