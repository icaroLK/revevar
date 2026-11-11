// PLACEHOLDER — pending final text from the client's legal/compliance review
// (see docs/private/meeting-2026-11-10.md: "LGPD: be careful asking for CPF;
// prefer minimal data + consent"). Do not treat this as the shipped copy.

export type PrivacySection = { heading: string; body: string }

export const PRIVACY_PLACEHOLDER_NOTICE =
  'Texto provisório, pendente de revisão final pelo cliente.'

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    heading: 'Quais dados coletamos',
    body: 'Ao baixar um replay, pedimos seu e-mail (obrigatório) e nome (opcional) para controle de downloads e por uma questão de direito de imagem.',
  },
  {
    heading: 'Por que coletamos',
    body: 'Para saber quem baixou cada replay e para cumprir eventuais solicitações relacionadas ao direito de imagem dos atletas filmados.',
  },
  {
    heading: 'Por quanto tempo guardamos',
    body: '[A confirmar com o cliente.]',
  },
  {
    heading: 'Seus direitos',
    body: 'Você pode solicitar a exclusão dos seus dados a qualquer momento pelo WhatsApp informado no rodapé do site.',
  },
]
