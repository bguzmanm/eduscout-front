import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacidad — EduScout",
  description:
    "Política de privacidad de EduScout, agregador de ofertas académicas de educación superior en Chile.",
};

const lastUpdated = "11 de septiembre de 2026";

export default function PrivacyPage() {
  return (
    <div className="pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="text-sm text-dorado hover:opacity-80 font-semibold mb-6 inline-block"
        >
          ← Volver al inicio
        </Link>
        <h1 className="text-3xl font-display font-bold text-azul mb-2">
          Política de Privacidad
        </h1>
        <p className="text-xs text-piedra mb-8">
          Última actualización: {lastUpdated}
        </p>

        <div className="space-y-8 text-sm text-azul leading-relaxed">
          <section>
            <h2 className="text-lg font-display font-bold text-azul mb-3">
              1. Información que recopilamos
            </h2>
            <p className="text-piedra">
              EduScout recopila y publica ofertas de trabajo anunciadas
              públicamente por universidades e instituciones de educación
              superior. Para cada oferta, almacenamos datos de carácter
              público, como el título del cargo, la descripción, los
              requisitos, las fechas de publicación y cierre, y el enlace
              oficial de postulación.
            </p>
            <p className="text-piedra mt-3">
              No solicitamos ni almacenamos datos personales de los visitantes:
              EduScout no requiere registro, cuenta ni contraseña para su uso.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-azul mb-3">
              2. Cómo usamos la información
            </h2>
            <p className="text-piedra">
              Los datos que mostramos tienen un único propósito: facilitar la
              búsqueda y comparación de oportunidades académicas. No vendemos,
              cedemos ni compartimos información personal de los usuarios con
              terceros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-azul mb-3">
              3. Enlaces a sitios externos
            </h2>
            <p className="text-piedra">
              Cada oferta incluye un enlace al sitio oficial de la institución
              que la publicó. Al postular, usted se dirige a ese sitio y queda
              sujeto a las políticas y tratamientos de datos de la institución
              correspondiente. EduScout no controla ni es responsable por esos
              sitios.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-azul mb-3">
              4. Seguridad
            </h2>
            <p className="text-piedra">
              Adoptamos medidas razonables para proteger los datos alojados en
              nuestros sistemas y para garantizar que la información publicada
              refleje fielmente la fuente original.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-azul mb-3">
              5. Cambios a esta política
            </h2>
            <p className="text-piedra">
              Podemos actualizar esta política periódicamente. Los cambios se
              publicarán en esta página junto con su fecha de vigencia.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-azul mb-3">
              6. Contacto
            </h2>
            <p className="text-piedra">
              Si tiene preguntas sobre esta política, escríbanos a través de los
              canales indicados en cada institución, o contacte al equipo
              detrás de EduScout mediante los medios oficiales del proyecto.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}