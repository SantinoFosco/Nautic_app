export default function FAQ() {
  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#F7FAFC] flex justify-center items-start py-12">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-[#0b2849] mb-10 text-center">
          Preguntas Frecuentes (FAQ)
        </h1>

        {/* 🌊 SECCIÓN 1 — Usuarios que usan el mapa */}
        <h2 className="text-2xl font-semibold text-[#0b2849] mb-4 border-b border-gray-300 pb-2">
          🌊 Usuarios — Pronósticos y mapa
        </h2>

        <div className="space-y-2 mb-10">
          {/* Pregunta 1 */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300">
            <input type="radio" name="faq-accordion-users" defaultChecked />
            <div className="collapse-title font-semibold">
              ¿Necesito una cuenta para ver los pronósticos?
            </div>
            <div className="collapse-content text-sm text-gray-600">
              No, podés ver el mapa y los pronósticos de surf o kite sin iniciar sesión.  
              La información del clima está disponible para todos los visitantes.
            </div>
          </div>

          {/* Pregunta 2 */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300">
            <input type="radio" name="faq-accordion-users" />
            <div className="collapse-title font-semibold">
              ¿Qué significan los colores de los puntos en el mapa?
            </div>
            <div className="collapse-content text-sm text-gray-600">
              Los <span className="text-green-600 font-medium">verdes</span> indican condiciones
              excelentes, los <span className="text-yellow-500 font-medium">amarillos</span> buenas
              y los <span className="text-red-600 font-medium">rojos</span> condiciones poco
              favorables para el deporte seleccionado.
            </div>
          </div>

          {/* Pregunta 3 */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300">
            <input type="radio" name="faq-accordion-users" />
            <div className="collapse-title font-semibold">
              ¿Cómo cambio el deporte o el día del pronóstico?
            </div>
            <div className="collapse-content text-sm text-gray-600">
              En el mapa, usá los botones de la esquina superior derecha para seleccionar el deporte
              (<strong>Surf</strong> o <strong>Kite</strong>) y el selector de día para ver el clima
              en los próximos días.
            </div>
          </div>

          {/* Pregunta 4 */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300">
            <input type="radio" name="faq-accordion-users" />
            <div className="collapse-title font-semibold">
              ¿Por qué algunos puntos del mapa no muestran datos?
            </div>
            <div className="collapse-content text-sm text-gray-600">
              Puede que en esa zona no haya datos climáticos suficientes o el spot no tenga
              información disponible para ese día.
            </div>
          </div>
        </div>

        {/* 🏪 SECCIÓN 2 — Dueños de negocios */}
        <h2 className="text-2xl font-semibold text-[#0b2849] mb-4 border-b border-gray-300 pb-2">
          🏪 Dueños de negocios — Registro y gestión
        </h2>

        <div className="space-y-2">
          {/* Pregunta 1 */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300">
            <input type="radio" name="faq-accordion-business" defaultChecked />
            <div className="collapse-title font-semibold">
              ¿Cómo registro mi negocio en la plataforma?
            </div>
            <div className="collapse-content text-sm text-gray-600">
              Primero creá una cuenta haciendo clic en <strong>“Unite a nosotros”</strong>.  
              Luego iniciá sesión, accedé a la sección <strong>“Negocios”</strong> y elegí{" "}
              <strong>“Crear mi negocio”</strong> para completar los datos del establecimiento.
            </div>
          </div>

          {/* Pregunta 2 */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300">
            <input type="radio" name="faq-accordion-business" />
            <div className="collapse-title font-semibold">
              ¿Por qué mi negocio no aparece en el mapa?
            </div>
            <div className="collapse-content text-sm text-gray-600">
              Los negocios nuevos deben ser aprobados antes de mostrarse públicamente.  
              Una vez verificado, tu negocio aparecerá automáticamente en el mapa con un
              marcador azul.
            </div>
          </div>

          {/* Pregunta 3 */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300">
            <input type="radio" name="faq-accordion-business" />
            <div className="collapse-title font-semibold">
              ¿Puedo tener más de un negocio registrado?
            </div>
            <div className="collapse-content text-sm text-gray-600">
              No, actualmente cada cuenta de dueño solo puede administrar un negocio.
              Si querés registrar otro, deberás crear una nueva cuenta de usuario.
            </div>
          </div>

          {/* Pregunta 4 */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300">
            <input type="radio" name="faq-accordion-business" />
            <div className="collapse-title font-semibold">
              ¿Cómo edito la información de mi negocio?
            </div>
            <div className="collapse-content text-sm text-gray-600">
              En la sección <strong>“Negocios”</strong>, seleccioná tu negocio y hacé clic en{" "}
              <strong>“Editar”</strong>. Desde ahí podés actualizar horarios, contacto,
              descripción y otros datos.
            </div>
          </div>

          {/* Pregunta 5 */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300">
            <input type="radio" name="faq-accordion-business" />
            <div className="collapse-title font-semibold">
              ¿Qué pasa si olvidé mi contraseña?
            </div>
            <div className="collapse-content text-sm text-gray-600">
              En la pantalla de inicio de sesión, hacé clic en{" "}
              <strong>“¿Olvidaste tu contraseña?”</strong> y seguí las instrucciones
              para restablecerla por correo electrónico.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
