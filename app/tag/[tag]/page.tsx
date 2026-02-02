import type { Metadata } from "next"
import TagResultsContent from "./TagResultsContent"

type Props = {
  params: { tag: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const decodedTag = decodeURIComponent(params.tag)

  return {
    title: `Noticias sobre "${decodedTag}" | Eldópolis`,
    description: `Encuentra todas las noticias relacionadas con ${decodedTag}. Mantente informado con las últimas actualizaciones.`,
    keywords: [decodedTag, "noticias", "actualidad", "información"],
    openGraph: {
      title: `Noticias sobre "${decodedTag}" | Eldópolis`,
      description: `Encuentra todas las noticias relacionadas con ${decodedTag}`,
      type: "website",
    },
  }
}

export default function TagPage({ params }: Props) {
  return <TagResultsContent params={params} />
}
