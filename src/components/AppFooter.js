import React from 'react'
import { CFooter } from '@coreui/react'
//CoreUI React Admin &amp; Dashboard Template

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a
          href="https://coreui.io"
          target="_blank"
          rel="noopener noreferrer"
        ></a>
      </div>
      <div className="ms-auto">
        <a
          href="https://coreui.io/react"
          target="_blank"
          rel="noopener noreferrer"
        ></a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
