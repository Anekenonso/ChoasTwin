import "./globals.css";

export const metadata = {
  title: "ChaosTwin — Autonomous Adversarial QA Swarm",
  description:
    "Self-healing engine that probes APIs, exploits race conditions, and synthesises verified patches using NVIDIA Nemotron on Nebius.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
