"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Share2, Globe } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        <div className="space-y-8">
          <Link href="/" className="outline-none">
            <img
              src="https://pub-514df041e2b3494caab09827cb896071.r2.dev/logo_rojo_azul_1_ethdja.svg"
              alt="Eldópolis"
              className="h-10 w-auto"
            />
          </Link>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed pr-8">
            Comprometidos con la veracidad y la inmediatez. El portal líder del Alto Paraná Misionero.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all shadow-sm">
              <Share2 className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all shadow-sm">
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-slate-900 dark:text-white">Secciones</h4>
          <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
            <li><Link href="/category/locales" className="hover:text-primary transition-colors">Locales</Link></li>
            <li><Link href="/category/provinciales" className="hover:text-primary transition-colors">Provinciales</Link></li>
            <li><Link href="/category/nacionales" className="hover:text-primary transition-colors">Nacionales</Link></li>
            <li><Link href="/category/deportes" className="hover:text-primary transition-colors">Deportes</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-slate-900 dark:text-white">Institucional</h4>
          <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
            <li><Link href="/publicidad" className="hover:text-primary transition-colors">Publicidad</Link></li>
            <li><Link href="/staff" className="hover:text-primary transition-colors">Staff</Link></li>
            <li><Link href="/contacto" className="hover:text-primary transition-colors">Contacto</Link></li>
            <li><Link href="/terminos" className="hover:text-primary transition-colors">Términos de uso</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-slate-900 dark:text-white">Contacto</h4>
          <div className="space-y-5 text-sm text-slate-500 dark:text-slate-400">
            <p className="flex items-center gap-3"><MapPin className="w-4 h-4 text-primary" /> Eldorado, Misiones</p>
            <p className="flex items-center gap-3"><Mail className="w-4 h-4 text-primary" /> redaccion@eldopolis.com.ar</p>
            <p className="flex items-center gap-3"><Phone className="w-4 h-4 text-primary" /> +54 3751 000000</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-10 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
        <span>© {new Date().getFullYear()} Eldópolis Red. Todos los derechos reservados.</span>
        <div className="flex gap-10">
          <Link href="/privacidad" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Privacidad</Link>
          <Link href="/cookies" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Cookies</Link>
          <Link href="/rss" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">RSS Feed</Link>
        </div>
      </div>
    </footer>
  )
}
export { Footer }
