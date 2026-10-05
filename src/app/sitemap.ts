import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://sago.world";
  const currentDate = new Date().toISOString();

  const publicRoutes = [
    "",
    "/about",
    "/collection",
    "/cocktails",
    "/club",
    "/terms",
    "/privacy",
    "/cookies",
    "/accessibility",
    "/refunds",
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1.0 : route === "/collection" || route === "/club" ? 0.9 : 0.7,
  }));
}
