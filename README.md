# Sistema de Monitoramento – Super Centro Brasil

Sistema de monitoramento de instituições para o programa Super Centro Brasil para Diagnóstico de Câncer.

## Stack

- **React 18** com TypeScript
- **Vite** como bundler
- **MUI (Material UI) v6** para componentes de UI
- **Lucide React** para ícones

## Como rodar

```bash
npm install
npm run dev
```

Acesse: http://localhost:5173

## Build de produção

```bash
npm run build
npm run preview
```

## Estrutura do projeto

```
src/
├── components/
│   ├── GanttChart.tsx     # Gráfico de Gantt temporal
│   ├── InstitutionCard.tsx # Card de instituição expansível
│   ├── InstitutionForm.tsx # Formulário (modal Dialog)
│   └── StatusChip.tsx     # Chip de status reutilizável
├── data/
│   └── initialData.ts     # Dados iniciais das 8 instituições
├── pages/
│   └── MonitoringSystem.tsx # Página principal
├── types/
│   └── index.ts           # Tipos TypeScript
├── theme.ts               # Tema MUI customizado
├── App.tsx
└── main.tsx
```

## Funcionalidades

- **Lista de instituições** com cartões expansíveis mostrando atividades
- **Gráfico de Gantt** com visualização de Abril a Dezembro 2026
- **CRUD completo** de instituições e atividades
- **Busca e filtro** por nome/estado/status
- **Exportação PDF** via impressão do navegador
- **Persistência** via localStorage
- **Responsivo** para mobile e desktop

## Paleta de cores (Design System do Governo Federal)

| Cor | Hex |
|-----|-----|
| Azul primário | `#1351B4` |
| Verde (sucesso) | `#168821` |
| Amarelo (destaque) | `#FFCD07` |
| Vermelho (erro/atraso) | `#E52207` |
| Laranja (projetado) | `#FF8C00` |
