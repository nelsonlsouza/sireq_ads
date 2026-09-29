# SIREQ — implementação e catálogo de testes

**Versão do projeto:** 1.0.0
**Data da verificação:** 29/09/2026
**Estado:** código compilando; 17 testes automatizados aprovados; aceite operacional pendente.

## 1. O que foi feito

O SIREQ foi organizado como aplicação web em TypeScript. Uma requisição válida entra no fim de uma fila única (**FIFO**). A análise retira apenas a primeira pendência. Aprovações, rejeições, devoluções e cancelamentos são registrados em uma pilha de histórico (**LIFO**). O operador pode consultar o histórico e desfazer a última operação elegível.

As mudanças desta entrega incluem:

| Área                 | Implementação                                                                                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cadastro e validação | Campos gerais e específicos dos cinco tipos; unidade obrigatória em Material; quantidades e licenças inteiras positivas; recusa de tipo desconhecido.                              |
| Identificadores      | IDs `REQ-0001`, `REQ-0002` etc.; contador persistido para evitar reutilização após desfazimento. O botão **Limpar dados** reinicia o conjunto local.                               |
| Análise e histórico  | Processamento FIFO, decisões com motivo obrigatório quando aplicável, cancelamento da primeira pendência e consulta LIFO.                                                          |
| Desfazimento         | Verificações antes de retirar o topo da pilha; bloqueio durante análise ativa e quando a requisição já está pendente.                                                              |
| Correção             | Requisição devolvida pode ser corrigida, validada novamente e reenviada ao fim da fila com o mesmo ID.                                                                             |
| Consulta             | Busca por ID entre pendências, requisição em análise, devolvidas e histórico.                                                                                                      |
| Persistência         | Fila, histórico, análise ativa e contador de IDs salvos no `localStorage`.                                                                                                         |
| Interface            | Formulário por tipo, área de devolvidas, busca por ID, dados exibidos com escape de HTML, título e idioma da página ajustados.                                                     |
| Documentação         | [Especificação de requisitos](SIREQ_Especificacao_Requisitos_Atualizada.docx) e [Plano e relatório de SQA](SIREQ_Plano_e_Relatorio_SQA.docx) descrevem o produto e o código atual. |

### Módulos principais

| Arquivo                                                                   | Função                                                       |
| ------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [`src/models/Requisicao.ts`](../src/models/Requisicao.ts)                 | Contrato dos dados e estados da requisição.                  |
| [`src/models/OperacaoHistorico.ts`](../src/models/OperacaoHistorico.ts)   | Dados necessários para rastrear e desfazer uma operação.     |
| [`src/structures/Fila.ts`](../src/structures/Fila.ts)                     | Pendências em ordem FIFO.                                    |
| [`src/structures/Pilha.ts`](../src/structures/Pilha.ts)                   | Histórico em ordem LIFO.                                     |
| [`src/services/ValidadorService.ts`](../src/services/ValidadorService.ts) | Regras de entrada gerais e por tipo.                         |
| [`src/services/SireqService.ts`](../src/services/SireqService.ts)         | Cadastro, análise, decisões, correção, busca e desfazimento. |
| [`src/services/StorageService.ts`](../src/services/StorageService.ts)     | Leitura, escrita e limpeza do estado local.                  |
| [`src/main.ts`](../src/main.ts)                                           | Interface e ligação dos eventos às regras de aplicação.      |

## 2. Catálogo dos testes automatizados

Os testes estão em [`tests/estruturas.test.ts`](../tests/estruturas.test.ts) e [`tests/sireq.test.ts`](../tests/sireq.test.ts). Cada teste recebe um armazenamento local simulado e independente. **PASSOU** indica o resultado da execução de `npm test` em 29/09/2026.

