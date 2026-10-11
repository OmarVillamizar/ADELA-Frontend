import React, { useState } from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBank,
  cilCheckAlt,
  cilCopy,
  cilCreditCard,
  cilExternalLink,
  cilMoney,
} from '@coreui/icons'
import Swal from 'sweetalert2'
import './donaciones.css'

// Cada cuenta toma un color del logo de ADELA.
const CUENTAS = [
  {
    banco: 'Bancolombia',
    numero: '832-311919-52',
    tipo: 'Cuenta de ahorros',
    titular: 'Omar Villamizar',
    icono: cilBank,
    acento: 'azul',
  },
  {
    banco: 'Nequi',
    numero: '3209241023',
    tipo: 'Número de celular',
    titular: 'Omar Villamizar',
    icono: cilMoney,
    acento: 'morado',
  },
  {
    banco: 'PayPal',
    enlace: 'https://paypal.me/omarvilla22',
    tipo: 'Pago en línea',
    titular: 'Omar Villamizar',
    icono: cilCreditCard,
    acento: 'cian',
  },
]

// Ilustraciones de cada destino, dibujadas con trazos simples.
const IconoServidor = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <rect x="8" y="8" width="32" height="12" rx="3" />
    <rect x="8" y="28" width="32" height="12" rx="3" />
    <circle cx="15" cy="14" r="2" className="don-relleno" />
    <circle cx="15" cy="34" r="2" className="don-relleno" />
    <path d="M24 14h10M24 34h10" />
  </svg>
)

const IconoDominio = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <circle cx="24" cy="24" r="16" />
    <path d="M8 24h32M24 8c-6 5-6 27 0 32M24 8c6 5 6 27 0 32" />
  </svg>
)

const IconoMantenimiento = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <path d="M30 8a9 9 0 0 0-8 12L9 33a4 4 0 0 0 6 6l13-13a9 9 0 0 0 12-8l-6 2-4-4 2-6z" />
  </svg>
)

const IconoCrecimiento = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <path d="M24 42V22" />
    <path d="M24 26c0-8-6-12-14-12 0 8 6 12 14 12z" />
    <path d="M24 22c0-8 6-12 14-12 0 8-6 12-14 12z" />
    <path d="M14 42h20" />
  </svg>
)

const DESTINOS = [
  {
    titulo: 'Servidor',
    texto: 'Cuota del servidor de despliegue y de la base de datos.',
    Icono: IconoServidor,
    acento: 'azul',
  },
  {
    titulo: 'Dominio propio',
    texto: 'Un dominio acorde a la temática del aplicativo.',
    Icono: IconoDominio,
    acento: 'cian',
  },
  {
    titulo: 'Mantenimiento',
    texto: 'Actualizaciones, mejoras de seguridad y optimización del sitio.',
    Icono: IconoMantenimiento,
    acento: 'verde',
  },
  {
    titulo: 'Crecimiento',
    texto: 'Nuevas funcionalidades y expansión de la plataforma.',
    Icono: IconoCrecimiento,
    acento: 'naranja',
  },
]

