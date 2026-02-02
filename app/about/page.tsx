import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Calendar, Award } from "lucide-react"

export const metadata: Metadata = {
  title: "Acerca de Eldópolis",
  description:
    "Conoce la historia, misión y valores de Eldópolis, tu fuente confiable de noticias en Eldorado, Misiones.",
  openGraph: {
    title: "Acerca de Eldópolis",
    description:
      "Conoce la historia, misión y valores de Eldópolis, tu fuente confiable de noticias en Eldorado, Misiones.",
  },
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Acerca de Eldópolis</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Información desde la Tierra Colorada - Tu fuente confiable de noticias en Eldorado, Misiones
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="flex flex-col items-center p-6">
              <Calendar className="h-8 w-8 text-blue-600 mb-2" />
              <div className="text-2xl font-bold">2020</div>
              <div className="text-sm text-gray-600">Fundado</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-6">
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <div className="text-2xl font-bold">50K+</div>
              <div className="text-sm text-gray-600">Lectores</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-6">
              <MapPin className="h-8 w-8 text-red-600 mb-2" />
              <div className="text-2xl font-bold">Eldorado</div>
              <div className="text-sm text-gray-600">Misiones</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-6">
              <Award className="h-8 w-8 text-yellow-600 mb-2" />
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-gray-600">Cobertura</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Nuestra Historia</CardTitle>
              <CardDescription>Cómo comenzó todo</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Eldópolis nació en 2020 con la misión de brindar información veraz y oportuna a los habitantes de
                Eldorado y la región. Desde nuestros inicios, nos hemos comprometido a ser la voz de nuestra comunidad.
              </p>
              <p className="text-gray-700">
                Con el tiempo, hemos crecido hasta convertirnos en una de las fuentes de noticias más confiables de
                Misiones, cubriendo desde eventos locales hasta noticias nacionales e internacionales que impactan a
                nuestra región.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nuestra Misión</CardTitle>
              <CardDescription>Lo que nos impulsa cada día</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Informar con veracidad, transparencia y responsabilidad a la comunidad de Eldorado y Misiones,
                promoviendo el diálogo constructivo y el desarrollo de nuestra región.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Veracidad</Badge>
                <Badge variant="secondary">Transparencia</Badge>
                <Badge variant="secondary">Responsabilidad</Badge>
                <Badge variant="secondary">Comunidad</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Nuestros Valores</CardTitle>
            <CardDescription>Los principios que guían nuestro trabajo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Integridad Periodística</h3>
                <p className="text-gray-700">
                  Nos comprometemos a verificar nuestras fuentes y presentar información precisa y equilibrada en todas
                  nuestras publicaciones.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Compromiso Local</h3>
                <p className="text-gray-700">
                  Priorizamos las noticias que impactan directamente a nuestra comunidad, siendo la voz de Eldorado y la
                  región.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Innovación Digital</h3>
                <p className="text-gray-700">
                  Utilizamos las últimas tecnologías para brindar la mejor experiencia de lectura y acceso a la
                  información.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Responsabilidad Social</h3>
                <p className="text-gray-700">
                  Promovemos el desarrollo social y cultural de nuestra región a través de un periodismo constructivo y
                  responsable.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coverage Areas */}
        <Card>
          <CardHeader>
            <CardTitle>Áreas de Cobertura</CardTitle>
            <CardDescription>Los temas que cubrimos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">📰</span>
                </div>
                <span className="text-sm font-medium">Noticias Locales</span>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-green-600 font-semibold">⚽</span>
                </div>
                <span className="text-sm font-medium">Deportes</span>
              </div>
              <div className="text-center">
                <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-red-600 font-semibold">🏛️</span>
                </div>
                <span className="text-sm font-medium">Política</span>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 rounded-full p-3 w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-yellow-600 font-semibold">🎭</span>
                </div>
                <span className="text-sm font-medium">Cultura</span>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">🌍</span>
                </div>
                <span className="text-sm font-medium">Internacionales</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
