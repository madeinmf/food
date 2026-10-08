# 🍔 mepede.ai · Sistema de Criação e Edição de Cardápio para Foodtruck

Sistema completo, moderno e de altíssima usabilidade para criação e edição de cardápios digitais para foodtrucks, com sincronização em tempo real e simulação interativa da experiência do cliente no smartphone (iPhone).

---

## 🚀 Como Iniciar

Você pode iniciar o sistema de três formas super simples:

### Opção 1: Com Node.js / NPM (Recomendado)
```bash
npm start
# ou
node server.js
```
*O sistema iniciará em `http://localhost:3000` e abrirá seu navegador automaticamente.*

### Opção 2: Script rápido no terminal
```bash
./iniciar.sh
```

### Opção 3: Direto no Navegador (Offline)
Basta dar um duplo clique no arquivo [`index.html`](file:///Users/filipemf/Developer/foodtruqueres/index.html) no Finder. Ele roda 100% de forma autônoma sem necessidade de servidores ou conexões externas.

---

## 🌟 Usabilidade Ponta a Ponta: Principais Recursos

### 1. Gestão Centralizada de Cardápios (Multi-Cardápio)
- **Indicador em Tempo Real**: Veja qual cardápio o cliente está visualizando no momento ("No ar agora").
- **Agendamento Inteligente**: Configure disponibilidade ("Sempre disponível" ou "Dias da semana e horários específicos", ex: Almoço Seg–Sex 11h às 15h).
- **Criação Flexível**: Crie novos cardápios em branco ou clone categorias e produtos de cardápios existentes.
- **Interruptor Rápido**: Ligue ou desligue qualquer cardápio sem perder dados.

### 2. Onboarding Guiado (Checklist Passo a Passo)
- Barra interativa com progresso ("Passo 3 de 4 · Pôr foto em 2 produtos").
- Cliques diretos nas etapas direcionam o usuário para a ação correta.
- Se houver produtos sem foto, um clique já abre o primeiro produto sem imagem para agilizar o cadastro.

### 3. Categorias Dinâmicas
- Pílulas (chips) de categorias com contadores em tempo real.
- Status por cor:
  - 🟢 **Verde**: Ativa e no horário de funcionamento.
  - 🟠 **Laranja**: Agendada para outro horário (com horário de abertura indicado).
  - ⚪ **Cinza**: Desativada/oculta.
- **Criação Instantânea**: Campo inline "+ Nova categoria" para digitar e dar Enter, além de sugestões rápidas com 1 clique (*Lanches*, *Bebidas*, *Porções*, *Combos*, *Sobremesas*, *Açaí*).
- Reordenação fácil com setas de ordenação (← e →).
- Vinculação rápida de produtos existentes à categoria.

### 4. Painel Lateral (Drawer) de Criação e Edição de Produtos
- **Foto**: Upload de qualquer imagem do computador com compressão automática + **Galeria de Fotos Rápidas do Foodtruck** com 1 clique (*Burger*, *Smash*, *Bacon*, *Açaí*, *Cheddar*, etc.).
- **Validação com Feedback Visual**: Borda de destaque e indicação dos campos obrigatórios faltantes.
- **Descrição**: Contador de caracteres em tempo real (0/160).
- **Preços e Descontos**:
  - Preço único com cálculo automático de desconto a partir do "Preço antes" (ex: R$ 49,90 -> R$ 32,90 calcula automaticamente **-34%**).
  - Variação por tamanho/tipo (ex: 300ml, 500ml, 1L ou P, M, G) com adição dinâmica de linhas.
- **Complementos Integrados**:
  - Vincule grupos da biblioteca existente com 1 clique.
  - Reordene a ordem que o cliente vê com setas ↑ e ↓.
  - Crie um novo grupo de complementos diretamente dentro do formulário do produto sem perder nada do que já digitou.
- **Ações Rápidas**: "Salvar alterações" e "Salvar e criar outro" (para cadastro ágil em lote).

### 5. Biblioteca de Complementos
- Grupos reutilizáveis (*Ponto da carne*, *Adicionais no burger*, *Monte seu açaí*).
- Regras em linguagem simples: **Obrigatório** ou **Opcional**, com escolha mínima e máxima ("Escolha até 3 opções").
- Contador e lista de produtos onde cada grupo está sendo utilizado.

### 6. Mockup do Smartphone (Prévia do Cliente ao Vivo)
- **Atualização WYSIWYG**: Tudo o que você digita ou edita no painel reflete no smartphone no mesmo segundo.
- **Status Aberto/Fechado**: O interruptor na sidebar sincroniza imediatamente com o selo do foodtruck no celular.
- **Navegação Real de Compra**:
  - Clique em produtos para abrir o **Bottom Sheet de customização**.
  - Validação de itens obrigatórios (bloqueia adicionar ao carrinho se não selecionar o ponto da carne ou tamanho).
  - Limite máximo respeitado em adicionais com mensagens amigáveis.
  - Total calculado em tempo real: `(base + adicionais) * quantidade`.
- **Carrinho Completo**:
  - Badge no ícone do carrinho com a contagem total de itens.
  - Detalhamento de cada item com adicionais escolhidos e botão para remover.
  - Cálculo de Subtotal + Taxa de Entrega = Total Geral.
  - Validação de Pedido Mínimo da loja e status da loja aberta.
  - **Simulação de Pedido**: Gera o pedido formatado prontinho para envio direto pelo WhatsApp do foodtruck!

### 7. Ferramentas e Segurança
- **Compartilhamento**: Cópia de link com feedback "Copiado!", botão WhatsApp e modal de QR Code em alta resolução pronto para impressão em mesas/balcão.
- **Desfazer (Undo)**: Qualquer exclusão acidental pode ser revertida com 1 clique pelo Toast no rodapé.
- **Persistência Local**: Todos os dados salvos automaticamente no `localStorage` do navegador.

---

## 📁 Estrutura de Arquivos

```
foodtruqueres/
├── index.html              # Interface web principal autônoma e moderna
├── app.js                  # Lógica reativa, estado, validações e interações
├── server.js               # Servidor local leve em Node.js (zero dependências)
├── package.json            # Scripts de execução (npm start)
├── iniciar.sh              # Script shell executável
├── README.md               # Documentação técnica e guia de uso
├── assets/                 # Imagens dos produtos, adicionais e capa
│   ├── burger.png
│   ├── carne.png
│   ├── bacon.png
│   ├── acai.png
│   ├── cheddar.png
│   ├── alface.png
│   ├── maionese.png
│   ├── molho.png
│   └── capa.png
└── Sistema de cardápio.../ # Arquivos complementares de documentação
```
