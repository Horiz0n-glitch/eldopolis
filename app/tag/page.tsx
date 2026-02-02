import type { Metadata } from "next"
import TagIndexContent from "./TagIndexContent"

export const metadata: Metadata = {
  title: "Explorar Tags | Eldópolis",
  description:
    "Explora todas las etiquetas y temas disponibles en Eldópolis. Encuentra noticias por temas específicos.",
  keywords: ["tags", "etiquetas", "temas", "noticias", "categorías"],
  openGraph: {
    title: "Explorar Tags | Eldópolis",
    description: "Explora todas las etiquetas y temas disponibles en Eldópolis",
    type: "website",
  },
}

export default function TagIndexPage() {
  return <TagIndexContent />
}
