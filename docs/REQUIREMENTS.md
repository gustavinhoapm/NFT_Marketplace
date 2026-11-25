# Matriz de requisitos — Desafio Frontend (NFT Marketplace)

Fonte: `junglegaming/frontend-challenge@main`. Este arquivo é a fonte de verdade
do escopo. A coluna **Evidência** é preenchida conforme cada item é implementado,
e vira o índice do `ARCHITECTURE.md` e dos testes Playwright.

Legenda de status: `[ ]` pendente · `[~]` em andamento · `[x]` pronto

## 1. Eliminatórios (qualquer falha aqui zera a entrega)

| ID | Requisito | Evidência |
| --- | --- | --- |
| E1 | Uso **efetivo** de toda a stack obrigatória | `[ ]` |
| E2 | Fluxos principais não podem ser "apenas visuais" (compra, login, perfil com estado real) | `[ ]` |
| E3 | Compra confirmada só com resposta da simulação (nunca confirmar no cliente) | `[ ]` |
| E4 | Zero exposição de dados entre usuários | `[ ]` |
| E5 | Eventos **não** podem ser simulados direto na UI (proibido setter/callback/cache no lugar do socket) | `[ ]` |
| E6 | Testes E2E executáveis de verdade | `[ ]` |

## 2. Stack obrigatória

| ID | Requisito | Evidência |
| --- | --- | --- |
| S1 | React como interface | `[ ]` |
| S2 | TypeScript | `[ ]` |
| S3 | TanStack Router em rotas, search params e proteção de rotas privadas | `[ ]` |
| S4 | TanStack Query em queries, mutations e sincronização de cache | `[ ]` |
| S5 | Axios como cliente HTTP (todas as chamadas REST passam por ele) | `[ ]` |
| S6 | REST APIs como integração de dados | `[ ]` |
| S7 | Socket.IO no tempo real, via `socket.io-client` | `[ ]` |
| S8 | Tailwind CSS | `[ ]` |
| S9 | shadcn/ui adaptado à identidade visual | `[ ]` |
| S10 | MSW na camada de rede (sw + socket binding) | `[ ]` |
| S11 | Playwright: E2E + regressão visual | `[ ]` |
| S12 | Lighthouse: auditoria de performance e qualidade | `[ ]` |

## 3. Telas

| ID | Tela | Obrigatório | Evidência |
| --- | --- | --- | --- |
| T1 | Início | Destaques, catálogo, busca, filtros, ordenação, navegação ao NFT | `[ ]` |
| T2 | Detalhes do NFT | Galeria, informações, edição, quantidade, favoritos, compra | `[ ]` |
| T3 | Carrinho | Quantidades, remoção, cupom, resumo de valores | `[ ]` |
| T4 | Pagamento | Dados do colecionador, carteira/rede, revisão, envio | `[ ]` |
| T5 | Confirmação | Resultado, id da transação, itens, taxas, total | `[ ]` |
| T6 | Login | Autenticação, validação, retorno ao fluxo anterior | `[ ]` |
| T7 | Cadastro | Criação de conta, validação, conflito | `[ ]` |
| T8 | Perfil | Edição de dados, avatar, alteração de senha | `[ ]` |
| T9 | Carteiras | Cadastro e edição de carteiras principal e secundária | `[ ]` |
| T10 | Mobile | Perfil, carteiras e confirmação funcionam em mobile **mesmo sem frame** | `[ ]` |
| T11 | Fora de escopo | Editorial, suporte, atividade, ofertas, downloads: link/ação coerente, **sem aparentar sucesso** | `[ ]` |

## 4. Catálogo e detalhe

| ID | Requisito | Evidência |
| --- | --- | --- |
| C1 | Busca, filtros, ordenação e paginação compõem a URL | `[ ]` |
| C2 | Estado sobrevive a refresh | `[ ]` |
| C3 | Estado sobrevive a back/forward do navegador | `[ ]` |
| C4 | Filtros combináveis; mudar filtro **reseta a paginação** | `[ ]` |
| C5 | Query reflete exatamente os parâmetros enviados à API | `[ ]` |
| C6 | Trata resultado vazio | `[ ]` |
| C7 | Trata falha | `[ ]` |
| C8 | Trata respostas fora de ordem (descarta obsoleta) | `[ ]` |
| C9 | Detalhe por acesso direto (deep link) | `[ ]` |
| C10 | Detalhe: NFT inexistente | `[ ]` |
| C11 | Detalhe: edição indisponível | `[ ]` |
| C12 | Detalhe: limite de quantidade | `[ ]` |
| C13 | Favoritos persistem para o usuário autenticado | `[ ]` |

