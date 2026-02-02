import { convertirURL } from "@/lib/image-utils"

interface DraftBlock {
  key: string
  text: string
  type: string
  depth: number
  inlineStyleRanges: any[]
  entityRanges: any[]
  data: any
}

interface DraftContent {
  blocks: DraftBlock[]
  entityMap: any
}

interface TableEntity {
  type: string
  mutability: string
  data: {
    rows: Array<{
      cells: Array<{
        content: string
        colspan?: number
        rowspan?: number
      }>
    }>
    headers?: boolean
  }
}

function cleanHtmlText(text: string): string {
  if (!text || typeof text !== "string") {
    return ""
  }

  return text
    .replace(/<[^>]*>/g, "") // Remover tags HTML
    .replace(/&nbsp;/g, " ") // Reemplazar entidades HTML
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, " ") // Limpiar espacios múltiples
    .replace(/[\r\n\t]/g, " ") // Remover saltos de línea y tabs
    .trim()
}

// Función mejorada para detectar párrafos con lógica de palabras mínimas
function detectParagraphBreaks(text: string): { content: string; isShort: boolean }[] {
  if (!text || typeof text !== "string") {
    return []
  }

  // Primero dividir por saltos de línea dobles que son párrafos claros
  let segments = text.split(/\n\s*\n/).filter((segment) => segment.trim().length > 0)

  // Si no hay saltos dobles, intentar detectar por puntos
  if (segments.length === 1) {
    let processedText = text

    // Detectar puntos apartes (punto + espacio + mayúscula)
    processedText = processedText.replace(/\.\s+([A-ZÁÉÍÓÚÑÜ])/g, ".|||PARAGRAPH_BREAK|||$1")

    // Detectar puntos seguidos de múltiples espacios
    processedText = processedText.replace(/\.\s{2,}/g, ".|||PARAGRAPH_BREAK|||")

    segments = processedText
      .split("|||PARAGRAPH_BREAK|||")
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
  }

  // Analizar cada segmento para determinar si es corto
  return segments.map((segment) => {
    const cleanSegment = segment.replace(/\n/g, " ").trim()
    const wordCount = cleanSegment.split(/\s+/).filter((word) => word.length > 0).length
    return {
      content: cleanSegment,
      isShort: wordCount < 5,
    }
  })
}

// Función mejorada para procesar texto plano y crear párrafos con diferentes espaciados
function processPlainTextToParagraphs(text: string): string {
  const paragraphs = detectParagraphBreaks(text)

  if (paragraphs.length <= 1) {
    return `<p class="mb-6 leading-8">${text}</p>`
  }

  return paragraphs
    .map((paragraph) => {
      if (paragraph.isShort) {
        // Para párrafos cortos, usar menos espaciado y estilo de lista
        return `<p class="mb-3 leading-7 ml-4 text-gray-700 relative before:content-['•'] before:absolute before:-left-3 before:text-red-500 before:font-bold">${paragraph.content.trim()}</p>`
      } else {
        // Para párrafos normales, usar espaciado completo
        return `<p class="mb-8 leading-8">${paragraph.content.trim()}</p>`
      }
    })
    .join("")
}

// Nueva función para procesar entidades (incluyendo tablas)
function processEntityRanges(text: string, entityRanges: any[], entityMap: any): string {
  if (!entityRanges || entityRanges.length === 0) {
    return text
  }

  let processedText = text
  const sortedRanges = [...entityRanges].sort((a, b) => b.offset - a.offset)

  for (const range of sortedRanges) {
    const entity = entityMap[range.key]
    if (!entity) continue

    const before = processedText.slice(0, range.offset)
    const entityText = processedText.slice(range.offset, range.offset + range.length)
    const after = processedText.slice(range.offset + range.length)

    switch (entity.type) {
      case "LINK":
        const url = entity.data?.url || "#"
        processedText =
          before +
          `<a href="${url}" class="text-red-600 hover:text-red-700 underline" target="_blank" rel="noopener noreferrer">${entityText}</a>` +
          after
        break
      case "TABLE":
        // Las tablas se procesan por separado, aquí solo marcamos el placeholder
        processedText = before + `[TABLE_PLACEHOLDER_${range.key}]` + after
        break
      default:
        break
    }
  }

  return processedText
}

