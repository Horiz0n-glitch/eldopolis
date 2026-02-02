import type { Metadata } from "next";
import PrivacyVideoPlayer from "../../components/privacy-video-player";

export const metadata: Metadata = {
  title: "Política de Privacidad - Eldópolis",
  description: "Conoce cómo Eldópolis protege y maneja tu información personal.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">
        Política de Privacidad — Eldópolis
      </h1>

      <p className="mb-8 text-sm text-gray-700">
        En Eldópolis cuidamos tu información. A continuación te mostramos un
        ejemplo de reproductor con selector de calidad incrustado en esta misma
        página. Podés reemplazar la URL del stream por la tuya.
      </p>

      <PrivacyVideoPlayer />
    </div>
  );
}
