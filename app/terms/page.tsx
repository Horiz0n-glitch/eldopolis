import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Términos y Condiciones - Eldópolis",
  description: "Términos y condiciones de uso del sitio web de Eldópolis.",
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Términos y Condiciones</h1>
          <p className="text-lg text-gray-600">Última actualización: {new Date().toLocaleDateString("es-AR")}</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>1. Aceptación de los Términos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Al acceder y utilizar el sitio web de Eldópolis, aceptas estar sujeto a estos Términos y Condiciones y a
              nuestra Política de Privacidad. Si no estás de acuerdo con alguno de estos términos, no debes utilizar
              nuestro sitio web.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>2. Descripción del Servicio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Eldópolis es un sitio web de noticias que proporciona información sobre eventos locales, nacionales e
              internacionales, con especial enfoque en la región de Eldorado, Misiones, Argentina.
            </p>
            <p className="text-gray-700">
              Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto del servicio en
              cualquier momento sin previo aviso.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>3. Uso Aceptable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Puedes:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Leer y compartir nuestro contenido para uso personal</li>
                <li>Comentar en nuestros artículos de manera respetuosa</li>
                <li>Contactarnos con sugerencias o noticias</li>
                <li>Suscribirte a nuestras actualizaciones</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-2">No puedes:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Reproducir, distribuir o modificar nuestro contenido sin autorización</li>
                <li>Utilizar el sitio para actividades ilegales o no autorizadas</li>
                <li>Publicar contenido ofensivo, difamatorio o que incite al odio</li>
                <li>Intentar acceder a áreas restringidas del sitio</li>
                <li>Interferir con el funcionamiento normal del sitio</li>
                <li>Utilizar robots, scrapers o herramientas automatizadas</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>4. Contenido y Propiedad Intelectual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Todo el contenido del sitio web, incluyendo textos, imágenes, gráficos, logos, videos y software, es
              propiedad de Eldópolis o de sus licenciantes y está protegido por las leyes de derechos de autor y otras
              leyes de propiedad intelectual.
            </p>
            <p className="text-gray-700 mb-4">
              Se otorga una licencia limitada, no exclusiva y no transferible para acceder y utilizar el sitio web
              únicamente para uso personal y no comercial.
            </p>
            <p className="text-gray-700">
              Las marcas comerciales, logos y marcas de servicio mostradas en el sitio web son propiedad de Eldópolis o
              de terceros. No se otorga ningún derecho o licencia sobre estas marcas.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>5. Comentarios y Contenido del Usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Al enviar comentarios, sugerencias o cualquier otro contenido al sitio web, otorgas a Eldópolis una
              licencia mundial, libre de regalías, perpetua e irrevocable para usar, reproducir, modificar y distribuir
              dicho contenido.
            </p>
            <p className="text-gray-700 mb-4">Eres responsable del contenido que publiques y garantizas que:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Tienes derecho a publicar el contenido</li>
              <li>El contenido no infringe derechos de terceros</li>
              <li>El contenido es preciso y no es engañoso</li>
              <li>El contenido no es ofensivo ni inapropiado</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Nos reservamos el derecho de eliminar cualquier contenido que consideremos inapropiado.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>6. Privacidad</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Tu privacidad es importante para nosotros. Por favor, revisa nuestra Política de Privacidad, que también
              rige tu uso del sitio web, para entender nuestras prácticas de recopilación y uso de información.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>7. Exención de Responsabilidad</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              El sitio web se proporciona "tal como está" y "según disponibilidad". Eldópolis no garantiza que:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>El sitio web estará disponible de forma ininterrumpida</li>
              <li>El sitio web estará libre de errores o virus</li>
              <li>La información sea completamente precisa o actualizada</li>
              <li>Los defectos serán corregidos</li>
            </ul>
            <p className="text-gray-700 mt-4">
              El uso del sitio web es bajo tu propio riesgo. Eldópolis no será responsable de ningún daño directo,
              indirecto, incidental o consecuente que resulte del uso del sitio web.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>8. Limitación de Responsabilidad</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              En ningún caso Eldópolis, sus directores, empleados o afiliados serán responsables por daños indirectos,
              incidentales, especiales, consecuentes o punitivos, incluyendo pérdida de beneficios, datos o uso,
              incurridos por ti o cualquier tercero, ya sea en una acción contractual o extracontractual, incluso si se
              ha advertido de la posibilidad de tales daños.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>9. Indemnización</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Aceptas indemnizar y eximir de responsabilidad a Eldópolis, sus afiliados, directores, empleados y agentes
              de cualquier reclamo, demanda, pérdida, responsabilidad y gasto (incluyendo honorarios de abogados) que
              surja de tu uso del sitio web, tu violación de estos términos, o tu violación de cualquier derecho de un
              tercero.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>10. Modificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Las
              modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web. Tu uso
              continuado del sitio web después de cualquier modificación constituye tu aceptación de los nuevos
              términos.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>11. Terminación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Podemos terminar o suspender tu acceso al sitio web inmediatamente, sin previo aviso o responsabilidad,
              por cualquier motivo, incluyendo la violación de estos Términos y Condiciones.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>12. Ley Aplicable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes de la República
              Argentina. Cualquier disputa que surja en relación con estos términos estará sujeta a la jurisdicción
              exclusiva de los tribunales de Misiones, Argentina.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>13. Contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Si tienes preguntas sobre estos Términos y Condiciones, puedes contactarnos:
            </p>
            <ul className="text-gray-700 space-y-1">
              <li>
                <strong>Email:</strong> legal@eldopolis.com
              </li>
              <li>
                <strong>Dirección:</strong> Eldorado, Misiones, Argentina
              </li>
              <li>
                <strong>Teléfono:</strong> +54 3751 123-456
              </li>
            </ul>
            <p className="text-gray-700 mt-4">
              Al utilizar nuestro sitio web, reconoces que has leído, entendido y aceptado estar sujeto a estos Términos
              y Condiciones.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