// Nueva función para renderizar tablas
function renderTable(tableData: TableEntity["data"]): string {
  if (!tableData || !tableData.rows || tableData.rows.length === 0) {
    return ""
  }

  const hasHeaders = tableData.headers || false
  let tableHtml = `<div class="overflow-x-auto my-8">
    <table class="min-w-full border-collapse border border-gray-300 bg-white rounded-lg shadow-sm">
  `

  tableData.rows.forEach((row, rowIndex) => {
    const isHeaderRow = hasHeaders && rowIndex === 0
    const cellTag = isHeaderRow ? "th" : "td"
    const cellClass = isHeaderRow
      ? "border border-gray-300 px-4 py-3 bg-gray-50 font-semibold text-gray-900 text-left"
      : "border border-gray-300 px-4 py-3 text-gray-800"

    tableHtml += "<tr>"

    row.cells.forEach((cell) => {
      const colspan = cell.colspan ? ` colspan="${cell.colspan}"` : ""
      const rowspan = cell.rowspan ? ` rowspan="${cell.rowspan}"` : ""

      tableHtml += `<${cellTag} class="${cellClass}"${colspan}${rowspan}>${cell.content || ""}</${cellTag}>`
    })

    tableHtml += "</tr>"
  })

  tableHtml += `
    </table>
  </div>`

  return tableHtml
}

export function parseDraftJSToPlainText(content: unknown): string {
  if (!content) {
    return ""
  }

  try {
    let draftContent: DraftContent | null = null

    if (typeof content === "string") {
      if (content.trim().startsWith("{")) {
        try {
          draftContent = JSON.parse(content)
        } catch (e) {
          // Si no es JSON, podría ser HTML o texto plano
          return cleanHtmlText(content)
        }
      } else {
        // Es texto plano o HTML
        return cleanHtmlText(content)
      }
    } else if (typeof content === "object") {
      draftContent = content as DraftContent
    }

    if (draftContent && draftContent.blocks && Array.isArray(draftContent.blocks)) {
      const text = draftContent.blocks
        .map((block: DraftBlock) => block?.text?.trim())
        .filter(Boolean)
        .join(" ")
      return cleanHtmlText(text)
    }

    return ""
  } catch (error) {
    console.error("Failed to parse content to plain text:", error)
    return ""
  }
}

