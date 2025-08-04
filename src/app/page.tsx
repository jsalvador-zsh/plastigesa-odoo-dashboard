import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-muted text-muted-foreground flex flex-col items-center justify-center px-4">
      <section className="max-w-7xl w-full grid md:grid-cols-2 gap-10 items-center py-16">
        {/* Texto principal */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            El Dashboard que guía tu negocio
          </h1>
          <p className="text-lg text-muted-foreground">
            Nuestra plataforma está diseñada para ayudarte a visualizar, planificar y controlar todos tus procesos conectados con Odoo.
          </p>
          <ul className="space-y-2 text-sm">
            <li>✅ Conexión segura y autenticación</li>
            <li>📊 Reportes visuales en tiempo real</li>
            <li>🤝 Colaboración entre áreas y equipos</li>
            <li>🎯 Integración total con módulos de Odoo</li>
          </ul>

          <div className="flex gap-4 pt-4">
            <Link href="/sign-in">
              <Button className="cursor-pointer">
                Ingresar
              </Button>
            </Link>
          </div>
        </div>

        {/* Imagen del dashboard */}
        <div className="rounded-xl overflow-hidden border shadow-md">
          <Image
            src="/mockup.png"
            alt="Ejemplo de dashboard"
            width={800}
            height={600}
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* Carrusel de logos */}
      <section className="w-full py-10 border-t">
        <div className="text-center pb-6">
          <p className="text-lg text-foreground font-semibold">Tecnologías utilizadas</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-10 px-6 animate-pulse-slow">
          <Image src="/logos/nextjs.svg" alt="Next.js" width={40} height={20} />
          <Image src="/logos/odoo.svg" alt="Odoo" width={40} height={20} />
          <Image src="/logos/clerk.svg" alt="Clerk" width={40} height={20} />
          <Image src="/logos/shadcn.svg" alt="ShadCN" width={40} height={20} />
          <Image src="/logos/tailwind.svg" alt="TailwindCSS" width={40} height={20} />
          <Image src="/logos/vercel.svg" alt="Vercel" width={40} height={20} />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-sm text-muted-foreground text-center border-t w-full">
        Dashboard conectado a Odoo — Desarrollado con ❤️ en Next.js
      </footer>
    </main>
  )
}
