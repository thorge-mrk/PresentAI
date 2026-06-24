import React from "react";
import UploadPage from "./components/UploadPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Neue Präsentation | Present by Orately AI",
  description:
    "Erstelle KI-gestützte Präsentationen mit Gemini – Recherche, Gliederung, Design und Bilder automatisch.",
};

const page = () => {
  return <UploadPage />;
};

export default page;
