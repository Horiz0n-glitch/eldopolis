import { NextResponse } from "next/server"

// Opcional: si querés forzar Edge Runtime
export const runtime = "edge"

type RawItem = {
  casa: string
  nombre: string
  compra: number | string
  venta: number | string
  moneda: string
  fechaActualizacion: string
}

type Rate = { name: string; buy: number; sell: number; change: string }

const CASA_MAP: Record<string, string> = {
  oficial: "Dólar Oficial",
  blue: "Dólar Blue",
  bolsa: "Dólar MEP",
  contadoconliqui: "Dólar CCL",
  tarjeta: "Dólar Tarjeta",
  cripto: "Dólar Cripto",
}

const wanted = new Set(Object.keys(CASA_MAP))

function toNumber(n: number | string | undefined): number {
  if (typeof n === "number") return n
  if (typeof n === "string") return Number(n.replace(",", "."))
  return 0
}

export async function GET() {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares", {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; NextJS-App/1.0)",
      },
      // Revalida en 15 min; en Edge/CDN honra s-maxage abajo
      next: { revalidate: 900 },
    })

    if (!res.ok) {
      throw new Error(`DolarApi responded ${res.status}`)
    }

    const data = (await res.json()) as RawItem[]

    // Filtramos solo las casas que te interesan y normalizamos
    const filtered = data.filter((d) => wanted.has(d.casa))

    // Orden + nombres como en tu UI
    const order = ["oficial", "blue", "bolsa", "contadoconliqui", "tarjeta", "cripto"]

    const rates: Rate[] = order
      .map((key) => filtered.find((d) => d.casa === key))
      .filter((d): d is RawItem => Boolean(d))
      .map((d) => ({
        name: CASA_MAP[d.casa],
        buy: toNumber(d.compra),
        sell: toNumber(d.venta),
        // DolarApi no trae variación aquí; mostramos “—”
        change: "—",
      }))

    return NextResponse.json(
      {
        ok: true,
        data: rates,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          // Cache en edge/CDN
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
        },
      }
    )
  } catch (err) {
    console.error("Error fetching dollar rates:", err)

    // Fallback: mantenemos la misma forma que consumís en el cliente
    const empty: Rate[] = [
      { name: "Dólar Oficial", buy: 0, sell: 0, change: "—" },
      { name: "Dólar Blue", buy: 0, sell: 0, change: "—" },
      { name: "Dólar MEP", buy: 0, sell: 0, change: "—" },
      { name: "Dólar CCL", buy: 0, sell: 0, change: "—" },
      { name: "Dólar Tarjeta", buy: 0, sell: 0, change: "—" },
    ]

    return NextResponse.json(
      { ok: false, data: empty, updatedAt: new Date().toISOString() },
      { status: 500, headers: { "Cache-Control": "no-cache" } }
    )
  }
}
