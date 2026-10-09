import React from 'react'
import PropTypes from 'prop-types'
import {
  ESQUEMA,
  LECTURA,
  interpretacionDeLectura,
  marcasPosibles,
  porcentajeDelMaximo,
  rangoEstilo,
} from '../borrador'
import { conEstructuraSugerida, modeloDe } from './modelos'

const fmt = (v) =>
  Number(v).toLocaleString('es-CO', { maximumFractionDigits: 1 })
const signo = (v) => (v > 0 ? `+${fmt(v)}` : fmt(v))

/** Explicación de cada lectura cuando no viene de un modelo. */
const GENERICAS = {
  [LECTURA.SOLO_PUNTAJES]: {
    calculo:
      'Cada estilo muestra su puntaje (la suma de lo que eligió el estudiante) y su % del máximo: (puntaje − mínimo) ÷ (máximo − mínimo). No se destaca ninguno.',
    ejemplo:
      'Un estilo que va de 0 a 20 y suma 14 → 14 ÷ 20 = 70 % del máximo.',
  },
  [LECTURA.PREDOMINANTE]: {
    calculo:
      'Se calcula el % del máximo de cada estilo. Destacan el más alto y los que quedan a menos de 10 puntos de él.',
    ejemplo:
      '80 %, 75 % y 60 % → destacan los dos primeros: 75 está a 5 puntos del más alto; 60 está a 20.',
  },
  [LECTURA.NIVELES]: {
    calculo:
      'Cada estilo recibe un nivel según su % del máximo: Bajo hasta 33 %, Medio hasta 67 % y Alto desde ahí. En un par opuesto, el nivel dice hacia qué polo tiende.',
    ejemplo: 'Un estilo de 0 a 20 que suma 15 → 75 % → Alto.',
  },
  [LECTURA.DOMINANCIA]: {
    calculo:
      'Se calcula el % del máximo de cada estilo: desde el 75 % es primaria (domina), desde el 50 % secundaria y por debajo terciaria. El código resume el nivel de cada estilo en orden: 1 primaria, 2 secundaria, 3 terciaria.',
    ejemplo:
      'Un estilo de 10 a 50 puntos que suma 42 → (42 − 10) ÷ 40 = 80 % → primaria.',
  },
  [LECTURA.CUADRANTES]: {
    calculo:
      'Cada par opuesto es un eje: el puntaje de un polo menos el del otro. Comparando cada eje con su corte, el estudiante cae en una de las cuatro esquinas. Un puntaje igual al corte cuenta como lado bajo.',
  },
  [LECTURA.ESCALONADO]: {
    calculo:
      'Se ordenan los estilos de mayor a menor puntaje y se van sumando al perfil mientras la diferencia con el anterior no supere una tolerancia. La tolerancia crece con el total de marcas: quien marca mucho tiene puntajes más altos y diferencias más grandes.',
    ejemplo:
      'Puntajes 10, 9, 6 y 2 con tolerancia 2 → entran 10 y 9 (difieren 1); 9 → 6 difiere 3 y se detiene.',
  },
}

/** Tramos de puntaje entero de cada nivel: «Muy baja 0–6 · Baja 7–8 …». */
const tramos = (bandas, r) => {
  const lista = []
  for (let v = Math.ceil(r.min); v <= Math.floor(r.max); v++) {
    const pomp = porcentajeDelMaximo(v, r)
    const banda = bandas.find((x) => pomp >= x.li - 1e-9 && pomp <= x.ls + 1e-9)
    const etiqueta = banda?.etiqueta ?? '—'
    const ultimo = lista.at(-1)
    if (ultimo && ultimo.etiqueta === etiqueta) ultimo.hasta = v
    else lista.push({ etiqueta, desde: v, hasta: v })
  }
  return lista
}

const Rango = ({ r }) =>
  r.preguntas === 0 ? (
    <span className="text-body-secondary">sin preguntas todavía</span>
  ) : (
    <>
      de {fmt(r.min)} a {fmt(r.max)}{' '}
      <span className="text-body-secondary">({r.preguntas} preg.)</span>
    </>
  )

Rango.propTypes = { r: PropTypes.object.isRequired }

