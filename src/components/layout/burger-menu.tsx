import * as React from "react"
import { FC } from "react"

const BurgerMenu: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    width={120}
    height={80}
    viewBox="0 0 24 12"
    {...props}
  >
    <g fill="#fff">
      <path d="M.5 5.5h20v1H.5zM.5 2.5h20v1H.5zM.5 8.5h20v1H.5z" />
    </g>
  </svg>
)
export default BurgerMenu