## 5. Carrinho

| ID | Requisito | Evidência |
| --- | --- | --- |
| K1 | Adicionar item respeitando disponibilidade | `[ ]` |
| K2 | Alterar quantidade respeitando disponibilidade | `[ ]` |
| K3 | Remover item | `[ ]` |
| K4 | Carrinho sobrevive a refresh | `[ ]` |
| K5 | Itens do visitante preservados ao autenticar (merge) | `[ ]` |
| K6 | Aplicar cupom | `[ ]` |
| K7 | Remover cupom | `[ ]` |
| K8 | Cupom inválido tratado | `[ ]` |
| K9 | Cupom expirado tratado | `[ ]` |
| K10 | Subtotal, desconto, taxa de rede e total vindos da API | `[ ]` |
| K11 | Resumo reflete `nft.updated` com carrinho aberto | `[ ]` |
| K12 | ETH trafega como string decimal com precisão preservada | `[ ]` |
| K13 | Quantidades são inteiras | `[ ]` |
| K14 | Cotação da API é a referência para finalizar o pedido | `[ ]` |

## 6. Pagamento e confirmação

| ID | Requisito | Evidência |
| --- | --- | --- |
| P1 | Validação dos campos do layout | `[ ]` |
| P2 | Revisão antes do envio | `[ ]` |
| P3 | Usa as carteiras cadastradas | `[ ]` |
| P4 | Seleção de rede | `[ ]` |
| P5 | Simulação de conexão de carteira | `[ ]` |
| P6 | Simulação de recusa de pagamento | `[ ]` |
| P7 | Simulação de desconexão | `[ ]` |
| P8 | Revalida preço, disponibilidade, cupom e taxas antes de confirmar | `[ ]` |
| P9 | Mudança detectada exige nova confirmação do usuário | `[ ]` |
| P10 | Impede pedido duplicado em cliques repetidos | `[ ]` |
| P11 | Impede duplicata em reenvio após timeout | `[ ]` |
| P12 | Estado pendente representado | `[ ]` |
| P13 | Estado confirmado representado | `[ ]` |
| P14 | Estado recusado representado | `[ ]` |
| P15 | Recuperação após refresh com pedido pendente | `[ ]` |
| P16 | Recuperação após reconexão | `[ ]` |
| P17 | Confirmação exibida só para pedido confirmado na simulação | `[ ]` |
| P18 | Falha preserva os itens no carrinho | `[ ]` |
| P19 | Após confirmar, remove só os itens/quantidades comprados | `[ ]` |
| P20 | Recibo é snapshot imutável do pedido | `[ ]` |
| P21 | Alteração posterior no catálogo não muda o recibo | `[ ]` |
| P22 | Hash de transação e link do explorer simulados | `[ ]` |

## 7. Conta e sessão

| ID | Requisito | Evidência |
| --- | --- | --- |
| A1 | Cadastro | `[ ]` |
| A2 | Login | `[ ]` |
| A3 | Logout | `[ ]` |
| A4 | Sessão recuperável após refresh | `[ ]` |
| A5 | Expiração durante navegação | `[ ]` |
| A6 | Expiração durante checkout, preservando contexto para retomada | `[ ]` |
| A7 | Logout limpa cache privado | `[ ]` |
| A8 | Troca de usuário limpa cache privado | `[ ]` |
| A9 | Logout/troca encerra subscriptions da sessão anterior | `[ ]` |
| A10 | Checkout exige autenticação | `[ ]` |
| A11 | Perfil exige autenticação | `[ ]` |
| A12 | Carteiras exigem autenticação | `[ ]` |
| A13 | Favoritos exigem autenticação | `[ ]` |
| A14 | Pedidos exigem autenticação | `[ ]` |
| A15 | Validação de cadastro, perfil, senha e carteiras | `[ ]` |
| A16 | Exibe erros de validação devolvidos pela API | `[ ]` |
| A17 | Alterações confirmadas persistem após refresh | `[ ]` |
| A18 | Senhas não armazenadas em claro (nem no mock) | `[ ]` |

## 8. Integração e estado

