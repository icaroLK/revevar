import { ArrowRight } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useConfig } from '../../lib/api/hooks'
import {
  PARA_CLUBES_FEATURES,
  PARA_CLUBES_WHATSAPP_MESSAGE,
} from '../../content/paraClubes'

export function ParaClubesPage() {
  const { data: config } = useConfig()
  const whatsappUrl = config?.whatsappNumber
    ? `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(PARA_CLUBES_WHATSAPP_MESSAGE)}`
    : null
  const whatsappUrlPlain = config?.whatsappNumber
    ? `https://wa.me/${config.whatsappNumber}`
    : null

  return (
    <>
      <title>Para clubes · Revê VAR</title>

      <section className="relative overflow-hidden border-b border-border">
        <svg
          viewBox="0 0 1440 520"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <g fill="none" stroke="rgba(255,255,255,0.045)" strokeWidth="1.5">
            <rect x="80" y="40" width="1280" height="440" rx="4" />
            <line x1="720" y1="40" x2="720" y2="480" />
            <circle cx="720" cy="260" r="95" />
          </g>
        </svg>

        <div className="relative mx-auto flex max-w-[1180px] flex-col gap-4 px-4 py-9 md:gap-[18px] md:px-7 md:py-[88px]">
          <span className="text-xs font-semibold uppercase tracking-wide text-subtle md:text-[13px]">
            Para clubes
          </span>
          <h1 className="max-w-[760px] font-display text-5xl uppercase leading-[1] md:text-[72px]">
            Replay automático
            <br />
            <span className="text-red">no seu clube</span>
          </h1>
          <p className="max-w-[600px] text-[15px] leading-relaxed text-muted md:text-lg">
            Instalamos câmeras, botão e sistema. Seus atletas recebem o replay
            dos lances, e o seu clube aparece em cada vídeo que eles
            compartilham.
          </p>
          <div className="flex flex-col gap-2.5 pt-1.5 md:flex-row md:flex-wrap">
            {whatsappUrl && (
              <Button as="a" href={whatsappUrl} size="lg">
                Falar no WhatsApp
              </Button>
            )}
            <Button as="link" to="/replays" variant="secondary" size="lg">
              Ver replays de exemplo
            </Button>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="incluso"
        className="mx-auto max-w-[1180px] px-4 py-7 md:px-7 md:py-20"
      >
        <h2
          id="incluso"
          className="mb-4 font-display text-3xl uppercase md:mb-7 md:text-4xl"
        >
          O que está incluso
        </h2>
        <div className="flex flex-col gap-3 md:grid md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] md:gap-5">
          {PARA_CLUBES_FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col gap-2 rounded-xl border border-border bg-gradient-to-b from-card-from to-card-to p-5 shadow-card md:gap-3 md:rounded-2xl md:p-[26px]"
            >
              <span className="flex items-center gap-2.5 text-[17px] font-bold md:block md:text-lg">
                <span className="h-[7px] w-[7px] flex-none rounded-full bg-red shadow-[0_0_0_4px_rgba(225,6,19,0.16)] md:mb-1 md:block md:h-2 md:w-2" />
                {feature.title}
              </span>
              <p className="text-sm leading-relaxed text-muted md:text-[15px]">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 pb-9 md:px-7 md:pb-[104px]">
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-gradient-to-b from-[#16171A] to-surface p-6 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_30px_80px_rgba(0,0,0,0.45)] md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-7 md:p-11">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-[28px] uppercase leading-tight md:text-4xl">
              Quer levar para o seu clube?
            </h2>
            <p className="text-sm leading-relaxed text-muted md:text-base">
              Conta pra gente quantas quadras você tem e marcamos uma visita.
            </p>
          </div>
          {whatsappUrlPlain && (
            <Button as="a" href={whatsappUrlPlain} variant="light" size="lg">
              Falar no WhatsApp
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </section>
    </>
  )
}
