import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import PlaceDetails from "./pages/PlaceDetails";
import "./styles/global.css"
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🏠 Home Page */}
        <Route path="/" element={<Home />} />

        {/* 📍 Dynamic Place Page */}
        <Route path="/place/:name" element={<PlaceDetails />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;