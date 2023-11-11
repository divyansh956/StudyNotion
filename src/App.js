import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import './App.css';
import './index.css';

export default function App() {
  return (
    <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  )
};