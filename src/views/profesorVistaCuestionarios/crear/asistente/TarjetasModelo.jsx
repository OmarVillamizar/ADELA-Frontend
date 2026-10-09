import React from 'react'
import PropTypes from 'prop-types'
import { PLANTILLA } from '../borrador'
import { modelosDe, nombrePar } from './modelos'

/** Estilos, pares y grupos que arma el modelo, como chips. */
const Estructura = ({ m }) => (
  <>
    <div className="adela-chips">
      {m.estilos.map((e) => (
        <span key={e.clave} className="adela-chip" title={e.describe}>
          {e.nombre}
        </span>
      ))}
    </div>
    {m.pares && m.plantilla !== PLANTILLA.ORDENAR && (
      <p className="adela-ayuda mb-0 mt-2">
        En pares opuestos: {m.pares.map((p) => nombrePar(m, p)).join(' · ')}
      </p>
    )}
    {m.plano && (
      <p className="adela-ayuda mb-0 mt-2">
        Dos ejes (hacer ↔ observar, pensar ↔ sentir) y cuatro estilos:{' '}
        {[
          m.plano.xAltoYAlto,
          m.plano.xBajoYAlto,
          m.plano.xBajoYBajo,
          m.plano.xAltoYBajo,
        ].join(', ')}
        .
      </p>
    )}
    {m.grupos && (
      <p className="adela-ayuda mb-0 mt-2">
        Se suman en:{' '}
        {m.grupos
          .map((g) => `${g.nombre} (${g.describe.replace(/\.$/, '')})`)
          .join(' · ')}
      </p>
    )}
  </>
)

Estructura.propTypes = { m: PropTypes.object.isRequired }

/**
 * Paso Tipo: los modelos guía de la forma de responder elegida. Cada tarjeta
 * muestra qué arma, cómo responde el estudiante y cómo se lee el resultado
 * con un ejemplo numérico, antes de usarlo.
 */
const TarjetasModelo = ({ plantilla, enUso, onUsar }) => {
  const modelos = modelosDe(plantilla)
  if (modelos.length === 0) {
    return (
      <p className="adela-ayuda mt-3 mb-0">
        No hay modelos para esta forma de responder. Pulsa «Siguiente» y arma
        los estilos a tu medida.
      </p>
    )
  }
  return (
    <section className="mt-4" aria-label="Modelos guía">
      <strong className="d-block">¿Quieres seguir un modelo conocido?</strong>
      <p className="adela-ayuda mt-1 mb-0">
        Un modelo arma los estilos y la forma de calcular los resultados. Las
        preguntas las escribes tú, con la cantidad que quieras: los cortes se
        ajustan solos. Si prefieres empezar de cero, pulsa «Siguiente».
      </p>
      <div className="adela-modelos">
        {modelos.map((m) => (
          <article
            key={m.id}
            className="adela-modelo"
            data-en-uso={enUso === m.id}
          >
            <div className="adela-item__cabeza mb-1">
              <h4 className="adela-modelo__titulo adela-crece">{m.nombre}</h4>
              <button
                type="button"
                className={`adela-btn adela-btn--sm${enUso === m.id ? '' : ' adela-btn--primario'}`}
                onClick={() => onUsar(m)}
              >
                {enUso === m.id
                  ? 'En uso · volver a aplicar'
                  : 'Usar este modelo'}
              </button>
            </div>
            <p className="adela-modelo__resumen">{m.resumen}</p>
            <div className="adela-modelo__rejilla">
              <div>
                <span className="adela-modelo__etiqueta">Qué arma</span>
                <Estructura m={m} />
              </div>
              <div>
                <span className="adela-modelo__etiqueta">
                  Así responde el estudiante
                </span>
                <span className="d-block">{m.respuesta.texto}</span>
                <p className="adela-ejemplo">{m.respuesta.ejemplo}</p>
              </div>
            </div>
            <span className="adela-modelo__etiqueta">
              Así se lee el resultado
            </span>
            <span className="d-block">{m.explica.titulo}</span>
            <p className="adela-ejemplo adela-ejemplo--cuenta">
              {m.explica.ejemplo}
            </p>
            <p className="adela-ayuda mt-2 mb-0">
              Sugerido: {m.sugerido.texto}.
              {m.complementaria &&
                ' Incluye la pregunta extra para cuando destacan todos los estilos.'}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

TarjetasModelo.propTypes = {
  plantilla: PropTypes.string.isRequired,
  enUso: PropTypes.string,
  onUsar: PropTypes.func.isRequired,
}

export default TarjetasModelo