| ID | Requisito | Evidência |
| --- | --- | --- |
| I1 | Contratos tipados entre transporte, estado e UI | `[ ]` |
| I2 | Estados de loading | `[ ]` |
| I3 | Estados vazio / erro / sucesso | `[ ]` |
| I4 | Atualização em segundo plano (background refetch) | `[ ]` |
| I5 | Invalidação coerente após mutations e eventos | `[ ]` |
| I6 | Cancelamento/descarte de respostas obsoletas | `[ ]` |
| I7 | Isolamento de cache por usuário | `[ ]` |
| I8 | Isolamento de cache por parâmetros de consulta | `[ ]` |
| I9 | Recuperação de falha sem duplicar operação | `[ ]` |
| I10 | Rota inexistente tratada | `[ ]` |
| I11 | Acesso direto a qualquer tela prevista | `[ ]` |
| I12 | Atualização otimista em ≥1 interação, com rollback em falha | `[ ]` |
| I13 | Política de cache, retries e sincronização documentada | `[ ]` |

## 9. Contratos REST

| ID | Recurso | Operações | Evidência |
| --- | --- | --- | --- |
| R1 | Sessão e conta | Cadastro, login, consulta, logout, expiração | `[ ]` |
| R2 | NFTs | Listagem (busca/filtros/ordenação/paginação) e detalhe | `[ ]` |
| R3 | Favoritos | Consulta, inclusão, remoção | `[ ]` |
| R4 | Carrinho | Consulta, inclusão, alteração, remoção | `[ ]` |
| R5 | Cotação | Cupom, disponibilidade, descontos, taxas, total | `[ ]` |
| R6 | Pedidos | Criação idempotente, estado, recibo | `[ ]` |
| R7 | Perfil | Consulta, dados/avatar, senha | `[ ]` |
| R8 | Carteiras | Consulta, cadastro, atualização | `[ ]` |
| R9 | Erros cobertos | Validação, sessão inválida, sem permissão, inexistente, conflito de disponibilidade, falha transitória | `[ ]` |
| R10 | Idempotência | Mesma chave → mesmo pedido; mesma chave + conteúdo diferente → conflito | `[ ]` |
| R11 | Documentação | Contratos REST documentados | `[ ]` |

## 10. Mocking (MSW)

| ID | Requisito | Evidência |
| --- | --- | --- |
| M1 | Mocks só na camada de rede (sem mock em componente/hook/axios) | `[ ]` |
| M2 | Contratos e cenários reutilizados entre dev, demo e testes | `[ ]` |
| M3 | Estado consistente entre catálogo, favoritos, carrinho, perfil, carteiras e pedidos | `[ ]` |
| M4 | Persistência local para sustentar refresh | `[ ]` |
| M5 | Reset restaura integralmente um cenário conhecido | `[ ]` |
| M6 | Latência fixa configurável | `[ ]` |
| M7 | Latência variável | `[ ]` |
| M8 | Timeout | `[ ]` |
| M9 | Indisponibilidade de conexão | `[ ]` |
| M10 | Respostas HTTP de erro | `[ ]` |
| M11 | Cenários configuráveis e reproduzíveis | `[ ]` |
| M12 | Fixtures com variedade para filtros e paginação | `[ ]` |
| M13 | ≥2 usuários | `[ ]` |
| M14 | Cenário sucesso | `[ ]` |
| M15 | Cenário resultado vazio | `[ ]` |
| M16 | Cenário respostas fora de ordem | `[ ]` |
| M17 | Cenário falha de conexão / 4xx / 5xx | `[ ]` |
| M18 | Cenário sessão expirada / não autorizado | `[ ]` |
| M19 | Cenário conflito de cadastro / validação | `[ ]` |
| M20 | Cenário cupom inválido / expirado | `[ ]` |
| M21 | Cenário preço alterado / edição esgotada na compra | `[ ]` |
| M22 | Cenário timeout após criar pedido, recuperando por idempotência | `[ ]` |
| M23 | Cenário pagamento confirmado | `[ ]` |
| M24 | Cenário pagamento recusado | `[ ]` |
| M25 | Eventos mockados com o binding de Socket.IO | `[ ]` |
| M26 | `socket.io-client` realmente exercitado | `[ ]` |
| M27 | Ativação por configuração | `[ ]` |
| M28 | Disponível no build de demonstração | `[ ]` |
| M29 | Mudança no mock reflete em REST **e** evento | `[ ]` |
| M30 | Transporte e limitações documentados | `[ ]` |

## 11. Tempo real

