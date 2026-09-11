import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y Condiciones — EduScout",
  description:
    "Términos y condiciones de uso de EduScout, agregador de ofertas académicas de educación superior en Chile.",
};

const lastUpdated = "11 de septiembre de 2026";

export default function TermsPage() {
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
          Términos y Condiciones
        </h1>
        <p className="text-xs text-piedra mb-8">
          Última actualización: {lastUpdated}
        </p>

        <div className="space-y-8 text-sm text-azul leading-relaxed">
          <section>
            <h2 className="text-lg font-display font-bold text-azul mb-3">
              1. Naturaleza del servicio
            </h2>
            <p className="text-piedra">
              EduScout es un servicio informativo que centraliza ofertas de
              trabajo académico publicadas por terceros. No somos una bolsa de
              empleo, no recibimos postulaciones ni participamos en los
              procesos de selección de las instituciones.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-azul mb-3">
              2. Origen de la información
            </h2>
            <p className="text-piedra">
              Las ofertas, sus descripciones y requisitos provienen de sitios
              públicos de las propias instituciones. La fuente oficial de cada
              convocatoria es la institución que la publica, y su publicación
              prevalece sobre lo que aquí se muestre.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-azul mb-3">
              3. Sin garantías
            </h2>
            <p className="text-piedra">
              Trabajamos para que la información sea oportuna y fiel a su
              origen, pero no garantizamos su exactitud, integridad ni
              permanencia. Las convocatorias pueden modificarse o cerrarse sin
              previo aviso. Antes de postular, verifique siempre la publicidad
              oficial.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-azul mb-3">
              4. Propiedad intelectual
            </h2>
            <p className="text-piedra">
              Los nombres, logos y contenidos de cada institución pertenecen a
              sus respectivos titulares. EduScout los utiliza únicamente con
              fines informativos. El código y diseño de la plataforma son
              propiedad de sus desarrolladores.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-azul mb-3">
              5. Uso aceptable
            </h2>
            <p className="text-piedra">
              Usted acepta usar el servicio con fines legítimos: no extraer los
              datos de forma masiva ni automatizada, no interferir con su
              funcionamiento y no emplear la información con fines ajenos a la
              búsqueda de oportunidades académicas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-azul mb-3">
              6. Disponibilidad
            </h2>
            <p className="text-piedra">
              Podemos modificar, suspender o discontinuar el servicio en
              cualquier momento. Las ofertas dejan de mostrarse cuando la
              fuente oficial deja de publicarlas o expira su vigencia.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-azul mb-3">
              7. Cambios
            </h2>
            <p className="text-piedra">
              Estos términos pueden actualizarse. La versión vigente será la
              publicada en esta página.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}