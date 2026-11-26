import type { SVGProps } from 'react'

/**
 * Selo "THANK YOU" do recibo (frame de Confirmação de Pedido): cartão com o
 * agradecimento saindo pela abertura do envelope, alça no topo e dobras em X,
 * em traço de acento sobre a superfície do card.
 */
export function ThankYouEnvelope(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* alça superior */}
      <path d="M29 7V5a3 3 0 0 1 6 0v2" />
      {/* cartão THANK YOU (desenhado antes do envelope para parecer inserido) */}
      <rect x="19" y="7" width="26" height="24" fill="var(--color-surface, #241612)" />
      <text
        x="32"
        y="17"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        fontFamily="inherit"
        fontSize="7.5"
        fontWeight="bold"
        letterSpacing="0.6"
      >
        THANK
      </text>
      <text
        x="32"
        y="26"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        fontFamily="inherit"
        fontSize="7.5"
        fontWeight="bold"
        letterSpacing="0.6"
      >
        YOU
      </text>
      {/* corpo do envelope cobre a base do cartão */}
      <rect x="7" y="25" width="50" height="31" fill="var(--color-surface, #241612)" />
      {/* dobra frontal em V */}
      <path d="M7 25 32 43 57 25" />
      {/* dobras inferiores */}
      <path d="M7 56 25 42M57 56 39 42" strokeWidth="1.6" />
    </svg>
  )
}