/** Lo que significa cada número con las preguntas reales (o las sugeridas). */
const Detalle = ({ b, inter }) => {
  if (inter.esquema === ESQUEMA.RELATIVO_ESCALONADO) {
    return (
      <div className="adela-calculo__scroll">
        <table className="adela-calculo__tabla">
          <thead>
            <tr>
              <th>Total de marcas del estudiante</th>
              <th>Diferencia tolerada entre estilos</th>
            </tr>
          </thead>
          <tbody>
            {inter.escalones.map((s) => (
              <tr key={s.totalMin}>
                <td>
                  de {fmt(s.totalMin)} a {fmt(s.totalMax)}
                </td>
                <td>
                  hasta {fmt(s.distancia)}{' '}
                  {s.distancia === 1 ? 'punto' : 'puntos'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="adela-ayuda mb-0">
          Marcas posibles: {marcasPosibles(b)}. Con 0 marcas no se calcula
          perfil.
        </p>
      </div>
    )
  }
  if (inter.esquema === ESQUEMA.CUADRANTES && inter.plano) {
    const eje = (id, corte, lado) => {
      const e = b.estilos.find((x) => x.id === id)
      if (!e) return null
      return (
        <tr key={lado}>
          <th>{e.nombre}</th>
          <td>
            <Rango r={rangoEstilo(b, e)} />
          </td>
          <td>
            corte {signo(Number(corte) || 0)}: por encima es el lado de{' '}
            {e.nombre.split(' − ')[0]}
          </td>
        </tr>
      )
    }
    return (
      <div className="adela-calculo__scroll">
        <table className="adela-calculo__tabla">
          <tbody>
            {eje(inter.plano.ejeX, inter.plano.corteX, 'x')}
            {eje(inter.plano.ejeY, inter.plano.corteY, 'y')}
          </tbody>
        </table>
      </div>
    )
  }
  const conBandas = b.estilos.filter((e) =>
    inter.bandas.some((x) => x.estiloId === e.id),
  )
  const filas = conBandas.length > 0 ? conBandas : b.estilos
  return (
    <div className="adela-calculo__scroll">
      <table className="adela-calculo__tabla">
        <tbody>
          {filas.map((e) => {
            const r = rangoEstilo(b, e)
            const propias = inter.bandas.filter((x) => x.estiloId === e.id)
            return (
              <tr key={e.id}>
                <th>{e.nombre}</th>
                <td>
                  <Rango r={r} />
                </td>
                {propias.length > 0 && (
                  <td>
                    {r.preguntas > 0 &&
                      tramos(propias, r)
                        .map((t) =>
                          t.desde === t.hasta
                            ? `${t.etiqueta} ${fmt(t.desde)}`
                            : `${t.etiqueta} ${fmt(t.desde)} a ${fmt(t.hasta)}`,
                        )
                        .join(' · ')}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

Detalle.propTypes = {
  b: PropTypes.object.isRequired,
  inter: PropTypes.object.isRequired,
}

/**
 * «Cómo se calcula»: la regla en palabras, un ejemplo con números y lo que
 * significa cada puntaje con las preguntas del cuestionario. Sin preguntas,
 * usa la estructura que sugiere el modelo para anticipar los cortes.
 */
const CalculoLectura = ({ borrador }) => {
  if (!borrador.lectura) return null
  const m = modeloDe(borrador)
  const explicacion =
    m && m.lectura === borrador.lectura
      ? m.explica
      : GENERICAS[borrador.lectura]
  const vacio = borrador.preguntas.length === 0
  const base = vacio && m ? conEstructuraSugerida(borrador, m) : borrador
  const inter = interpretacionDeLectura(base)
  return (
    <section className="adela-calculo" aria-label="Cómo se calcula">
      <p className="adela-calculo__titulo">Cómo se calcula</p>
      {explicacion && <p className="mb-0">{explicacion.calculo}</p>}
      {explicacion?.ejemplo && (
        <p className="adela-ejemplo adela-ejemplo--cuenta">
          {explicacion.ejemplo}
        </p>
      )}
      {(!vacio || m) && (
        <>
          <p className="adela-calculo__titulo mt-3 mb-0">
            {vacio
              ? `Así quedaría con la estructura sugerida (${m.sugerido.texto})`
              : `Así queda con tus ${borrador.preguntas.length} preguntas`}
          </p>
          <Detalle b={base} inter={inter} />
        </>
      )}
    </section>
  )
}

CalculoLectura.propTypes = { borrador: PropTypes.object.isRequired }

export default CalculoLectura
