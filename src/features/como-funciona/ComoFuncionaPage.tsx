import { Button } from '../../components/ui/Button'
import { AccordionItem } from '../../components/ui/Accordion'
import { useConfig } from '../../lib/api/hooks'
import { COMO_FUNCIONA_STEPS, FAQ_ITEMS } from '../../content/comoFunciona'

export function ComoFuncionaPage() {
  const { data: config } = useConfig()
  const retentionHours = config?.retentionHours ?? 24
  const whatsappUrl = config?.whatsappNumber
    ? `https://wa.me/${config.whatsappNumber}`
    : null

  return (
    <>
      <title>Como funciona · Revê VAR</title>

      <section className="mx-auto flex max-w-[1180px] flex-col gap-3 px-4 pb-6 pt-9 md:px-7 md:pb-12 md:pt-[72px]">
        <span className="text-xs font-semibold uppercase tracking-wide text-subtle md:text-[13px]">
          Ajuda
        </span>
        <h1 className="font-display text-5xl uppercase md:text-[64px]">
          Como funciona
        </h1>
        <p className="max-w-[600px] text-[15px] leading-relaxed text-muted md:text-[17px]">
          As câmeras da quadra gravam o jogo o tempo todo. Quando alguém aperta
          o botão, o sistema salva o lance e publica aqui.
        </p>
      </section>

      <section
        aria-label="Passo a passo"
        className="mx-auto max-w-[1180px] px-4 pb-8 md:px-7 md:pb-[88px]"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] md:gap-5">
          {COMO_FUNCIONA_STEPS.map((step) => (
            <div
              key={step.n}
              className="flex flex-col gap-3 rounded-xl border border-border bg-gradient-to-b from-card-from to-card-to p-5 shadow-card md:flex-col md:gap-3.5 md:rounded-2xl md:p-7"
            >
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] border border-red/40 bg-red-tint text-sm font-bold text-white md:h-10 md:w-10 md:rounded-xl">
                {step.n}
              </span>
              <h2 className="text-[17px] font-bold md:text-xl">{step.title}</h2>
              <p className="text-sm leading-relaxed text-muted md:text-[15px]">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="faq" className="border-t border-border">
        <div className="mx-auto max-w-[780px] px-4 py-7 md:px-7 md:py-20">
          <h2
            id="faq"
            className="mb-4 font-display text-3xl uppercase md:mb-7 md:text-4xl"
          >
            Dúvidas comuns
          </h2>
          <div className="flex flex-col border-t border-border">
            {FAQ_ITEMS.map((item) => (
              <AccordionItem key={item.q} question={item.q}>
                {item.a.replace('{retentionHours}', String(retentionHours))}
              </AccordionItem>
            ))}
          </div>

          {whatsappUrl && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3.5 rounded-2xl border border-border bg-surface px-5 py-5">
              <span className="text-[15px] text-[#D4D4D8]">
                Não achou sua resposta?
              </span>
              <Button as="a" href={whatsappUrl}>
                Falar no WhatsApp
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
