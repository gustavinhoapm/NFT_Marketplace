import type { SVGProps } from 'react'

/**
 * Glifos de redes sociais do frame. O lucide-react 1.x não distribui ícones de
 * marca, então usamos SVGs inline simplificados das marcas (substituição de
 * asset documentada em docs/ASSETS.md).
 */
export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.87.24-1.46 1.49-1.46H16.5V5.05c-.27-.04-1.2-.12-2.28-.12-2.26 0-3.8 1.38-3.8 3.9V11H8v3h2.42v7h3.08Z" />
    </svg>
  )
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function TwitterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21.5 6.1c-.7.32-1.46.53-2.25.63a3.9 3.9 0 0 0 1.72-2.16c-.76.45-1.6.78-2.5.95a3.93 3.93 0 0 0-6.7 3.58A11.1 11.1 0 0 1 3.7 5.03a3.93 3.93 0 0 0 1.22 5.24c-.64-.02-1.24-.2-1.77-.49v.05c0 1.9 1.35 3.49 3.15 3.85-.33.09-.68.14-1.04.14-.25 0-.5-.03-.74-.07a3.93 3.93 0 0 0 3.67 2.73A7.88 7.88 0 0 1 2.5 18.1a11.1 11.1 0 0 0 6.02 1.77c7.22 0 11.17-5.98 11.17-11.17l-.01-.51c.77-.55 1.43-1.24 1.82-2.09Z" />
    </svg>
  )
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3.5a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.44 13.6c0-3.2-1.7-4.69-3.98-4.69-1.83 0-2.65 1-3.12 1.72V8.5H9.96V20h3.38v-6.1c0-1.62.3-3.18 2.3-3.18 1.97 0 2 1.84 2 3.28V20h3.38v-6.4Z" />
    </svg>
  )
}

/** "G" do Google em cores de marca, como no frame de login. */
export function GoogleBrandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09Z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z" />
    </svg>
  )
}

/** "f" do Facebook em azul de marca, como no frame de login. */
export function FacebookBrandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      /* viewBox recortado ao glifo para ficar proporcional ao "G" do Google */
      viewBox="7.6 4.6 9.4 16.8"
      fill="#3b5998"
      aria-hidden="true"
      {...props}
    >
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.87.24-1.46 1.49-1.46h1.51V5.05c-.27-.04-1.2-.12-2.28-.12-2.26 0-3.8 1.38-3.8 3.9V11H8v3h2.42v7h3.08Z" />
    </svg>
  )
}

export function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21.6 7.2a2.78 2.78 0 0 0-1.96-1.97C17.9 4.75 12 4.75 12 4.75s-5.9 0-7.64.48A2.78 2.78 0 0 0 2.4 7.2 29.3 29.3 0 0 0 1.92 12a29.3 29.3 0 0 0 .48 4.8 2.78 2.78 0 0 0 1.96 1.97c1.74.48 7.64.48 7.64.48s5.9 0 7.64-.48a2.78 2.78 0 0 0 1.96-1.97A29.3 29.3 0 0 0 22.08 12a29.3 29.3 0 0 0-.48-4.8ZM9.9 15.1V8.9L15.2 12l-5.3 3.1Z" />
    </svg>
  )
}
