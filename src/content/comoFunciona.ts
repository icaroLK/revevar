export type ComoFuncionaStep = { n: string; title: string; text: string }

export const COMO_FUNCIONA_STEPS: ComoFuncionaStep[] = [
  {
    n: '1',
    title: 'O jogo é gravado',
    text: 'As câmeras da quadra filmam a partida continuamente. Ninguém precisa fazer nada.',
  },
  {
    n: '2',
    title: 'Alguém aperta o botão',
    text: 'O botão fica na beira da quadra. O sistema salva os 30 segundos anteriores e mais 5 segundos depois.',
  },
  {
    n: '3',
    title: 'O replay aparece aqui',
    text: 'Em segundos o lance fica disponível na página de replays, com um vídeo para cada câmera, pronto para assistir e baixar.',
  },
]

export type FaqItem = { q: string; a: string }

// {retentionHours} is replaced with the real value from GET /config when rendered.
// Placeholder set — client will send the final list (build-plan.md M9).
export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Preciso de cadastro para ver meu replay?',
    a: 'Não. Os replays ficam abertos no site. É só escolher o clube, a quadra, o dia e o horário do seu jogo.',
  },
  {
    q: 'Quanto tempo o vídeo fica disponível?',
    a: 'Os replays ficam disponíveis por {retentionHours} horas. Baixe o seu antes disso.',
  },
  {
    q: 'Por que aparecem dois vídeos do mesmo lance?',
    a: 'A quadra tem duas câmeras. Você vê a mesma jogada de dois ângulos e baixa o que preferir.',
  },
  {
    q: 'O vídeo não apareceu. O que faço?',
    a: 'Confira o clube, a quadra, o dia e o horário no filtro. Se mesmo assim não encontrar, fale com a gente pelo WhatsApp.',
  },
  {
    q: 'Posso compartilhar o vídeo?',
    a: 'Sim. Baixe o MP4 ou envie o link direto pelo WhatsApp.',
  },
  {
    q: 'Por que pedem meu e-mail para baixar?',
    a: 'Para controle de downloads e por uma questão de direito de imagem.',
  },
]