// Función principal mejorada para parsear DraftJS con soporte para tablas
export function parseDraftJSContent(content: string | DraftContent): string {
  try {
    // Si es string y no parece JSON, procesarlo como texto plano
    if (typeof content === "string" && !content.trim().startsWith("{")) {
      return processPlainTextToParagraphs(content)
    }

    const draftContent: DraftContent = typeof content === "string" ? JSON.parse(content) : content

    if (!draftContent.blocks || !Array.isArray(draftContent.blocks)) {
      return typeof content === "string" ? processPlainTextToParagraphs(content) : ""
    }

    // Primero, procesar todas las tablas del entityMap
    const tableEntities: { [key: string]: string } = {}
    if (draftContent.entityMap) {
      Object.keys(draftContent.entityMap).forEach((key) => {
        const entity = draftContent.entityMap[key]
        if (entity.type === "TABLE") {
          tableEntities[key] = renderTable(entity.data)
        }
      })
    }

    return draftContent.blocks
      .map((block) => {
        if (!block.text.trim() && (!block.entityRanges || block.entityRanges.length === 0)) {
          return ""
        }

        let text = block.text

        // Procesar entidades primero (incluyendo tablas)
        if (block.entityRanges && block.entityRanges.length > 0) {
          text = processEntityRanges(text, block.entityRanges, draftContent.entityMap || {})
        }

        // Aplicar estilos inline
        const sortedRanges = [...block.inlineStyleRanges].sort((a, b) => a.offset - b.offset)
        for (let i = sortedRanges.length - 1; i >= 0; i--) {
          const range = sortedRanges[i]
          const before = text.slice(0, range.offset)
          const styled = text.slice(range.offset, range.offset + range.length)
          const after = text.slice(range.offset + range.length)

          switch (range.style) {
            case "BOLD":
              text = before + `<strong>${styled}</strong>` + after
              break
            case "ITALIC":
              text = before + `<em>${styled}</em>` + after
              break
            case "UNDERLINE":
              text = before + `<u>${styled}</u>` + after
              break
            default:
              break
          }
        }

        // Reemplazar placeholders de tablas con el HTML renderizado
        Object.keys(tableEntities).forEach((key) => {
          text = text.replace(`[TABLE_PLACEHOLDER_${key}]`, tableEntities[key])
        })

        // Procesar según el tipo de bloque
        switch (block.type) {
          case "header-one":
            return `<h1 class="text-3xl font-bold mb-8 mt-12 text-gray-900">${text}</h1>`
          case "header-two":
            return `<h2 class="text-2xl font-bold mb-6 mt-10 text-gray-900">${text}</h2>`
          case "header-three":
            return `<h3 class="text-xl font-bold mb-5 mt-8 text-gray-900">${text}</h3>`
          case "header-four":
            return `<h4 class="text-lg font-semibold mb-4 mt-6 text-gray-800">${text}</h4>`
          case "header-five":
            return `<h5 class="text-base font-semibold mb-3 mt-5 text-gray-800">${text}</h5>`
          case "header-six":
            return `<h6 class="text-sm font-semibold mb-3 mt-4 text-gray-800">${text}</h6>`
          case "blockquote":
            return `<blockquote class="border-l-4 border-red-500 pl-6 italic my-8 bg-gray-50 py-6 rounded-r-lg text-gray-700">${text}</blockquote>`
          case "code-block":
            return `<pre class="bg-gray-100 p-6 rounded-lg overflow-x-auto my-8 border border-gray-200"><code>${text}</code></pre>`
          case "unordered-list-item":
            return `<li class="mb-3 leading-7">${text}</li>`
          case "ordered-list-item":
            return `<li class="mb-3 leading-7">${text}</li>`
          case "atomic":
            // Los bloques atómicos suelen ser imágenes, videos o tablas
            if (block.entityRanges && block.entityRanges.length > 0) {
              const entity = draftContent.entityMap[block.entityRanges[0].key]
              if (entity) {
                if (entity.type === "IMAGE" || entity.type === "image") {
                  const src = convertirURL(entity.data?.src || entity.data?.url || "")
                  const caption = entity.data?.caption || ""
                  return `
                    <figure class="my-10 space-y-3">
                      <img src="${src}" alt="${caption}" class="w-full h-auto rounded-2xl shadow-lg object-cover" />
                      ${caption ? `<figcaption class="text-center text-sm text-slate-500 italic px-4">${caption}</figcaption>` : ""}
                    </figure>
                  `
                }
                if (entity.type === "VIDEO" || entity.type === "video") {
                  const src = convertirURL(entity.data?.src || entity.data?.url || "")
                  return `
                    <div class="my-10 rounded-2xl overflow-hidden shadow-lg bg-black">
                      <video src="${src}" controls class="w-full h-auto"></video>
                    </div>
                  `
                }
              }
            }
            if (text.includes("[TABLE_PLACEHOLDER_")) {
              return text
            }
            return `<div class="my-8">${text}</div>`
          case "unstyled":
          default:
            // Para párrafos normales, detectar puntos apartes con lógica mejorada
            const paragraphs = detectParagraphBreaks(text)
            if (paragraphs.length > 1) {
              return paragraphs
                .map((paragraph) => {
                  if (paragraph.isShort) {
                    // Para párrafos cortos (menos de 5 palabras), usar estilo de lista con menos espaciado
                    return `<p class="mb-3 leading-7 ml-4 text-gray-700 relative before:content-['•'] before:absolute before:-left-3 before:text-red-500 before:font-bold">${paragraph.content.trim()}</p>`
                  } else {
                    // Para párrafos normales, usar espaciado completo
                    return `<p class="mb-8 leading-8">${paragraph.content.trim()}</p>`
                  }
                })
                .join("")
            }
            return `<p class="mb-8 leading-8">${text}</p>`
        }
      })
      .filter(Boolean) // Remover elementos vacíos
      .join("")
  } catch (error) {
    console.error("Error parsing Draft.js content:", error)
    return typeof content === "string" ? processPlainTextToParagraphs(content) : ""
  }
}

export function extractPlainText(content: string | DraftContent): string {
  return parseDraftJSToPlainText(content)
}

