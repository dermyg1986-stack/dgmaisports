import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DrillPitch",
    short_name: "DrillPitch",
    description:
      "AI-powered coaching assistant for session planning, match preparation, and player analysis.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f1117",
    theme_color: "#0f1117",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
