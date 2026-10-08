import React from 'react'
import PropTypes from 'prop-types'
import SelectorEscala from './SelectorEscala'
import GraficasResultado from './GraficasResultado'
import TablaEstilos from './TablaEstilos'
import EscalasCompuestas from './EscalasCompuestas'
import { useEscala } from '../../util/calificacion/useEscala'
import {
  AYUDA_POMP,
  ESCALA,
  separarPorTipo,
} from '../../util/calificacion/escala'
import './resultados.css'

/**
 * Puntajes de un resultado individual: gráficos en la escala elegida y tabla.
 * Los estilos compuestos (polos) van aparte, en su propia escala.
 */
const PanelEstilos = ({ estilos, calificacion, etiqueta }) => {
  const { escala, setEscala, disponibles } = useEscala(calificacion)
  const { primarios, compuestos } = separarPorTipo(estilos)
  return (
    <>
      <section className="adela-panel adela-aparece" style={{ '--i': 1 }}>
        <div className="adela-panel__cabeza">
          <div>
            <h2 className="adela-panel__titulo">
              Puntajes por estilo de aprendizaje
            </h2>
            {escala === ESCALA.POMP && (
              <p className="adela-panel__nota">{AYUDA_POMP}</p>
            )}
          </div>
          <SelectorEscala
            disponibles={disponibles}
            valor={escala}
            onChange={setEscala}
          />
        </div>
        <GraficasResultado
          estilos={primarios}
          escala={escala}
          etiqueta={etiqueta}
        />
        <div className="mt-4">
          <TablaEstilos estilos={primarios} />
        </div>
      </section>
      <EscalasCompuestas estilos={compuestos} />
    </>
  )
}

PanelEstilos.propTypes = {
  estilos: PropTypes.arrayOf(PropTypes.object).isRequired,
  calificacion: PropTypes.object,
  etiqueta: PropTypes.string,
}

export default PanelEstilos
