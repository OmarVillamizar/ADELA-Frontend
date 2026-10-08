import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import {
  guardarInterpretacion,
  obtenerCuestionario,
  obtenerInterpretacion,
} from '../../util/services/cuestionarioService'
import EditorInterpretacion from './crear/EditorInterpretacion'
import ListaErrores from './crear/ListaErrores'
import EsqueletoReporte from '../../components/resultados/EsqueletoReporte'
import {
  LECTURA,
  TIPO,
  erroresInterpretacion,
  interpretacionADTO,
  interpretacionDeLectura,
  polosDeNombre,
} from './crear/borrador'
import '../../components/resultados/resultados.css'
import './crear/crear.css'

const nuevoId = () => Math.random().toString(36).slice(2, 10)

// En esta vista el id de cada estilo es su nombre: así lo identifica el servidor.
const porNombre = (nombre) => nombre

/** InterpretacionDTO del servidor -> forma del editor. */
const aEditor = (dto) => ({
  esquema: dto.esquema,
  delta: dto.delta ?? 10,
  bandas: (dto.bandas ?? []).map((b) => ({
    id: nuevoId(),
    estiloId: b.estilo,
    escala: b.escala,
    li: b.limiteInferior,
    ls: b.limiteSuperior,
    etiqueta: b.etiqueta,
  })),
  escalones: (dto.escalones ?? []).map((s) => ({ ...s })),
  // Los ejes llegan por nombre, que aquí es también el id del estilo.
  ...(dto.plano ? { plano: { ...dto.plano } } : {}),
})

/**
 * Estilos para el editor, con ids = nombres. Del compuesto "A − B" se deducen
 * los polos (A suma, B resta) para que el atajo de niveles y el mapa los usen.
 */
const aEstilosEditor = (lista) =>
  lista.map((e) => {
    const polos = e.tipo === TIPO.COMPUESTO ? polosDeNombre(e.nombre) : null
    return {
      id: e.nombre,
      nombre: e.nombre,
      tipo: e.tipo ?? TIPO.PRIMARIO,
      coeficientes: polos
        ? [
            { estiloId: polos.a, coeficiente: 1 },
            { estiloId: polos.b, coeficiente: -1 },
          ]
        : [],
    }
  })

const ATAJOS = [
  [LECTURA.SOLO_PUNTAJES, 'Solo puntajes'],
  [LECTURA.PREDOMINANTE, 'Destacar el predominante'],
  [LECTURA.NIVELES, 'Bajo · Medio · Alto en todos'],
]

/**
 * Cambiar cómo se leen los resultados de un cuestionario ya creado. Como se
 * califica al leer, el cambio se ve de inmediato en los reportes existentes; los
 * puntajes no cambian.
 */
const InterpretacionCuestionario = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cuestionario, setCuestionario] = useState(null)
  const [estilos, setEstilos] = useState([])
  const [valor, setValor] = useState(null)
  const [esIpsativo, setEsIpsativo] = useState(false)
  const [errorCarga, setErrorCarga] = useState(null)
  const [errores, setErrores] = useState([])
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    let vigente = true
    Promise.all([obtenerCuestionario(id), obtenerInterpretacion(id)])
      .then(([c, inter]) => {
        if (!vigente) return
        setCuestionario(c)
        setEstilos(aEstilosEditor(inter.estilos ?? c.estilos ?? []))
        setValor(aEditor(inter))
        setEsIpsativo(Boolean(inter.esIpsativo))
      })
      .catch((e) => vigente && setErrorCarga(e.message))
    return () => {
      vigente = false
    }
  }, [id])

  const aplicarAtajo = async (lectura) => {
    if (valor.bandas.length > 0) {
      const { isConfirmed } = await Swal.fire({
        title: '¿Reemplazar la configuración?',
        text: 'Se cambiará el esquema y se quitarán los niveles actuales.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Reemplazar',
        cancelButtonText: 'Cancelar',
      })
      if (!isConfirmed) return
    }
    setValor(interpretacionDeLectura({ estilos }, lectura))
    setErrores([])
  }

  const guardar = async () => {
    const locales = erroresInterpretacion(valor, porNombre)
    setErrores(locales)
    if (locales.length > 0) return
    setGuardando(true)
    try {
      await guardarInterpretacion(
        id,
        interpretacionADTO(valor, porNombre, esIpsativo),
      )
      Swal.fire(
        'Lectura guardada',
        'Los reportes ya muestran los resultados con esta configuración.',
        'success',
      )
    } catch (e) {
      const campos = Object.entries(e.fields ?? {})
      setErrores(
        (campos.length > 0 ? campos : [[null, e.message]]).map(
          ([campo, mensaje]) => ({
            seccion: 'interpretacion',
            mensaje,
            // Los errores del mapa señalan el campo del editor.
            ref: campo?.startsWith('plano') ? campo : null,
          }),
        ),
      )
    } finally {
      setGuardando(false)
    }
  }

  const marcados = new Set(errores.map((e) => e.ref).filter(Boolean))

  return (
    <div className="adela-r adela-crear">
      <div className="adela-r__bar mb-3">
        <div>
          <h2>Lectura de resultados</h2>
          <p className="adela-r__subtitulo m-0">
            {cuestionario ? cuestionario.nombre : 'Cargando…'}
          </p>
        </div>
        <div className="adela-r__acciones">
          <button
            type="button"
            className="adela-btn adela-btn--sm"
            onClick={() => navigate('/administrar-cuestionarios')}
          >
            Volver
          </button>
        </div>
      </div>

      {errorCarga && (
        <div className="adela-errores" role="alert">
          No se pudo cargar: {errorCarga}
        </div>
      )}
      {!errorCarga && !valor && <EsqueletoReporte />}

      {valor && (
        <>
          <div className="adela-panel">
            <div className="adela-panel__cabeza">
              <div>
                <h3 className="adela-panel__titulo">Atajos</h3>
                <p className="adela-panel__nota">
                  Configuraciones listas; luego puedes ajustarlas abajo.
                </p>
              </div>
            </div>
            <div className="adela-fila">
              {ATAJOS.map(([lectura, texto]) => (
                <button
                  key={lectura}
                  type="button"
                  className="adela-btn adela-btn--sm"
                  onClick={() => aplicarAtajo(lectura)}
                >
                  {texto}
                </button>
              ))}
            </div>
          </div>

          <div className="adela-panel">
            <EditorInterpretacion
              estilos={estilos}
              valor={valor}
              marcados={marcados}
              onChange={setValor}
            />
            <label className="adela-fila mt-4" style={{ gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={esIpsativo}
                onChange={(e) => setEsIpsativo(e.target.checked)}
              />
              <span>
                <strong>Respuestas ipsativas</strong>
                <span className="adela-ayuda d-block m-0">
                  Se marca solo al ordenar o repartir puntos: los estilos de una
                  persona compiten entre sí, y los reportes advierten que la
                  media del grupo se lea con cuidado.
                </span>
              </span>
            </label>
          </div>

          <ListaErrores errores={errores} />

          <div className="adela-navegacion">
            <span className="adela-falta">
              El cambio se aplica a todos los resultados, también a los ya
              respondidos; los puntajes no cambian.
            </span>
            <button
              type="button"
              className="adela-btn adela-btn--primario"
              disabled={guardando}
              onClick={guardar}
            >
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default InterpretacionCuestionario
