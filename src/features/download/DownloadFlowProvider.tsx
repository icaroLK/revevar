import { createContext, useContext, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { ApiError } from '../../lib/api/errors'
import { useConfig, useCreateDownload } from '../../lib/api/hooks'

const STORAGE_KEY = 'revevar.lead'
const STAGGER_MS = 400

type StoredLead = { email: string; name?: string; consentVersion: string }

function readStoredLead(): StoredLead | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredLead) : null
  } catch {
    return null
  }
}

function writeStoredLead(lead: StoredLead) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lead))
  } catch {
    // Private browsing / quota exceeded — the download itself still works, we just won't remember.
  }
}

function clearStoredLead() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

const downloadFormSchema = z.object({
  email: z.string().min(1, 'Informe seu e-mail.').email('E-mail inválido.'),
  name: z.string(),
  consent: z
    .boolean()
    .refine((v) => v, { message: 'É necessário autorizar o uso dos dados.' }),
  remember: z.boolean(),
})
type DownloadFormValues = z.infer<typeof downloadFormSchema>

type DownloadFlowContextValue = {
  requestDownload: (clipIds: string[]) => void
  storedEmail: string | null
  forgetLead: () => void
}

const DownloadFlowContext = createContext<DownloadFlowContextValue | null>(null)

/** The download modal (spec §8), mounted once; any component calls useDownloadFlow().requestDownload(clipIds). */
export function DownloadFlowProvider({ children }: { children: ReactNode }) {
  const configQuery = useConfig()
  const createDownload = useCreateDownload()
  const { show } = useToast()

  const [pendingClipIds, setPendingClipIds] = useState<string[] | null>(null)
  const [storedLead, setStoredLead] = useState<StoredLead | null>(() =>
    readStoredLead(),
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DownloadFormValues>({
    resolver: zodResolver(downloadFormSchema),
    defaultValues: { email: '', name: '', consent: false, remember: true },
  })

  function triggerFileDownloads(
    downloads: { url: string; fileName: string }[],
  ) {
    downloads.forEach((file, index) => {
      setTimeout(() => {
        const a = document.createElement('a')
        a.href = file.url
        a.download = file.fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }, index * STAGGER_MS)
    })
  }

  function handleDownloadError(error: unknown) {
    if (error instanceof ApiError) {
      if (error.status === 410) return show('Este replay expirou.', 'error')
      if (error.status === 429)
        return show('Muitas tentativas, tente em alguns minutos.', 'error')
    }
    show('Não foi possível baixar. Tente de novo.', 'error')
  }

  function submitDownload(
    clipIds: string[],
    data: { email: string; name?: string; consent: boolean },
  ) {
    const consentVersion = configQuery.data?.consentVersion ?? ''
    createDownload.mutate(
      {
        clipIds,
        email: data.email,
        name: data.name,
        consent: data.consent,
        consentVersion,
      },
      {
        onSuccess: (response) => {
          triggerFileDownloads(response.downloads)
          show('Download iniciado')
          setPendingClipIds(null)
        },
        onError: handleDownloadError,
      },
    )
  }

  function requestDownload(clipIds: string[]) {
    const lead = readStoredLead()
    const consentVersion = configQuery.data?.consentVersion
    if (lead && consentVersion && lead.consentVersion === consentVersion) {
      submitDownload(clipIds, {
        email: lead.email,
        name: lead.name,
        consent: true,
      })
      return
    }
    reset({
      email: lead?.email ?? '',
      name: lead?.name ?? '',
      consent: false,
      remember: true,
    })
    setPendingClipIds(clipIds)
  }

  function onSubmit(values: DownloadFormValues) {
    if (!pendingClipIds) return
    if (values.remember) {
      const lead = {
        email: values.email,
        name: values.name,
        consentVersion: configQuery.data?.consentVersion ?? '',
      }
      writeStoredLead(lead)
      setStoredLead(lead)
    }
    submitDownload(pendingClipIds, values)
  }

  function forgetLead() {
    clearStoredLead()
    setStoredLead(null)
  }

  return (
    <DownloadFlowContext.Provider
      value={{
        requestDownload,
        storedEmail: storedLead?.email ?? null,
        forgetLead,
      }}
    >
      {children}
      <Modal
        open={pendingClipIds !== null}
        onClose={() => setPendingClipIds(null)}
        title="Baixar replay"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            Informe seu e-mail para baixar o vídeo.
          </p>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-subtle">
              E-mail
            </span>
            <input
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
              className="h-11 rounded-md border border-border bg-surface px-3 text-sm text-text outline-none focus-visible:border-border-strong focus-visible:[--tw-outline-style:solid] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
            />
            {errors.email && (
              <span className="text-xs text-red">{errors.email.message}</span>
            )}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-subtle">
              Nome (opcional)
            </span>
            <input
              type="text"
              autoComplete="name"
              {...register('name')}
              className="h-11 rounded-md border border-border bg-surface px-3 text-sm text-text outline-none focus-visible:border-border-strong focus-visible:[--tw-outline-style:solid] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <label className="flex items-start gap-2.5 text-sm text-muted">
              <input
                type="checkbox"
                {...register('consent')}
                className="mt-0.5 h-4 w-4 flex-none accent-red"
              />
              <span>
                Autorizo o Revê VAR a registrar meu nome e e-mail para controle
                de downloads, conforme a{' '}
                <Link to="/privacidade" className="underline hover:text-text">
                  Política de Privacidade
                </Link>
                .
              </span>
            </label>
            {errors.consent && (
              <span className="text-xs text-red">{errors.consent.message}</span>
            )}
          </div>

          <label className="flex items-center gap-2.5 text-sm text-muted">
            <input
              type="checkbox"
              {...register('remember')}
              className="h-4 w-4 flex-none accent-red"
            />
            Lembrar neste aparelho
          </label>

          <div className="mt-1 flex gap-2">
            <Button
              type="submit"
              loading={createDownload.isPending}
              className="flex-1"
            >
              Baixar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPendingClipIds(null)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </DownloadFlowContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with its provider/context
export function useDownloadFlow(): DownloadFlowContextValue {
  const ctx = useContext(DownloadFlowContext)
  if (!ctx)
    throw new Error(
      'useDownloadFlow must be used within a DownloadFlowProvider',
    )
  return ctx
}