| ID  | Arquivo              | Cenário e critério verificado                                                                     | Resultado |
| --- | -------------------- | ------------------------------------------------------------------------------------------------- | --------- |
| T01 | `estruturas.test.ts` | Enfileirar A, B e C; remover A e manter B na frente.                                              | PASSOU    |
| T02 | `estruturas.test.ts` | Desenfileirar uma fila vazia retorna `undefined`.                                                 | PASSOU    |
| T03 | `estruturas.test.ts` | Empilhar A, B e C; consultar/remover C antes de B.                                                | PASSOU    |
| T04 | `estruturas.test.ts` | Desempilhar uma pilha vazia retorna `undefined`.                                                  | PASSOU    |
| T05 | `sireq.test.ts`      | Serviço exige fornecedor; cadastro de Serviço completo entra na fila.                             | PASSOU    |
| T06 | `sireq.test.ts`      | Viagem exige destino; cadastro completo entra na fila.                                            | PASSOU    |
| T07 | `sireq.test.ts`      | Software exige nome; cadastro completo entra na fila.                                             | PASSOU    |
| T08 | `sireq.test.ts`      | Outros exige descrição detalhada; cadastro completo entra na fila.                                | PASSOU    |
| T09 | `sireq.test.ts`      | Material sem unidade não entra na fila; quantidade fracionária é rejeitada.                       | PASSOU    |
| T10 | `sireq.test.ts`      | Tipo desconhecido gera erro e não modifica a fila.                                                | PASSOU    |
| T11 | `sireq.test.ts`      | Cadastro e análise preservam FIFO; decisões entram no histórico; desfazer restaura em ordem LIFO. | PASSOU    |
| T12 | `sireq.test.ts`      | Desfazer durante outra análise é bloqueado sem retirar a operação do topo.                        | PASSOU    |
| T13 | `sireq.test.ts`      | Devolvida inválida não é reenviada; após correção entra no fim da fila com o mesmo ID.            | PASSOU    |
| T14 | `sireq.test.ts`      | Recarga preserva fila; busca encontra o ID; ID desfeito não é reutilizado.                        | PASSOU    |
| T15 | `sireq.test.ts`      | Fila/histórico vazios geram erros controlados; rejeição sem motivo não encerra a análise.         | PASSOU    |
| T16 | `sireq.test.ts`      | Cancelamento exige motivo, atinge só a frente e preserva a pendência seguinte.                    | PASSOU    |
| T17 | `sireq.test.ts`      | Desfazer decisão antiga após reenvio não duplica a requisição nem altera o topo.                  | PASSOU    |

**Resultado da suíte:** 2 arquivos de teste aprovados; **17 testes aprovados, 0 falhas**. `npm run build` também concluiu sem erro TypeScript ou Vite.

## 3. Verificações operacionais ainda abertas

A suíte automatizada verifica estruturas e serviços com `localStorage` simulado. Ela não substitui a execução dos fluxos na interface do navegador. Estes cenários permanecem **pendentes de execução e registro de evidência**:

| ID  | Verificação manual                              | Resultado esperado                                   |
| --- | ----------------------------------------------- | ---------------------------------------------------- |
| M01 | Cadastrar cada um dos cinco tipos na interface. | Campos, mensagens e dados apresentados corretamente. |
| M02 | Cancelar a próxima pendência pela interface.    | Motivo exigido; fila e histórico atualizados.        |
| M03 | Analisar, decidir e desfazer pela interface.    | Ordem e dados exibidos corretamente.                 |
| M04 | Corrigir uma devolvida e buscar por ID.         | Reenvio ao fim da fila e busca correta.              |
| M05 | Recarregar a página após cadastro e decisão.    | Estado reaparece na tela na mesma ordem.             |

O aceite operacional depende desses resultados e da revisão pelo responsável. As limitações e o acompanhamento das não conformidades estão no relatório SQA.

## 4. Como executar e repetir as verificações

No diretório raiz do projeto:

```bash
npm install
npm test
npm run build
npm run dev
```

O comando `npm run dev` informa o endereço local da aplicação. Para repetir um cenário manual de forma independente, use **Limpar dados** antes de começar; no teste de persistência, recarregue a página sem limpar o estado.
