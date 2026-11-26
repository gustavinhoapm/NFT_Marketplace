import type { SVGProps } from 'react'

/**
 * Selo "THANK YOU" do recibo (frame de Confirmação de Pedido): envelope com o
 * cartão saindo, em traço de acento. Substitui o ícone genérico de e-mail.
 */
export function ThankYouEnvelope(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true" {...props}>
      {/* cartão */}
      <rect x="18" y="6" width="28" height="26" rx="2" fill="#241612" />
      <text
        x="32"
        y="17"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        fontFamily="inherit"
        fontSize="8"
        fontWeight="bold"
        letterSpacing="0.5"
      >
        THANK
      </text>
      <text
        x="32"
        y="27"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        fontFamily="inherit"
        fontSize="8"
        fontWeight="bold"
        letterSpacing="0.5"
      >
        YOU
      </text>
      {/* envelope */}
      <path d="M8 26h48v30H8z" fill="#241612" />
      <path d="M8 26l24 18 24-18" />
      <path d="M8 56l20-16M56 56L36 40" strokeWidth="1.6" />
      {/* aba superior */}
      <path d="M20 26V10a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v16" strokeWidth="0" />
    </svg>
  )
}