| ID | Requisito | Evidência |
| --- | --- | --- |
| W1 | `nft.updated` atualiza catálogo | `[ ]` |
| W2 | `nft.updated` atualiza detalhe | `[ ]` |
| W3 | `nft.updated` atualiza carrinho | `[ ]` |
| W4 | `order.updated` atualiza estado do pedido | `[ ]` |
| W5 | `order.updated` apresenta confirmação/recusa | `[ ]` |
| W6 | Evento carrega identidade estável, recurso e **versão** | `[ ]` |
| W7 | Tolera duplicatas | `[ ]` |
| W8 | Tolera eventos antigos (não regride estado) | `[ ]` |
| W9 | Não reaplica efeitos já aplicados | `[ ]` |
| W10 | Reconcilia com REST após reconexão | `[ ]` |
| W11 | Evento de sessão anterior não atualiza outro usuário | `[ ]` |
| W12 | Listeners liberados no fim do ciclo de vida | `[ ]` |
| W13 | Cenário: NFT no carrinho muda de preço/disponibilidade | `[ ]` |
| W14 | UI informa a mudança e atualiza o resumo | `[ ]` |
| W15 | Checkout bloqueia com cotação desatualizada | `[ ]` |
| W16 | Queda de conexão com pedido pendente | `[ ]` |
| W17 | Após reconectar/recarregar recupera sem nova compra | `[ ]` |
| W18 | Confirmado e recusado são terminais | `[ ]` |

## 12. Interface, responsividade e acessibilidade

| ID | Requisito | Evidência |
| --- | --- | --- |
| U1 | Tipografia, cores, espaçamento, hierarquia, imagens e proporções do Figma | `[ ]` |
| U2 | shadcn/ui adaptado à identidade | `[ ]` |
| U3 | Funciona em 390px | `[ ]` |
| U4 | Funciona em 768px | `[ ]` |
| U5 | Funciona em 1440px | `[ ]` |
| U6 | Skeletons com shimmer no catálogo | `[ ]` |
| U7 | Skeletons com shimmer no detalhe | `[ ]` |
| U8 | Skeletons com shimmer no resumo do carrinho | `[ ]` |
| U9 | Skeleton preserva dimensões (sem CLS) | `[ ]` |
| U10 | Shimmer respeita `prefers-reduced-motion` | `[ ]` |
| U11 | Navegação por teclado | `[ ]` |
| U12 | Foco visível | `[ ]` |
| U13 | Controle de foco em diálogos/drawers | `[ ]` |
| U14 | Semântica, labels e erros associados aos campos | `[ ]` |
| U15 | Texto alternativo em imagens relevantes | `[ ]` |
| U16 | Contraste legível | `[ ]` |
| U17 | Estado nunca só por cor | `[ ]` |
| U18 | Feedback acessível para mutations | `[ ]` |
| U19 | Feedback acessível para tempo real (aria-live) | `[ ]` |
| U20 | Sem overflow horizontal | `[ ]` |
| U21 | Sem perda de conteúdo com zoom | `[ ]` |
| U22 | Assets do Figma usados quando disponíveis | `[ ]` |
| U23 | Imagens e fontes acessíveis localmente | `[ ]` |
| U24 | Substituições de asset e ajustes de a11y documentados | `[ ]` |

## 13. Testes Playwright

