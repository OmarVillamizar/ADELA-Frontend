import React from 'react'
import { CCard, CCardBody, CProgress } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked } from '@coreui/icons'
import { useInsignias } from '../../util/insignias/InsigniasProvider'
import { CATALOGO_INSIGNIAS } from './catalogo'
import './MisInsignias.css'

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' })

const MisInsignias = () => {
  const { insignias, pendiente } = useInsignias()
  // La que se está celebrando aún no cuenta: aparece a color cuando aterriza.
  const ganadas = new Map(
    insignias
      .filter((i) => i.codigo !== pendiente?.codigo)
      .map((i) => [i.codigo, i]),
  )
  const total = CATALOGO_INSIGNIAS.length

  return (
    <CCard className="mb-4 shadow-sm">
      <CCardBody className="p-4">
        <div className="insignias-cabecera">
          <div>
            <h3 className="mb-1">Mis insignias</h3>
            <p className="text-body-secondary mb-0">
              Cada logro enciende una insignia. ¡Consíguelas todas!
            </p>
          </div>
          <div className="insignias-progreso">
            <strong>
              {ganadas.size} / {total}
            </strong>
            <CProgress
              value={(ganadas.size / total) * 100}
              color="warning"
              height={8}
            />
          </div>
        </div>

        <div className="insignias-grid">
          {CATALOGO_INSIGNIAS.map((insignia) => {
            const ganada = ganadas.get(insignia.codigo)
            return (
              <div
                key={insignia.codigo}
                className={`insignia-tarjeta ${ganada ? 'ganada' : 'bloqueada'}`}
              >
                <div className="insignia-imagen">
                  <img
                    src={insignia.imagen}
                    alt=""
                    loading="lazy"
                    draggable="false"
                  />
                  {!ganada && (
                    <span className="insignia-candado" aria-hidden="true">
                      <CIcon icon={cilLockLocked} />
                    </span>
                  )}
                </div>
                <h5 className="insignia-nombre">{insignia.nombre}</h5>
                <p className="insignia-texto">
                  {ganada ? insignia.texto : insignia.pista}
                </p>
                {ganada && (
                  <small className="insignia-fecha">
                    {formatoFecha.format(new Date(ganada.obtenidaEn))}
                  </small>
                )}
                <span className="visually-hidden">
                  {ganada ? 'Obtenida' : 'Bloqueada'}
                </span>
              </div>
            )
          })}
        </div>
      </CCardBody>
    </CCard>
  )
}

export default MisInsignias
