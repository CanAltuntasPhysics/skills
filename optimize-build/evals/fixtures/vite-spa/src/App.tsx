import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

function Home() {
  return <h1>Welcome to our marketing site</h1>;
}

function About() {
  return <p>We are a small team building delightful things.</p>;
}

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
