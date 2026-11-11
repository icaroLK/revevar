import { useState } from 'react'
import { Calendar, Clock, Download, Play } from 'lucide-react'
import { AccordionItem } from '../../components/ui/Accordion'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { EmptyState, ErrorState } from '../../components/ui/EmptyState'
import { IconButton } from '../../components/ui/IconButton'
import { Modal } from '../../components/ui/Modal'
import { ReplayRow } from '../../components/ui/ReplayRow'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { SelectField } from '../../components/ui/SelectField'
import { Skeleton } from '../../components/ui/Skeleton'
import { Thumbnail } from '../../components/ui/Thumbnail'
import { useToast } from '../../components/ui/Toast'

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 border-b border-border pb-10">
      <h2 className="font-display text-2xl uppercase">{title}</h2>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  )
}

export function DevUiPage() {
  const [day, setDay] = useState<'hoje' | 'ontem'>('hoje')
  const [club, setClub] = useState('tupi')
  const [modalOpen, setModalOpen] = useState(false)
  const { show } = useToast()

  return (
    <main className="mx-auto flex max-w-[1180px] flex-col gap-10 p-7">
      <h1 className="font-display text-4xl uppercase">
        /dev/ui — Kit de componentes
      </h1>

      <Section title="Button">
        <Button>Primary md</Button>
        <Button size="lg">Primary lg</Button>
        <Button icon={<Play className="h-3.5 w-3.5" aria-hidden="true" />}>
          Com ícone
        </Button>
        <Button loading>Carregando</Button>
        <Button disabled>Desabilitado</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="light">Light</Button>
        <Button as="a" href="https://wa.me/" variant="secondary">
          Como link (a)
        </Button>
      </Section>

      <Section title="IconButton">
        <IconButton aria-label="Baixar">
          <Download className="h-[18px] w-[18px]" aria-hidden="true" />
        </IconButton>
        <IconButton aria-label="Fechar" variant="ghost">
          <Play className="h-[18px] w-[18px]" aria-hidden="true" />
        </IconButton>
      </Section>

      <Section title="SegmentedControl">
        <SegmentedControl
          label="Dia"
          value={day}
          onChange={setDay}
          options={[
            { value: 'hoje', label: 'Hoje' },
            { value: 'ontem', label: 'Ontem' },
          ]}
        />
      </Section>

      <Section title="Chip">
        <Chip active count={6}>
          Todas
        </Chip>
        <Chip count={3}>19h</Chip>
        <Chip>20h</Chip>
      </Section>

      <Section title="SelectField">
        <SelectField
          label="Clube"
          value={club}
          onChange={setClub}
          options={[
            { value: 'tupi', label: 'Tupi' },
            { value: 'outro', label: 'Outro clube' },
          ]}
        />
        <span className="text-sm text-subtle">(some apenas 1 opção)</span>
        <SelectField
          label="Quadra"
          value="q1"
          onChange={() => {}}
          options={[{ value: 'q1', label: 'Quadra 1' }]}
        />
      </Section>

      <Section title="Card">
        <Card className="w-64 p-5">
          <p className="text-sm text-muted">Card padrão (radius xl)</p>
        </Card>
        <Card radius="2xl" className="w-64 p-5">
          <p className="text-sm text-muted">Card hero (radius 2xl)</p>
        </Card>
      </Section>

      <Section title="Thumbnail">
        <Thumbnail
          thumbnailUrl={null}
          cameraLabel="Câmera 1"
          durationLabel="0:35"
          showPlay
          className="w-48"
        />
        <Thumbnail
          thumbnailUrl={null}
          cameraLabel="Câmera 2"
          status="processing"
          className="w-48"
        />
        <Thumbnail
          thumbnailUrl={null}
          cameraLabel="Câmera 2"
          status="failed"
          className="w-48"
        />
      </Section>

      <Section title="ReplayRow">
        <div className="flex w-80 flex-col gap-1">
          <ReplayRow time="19:58" note="Câmeras 1 e 2" to="#" />
          <ReplayRow time="19:43" note="Assistindo agora" active />
        </div>
      </Section>

      <Section title="Modal / Sheet">
        <Button onClick={() => setModalOpen(true)}>Abrir modal</Button>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Baixar replay"
        >
          <p className="text-sm text-muted">
            Conteúdo de exemplo do modal/sheet.
          </p>
          <div className="mt-4 flex gap-2">
            <Button size="md" onClick={() => setModalOpen(false)}>
              Baixar
            </Button>
            <Button
              size="md"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </Modal>
      </Section>

      <Section title="Accordion">
        <div className="w-full max-w-xl">
          <AccordionItem question="Preciso de cadastro para ver meu replay?">
            Não, o catálogo é público.
          </AccordionItem>
          <AccordionItem question="Quanto tempo o vídeo fica disponível?">
            Por 24 horas.
          </AccordionItem>
        </div>
      </Section>

      <Section title="Badge">
        <Badge icon={<Clock className="h-3.5 w-3.5" aria-hidden="true" />}>
          Disponível até 19:43 de amanhã
        </Badge>
      </Section>

      <Section title="Skeleton">
        <div className="flex w-64 flex-col gap-2">
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </Section>

      <Section title="EmptyState / ErrorState">
        <EmptyState
          icon={<Calendar className="h-6 w-6 text-subtle" aria-hidden="true" />}
          title="Nenhum replay nesse horário."
          description="Tente outro horário ou dia."
          className="w-80"
        />
        <ErrorState
          title="Não foi possível carregar os replays."
          action={
            <Button size="md" variant="secondary">
              Tentar de novo
            </Button>
          }
          className="w-80"
        />
      </Section>

      <Section title="Toast">
        <Button variant="secondary" onClick={() => show('Link copiado')}>
          Disparar toast
        </Button>
        <Button
          variant="secondary"
          onClick={() => show('Não foi possível baixar.', 'error')}
        >
          Disparar toast de erro
        </Button>
      </Section>
    </main>
  )
}