| ID | Requisito | Evidência |
| --- | --- | --- |
| X1 | Busca | `[ ]` |
| X2 | Filtros combinados | `[ ]` |
| X3 | Ordenação | `[ ]` |
| X4 | Paginação | `[ ]` |
| X5 | Restauração pelo histórico | `[ ]` |
| X6 | Acesso direto ao detalhe | `[ ]` |
| X7 | Recurso inexistente | `[ ]` |
| X8 | Cadastro | `[ ]` |
| X9 | Login | `[ ]` |
| X10 | Expiração de sessão | `[ ]` |
| X11 | Logout | `[ ]` |
| X12 | Troca de usuário | `[ ]` |
| X13 | Favoritos | `[ ]` |
| X14 | Favoritos com falha de mutation e recuperação | `[ ]` |
| X15 | Carrinho: quantidades | `[ ]` |
| X16 | Carrinho: remoção | `[ ]` |
| X17 | Carrinho: cupom | `[ ]` |
| X18 | Carrinho: persistência após refresh/login | `[ ]` |
| X19 | Compra completa até recibo confirmado | `[ ]` |
| X20 | Falha de pagamento | `[ ]` |
| X21 | Clique repetido | `[ ]` |
| X22 | Timeout recuperando o mesmo pedido | `[ ]` |
| X23 | Perfil: edição | `[ ]` |
| X24 | Perfil: avatar | `[ ]` |
| X25 | Perfil: senha | `[ ]` |
| X26 | Carteiras com erros de validação | `[ ]` |
| X27 | Mudança via Socket.IO durante checkout | `[ ]` |
| X28 | Eventos duplicados/antigos | `[ ]` |
| X29 | Desconexão e retomada de pedido pendente | `[ ]` |
| X30 | Navegação por teclado | `[ ]` |
| X31 | Foco de diálogos | `[ ]` |
| X32 | Validação de formulários | `[ ]` |
| X33 | Skeletons em carregamento lento | `[ ]` |
| X34 | Feedback de falha + recuperação por retry | `[ ]` |
| X35 | Fluxos principais em Chromium desktop e mobile | `[ ]` |
| X36 | Regressão visual: início | `[ ]` |
| X37 | Regressão visual: detalhe | `[ ]` |
| X38 | Regressão visual: carrinho | `[ ]` |
| X39 | Regressão visual: pagamento | `[ ]` |
| X40 | Baselines versionadas com dados estáveis | `[ ]` |
| X41 | Cada teste parte de estado isolado | `[ ]` |
| X42 | Controle de relógio, latência e disparo de eventos | `[ ]` |
| X43 | Relatório HTML entregue | `[ ]` |
| X44 | Traces das falhas entregues | `[ ]` |
| X45 | Asserções na UI e no resultado das operações | `[ ]` |
| X46 | Tempo real passa pelo cliente Socket.IO | `[ ]` |
| X47 | REST passa pelos handlers MSW | `[ ]` |

## 14. Performance / Lighthouse

| ID | Requisito | Evidência |
| --- | --- | --- |
| L1 | Performance ≥ 90 | `[ ]` |
| L2 | Accessibility ≥ 95 | `[ ]` |
| L3 | Best Practices ≥ 95 | `[ ]` |
| L4 | SEO ≥ 90 | `[ ]` |
| L5 | Audita início e detalhe | `[ ]` |
| L6 | Perfis mobile e desktop | `[ ]` |
| L7 | 3 medições por página/perfil, reporta mediana | `[ ]` |
| L8 | Configuração da auditoria versionada | `[ ]` |
| L9 | Relatórios HTML/JSON entregues | `[ ]` |
| L10 | Versões de ferramentas, ambiente e condições | `[ ]` |
| L11 | Registra LCP, CLS e TBT | `[ ]` |
| L12 | Justifica resultados abaixo da meta | `[ ]` |
| L13 | Audita o build real, sem simplificações | `[ ]` |

## 15. Entrega

| ID | Requisito | Evidência |
| --- | --- | --- |
| D1 | Código-fonte | `[ ]` |
| D2 | Lockfile | `[ ]` |
| D3 | Assets | `[ ]` |
| D4 | Mocks | `[ ]` |
| D5 | Fixtures | `[ ]` |
| D6 | Testes | `[ ]` |
| D7 | Configurações de auditoria | `[ ]` |
| D8 | Deploy público obrigatório | `[ ]` |
| D9 | Versão publicada = código entregue | `[ ]` |
| D10 | Deploy com mocks e tempo real funcionando | `[ ]` |
| D11 | Deep link e refresh funcionam no deploy | `[ ]` |
| D12 | `README.md`: setup | `[ ]` |
| D13 | `README.md`: variáveis de ambiente | `[ ]` |
| D14 | `README.md`: credenciais fictícias | `[ ]` |
| D15 | `README.md`: seleção e reset de cenários | `[ ]` |
| D16 | `README.md`: comandos de execução | `[ ]` |
| D17 | `README.md`: reproduzir fluxos de falha | `[ ]` |
| D18 | `ARCHITECTURE.md`: contratos REST e eventos | `[ ]` |
| D19 | `ARCHITECTURE.md`: política de sessão | `[ ]` |
| D20 | `ARCHITECTURE.md`: estado do carrinho | `[ ]` |
| D21 | `ARCHITECTURE.md`: estratégia de cache | `[ ]` |
| D22 | `ARCHITECTURE.md`: reconciliação REST ↔ Socket.IO | `[ ]` |
| D23 | `ARCHITECTURE.md`: limitações e decisões de UX | `[ ]` |
| D24 | `ARCHITECTURE.md`: desvios do Figma | `[ ]` |
| D25 | Comandos: dev com mocks, build, preview, typecheck, lint, e2e, lighthouse | `[ ]` |
| D26 | Executa a partir de checkout limpo, sem serviço privado | `[ ]` |
