import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacidad",
  description:
    "Política de privacidad de EduScout, agregador de ofertas académicas de educación superior en Chile.",
  alternates: {
    canonical: "/privacidad",
  },
};

const lastUpdated = "28 de octubre de 2026";

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
              Buscar y revisar ofertas no requiere registro. De forma
              opcional, puede crear una cuenta de postulante para guardar
              ofertas, recibir alertas y adjuntar su currículum. En ese caso
              almacenamos su nombre, correo electrónico, contraseña cifrada y,
              si usted lo decide, teléfono, currículum en PDF y preferencias de
              notificación. Puede eliminar esos datos solicitándolo por los
              canales de contacto indicados más abajo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-azul mb-3">
              2. Cómo usamos la información
            </h2>
            <p className="text-piedra">
              Los datos que mostramos tienen un único propósito: facilitar la
              búsqueda y comparación de oportunidades académicas. Los datos de
              su cuenta se usan sólo para operar el servicio: autenticarlo,
              enviarle las alertas que usted configure y permitirle postular
              con su currículum. No vendemos, cedemos ni compartimos
              información personal de los usuarios con terceros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-azul mb-3">
              3. Medición de audiencia
            </h2>
            <p className="text-piedra">
              Para saber cuántas personas visitan el sitio y por qué canal
              llegan, usamos dos mecanismos propios, sin cookies de terceros ni
              publicidad:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2 text-piedra">
              <li>
                <strong>Registros de acceso del servidor:</strong> cada
                solicitud queda registrada con fecha, dirección IP, página
                solicitada y agente de usuario. Se conservan por un período
                acotado y se usan para operar el servicio y medir tráfico.
              </li>
              <li>
                <strong>Almacenamiento local en su navegador:</strong> si llega
                desde un enlace con parámetros de campaña o desde otro sitio,
                guardamos en su propio navegador de qué canal provino. Ese dato
                se asocia a su cuenta sólo si decide registrarse, y puede
                borrarlo limpiando los datos del sitio en su navegador.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-azul mb-3">
              4. Enlaces a sitios externos
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
              5. Seguridad
            </h2>
            <p className="text-piedra">
              Adoptamos medidas razonables para proteger los datos alojados en
              nuestros sistemas y para garantizar que la información publicada
              refleje fielmente la fuente original. Las contraseñas se almacenan
              cifradas y el sitio opera íntegramente sobre HTTPS.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-azul mb-3">
              6. Cambios a esta política
            </h2>
            <p className="text-piedra">
              Podemos actualizar esta política periódicamente. Los cambios se
              publicarán en esta página junto con su fecha de vigencia.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-azul mb-3">
              7. Contacto
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