// Nueva función para procesar texto con mejor detección de párrafos y lógica de palabras
export function processTextWithParagraphs(text: string): string {
  if (!text || typeof text !== "string") {
    return ""
  }

  // Limpiar el texto primero
  const cleanText = text
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()

  // Detectar párrafos con lógica mejorada
  const paragraphs = detectParagraphBreaks(cleanText)

  return paragraphs
    .map((paragraph) => {
      if (paragraph.isShort) {
        // Para párrafos cortos, usar estilo de lista con bullet point
        return `<p class="mb-3 leading-7 ml-4 text-gray-700 relative before:content-['•'] before:absolute before:-left-3 before:text-red-500 before:font-bold">${paragraph.content.trim()}</p>`
      } else {
        // Para párrafos normales, usar espaciado completo
        return `<p class="mb-8 leading-8">${paragraph.content.trim()}</p>`
      }
    })
    .join("")
}

// Función adicional para agrupar párrafos cortos consecutivos
export function groupShortParagraphs(text: string): string {
  if (!text || typeof text !== "string") {
    return ""
  }

  try {
    // Intentar parsear como JSON DraftJS primero
    let processedText = text
    if (text.trim().startsWith("{")) {
      const draftContent: DraftContent = JSON.parse(text)
      if (draftContent.blocks && Array.isArray(draftContent.blocks)) {
        // Procesar cada bloque de DraftJS
        const processedBlocks = draftContent.blocks
          .filter((block) => block.text && block.text.trim())
          .map((block) => {
            let blockText = block.text

            // Aplicar estilos inline si existen
            const sortedRanges = [...block.inlineStyleRanges].sort((a, b) => a.offset - b.offset)
            for (let i = sortedRanges.length - 1; i >= 0; i--) {
              const range = sortedRanges[i]
              const before = blockText.slice(0, range.offset)
              const styled = blockText.slice(range.offset, range.offset + range.length)
              const after = blockText.slice(range.offset + range.length)

              switch (range.style) {
                case "BOLD":
                  blockText = before + `<strong>${styled}</strong>` + after
                  break
                case "ITALIC":
                  blockText = before + `<em>${styled}</em>` + after
                  break
                case "UNDERLINE":
                  blockText = before + `<u>${styled}</u>` + after
                  break
              }
            }

            // Manejar tipos de bloque especiales
            switch (block.type) {
              case "header-one":
                return `<h1 class="text-3xl font-bold mb-8 mt-12 text-gray-900">${blockText}</h1>`
              case "header-two":
                return `<h2 class="text-2xl font-bold mb-6 mt-10 text-gray-900">${blockText}</h2>`
              case "header-three":
                return `<h3 class="text-xl font-bold mb-5 mt-8 text-gray-900">${blockText}</h3>`
              case "blockquote":
                return `<blockquote class="border-l-4 border-red-500 pl-6 italic my-8 bg-gray-50 py-6 rounded-r-lg text-gray-700">${blockText}</blockquote>`
              default:
                return blockText
            }
          })

        // Unir todos los bloques procesados
        processedText = processedBlocks.join("\n\n")
      }
    }

    // Limpiar el texto
    const cleanText = processedText
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()

    const paragraphs = detectParagraphBreaks(cleanText)
    const result: string[] = []
    let shortParagraphsGroup: string[] = []

    paragraphs.forEach((paragraph, index) => {
      if (paragraph.isShort) {
        shortParagraphsGroup.push(paragraph.content.trim())
      } else {
        // Si hay párrafos cortos acumulados, procesarlos como lista
        if (shortParagraphsGroup.length > 0) {
          const listItems = shortParagraphsGroup
            .map((item) => `<li class="mb-2 leading-7 text-gray-700">${item}</li>`)
            .join("")
          result.push(`<ul class="mb-6 ml-6 list-disc space-y-1">${listItems}</ul>`)
          shortParagraphsGroup = []
        }

        // Agregar el párrafo normal
        result.push(`<p class="mb-8 leading-8">${paragraph.content.trim()}</p>`)
      }
    })

    // Procesar párrafos cortos restantes al final
    if (shortParagraphsGroup.length > 0) {
      const listItems = shortParagraphsGroup
        .map((item) => `<li class="mb-2 leading-7 text-gray-700">${item}</li>`)
        .join("")
      result.push(`<ul class="mb-6 ml-6 list-disc space-y-1">${listItems}</ul>`)
    }

    return result.join("")
  } catch (error) {
    console.error("Error processing text with paragraphs:", error)
    return processPlainTextToParagraphs(text)
  }
}
