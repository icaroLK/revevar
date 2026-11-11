import {
  PRIVACY_PLACEHOLDER_NOTICE,
  PRIVACY_SECTIONS,
} from '../../content/privacy'

export function PrivacyPage() {
  return (
    <>
      <title>Política de Privacidade · Revê VAR</title>

      <main className="mx-auto max-w-[780px] px-4 py-9 md:px-7 md:py-16">
        <h1 className="font-display text-4xl uppercase md:text-5xl">
          Política de Privacidade
        </h1>
        <p className="mt-2 text-xs text-subtle">{PRIVACY_PLACEHOLDER_NOTICE}</p>

        <div className="mt-7 flex flex-col gap-6">
          {PRIVACY_SECTIONS.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-1.5 text-lg font-bold">{section.heading}</h2>
              <p className="text-[15px] leading-relaxed text-muted">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </main>
    </>
  )
}
