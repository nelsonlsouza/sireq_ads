# SIREQ — Sistema Inteligente de Requisições e Aprovações

Aplicação web acadêmica para cadastro, organização, análise e rastreabilidade de requisições internas. O projeto foi desenvolvido como MVP funcional para demonstrar, de forma prática, o uso de **Fila (FIFO)** no processamento das solicitações e **Pilha (LIFO)** no histórico de operações.

> **Versão atual:** MVP web sem backend e sem banco de dados. A persistência é feita no `localStorage` do navegador.

## Entrega de requisitos e SQA

- [Especificação de requisitos atualizada](documentacao/SIREQ_Especificacao_Requisitos_Atualizada.docx)
- [Plano e relatório de SQA](documentacao/SIREQ_Plano_e_Relatorio_SQA.docx)
- [Registro de implementação e catálogo dos 17 testes](documentacao/SIREQ_Implementacao_e_Catalogo_de_Testes.md)

Em 29/09/2026, `npm test` passou com 17 testes e `npm run build` concluiu sem erros. A execução manual em navegador e o aceite pelo responsável continuam pendentes, conforme o relatório SQA. Para executar localmente: `npm install`, `npm test`, `npm run build` e `npm run dev`.

## Finalidade

O SIREQ organiza solicitações de materiais, serviços, viagens, softwares e outros gastos. Requisições válidas entram no final da fila e são analisadas na ordem de chegada. As decisões são registradas no histórico, permitindo consultar e desfazer a última operação válida.

O sistema foi construído para apoiar a apresentação acadêmica, a documentação do projeto e a execução de testes de qualidade.

## Tecnologias

- TypeScript
- JavaScript
- HTML5
- CSS3
- Vite
- Vitest
- Web Storage API (`localStorage`)
- Git e GitHub

## Funcionalidades implementadas

- Cadastro de requisições com ID sequencial (`REQ-0001`, `REQ-0002`...)
- Registro automático de data/hora e status inicial
- Tipos: Material, Serviço, Viagem, Software e Outros
- Campos específicos exibidos conforme o tipo selecionado
- Validação de campos obrigatórios
- Justificativa com mínimo de 20 caracteres
- Inclusão de requisições válidas no final da fila
- Consulta da próxima solicitação
- Contagem e visualização das solicitações pendentes
- Análise exclusiva da primeira requisição da fila
- Aprovação
- Rejeição com motivo
- Devolução para correção com motivo
- Cancelamento da próxima solicitação pendente com justificativa
- Histórico das decisões em ordem da mais recente para a mais antiga
- Exibição dos dados completos da requisição na análise e no histórico
- Desfazer última operação registrada
- Persistência local da fila, histórico e requisição em análise
- Tratamento de fila e pilha vazias
- Correção e reenvio de solicitações devolvidas ao final da fila
- Busca de requisições por ID
- Identificadores sem reutilização após desfazimento
- Interface responsiva

## Campos por tipo

| Tipo     | Dados específicos                                  |
| -------- | -------------------------------------------------- |
| Material | Item, quantidade, unidade e valor unitário         |
| Serviço  | Descrição, fornecedor e período                    |
| Viagem   | Destino, período e finalidade                      |
| Software | Nome do software, quantidade de licenças e período |
| Outros   | Descrição detalhada                                |

Todos os tipos também possuem setor, requisitante, descrição, justificativa e valor estimado.

## Regras principais

### Fila de requisições — FIFO

A fila segue **First In, First Out**. A primeira requisição válida cadastrada deve ser a primeira disponibilizada para análise.

Operações implementadas:

- enfileirar;
- consultar a frente;
- desenfileirar;
- consultar quantidade;
- verificar fila vazia.

### Histórico — LIFO

O histórico utiliza uma pilha **Last In, First Out**. A operação registrada mais recentemente fica no topo e é a primeira considerada no desfazimento.

Operações implementadas:

- empilhar;
- consultar topo;
- desempilhar;
- consultar quantidade;
- verificar pilha vazia.

> FIFO e LIFO são conceitos da implementação e dos testes; a interface utiliza linguagem voltada ao usuário.

