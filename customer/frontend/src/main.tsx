import { createRoot } from "react-dom/client";

function App() {
  return (
    <main style={{ fontFamily: "Inter, sans-serif", padding: 24 }}>
      <h1 style={{ marginBottom: 12 }}>OrderXpress Customer</h1>
      <p style={{ maxWidth: 520, lineHeight: 1.6 }}>
        The customer web app will open from the QR code, show the restaurant
        menu, and later handle cart, payment, and order tracking flows.
      </p>
    </main>
  );
}

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(<App />);
}