// Corazón partido en los cuatro cuadrantes del logo, con sus nodos.
const ArteCorazon = () => (
  <svg
    viewBox="0 0 220 200"
    className="don-arte"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <clipPath id="don-corazon">
        <path d="M110 186C52 146 14 112 14 68 14 38 37 16 66 16c19 0 34 10 44 25 10-15 25-25 44-25 29 0 52 22 52 52 0 44-38 78-96 118z" />
      </clipPath>
    </defs>
    <g clipPath="url(#don-corazon)">
      <rect x="0" y="0" width="110" height="96" fill="#1a73e8" />
      <rect x="110" y="0" width="110" height="96" fill="#12bfe8" />
      <rect x="0" y="96" width="110" height="104" fill="#6cc93a" />
      <rect x="110" y="96" width="110" height="104" fill="#f7931e" />
      <circle cx="46" cy="50" r="4" fill="#fff" opacity="0.8" />
      <circle cx="170" cy="58" r="3" fill="#fff" opacity="0.8" />
      <circle cx="62" cy="128" r="3" fill="#fff" opacity="0.8" />
      <circle cx="150" cy="122" r="4" fill="#fff" opacity="0.8" />
      <path d="M110 0v200M0 96h220" stroke="#0b1b2e" strokeWidth="6" />
    </g>
    <path
      d="M110 186C52 146 14 112 14 68 14 38 37 16 66 16c19 0 34 10 44 25 10-15 25-25 44-25 29 0 52 22 52 52 0 44-38 78-96 118z"
      fill="none"
      stroke="#0b1b2e"
      strokeWidth="7"
      strokeLinejoin="round"
    />
    <circle
      cx="110"
      cy="96"
      r="12"
      fill="#ffc21a"
      stroke="#0b1b2e"
      strokeWidth="5"
    />
    <circle
      cx="110"
      cy="38"
      r="9"
      fill="#a63ff0"
      stroke="#0b1b2e"
      strokeWidth="5"
    />
    <circle
      cx="17"
      cy="96"
      r="9"
      fill="#6cc93a"
      stroke="#0b1b2e"
      strokeWidth="5"
    />
    <circle
      cx="203"
      cy="96"
      r="9"
      fill="#12bfe8"
      stroke="#0b1b2e"
      strokeWidth="5"
    />
  </svg>
)

const Donaciones = () => {
  const [copiada, setCopiada] = useState(null)

  const copiar = async (cuenta) => {
    try {
      await navigator.clipboard.writeText(cuenta.numero)
      setCopiada(cuenta.banco)
      setTimeout(() => setCopiada(null), 2000)
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo copiar',
        text: `Copia el número a mano: ${cuenta.numero}`,
      })
    }
  }

  return (
    <div className="don">
      <section className="don-hero">
        <ArteCorazon />
        <div>
          <h1>Apoya a ADELA</h1>
          <p>
            Tu contribución mantiene el aplicativo en línea y lo mejora para
            estudiantes y profesores. Cualquier aporte, sin importar su tamaño,
            hace la diferencia. ¡Gracias por tu apoyo!
          </p>
          <p className="don-nota">
            <strong>Transparencia:</strong> se publicarán informes sobre el uso
            de las donaciones.
          </p>
        </div>
      </section>

      <div className="don-columnas">
        <section>
          <h2 className="don-titulo">Cuentas para donar</h2>
          <div className="don-cuentas">
            {CUENTAS.map((cuenta) => (
              <article
                key={cuenta.banco}
                className={`don-cuenta don-acento-${cuenta.acento}`}
              >
                <span className="don-cuenta-icono">
                  <CIcon icon={cuenta.icono} />
                </span>
                <div className="don-cuenta-datos">
                  <h3>{cuenta.banco}</h3>
                  <p>
                    {cuenta.tipo} · {cuenta.titular}
                  </p>
                  {cuenta.numero && (
                    <code className="don-numero">{cuenta.numero}</code>
                  )}
                </div>
                {cuenta.enlace ? (
                  <a
                    href={cuenta.enlace}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="don-boton adela-tactil"
                  >
                    <CIcon icon={cilExternalLink} />
                    Ir a PayPal
                  </a>
                ) : (
                  <button
                    type="button"
                    className="don-boton adela-tactil"
                    onClick={() => copiar(cuenta)}
                    aria-live="polite"
                  >
                    <CIcon
                      icon={copiada === cuenta.banco ? cilCheckAlt : cilCopy}
                    />
                    {copiada === cuenta.banco ? '¡Copiado!' : 'Copiar'}
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="don-titulo">¿En qué se usan las donaciones?</h2>
          <div className="don-destinos">
            {DESTINOS.map(({ titulo, texto, Icono, acento }) => (
              <div key={titulo} className={`don-destino don-acento-${acento}`}>
                <span className="don-destino-icono">
                  <Icono />
                </span>
                <div>
                  <h3>{titulo}</h3>
                  <p>{texto}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Donaciones