## Estrutura do projeto

```text
sireq_ads/
├── src/
│   ├── models/
│   │   ├── Requisicao.ts
│   │   └── OperacaoHistorico.ts
│   ├── services/
│   │   ├── SireqService.ts
│   │   ├── StorageService.ts
│   │   └── ValidadorService.ts
│   ├── structures/
│   │   ├── Fila.ts
│   │   └── Pilha.ts
│   ├── main.ts
│   └── style.css
├── tests/
│   └── estruturas.test.ts
├── index.html
├── package.json
└── tsconfig.json
```

### Responsabilidades

**models/** — contratos e tipos dos dados.

**structures/** — implementação das estruturas de dados Fila e Pilha.

**services/** — regras de negócio, validação e persistência.

**main.ts** — interface, eventos e integração da tela com os serviços.

**tests/** — testes automatizados existentes e local recomendado para novos testes.

## Como executar

### Pré-requisitos

- Node.js instalado
- npm
- Git

### Instalação

```bash
git clone https://github.com/nelsonlsouza/sireq_ads.git
cd sireq_ads
git checkout feat/estrutura-mvp
npm install
```

### Desenvolvimento

```bash
npm run dev
```

Abra o endereço informado pelo Vite, normalmente `http://localhost:5173`.

### Build

```bash
npm run build
```

O build deve concluir sem erros TypeScript.

### Testes automatizados

```bash
npm test
```

Também é possível executar em modo de acompanhamento:

```bash
npm run test:watch
```

## Persistência

Não existe banco de dados nesta versão. O navegador mantém o estado em:

- `sireq_fila`
- `sireq_historico`
- `sireq_em_analise`

O botão **Limpar dados** remove os dados utilizados pela demonstração.

> Para CT14, recarregue a página sem usar “Limpar dados” e confirme que o estado permanece.

---

# Orientações para QA / responsável pelos testes

O objetivo desta etapa é verificar requisitos funcionais, estruturas de dados, persistência e comportamento diante de operações inválidas.

## Estado inicial recomendado

Antes de uma bateria independente, clique em **Limpar dados**. Para testes de persistência, não limpe os dados entre as etapas.

Registre para cada caso:

- resultado obtido;
- status **PASSOU** ou **FALHOU**;
- evidência (print, saída do terminal ou descrição objetiva);
- observação/defeito, quando houver.

## Casos de teste

| ID   | Cenário                | Procedimento resumido                                                   | Resultado esperado                                          |
| ---- | ---------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------- |
| CT01 | Cadastro válido        | Preencher todos os campos válidos                                       | Gera ID, data/hora, status pendente e entra no fim da fila  |
| CT02 | Cadastro inválido      | Deixar campo obrigatório vazio ou justificativa abaixo de 20 caracteres | Cadastro bloqueado e erro apresentado                       |
| CT03 | FIFO                   | Cadastrar A, B e C nessa ordem                                          | Fila permanece A → B → C                                    |
| CT04 | Consulta sem remoção   | Observar próxima solicitação                                            | A continua na fila até iniciar análise                      |
| CT05 | Iniciar análise        | Com A → B → C, iniciar análise                                          | A sai da fila; B passa a ser a próxima                      |
| CT06 | Aprovação              | Iniciar análise e aprovar                                               | Decisão registrada e requisição finalizada                  |
| CT07 | Rejeição               | Rejeitar informando motivo                                              | Rejeição e motivo registrados                               |
| CT08 | Devolução              | Devolver informando motivo                                              | Devolução e motivo registrados                              |
| CT09 | Cancelamento           | Cancelar solicitação pendente informando justificativa                  | Cancelamento registrado sem interromper o sistema           |
| CT10 | Histórico LIFO         | Realizar decisões A, B e C                                              | Operação C aparece como a mais recente                      |
| CT11 | Desfazer               | Executar uma decisão e clicar em “Desfazer última”                      | Última operação é removida e solicitação é restaurada       |
| CT12 | Vários desfazimentos   | Realizar várias decisões e desfazê-las sucessivamente                   | Operações são revertidas da mais recente para a mais antiga |
| CT13 | Desfazer sem histórico | Limpar dados e tentar desfazer                                          | Sistema informa que não há operação e não quebra            |
| CT14 | Persistência           | Cadastrar/decidir, recarregar a página                                  | Estado permanece disponível                                 |
| CT15 | Estruturas vazias      | Operar com fila/histórico vazios                                        | Sistema trata a condição sem crash                          |

## Testes adicionais por tipo

Além dos CT01–CT15, validar pelo menos um cadastro de cada categoria:

| Tipo     | Verificar                                             |
| -------- | ----------------------------------------------------- |
| Material | item, quantidade e valor unitário aparecem na análise |
| Serviço  | fornecedor e período aparecem na análise              |
| Viagem   | destino, período e finalidade aparecem na análise     |
| Software | nome, licenças e período aparecem na análise          |
| Outros   | descrição detalhada aparece na análise                |

Após uma decisão, confirmar que os mesmos dados permanecem visíveis no **Histórico**.

## Testes automatizados já existentes

O arquivo `tests/estruturas.test.ts` possui testes automatizados básicos para:

- manutenção da ordem FIFO;
- remoção do elemento mais antigo;
- tratamento de fila vazia;
- consulta e remoção em ordem LIFO;
- tratamento de pilha vazia.

Esses testes **não substituem** a bateria CT01–CT15. O responsável por QA deve ampliar a cobertura, principalmente sobre `ValidadorService` e `SireqService`.

## Sugestão de organização dos novos testes

```text
tests/
├── estruturas.test.ts
├── validador.test.ts
├── sireq-service.test.ts
└── persistencia.test.ts
```

Prioridades:

1. validação dos campos gerais;
2. validação específica de cada tipo;
3. cadastro e FIFO;
4. aprovação/rejeição/devolução;
5. cancelamento;
6. LIFO;
7. desfazimento;
8. persistência;
9. cenários vazios e inválidos.

## Critério de conclusão da etapa de testes

A etapa deve ser considerada concluída quando:

- todos os casos planejados tiverem resultado registrado;
- falhas encontradas estiverem documentadas;
- testes automatizados executarem sem erro;
- `npm run build` concluir sem erro;
- requisitos críticos de fila, decisão, histórico e desfazimento estiverem validados.

## Como reportar um defeito

Ao encontrar uma falha, abrir uma Issue contendo:

```text
Título: [BUG] descrição curta

Caso de teste:
CTxx

Pré-condição:
...

Passos para reproduzir:
1.
2.
3.

Resultado esperado:
...

Resultado obtido:
...

Evidência:
print/log

Ambiente:
Navegador:
Sistema operacional:

Severidade:
Baixa / Média / Alta / Crítica
```

Não corrigir o teste para fazê-lo passar. Se o comportamento divergir do requisito, registrar a falha.

## Fluxo Git recomendado para QA

Criar uma branch a partir da versão entregue:

```bash
git checkout feat/estrutura-mvp
git pull
git checkout -b test/qa-sireq
```

Alterações em testes automatizados devem ser commitadas nessa branch.

Exemplo:

```bash
git add .
git commit -m "test: adiciona testes de validação das requisições"
git push -u origin test/qa-sireq
```

Ao concluir, abrir Pull Request para revisão.

## Comandos rápidos

```bash
npm install
npm test
npm run build
npm run dev
```

## Observações de escopo

Este é um MVP local. Não fazem parte desta versão:

- autenticação;
- API/backend;
- banco de dados remoto;
- múltiplos usuários simultâneos;
- integrações externas.

Esses itens não devem ser registrados como defeitos do MVP, salvo mudança formal de escopo.

---

## Status da entrega

- Aplicação web funcional
- Build TypeScript validado durante o desenvolvimento
- Testes estruturais automatizados
- Persistência local
- Interface responsiva
- Fluxo principal implementado
- Projeto preparado para ampliação da cobertura de QA

A aprovação final da versão depende da execução e documentação da bateria de testes pelo responsável por QA.
