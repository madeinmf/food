// mepede.ai · Aplicação de Cardápio para Foodtruck
// Usabilidade ponta a ponta 100% funcional

(function() {
  'use strict';

  const LS_KEY = 'mepede-cardapio-v12';
  const uid = () => Math.random().toString(36).slice(2, 9);
  const money = n => 'R$\u00A0' + (Number(n) || 0).toFixed(2).replace('.', ',');
  const pm = s => {
    if (typeof s === 'number') return s;
    s = String(s || '').replace(/[^\d,.]/g, '');
    if (!s) return 0;
    if (s.indexOf(',') > -1) s = s.replace(/\./g, '').replace(',', '.');
    return parseFloat(s) || 0;
  };
  const ms = n => (n ? Number(n).toFixed(2).replace('.', ',') : '');

  const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
  const PRODUCT_TAGS = [
    { id: 'promocao', label: 'promoção', emoji: '🎉', bg: '#FDF6E2', color: '#E67E00' },
    { id: 'mais_pedido', label: 'mais pedido', emoji: '🔥', bg: '#FDEAE2', color: '#EA580C' },
    { id: 'queridinho', label: 'O Queridinho', emoji: '😇', bg: '#E2EEFD', color: '#007AFF' },
    { id: 'novidade', label: 'Novidade', emoji: '✨', bg: '#FCF8DA', color: '#9E8A00' },
    { id: 'favorito', label: 'Favorito da casa', emoji: '⭐', bg: '#FEF8DA', color: '#D49B00' },
    { id: 'chef', label: 'Recomendado pelo chef', emoji: '👨‍🍳', bg: '#FDEEE4', color: '#E8590C' },
    { id: 'ultimas', label: 'Últimas unidades', emoji: '⏰', bg: '#FDE4E7', color: '#C92A42' },
    { id: 'so_hoje', label: 'Só hoje', emoji: '📅', bg: '#FDEEE4', color: '#E65100' },
    { id: 'combo', label: 'Combo especial', emoji: '🎁', bg: '#FDF0E4', color: '#EA580C' },
    { id: 'picante', label: 'Picante', emoji: '🌶️', bg: '#FDE2E4', color: '#E00025' },
    { id: 'sem_gluten', label: 'Sem glúten', emoji: '🌾', bg: '#E8F5E9', color: '#558B2F' },
    { id: 'vegetariano', label: 'Vegetariano', emoji: '🌱', bg: '#E4F6DF', color: '#43A047' },
    { id: 'vegano', label: 'Vegano', emoji: '🥬', bg: '#DCF3E8', color: '#0E8A59' }
  ];
  const BADGES = PRODUCT_TAGS.map(t => t.label);

  function getTagInfo(badge) {
    if (!badge) return null;
    const clean = String(badge).trim().toLowerCase();
    const found = PRODUCT_TAGS.find(t => 
      t.label.toLowerCase() === clean || 
      t.id === clean ||
      clean.includes(t.label.toLowerCase()) ||
      t.label.toLowerCase().includes(clean)
    );
    if (found) return found;
    return { id: 'custom', label: badge, emoji: '🏷️', bg: '#F1F2F5', color: '#555A68' };
  }

  function renderBadgeHtml(badge, customStyle = '') {
    const t = getTagInfo(badge);
    if (!t) return '';
    return `<span class="product-tag-pill" style="display:inline-flex; align-items:center; gap:4px; background:${t.bg}; color:${t.color}; padding:2.5px 8px; border-radius:12px; font-size:10.5px; font-weight:700; line-height:1.2; user-select:none; ${customStyle}"><span style="font-size:12px; line-height:1">${t.emoji}</span><span>${t.label}</span></span>`;
  }

  const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

  const PRESET_PHOTOS = [
    { name: 'X-Burguer Clássico', url: 'assets/burger.png' },
    { name: 'Batatas + Detroid', url: 'assets/detroid_hero.png' },
    { name: 'Bacon Crocante', url: 'assets/bacon.png' },
    { name: 'Carne / Smash', url: 'assets/carne.png' },
    { name: 'Maionese da Casa', url: 'assets/maionese.png' },
    { name: 'Alface Fresco', url: 'assets/alface.png' },
    { name: 'Cheddar Extra', url: 'assets/cheddar.png' },
    { name: 'Açaí Cremoso', url: 'assets/acai.png' }
  ];

  const O = (name, price, desc, img) => ({
    id: uid(),
    name,
    price: price || 0,
    desc: desc || '',
    img: img || ''
  });

  function seed() {
    const groups = [
      {
        id: 'g0',
        name: 'Base',
        min: 1,
        max: 1,
        options: [
          O('Pão natural fermentado', 5, 'A melhor maionese do planeta', 'assets/pao_fermentado.png'),
          O('Pão integral de forma', 0, '120g de pura carne', 'assets/pao_forma.png'),
          O('Pão Francês', 0, 'Nosso clássico francês com 50% de farinha integral', 'assets/pao_frances.png')
        ]
      },
      {
        id: 'g2',
        name: 'Adicionais',
        min: 0,
        max: 4,
        options: [
          O('Maionese da casa', 4, 'A melhor maionese do planeta', 'assets/maionese.png'),
          O('Hamburguer', 12, '120g de pura carne', 'assets/carne.png'),
          O('Alface', 3, 'Pros veganos', 'assets/alface.png'),
          O('Bacon crocante', 5, 'Bacon artesanal em tiras', 'assets/bacon.png')
        ]
      }
    ];

    const C = (id, name, o) => Object.assign({
      id,
      name,
      menuId: 'm1',
      active: true,
      avail: 'always',
      days: ALL_DAYS.slice(),
      start: '17:00',
      end: '23:30'
    }, o || {});

    const categories = [
      C('c1', 'Mais vendidos'),
      C('c2', 'Hamburguers'),
      C('c3', 'Combos'),
      C('c4', 'Bebidas')
    ];

    const P = o => Object.assign({
      id: uid(),
      desc: '',
      img: '',
      badge: '',
      serves: '1 pessoa',
      type: 'simple',
      price: 0,
      orig: 0,
      varName: 'Tamanho',
      varOpts: [],
      groupIds: [],
      active: true,
      catIds: []
    }, o);

    const products = [
      P({
        name: 'X-Burguer Clássico + Coca-cola Zero',
        desc: 'Blend 180g, queijo cheddar, alface, tomate e maionese da casa',
        img: 'assets/burger.png',
        badge: 'mais pedido',
        price: 32.9,
        orig: 49.9,
        serves: '1 pessoa',
        groupIds: ['g0', 'g2'],
        catIds: ['c1', 'c2']
      }),
      P({
        name: 'Batatas + Detroid Burguer',
        desc: 'Blend 180g, peso de 350g, queijo cheddar, alface, tomate e maionese da casa',
        img: 'assets/detroid_hero.png',
        badge: 'Promoção',
        price: 34.9,
        orig: 60.0,
        serves: '1 pessoa',
        groupIds: ['g0', 'g2'],
        catIds: ['c1', 'c2', 'c3']
      }),
      P({
        name: 'X-Burguer Clássico + Coca-cola Zero',
        desc: 'Blend 180g, queijo cheddar, alface, tomate e maionese da casa',
        img: 'assets/burger.png',
        badge: 'mais pedido',
        price: 32.9,
        orig: 49.9,
        serves: '1 pessoa',
        groupIds: ['g0', 'g2'],
        catIds: ['c1', 'c2']
      }),
      P({
        name: 'X-Burguer Clássico + Coca-cola Zero',
        desc: 'Blend 180g, queijo cheddar, alface, tomate e maionese da casa',
        img: 'assets/burger.png',
        badge: 'mais pedido',
        price: 32.9,
        orig: 49.9,
        serves: '1 pessoa',
        groupIds: ['g0', 'g2'],
        catIds: ['c1', 'c2']
      }),
      P({
        name: 'Coca-cola Zero lata',
        desc: '350ml bem gelada',
        price: 6.9,
        catIds: ['c4']
      })
    ];

    const menus = [
      {
        id: 'm1',
        name: 'Cardápio Principal',
        active: true,
        avail: 'always',
        days: ALL_DAYS.slice(),
        start: '17:00',
        end: '23:30'
      }
    ];

    return {
      store: {
        name: "Me pede ai Burguer's",
        open: true,
        eta: '35-45 min',
        fee: 0,
        min: 60,
        slug: 'mepedeburguers'
      },
      menus,
      categories,
      groups,
      products
    };
  }

  function emptyData() {
    return {
      store: {
        name: "Me pede ai Burguer's",
        open: true,
        eta: '35-45 min',
        fee: 0,
        min: 60,
        slug: 'mepedeburguers'
      },
      menus: [],
      categories: [],
      groups: [
        {
          id: 'g0',
          name: 'Base',
          min: 1,
          max: 1,
          options: [
            O('Pão natural fermentado', 5, 'A melhor maionese do planeta', 'assets/pao_fermentado.png'),
            O('Pão integral de forma', 0, '120g de pura carne', 'assets/pao_forma.png'),
            O('Pão Francês', 0, 'Nosso clássico francês com 50% de farinha integral', 'assets/pao_frances.png')
          ]
        },
        {
          id: 'g2',
          name: 'Adicionais',
          min: 0,
          max: 4,
          options: [
            O('Maionese da casa', 4, 'A melhor maionese do planeta', 'assets/maionese.png'),
            O('Hamburguer', 12, '120g de pura carne', 'assets/carne.png'),
            O('Alface', 3, 'Pros veganos', 'assets/alface.png'),
            O('Bacon crocante', 5, 'Bacon artesanal em tiras', 'assets/bacon.png')
          ]
        }
      ],
      products: []
    };
  }

  function loadData() {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d && Array.isArray(d.categories) && Array.isArray(d.menus)) {
          return d;
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar dados do localStorage:', e);
    }
    return emptyData();
  }

  const toM = t => {
    const [a, b] = String(t || '0:0').split(':').map(Number);
    return a * 60 + (b || 0);
  };

  const ruleText = g => {
    if (g.min > 0 && g.min === g.max) return 'Escolha ' + g.max + (g.max > 1 ? ' opções' : ' opção');
    if (g.min > 0) return 'Escolha de ' + g.min + ' a ' + g.max;
    return 'Escolha até ' + g.max + (g.max > 1 ? ' opções' : ' opção');
  };

  const priceOf = p => {
    if (p.type === 'var') {
      const ps = p.varOpts.map(o => o.price).filter(x => x > 0);
      if (!ps.length) return 'R$\u00A00,00';
      const mn = Math.min(...ps);
      return (ps.length > 1 ? 'a partir de ' : '') + money(mn);
    }
    return money(p.price);
  };

  const discOf = p => (p.type !== 'var' && p.orig > p.price && p.price > 0 ? '-' + Math.round((1 - p.price / p.orig) * 100) + '%' : '');

  // Estado da Aplicação
  class Store {
    updatePriceHint() {
      const hint = document.getElementById('drawer-disc-hint');
      if (!hint || !this.draft) return;
      const pr = pm(this.draft.priceStr);
      const orr = pm(this.draft.origStr);
      if (orr > 0 && pr > 0 && orr > pr) {
        hint.textContent = `O cliente verá ${money(orr)} riscado e -${Math.round((1 - pr / orr) * 100)}% de desconto.`;
        hint.style.display = 'block';
      } else {
        hint.textContent = '';
        hint.style.display = 'none';
      }
    }

    cleanMoneyStr(s) {
      if (!s) return '';
      s = String(s).replace(/[^\d,.]/g, '');
      if (s.indexOf('.') > -1 && s.indexOf(',') === -1) s = s.replace('.', ',');
      const parts = s.split(',');
      if (parts.length > 1) {
        return parts[0] + ',' + parts.slice(1).join('').slice(0, 2);
      }
      return parts[0];
    }

    formatMoneyBlur(s) {
      if (!s || !s.trim()) return '';
      const v = pm(s);
      if (v === 0 && !s.includes('0')) return '';
      return v.toFixed(2).replace('.', ',');
    }

    constructor() {
      // Sempre que acessar o link, inicia direto no tour guiado com dados limpos!
      this.data = emptyData();
      try { localStorage.removeItem(LS_KEY); } catch (e) {}
      this.tab = 'menu'; // 'menu' | 'groups' | 'settings'
      this.menuId = null;
      this.selCat = 'all';
      this.search = '';
      this.drawer = null; // null | 'product' | 'category' | 'menu' | 'group' | 'pick'
      this.draft = null;
      this.cd = null;
      this.md = null;
      this.gd = null;
      this.pick = null;
      this.menuFor = null;
      this.toast = null;
      this.toastTimer = null;
      this.newCatOpen = false;
      this.newCatName = '';
      this.hideCheck = {};
      this.qrOpen = false;
      this.orderModalOpen = false;
      this.docModalOpen = false;
      this.tutorialStep = 1; // SEMPRE começa no passo 1 do tour guiado!
      this.showTutorialCard = false; // Não exibe card flutuante, apenas o "Clique aqui"!

      // Estado do Celular
      this.ph = {
        cat: null,
        pid: null,
        sel: { v: null, g: {} },
        qty: 1,
        cart: [],
        view: 'home', // 'home' | 'cart'
        coupon: '',
        couponCode: '',
        discountVal: 0,
        msg: '',
        msgTimer: null
      };

      this.listeners = [];
    }

    openDocModal() {
      this.docModalOpen = true;
      this.notify();
    }

    closeDocModal() {
      this.docModalOpen = false;
      this.notify();
    }

    startTutorial(forceEmpty = true) {
      if (forceEmpty) {
        this.data = emptyData();
      }
      this.tutorialStep = 1;
      this.showTutorialCard = false;
      this.tab = 'menu';
      this.drawer = null;
      this.menuId = this.data.menus[0] ? this.data.menus[0].id : null;
      this.selCat = 'all';
      this.ph = {
        cat: null,
        pid: null,
        sel: { v: null, g: {} },
        qty: 1,
        cart: [],
        view: 'home',
        msg: '',
        msgTimer: null
      };
      this.setToast('Tour iniciado! Siga o “Clique aqui” para começar.');
      this.notify();
    }

    loadSeedData() {
      this.data = seed();
      this.tutorialStep = null;
      this.showTutorialCard = false;
      this.tab = 'menu';
      this.drawer = null;
      this.menuId = this.data.menus[0] ? this.data.menus[0].id : null;
      this.selCat = 'all';
      this.ph = {
        cat: null,
        pid: null,
        sel: { v: null, g: {} },
        qty: 1,
        cart: [],
        view: 'home',
        msg: '',
        msgTimer: null
      };
      this.setToast('Dados de exemplo carregados!');
      this.notify();
    }

    resetToEmpty() {
      this.data = emptyData();
      this.tutorialStep = 1;
      this.showTutorialCard = false;
      this.tab = 'menu';
      this.drawer = null;
      this.menuId = null;
      this.selCat = 'all';
      this.ph = {
        cat: null,
        pid: null,
        sel: { v: null, g: {} },
        qty: 1,
        cart: [],
        view: 'home',
        msg: '',
        msgTimer: null
      };
      this.setToast('Painel zerado para novo cardápio!');
      this.notify();
    }

    nextTutorial() {
      if (this.tutorialStep && this.tutorialStep < 9) {
        this.tutorialStep++;
      } else {
        this.tutorialStep = null;
      }
      this.notify();
    }

    prevTutorial() {
      if (this.tutorialStep > 1) {
        this.tutorialStep--;
        this.notify();
      }
    }

    endTutorial() {
      this.tutorialStep = null;
      this.closeDrawer();
      this.notify();
    }

    triggerTutorialAction() {
      return this.executeTutorialStep();
    }

    executeTutorialStep() {
      const step = this.tutorialStep;
      if (step === 1) {
        // Abre gaveta de novo cardápio
        this.openMenu(null);
        this.nextTutorial();
      } else if (step === 2) {
        // Salva o cardápio
        if (this.md) {
          if (!this.md.name.trim()) this.md.name = 'Cardápio Principal';
          this.saveMenu();
        } else {
          this.openMenu(null);
          this.saveMenu();
        }
        this.setToast('Cardápio “Cardápio Principal” criado com sucesso!');
        this.nextTutorial();
      } else if (step === 3) {
        // Cria categoria Lanches
        this.createCat('Lanches');
        this.setToast('Categoria “Lanches” criada com sucesso!');
        this.nextTutorial();
      } else if (step === 4) {
        // Abre gaveta para novo produto
        const lCat = this.data.categories.find(c => c.name === 'Lanches') || this.data.categories[0];
        this.openProduct(null, lCat ? [lCat.id] : []);
        this.nextTutorial();
      } else if (step === 5) {
        // Preenche produto
        if (!this.draft) {
          const lCat = this.data.categories[0];
          this.openProduct(null, lCat ? [lCat.id] : []);
        }
        this.draft.name = 'Batatas + Detroid Burguer';
        this.draft.desc = 'Blend 180g, peso de 350g, queijo cheddar, alface, tomate e maionese da casa';
        this.draft.priceStr = '34,90';
        this.draft.img = 'assets/detroid_hero.png';
        this.draft.badge = 'Promoção';
        this.draft.groupIds = ['g0', 'g2'];
        if (!this.draft.catIds.length && this.data.categories.length) {
          this.draft.catIds = [this.data.categories[0].id];
        }
        this.notify();
        this.setToast('✨ Dados do burger preenchidos!');
        this.nextTutorial();
      } else if (step === 6) {
        // Salva produto
        if (this.draft) {
          this.saveProduct(false);
        }
        this.setToast('Produto salvo e publicado no cardápio!');
        this.nextTutorial();
      } else if (step === 7) {
        // Abre no smartphone
        const p = this.data.products[0];
        if (p) {
          this.closeDrawer();
          this.setPhone({ pid: p.id, view: 'home', qty: 1 });
        }
        this.nextTutorial();
      } else if (step === 8) {
        // Adiciona ao carrinho
        const p = this.data.products[0];
        const pName = p ? p.name : 'Batatas + Detroid Burguer';
        this.setPhone({
          pid: null,
          view: 'cart',
          cart: [
            {
              id: uid(),
              name: pName,
              detail: 'Blend 180g, queijo cheddar, alface, tomate e maionese da casa',
              qty: 2,
              total: 79.80,
              unitPrice: 39.90,
              img: (p && p.img) ? p.img : 'assets/detroid_combo.png'
            }
          ]
        });
        this.phSay('Item adicionado ao carrinho!');
        this.nextTutorial();
      } else if (step === 9) {
        // Carrinho aberto, usuário vê o resumo e clica em Continuar
        this.setPhone({ view: 'cart', pid: null });
        this.notify();
        startTutorialTracking();
      } else if (step === 10) {
        // Modal de WhatsApp aberto, usuário clica no botão de fechar para concluir o tour
        this.orderModalOpen = true;
        this.notify();
        startTutorialTracking();
      }
    }

    subscribe(fn) {
      this.listeners.push(fn);
    }

    notify() {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.warn('Erro ao salvar no localStorage:', e);
      }
      this.listeners.forEach(fn => fn());
    }

    mut(fn, msg, undo) {
      const prev = JSON.parse(JSON.stringify(this.data));
      fn(this.data);
      if (msg) {
        this.setToast(msg, undo ? prev : null);
      }
      this.notify();
    }

    setToast(msg, undoData) {
      clearTimeout(this.toastTimer);
      this.toast = { msg, undo: undoData };
      this.toastTimer = setTimeout(() => {
        this.toast = null;
        this.notify();
      }, 5000);
    }

    undo() {
      if (this.toast && this.toast.undo) {
        this.data = this.toast.undo;
        this.toast = null;
        this.notify();
      }
    }

    setPhone(props) {
      if (props.pid && (!props.sel || !props.sel.g || !Object.keys(props.sel.g).length)) {
        const p = this.data.products.find(x => x.id === props.pid);
        const selG = (props.sel && props.sel.g) ? { ...props.sel.g } : {};
        if (p) {
          p.groupIds.forEach(gid => {
            const g = this.data.groups.find(x => x.id === gid);
            if (g && g.min > 0 && g.options.length && (!selG[gid] || !selG[gid].length)) {
              const pref = g.options.find(o => o.name.toLowerCase().includes('ponto')) || g.options[0];
              selG[gid] = [pref.id];
            }
          });
        }
        props = { ...props, sel: { v: (props.sel && props.sel.v) || (p && p.type === 'var' && p.varOpts[0] ? p.varOpts[0].id : null), g: selG } };
      }
      this.ph = { ...this.ph, ...props };
      this.notify();
    }

    phSay(msg) {
      clearTimeout(this.ph.msgTimer);
      this.ph.msg = msg;
      this.notify();
      this.ph.msgTimer = setTimeout(() => {
        this.ph.msg = '';
        this.notify();
      }, 2400);
    }

    addPhoneToCart() {
      const ph = this.ph;
      const data = this.data;
      if (!ph.pid) return;
      const sp = data.products.find(x => x.id === ph.pid);
      if (!sp) return;

      const gList = (sp.groupIds || []).map(gid => data.groups.find(x => x.id === gid)).filter(Boolean);
      const vOk = sp.type === 'var' ? sp.varOpts.find(v => v.id === ph.sel.v) : null;
      const needVar = sp.type === 'var' && !vOk;
      const missReqGroup = gList.find(g => (ph.sel.g[g.id] || []).length < g.min);

      if (needVar) {
        this.phSay('Escolha o(a) ' + (sp.varName || 'tamanho').toLowerCase());
        return;
      }
      if (missReqGroup) {
        this.phSay('Escolha: ' + missReqGroup.name);
        return;
      }

      const extras = gList.reduce((a, g) => {
        const chosen = ph.sel.g[g.id] || [];
        return a + chosen.reduce((b, oid) => {
          const opt = g.options.find(x => x.id === oid);
          return b + (opt ? opt.price : 0);
        }, 0);
      }, 0);

      const basePrice = sp.type === 'var' ? (vOk ? vOk.price : 0) : sp.price;
      const sheetTotal = (basePrice + extras) * ph.qty;

      const detailOpts = [
        vOk ? vOk.name : null,
        ...gList.flatMap(g => (ph.sel.g[g.id] || []).map(oid => {
          const opt = g.options.find(x => x.id === oid);
          return opt ? opt.name : '';
        }))
      ].filter(Boolean).join(', ');

      this.setPhone({
        pid: null,
        view: 'cart',
        cart: this.ph.cart.concat({
          id: uid(),
          name: sp.name,
          detail: detailOpts || 'Sem adicionais',
          qty: ph.qty,
          total: sheetTotal,
          unitPrice: sheetTotal / ph.qty,
          img: sp.img || 'assets/detroid_combo.png'
        })
      });

      this.phSay('Adicionado ao carrinho!');
      if (this.tutorialStep === 8) {
        this.tutorialStep = 9;
        this.notify();
        startTutorialTracking();
      }
    }

    addPecaTambem(key) {
      const itemsMap = {
        maionese: { name: 'Maionese extra', detail: 'Porção artesanal 50g', price: 5.00, img: 'assets/peca_maionese.png' },
        sorvete: { name: 'Sorvete no pote', detail: 'Pote 200ml chocolate belga', price: 25.00, img: 'assets/peca_sorvete.png' },
        coca: { name: 'Coca Zero', detail: 'Lata 350ml bem gelada', price: 5.00, img: 'assets/peca_coca.png' },
        batata: { name: 'Batata crocante', detail: 'Porção individual 120g', price: 15.00, img: 'assets/detroid_combo.png' }
      };
      const def = itemsMap[key];
      if (!def) return;

      const existing = this.ph.cart.find(x => x.name === def.name);
      if (existing) {
        existing.qty += 1;
        existing.total = existing.qty * def.price;
      } else {
        this.ph.cart.push({
          id: uid(),
          name: def.name,
          detail: def.detail,
          qty: 1,
          total: def.price,
          unitPrice: def.price,
          img: def.img
        });
      }
      this.phSay(def.name + ' adicionado!');
      this.notify();
    }

    changeCartItemQty(id, delta) {
      const item = this.ph.cart.find(x => x.id === id);
      if (!item) return;
      const unit = item.unitPrice || (item.total / item.qty) || item.price || 0;
      if (delta < 0 && item.qty <= 1) {
        this.ph.cart = this.ph.cart.filter(x => x.id !== id);
        this.phSay('Item removido do carrinho');
      } else {
        item.qty += delta;
        item.unitPrice = unit;
        item.total = item.qty * unit;
      }
      this.notify();
    }

    clearPhoneCart() {
      this.ph.cart = [];
      this.ph.coupon = '';
      this.ph.discountVal = 0;
      this.phSay('Carrinho limpo');
      this.notify();
    }

    applyPhoneCoupon() {
      const inp = document.getElementById('ph-coupon-input');
      const val = (inp && inp.value ? inp.value.trim() : (this.ph.couponCode || 'PRIMEIRACOMPRA')).toUpperCase();
      this.ph.coupon = val || 'PROMO10';
      this.ph.discountVal = 5.00;
      this.phSay('Cupom aplicado: -R$ 5,00!');
      this.notify();
    }

    removePhoneCoupon() {
      this.ph.coupon = '';
      this.ph.discountVal = 0;
      this.phSay('Cupom removido');
      this.notify();
    }

    finishTourFromModal() {
      this.orderModalOpen = false;
      this.tutorialStep = null;
      this.setPhone({ cart: [], view: 'home', pid: null });
      this.notify();
      this.setToast('🎉 Parabéns! Você concluiu o tour guiado completo do Me Pede Aí!');
      updateTutorialSpotlight();
    }

    checkoutPhone() {
      if (!this.ph.cart.length) {
        this.phSay('Adicione itens ao carrinho');
        return;
      }
      if (!this.data.store.open) {
        this.phSay('A loja está fechada no momento');
        return;
      }
      const cartSub = this.ph.cart.reduce((a, c) => a + c.total, 0);
      if (this.tutorialStep === 9) {
        this.orderModalOpen = true;
        this.tutorialStep = 10;
        this.notify();
        startTutorialTracking();
        return;
      }
      if (cartSub < (this.data.store.min || 0)) {
        this.phSay('Pedido mínimo de ' + money(this.data.store.min));
        return;
      }
      this.orderModalOpen = true;
      this.notify();
    }

    curMenu() {
      const m = this.data.menus.find(x => x.id === this.menuId);
      return m || this.data.menus[0] || null;
    }

    curMenuId() {
      const m = this.curMenu();
      return m ? m.id : null;
    }

    catStatus(c) {
      if (!c.active) return { live: false, label: 'Oculta', bg: '#F1F2F5', fg: '#6B7280', dot: '#B8BEC9' };
      if (c.avail !== 'schedule') return { live: true, label: 'Ativa agora', bg: '#E8F7EE', fg: '#12A150', dot: '#12A150' };
      const now = new Date();
      const d = now.getDay();
      const m = now.getHours() * 60 + now.getMinutes();
      const s = toM(c.start);
      const e = toM(c.end);
      const inWin = e > s ? (m >= s && m < e) : (m >= s || m < e);
      if (c.days.includes(d) && inWin) {
        return { live: true, label: 'Ativa agora · até ' + c.end, bg: '#E8F7EE', fg: '#12A150', dot: '#12A150' };
      }
      for (let i = 0; i < 8; i++) {
        const dd = (d + i) % 7;
        if (c.days.includes(dd) && (i > 0 || m < s)) {
          return {
            live: false,
            label: 'Abre ' + (i === 0 ? 'hoje' : i === 1 ? 'amanhã' : DAYS[dd]) + ' às ' + c.start,
            bg: '#FFF4E0',
            fg: '#B45309',
            dot: '#F59E0B'
          };
        }
      }
      return { live: false, label: 'Sem dias definidos', bg: '#FFF4E0', fg: '#B45309', dot: '#F59E0B' };
    }

    schedText(c) {
      if (c.avail !== 'schedule') return 'Sempre disponível';
      const ds = DAY_ORDER.filter(d => c.days.includes(d)).map(d => DAYS[d]);
      return (ds.length === 7 ? 'Todos os dias' : ds.join(', ')) + ' · ' + c.start + ' às ' + c.end;
    }

    // Ações de Produtos
    openProduct(p, catIds) {
      const row = () => ({ id: uid(), name: '', priceStr: '' });
      const d = p
        ? {
            id: p.id,
            name: p.name,
            desc: p.desc,
            img: p.img,
            badge: p.badge,
            serves: p.serves || '',
            catIds: p.catIds.slice(),
            type: p.type,
            priceStr: ms(p.price),
            origStr: ms(p.orig),
            varName: p.varName || 'Tamanho',
            varOpts: p.varOpts.length ? p.varOpts.map(o => ({ id: o.id, name: o.name, priceStr: ms(o.price) })) : [row(), row()],
            groupIds: p.groupIds.slice(),
            active: p.active
          }
        : {
            id: null,
            name: '',
            desc: '',
            img: '',
            badge: '',
            serves: '1 pessoa',
            catIds: catIds || (this.selCat !== 'all' ? [this.selCat] : []),
            type: 'simple',
            priceStr: '',
            origStr: '',
            varName: 'Tamanho',
            varOpts: [row(), row()],
            groupIds: [],
            active: true
          };
      d.libOpen = false;
      d.ng = null;
      d.tried = false;
      this.drawer = 'product';
      this.draft = d;
      this.menuFor = null;
      this.qrOpen = false;
      this.ph.view = 'home';
      this.ph.sel = { v: null, g: {} };
      this.ph.qty = 1;
      this.notify();
    }

    missingFields(d) {
      const m = [];
      if (!d.name.trim()) m.push('nome');
      if (!d.catIds.length) m.push('categoria');
      if (d.type === 'simple') {
        if (pm(d.priceStr) <= 0) m.push('preço de venda');
      } else {
        const ok = d.varOpts.filter(o => o.name.trim() && pm(o.priceStr) > 0);
        if (!ok.length) m.push('ao menos 1 opção com preço');
      }
      return m;
    }

    saveProduct(again) {
      const d = this.draft;
      const miss = this.missingFields(d);
      if (miss.length) {
        d.tried = true;
        this.notify();
        return;
      }
      const price = d.type === 'simple' ? pm(d.priceStr) : 0;
      const orig = pm(d.origStr);
      const p = {
        id: d.id || uid(),
        name: d.name.trim(),
        desc: d.desc.trim(),
        img: d.img,
        badge: d.badge,
        serves: d.serves,
        catIds: d.catIds,
        type: d.type,
        price,
        orig: d.type === 'simple' && orig > price ? orig : 0,
        varName: d.varName.trim() || 'Tamanho',
        varOpts: d.type === 'var'
          ? d.varOpts.filter(o => o.name.trim() && pm(o.priceStr) > 0).map(o => ({ id: o.id, name: o.name.trim(), price: pm(o.priceStr) }))
          : [],
        groupIds: d.groupIds,
        active: d.active
      };
      const isNew = !d.id;
      this.mut(data => {
        const i = data.products.findIndex(x => x.id === p.id);
        if (i > -1) data.products[i] = p;
        else data.products.push(p);
      }, isNew ? '“' + p.name + '” cadastrado com sucesso' : 'Alterações salvas');

      if (again) {
        this.openProduct(null, d.catIds.slice());
      } else {
        this.closeDrawer();
      }
    }

    deleteProduct(id) {
      const p = this.data.products.find(x => x.id === id);
      this.mut(data => {
        data.products = data.products.filter(x => x.id !== id);
      }, '“' + (p ? p.name : 'Produto') + '” excluído', true);
      this.menuFor = null;
      this.closeDrawer();
    }

    dupProduct(id) {
      this.mut(data => {
        const i = data.products.findIndex(x => x.id === id);
        if (i < 0) return;
        const c = JSON.parse(JSON.stringify(data.products[i]));
        c.id = uid();
        c.name = c.name + ' (cópia)';
        data.products.splice(i + 1, 0, c);
      }, 'Produto duplicado', true);
      this.menuFor = null;
    }

    closeDrawer() {
      this.drawer = null;
      this.draft = null;
      this.cd = null;
      this.gd = null;
      this.pick = null;
      this.md = null;
      this.ph.pid = null;
      this.ph.sel = { v: null, g: {} };
      this.ph.qty = 1;
      this.notify();
    }

    // Ações de Categorias
    createCat(name) {
      name = (name || '').trim();
      if (!name) return;
      const id = uid();
      const menuId = this.curMenuId();
      this.mut(data => {
        data.categories.push({
          id,
          name,
          menuId,
          active: true,
          avail: 'always',
          days: ALL_DAYS.slice(),
          start: '17:00',
          end: '23:30'
        });
      }, 'Categoria “' + name + '” criada!', true);
      this.selCat = id;
      this.newCatOpen = false;
      this.newCatName = '';
      this.search = '';
      this.ph.cat = id;
      this.notify();
    }

    openCat(c) {
      this.drawer = 'category';
      this.cd = {
        id: c.id,
        name: c.name,
        active: c.active,
        avail: c.avail,
        days: c.days.slice(),
        start: c.start,
        end: c.end,
        confirm: false
      };
      this.ph.cat = c.id;
      this.notify();
    }

    saveCat() {
      const cd = this.cd;
      if (!cd || !cd.name.trim()) return;
      this.mut(data => {
        const c = data.categories.find(x => x.id === cd.id);
        if (c) {
          Object.assign(c, {
            name: cd.name.trim(),
            active: cd.active,
            avail: cd.avail,
            days: cd.days,
            start: cd.start,
            end: cd.end
          });
        }
      }, 'Categoria salva');
      this.closeDrawer();
    }

    deleteCat() {
      const cd = this.cd;
      if (!cd) return;
      this.mut(data => {
        data.categories = data.categories.filter(x => x.id !== cd.id);
        data.products.forEach(p => {
          p.catIds = p.catIds.filter(c => c !== cd.id);
        });
      }, 'Categoria “' + cd.name + '” excluída', true);
      this.selCat = 'all';
      this.closeDrawer();
    }

    moveCat(id, dir) {
      this.mut(data => {
        const c = data.categories.find(x => x.id === id);
        if (!c) return;
        const idx = data.categories.map((x, i) => (x.menuId === c.menuId ? i : -1)).filter(i => i > -1);
        const k = idx.indexOf(data.categories.indexOf(c));
        const j = idx[k + dir];
        if (j == null) return;
        const i = idx[k];
        const t = data.categories[i];
        data.categories[i] = data.categories[j];
        data.categories[j] = t;
      });
    }

    // Ações de Cardápios
    selectMenu(id) {
      this.menuId = id;
      this.selCat = 'all';
      this.search = '';
      this.ph.cat = null;
      this.ph.pid = null;
      this.notify();
    }

    openMenu(m) {
      const base = { active: true, avail: 'always', days: ALL_DAYS.slice(), start: '17:00', end: '23:30' };
      this.drawer = 'menu';
      this.md = m
        ? { id: m.id, name: m.name, active: m.active, avail: m.avail, days: m.days.slice(), start: m.start, end: m.end, confirm: false }
        : { id: null, name: this.data.menus.length ? '' : 'Cardápio Principal', ...base, copy: '', confirm: false };
      this.notify();
    }

    saveMenu() {
      const md = this.md;
      if (!md || !md.name.trim()) return;
      const id = md.id || uid();
      this.mut(data => {
        const f = {
          name: md.name.trim(),
          active: md.active,
          avail: md.avail,
          days: md.days,
          start: md.start,
          end: md.end
        };
        const m = data.menus.find(x => x.id === id);
        if (m) {
          Object.assign(m, f);
          return;
        }
        data.menus.push({ id, ...f });
        if (md.copy) {
          data.categories
            .filter(c => c.menuId === md.copy)
            .forEach(c => {
              const nid = uid();
              data.categories.push({ ...c, id: nid, menuId: id, days: c.days.slice() });
              data.products.forEach(p => {
                if (p.catIds.includes(c.id)) p.catIds.push(nid);
              });
            });
        }
      }, md.id ? 'Cardápio salvo' : 'Cardápio “' + md.name.trim() + '” criado!', !md.id);
      this.closeDrawer();
      if (!md.id) this.selectMenu(id);
    }

    deleteMenu() {
      const md = this.md;
      if (!md || this.data.menus.length < 2) return;
      this.mut(data => {
        const ids = data.categories.filter(c => c.menuId === md.id).map(c => c.id);
        data.menus = data.menus.filter(m => m.id !== md.id);
        data.categories = data.categories.filter(c => c.menuId !== md.id);
        data.products.forEach(p => {
          p.catIds = p.catIds.filter(c => !ids.includes(c));
        });
      }, 'Cardápio “' + md.name + '” excluído', true);
      this.closeDrawer();
      this.menuId = this.data.menus[0].id;
      this.selCat = 'all';
    }

    // Ações de Grupos
    openGroup(g) {
      const row = o => ({ id: o ? o.id : uid(), name: o ? o.name : '', desc: o ? o.desc : '', img: o ? o.img : '', priceStr: o ? ms(o.price) : '' });
      this.drawer = 'group';
      this.gd = g
        ? { id: g.id, name: g.name, min: g.min, max: g.max, rows: g.options.map(row) }
        : { id: null, name: '', min: 0, max: 1, rows: [row(), row()] };
      this.notify();
    }

    saveGroup() {
      const gd = this.gd;
      if (!gd) return;
      const rows = gd.rows.filter(r => r.name.trim());
      if (!gd.name.trim() || !rows.length) return;
      const g = {
        id: gd.id || uid(),
        name: gd.name.trim(),
        min: gd.min,
        max: Math.max(gd.max, gd.min, 1),
        options: rows.map(r => ({
          id: r.id,
          name: r.name.trim(),
          desc: r.desc.trim(),
          img: r.img,
          price: pm(r.priceStr)
        }))
      };
      this.mut(data => {
        const i = data.groups.findIndex(x => x.id === g.id);
        if (i > -1) data.groups[i] = g;
        else data.groups.push(g);
      }, gd.id ? 'Grupo atualizado' : 'Grupo criado');
      this.closeDrawer();
    }

    deleteGroup() {
      const gd = this.gd;
      if (!gd) return;
      this.mut(data => {
        data.groups = data.groups.filter(x => x.id !== gd.id);
        data.products.forEach(p => {
          p.groupIds = p.groupIds.filter(g => g !== gd.id);
        });
      }, 'Grupo excluído', true);
      this.closeDrawer();
    }

    runChecklistStep(stepIndex) {
      const data = this.data;
      const curMid = this.curMenuId();
      const mCats = data.categories.filter(c => c.menuId === curMid);
      const mCatIds = mCats.map(c => c.id);
      const mProds = data.products.filter(p => !p.catIds.length || p.catIds.some(c => mCatIds.includes(c)));
      const noPhotoProds = mProds.filter(p => !p.img);
      const curMenu = this.curMenu();

      if (stepIndex === 0) {
        this.tab = 'menu';
        this.newCatOpen = true;
        this.selCat = 'all';
        this.notify();
      } else if (stepIndex === 1) {
        this.tab = 'menu';
        const catId = this.selCat !== 'all' ? this.selCat : (mCats[0] ? mCats[0].id : null);
        this.openProduct(null, catId ? [catId] : []);
      } else if (stepIndex === 2) {
        if (noPhotoProds[0]) this.openProduct(noPhotoProds[0]);
      } else if (stepIndex === 3) {
        this.mut(d => {
          d.store.open = true;
          const x = d.menus.find(y => y.id === curMid);
          if (x) x.active = true;
        }, '“' + (curMenu ? curMenu.name : 'Cardápio') + '” no ar!');
      }
    }
  }

  // Instância Global
  const store = new Store();
  window.__mepedeStore = store;
  window.store = store;

  // Renderizador da Interface
  function render() {
    const activeEl = document.activeElement;
    const activeId = activeEl && activeEl.id ? activeEl.id : null;
    const selStart = (activeEl && typeof activeEl.selectionStart === 'number') ? activeEl.selectionStart : null;
    const selEnd = (activeEl && typeof activeEl.selectionEnd === 'number') ? activeEl.selectionEnd : null;

    const root = document.getElementById('app');
    const modalRoot = document.getElementById('modal-root');
    const S = store;
    const data = S.data;
    const curMenu = S.curMenu();
    const curMid = S.curMenuId();

    const mCats = data.categories.filter(c => c.menuId === curMid);
    const mCatIds = mCats.map(c => c.id);
    const mProds = data.products.filter(p => !p.catIds.length || p.catIds.some(c => mCatIds.includes(c)));

    const liveMenu = data.menus.find(m => S.catStatus(m).live);
    const isEditingLive = liveMenu && liveMenu.id === curMid;

    // Checklist
    const noPhotoProds = mProds.filter(p => !p.img);
    const steps = [
      { label: 'Criar uma categoria', done: mCats.length > 0, act: () => { S.tab = 'menu'; S.newCatOpen = true; S.selCat = 'all'; S.notify(); } },
      { label: 'Cadastrar um produto', done: mProds.length > 0, act: () => { S.tab = 'menu'; S.openProduct(null, S.selCat !== 'all' ? [S.selCat] : (mCats[0] ? [mCats[0].id] : [])); } },
      { label: mProds.length && noPhotoProds.length ? 'Pôr foto em ' + noPhotoProds.length + (noPhotoProds.length > 1 ? ' produtos' : ' produto') : 'Pôr fotos nos produtos', done: mProds.length > 0 && !noPhotoProds.length, act: () => { if (noPhotoProds[0]) S.openProduct(noPhotoProds[0]); } },
      { label: 'Colocar no ar', done: !!(curMenu && data.store.open && curMenu.active), act: () => { S.mut(d => { d.store.open = true; const x = d.menus.find(y => y.id === curMid); if (x) x.active = true; }, '“' + (curMenu ? curMenu.name : 'Cardápio') + '” no ar!'); } }
    ];
    for (let i = 1; i < steps.length; i++) {
      if (!steps[i - 1].done) steps[i].done = false;
    }
    const checkDone = steps.filter(s => s.done).length;
    const nextIdx = steps.findIndex(s => !s.done);
    const showChecklist = curMenu && !S.hideCheck[curMid] && checkDone < 4;

    // URL da loja
    const storeUrl = 'https://mepede.ai/' + (data.store.slug || '');

    // HTML da Sidebar
    const storeStatusBg = data.store.open ? '#E8F7EE' : '#FDECEB';
    const storeStatusBorder = data.store.open ? '#C6EBD4' : '#F8C9C5';
    const storeStatusFg = data.store.open ? '#12A150' : '#E5352B';
    const storeKnobLeft = data.store.open ? '19px' : '3px';
    const storeSwitchBg = data.store.open ? '#FF6100' : '#D5D9E0';

    const sidebarHtml = `
      <aside class="sidebar">
        <div class="brand" style="padding: 0 4px; margin-bottom: 4px;">
          <img src="assets/logo.png" alt="mepede.ai" style="height: 28px; max-width: 160px; object-fit: contain; display: block;">
        </div>

        <div class="store-status-card" style="background:${storeStatusBg}; border:1px solid ${storeStatusBorder}">
          <div style="flex:1; min-width:0">
            <div style="font-size:14px; font-weight:600; color:${storeStatusFg}">${data.store.open ? 'Loja aberta' : 'Loja fechada'}</div>
            <div style="font-size:12px; color:var(--gray-500)">${data.store.open ? 'Recebendo pedidos' : 'Clientes só visualizam'}</div>
          </div>
          <div id="tut-store-toggle" class="toggle-switch" style="background:${storeSwitchBg}" onclick="window.__mepedeStore.mut(d => { d.store.open = !d.store.open; }, '${data.store.open ? 'Loja fechada' : 'Loja aberta'}'); if(window.__mepedeStore.tutorialStep === 1) window.__mepedeStore.nextTutorial();">
            <div class="toggle-knob" style="left:${storeKnobLeft}"></div>
          </div>
        </div>

        <div class="menu-label">MENU</div>
        <div style="display:flex; flex-direction:column; gap:4px">
          <div class="nav-item ${S.tab === 'menu' ? 'active' : ''}" onclick="window.__mepedeStore.tab='menu'; window.__mepedeStore.notify()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4Z"></path><path d="M8 9h8M8 13h6"></path></svg>
            <span style="flex:1">Cardápio</span>
            <span class="nav-badge">${data.products.length}</span>
          </div>
          <div class="nav-item ${S.tab === 'groups' ? 'active' : ''}" onclick="window.__mepedeStore.tab='groups'; window.__mepedeStore.notify()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 9 5-9 5-9-5Z"></path><path d="m3 13 9 5 9-5"></path></svg>
            <span style="flex:1">Complementos</span>
            <span class="nav-badge">${data.groups.length}</span>
          </div>
          <div class="nav-item ${S.tab === 'settings' ? 'active' : ''}" onclick="window.__mepedeStore.tab='settings'; window.__mepedeStore.notify()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"></path><circle cx="16" cy="6" r="2"></circle><circle cx="10" cy="12" r="2"></circle><circle cx="18" cy="18" r="2"></circle></svg>
            <span style="flex:1">Loja e link</span>
          </div>
        </div>

        <div style="flex:1"></div>

        <div class="user-profile">
          <div class="user-avatar">EH</div>
          <div style="min-width:0">
            <div style="font-size:13px; font-weight:600">Enzo Hirrata</div>
            <div style="font-size:11px; color:var(--gray-400); overflow:hidden; text-overflow:ellipsis">enzohirrata@gmail.com</div>
          </div>
        </div>
      </aside>
    `;

    // Header Principal
    const pageKicker = S.tab === 'menu' ? (data.menus.length > 1 ? data.menus.length + ' cardápios · editando este' : data.menus.length === 1 ? 'Categorias e produtos' : 'Início') : S.tab === 'groups' ? 'Biblioteca de grupos' : 'Configurações do cardápio';
    const pageTitle = S.tab === 'menu' ? (curMenu ? curMenu.name : 'Cardápios') : S.tab === 'groups' ? 'Complementos' : 'Loja e link';

    const headerHtml = `
      <header class="top-header">
        <div style="flex:1; min-width:200px">
          <div style="font-size:12px; color:var(--gray-400)">${pageKicker}</div>
          <div style="font-size:22px; font-weight:600; letter-spacing:-0.3px">${pageTitle}</div>
        </div>
        <div style="display:flex; align-items:center; gap:8px; flex:none">
          <button class="btn-outline" style="background:#FFF6F0; border-color:#FFB98C; color:#E85700; font-weight:600; display:flex; align-items:center; gap:6px" onclick="window.__mepedeStore.startTutorial(true)" title="Iniciar tour guiado">
            <span>🎓</span> Tour Guiado
          </button>
          <button class="btn-outline" style="font-size:12px; padding:0 10px; color:var(--gray-500)" onclick="window.__mepedeStore.loadSeedData()" title="Carregar cardápio de exemplo completo">
            <span>⚡ Demo</span>
          </button>
          <button class="btn-link-copy" onclick="navigator.clipboard.writeText('${storeUrl}'); window.__mepedeStore.setToast('Link copiado para a área de transferência!')">
            <span>mepede.ai/${data.store.slug || ''}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="12" height="12" rx="2"></rect><path d="M5 15V5a2 2 0 0 1 2-2h10"></path></svg>
          </button>
          <button class="btn-dark" onclick="window.__mepedeStore.qrOpen = true; window.__mepedeStore.notify()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><path d="M14 14h3v3h-3zM17 20h4v-3"></path></svg>
            QR Code
          </button>
          <button class="btn-whatsapp" onclick="window.open('https://wa.me/?text=' + encodeURIComponent('Confira nosso cardápio: ${storeUrl}'), '_blank')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.4A8.5 8.5 0 1 1 21 12Z"></path></svg>
            WhatsApp
          </button>
        </div>
      </header>
    `;

    // Conteúdo da Aba Cardápio
    let bodyHtml = '';

    if (S.tab === 'menu') {
      // Cards de Cardápios
      const menuCardsHtml = data.menus.length ? data.menus.map(m => {
        const isCur = m.id === curMid;
        const st = S.catStatus(m);
        const cats = data.categories.filter(c => c.menuId === m.id);
        const prods = data.products.filter(p => p.catIds.some(c => cats.some(x => x.id === c)));
        const thumb = prods.find(p => p.img);
        const isLive = liveMenu && liveMenu.id === m.id;
        const statusLabel = !m.active ? 'Desligado' : isLive ? 'No ar agora' : st.live ? 'No horário · outro cardápio ativo' : st.label;
        const statusColor = !m.active ? '#6B7280' : isLive ? '#12A150' : '#B45309';

        return `
          <div class="menu-card ${isCur ? 'active' : ''}" onclick="window.__mepedeStore.selectMenu('${m.id}')">
            <div class="menu-thumb" style="opacity:${m.active ? '1' : '0.5'}">
              ${thumb ? `<img src="${thumb.img}" alt="">` : `<span>${m.name[0] || 'C'}</span>`}
            </div>
            <div style="flex:1; min-width:0; display:flex; flex-direction:column; gap:2px">
              <div style="display:flex; align-items:center; gap:6px">
                <span style="font-size:14px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${m.name}</span>
                ${isCur ? `<span style="font-size:10px; font-weight:600; color:#fff; background:#14171F; border-radius:6px; padding:1px 6px">EDITANDO</span>` : ''}
              </div>
              <div style="display:flex; align-items:center; gap:5px; font-size:12px; font-weight:500; color:${statusColor}">
                <span style="width:6px; height:6px; border-radius:3px; background:${statusColor}; flex:none"></span>
                <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${statusLabel}</span>
              </div>
              <div style="font-size:11px; color:var(--gray-400); overflow:hidden; text-overflow:ellipsis; white-space:nowrap">
                ${S.schedText(m)} · ${cats.length} ${cats.length === 1 ? 'cat.' : 'cats.'}
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:4px; flex:none" onclick="event.stopPropagation()">
              <div onclick="window.__mepedeStore.openMenu(window.__mepedeStore.data.menus.find(x => x.id === '${m.id}'))" title="Editar nome e horários" style="width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--gray-500); cursor:pointer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>
              </div>
              <div class="toggle-switch" style="width:38px; height:22px; background:${m.active ? '#FF6100' : '#D5D9E0'}" onclick="window.__mepedeStore.mut(d => { const x = d.menus.find(y => y.id === '${m.id}'); if(x) x.active = !x.active; }, '${m.active ? '“' + m.name + '” desligado' : '“' + m.name + '” ligado'}')">
                <div class="toggle-knob" style="width:18px; height:18px; top:2px; left:${m.active ? '17px' : '3px'}"></div>
              </div>
            </div>
          </div>
        `;
      }).join('') : `
        <div style="grid-column: 1 / -1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:32px 20px; background:#FAFAFA; border:2px dashed #ECEEF2; border-radius:16px; text-align:center">
          <div style="width:48px; height:48px; border-radius:24px; background:var(--orange-subtle); color:var(--orange); display:flex; align-items:center; justify-content:center; margin-bottom:10px">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>
          </div>
          <div style="font-size:15px; font-weight:700; color:var(--dark)">Comece criando seu cardápio</div>
          <div style="font-size:13px; color:var(--gray-500); margin-top:4px; max-width:360px">Defina horários e monte as categorias e produtos da sua loja.</div>
          <button id="tut-btn-new-menu" class="btn-orange" style="margin-top:16px; padding:0 22px; height:40px; font-weight:600" onclick="window.__mepedeStore.openMenu(null); if(window.__mepedeStore.tutorialStep === 1) window.__mepedeStore.nextTutorial();">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>
            Criar cardápio
          </button>
        </div>
      `;

      // Barra de Cardápio Ativo
      const liveBarText = data.menus.length > 1
        ? (liveMenu ? `<span style="display:inline-flex; align-items:center; gap:6px; height:24px; padding:0 10px; border-radius:12px; background:#E8F7EE; color:#12A150; font-size:12px; font-weight:500"><span style="width:6px; height:6px; border-radius:3px; background:#12A150"></span>Agora o cliente vê: ${liveMenu.name}</span>` : `<span style="display:inline-flex; align-items:center; gap:6px; height:24px; padding:0 10px; border-radius:12px; background:#FFF4E0; color:#B45309; font-size:12px; font-weight:500"><span style="width:6px; height:6px; border-radius:3px; background:#B45309"></span>Nenhum cardápio no horário agora</span>`)
        : '';

      // Checklist HTML
      let checklistHtml = '';
      if (showChecklist) {
        const stepItems = steps.map((s, i) => {
          const isCurStep = i === nextIdx;
          const bg = s.done ? '#E8F7EE' : isCurStep ? '#FF6100' : '#F1F2F5';
          const fg = s.done ? '#12A150' : isCurStep ? '#fff' : '#8A91A0';
          const markBg = s.done ? '#12A150' : isCurStep ? '#fff' : '#C9CED8';
          const markFg = isCurStep ? '#FF6100' : '#fff';
          const mark = s.done ? '✓' : String(i + 1);

          return `
            <div ${i === 1 ? 'id="tut-checklist-prod"' : ''} class="check-step" style="background:${bg}; color:${fg}; cursor:pointer" onclick="window.__mepedeStore.runChecklistStep(${i}); if(window.__mepedeStore.tutorialStep === 4 && ${i === 1}) window.__mepedeStore.nextTutorial();">
              <span class="check-step-mark" style="background:${markBg}; color:${markFg}">${mark}</span>
              ${s.label} ${isCurStep ? '→' : ''}
            </div>
          `;
        }).join('');

        checklistHtml = `
          <div class="checklist-bar">
            <div style="min-width:180px">
              <div style="font-size:15px; font-weight:600">“${curMenu ? curMenu.name : 'Cardápio'}” está quase pronto</div>
              <div style="font-size:12px; color:var(--gray-400); margin-top:2px">Passo ${nextIdx + 1} de 4 · ${steps[nextIdx] ? steps[nextIdx].label : ''}</div>
            </div>
            <div style="flex:1; display:flex; gap:8px; flex-wrap:wrap">
              ${stepItems}
            </div>
            <div style="cursor:pointer; color:var(--gray-400); padding:6px" title="Ocultar checklist" onclick="window.__mepedeStore.hideCheck['${curMid}'] = true; window.__mepedeStore.notify()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>
            </div>
          </div>
        `;
      }

      // Chips de Categorias
      const allCount = mProds.length;
      const chipsHtml = mCats.map(c => {
        const isActive = S.selCat === c.id;
        const cnt = data.products.filter(p => p.catIds.includes(c.id)).length;
        const st = S.catStatus(c);
        return `
          <div class="chip ${isActive ? 'active' : ''}" onclick="window.__mepedeStore.selCat = '${c.id}'; window.__mepedeStore.ph.cat = '${c.id}'; window.__mepedeStore.notify()">
            <span class="chip-dot" style="background:${st.dot}"></span>
            <span>${c.name}</span>
            <span class="chip-count">${cnt}</span>
          </div>
        `;
      }).join('');

      // Input de Nova Categoria Inline
      const newCatInputHtml = S.newCatOpen
        ? `
          <div style="display:flex; align-items:center; gap:6px; height:40px; padding:0 6px 0 12px; border-radius:12px; border:1px solid #FF6100; background:#fff; box-shadow:0 0 0 3px #FFE2CF">
            <input id="input-new-cat" value="${S.newCatName}" placeholder="Nome e Enter" style="width:150px; border:none; outline:none; font-size:14px; background:transparent" onkeydown="if(event.key==='Enter'){ window.__mepedeStore.createCat(this.value); } if(event.key==='Escape'){ window.__mepedeStore.newCatOpen=false; window.__mepedeStore.notify(); }">
            <button class="btn-orange" style="height:28px; padding:0 10px; font-size:12px" onclick="window.__mepedeStore.createCat(document.getElementById('input-new-cat').value)">Criar</button>
            <div style="cursor:pointer; color:var(--gray-400); display:flex; padding:4px" onclick="window.__mepedeStore.newCatOpen=false; window.__mepedeStore.notify()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>
            </div>
          </div>
        `
        : `
          <button id="tut-btn-new-cat" class="btn-new-cat-dashed" onclick="window.__mepedeStore.newCatOpen=true; window.__mepedeStore.notify(); setTimeout(() => { const el = document.getElementById('input-new-cat'); if(el) el.focus(); }, 50);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>
            Nova categoria
          </button>
        `;

      // Sugestões de categorias rápidas caso não tenha categorias
      let emptyCatsBanner = '';
      if (curMenu && !mCats.length) {
        const quickSugg = ['Lanches', 'Bebidas', 'Porções', 'Combos', 'Sobremesas', 'Açaí'].map(s => {
          const isLanches = s === 'Lanches';
          return `
            <div ${isLanches ? 'id="tut-quick-cat-lanches"' : ''} onclick="window.__mepedeStore.createCat('${s}'); if(window.__mepedeStore.tutorialStep === 3) window.__mepedeStore.nextTutorial();" class="btn-new-cat-dashed" style="padding:0 18px; border-radius:20px; font-weight:600; cursor:pointer; ${isLanches ? 'border-color:#FF6100; color:#FF6100; background:#FFF1E8;' : ''}">+ ${s}</div>
          `;
        }).join('');

        emptyCatsBanner = `
          <div style="background:#fff; border:1px solid var(--gray-100); border-radius:20px; padding:48px 40px; text-align:center; margin-top:20px">
            <div style="width:56px; height:56px; border-radius:16px; background:#FFF1E8; color:#FF6100; display:flex; align-items:center; justify-content:center; margin:0 auto">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4Z"></path><path d="M8 9h8M8 13h6"></path></svg>
            </div>
            <div style="font-size:22px; font-weight:600; margin-top:16px">Vamos montar seu cardápio</div>
            <div style="font-size:14px; color:var(--gray-500); margin-top:6px">Comece pelas categorias — são as abas que o cliente vê no celular.</div>
            <div style="font-size:12px; color:var(--gray-400); margin-top:24px">Crie com um clique:</div>
            <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-top:12px">
              ${quickSugg}
            </div>
          </div>
        `;
      }

      // Filtragem dos Produtos
      const curCatObj = S.selCat !== 'all' ? data.categories.find(c => c.id === S.selCat) : null;
      let prodList = curCatObj ? data.products.filter(p => p.catIds.includes(curCatObj.id)) : mProds;
      const q = S.search.trim().toLowerCase();
      if (q) {
        prodList = prodList.filter(p => (p.name + ' ' + p.desc).toLowerCase().includes(q));
      }

      // Cabeçalho dos produtos
      const catHeadTitle = curCatObj ? curCatObj.name : 'Todos os produtos';
      const catHeadSub = curCatObj
        ? `${prodList.length} ${prodList.length === 1 ? 'produto' : 'produtos'} · ${S.schedText(curCatObj)}`
        : `${mProds.length} produtos neste cardápio · ${mProds.filter(p => p.active).length} visíveis`;

      const catHeadActions = curCatObj
        ? `
          <div style="display:flex; border:1px solid var(--gray-200); border-radius:10px; overflow:hidden">
            <div onclick="window.__mepedeStore.moveCat('${curCatObj.id}', -1)" title="Mover para esquerda" style="width:36px; height:38px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--gray-700)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m15 18-6-6 6-6"></path></svg>
            </div>
            <div onclick="window.__mepedeStore.moveCat('${curCatObj.id}', 1)" title="Mover para direita" style="width:36px; height:38px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--gray-700); border-left:1px solid var(--gray-200)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m9 18 6-6-6-6"></path></svg>
            </div>
          </div>
          <button class="btn-outline" onclick="window.__mepedeStore.openCat(window.__mepedeStore.data.categories.find(c => c.id === '${curCatObj.id}'))">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>
            Nome e horários
          </button>
          <button class="btn-outline" onclick="window.__mepedeStore.drawer = 'pick'; window.__mepedeStore.pick = { q: '', sel: {} }; window.__mepedeStore.notify()">
            Adicionar existente
          </button>
        `
        : '';

      // Grid de Produtos Cards
      const productCardsHtml = prodList.map(p => {
        const disc = discOf(p);
        const metaList = [];
        if (p.type === 'var') metaList.push(p.varOpts.length + ' opções de ' + (p.varName || 'tamanho').toLowerCase());
        if (p.groupIds.length) metaList.push(p.groupIds.length + (p.groupIds.length > 1 ? ' grupos de complementos' : ' grupo de complementos'));
        if (!curCatObj && p.catIds.length) {
          metaList.push(p.catIds.filter(c => mCatIds.includes(c)).map(id => {
            const cc = data.categories.find(x => x.id === id);
            return cc ? cc.name : '';
          }).filter(Boolean).join(', '));
        }

        const isMenuOpen = S.menuFor === p.id;

        return `
          <div class="product-card" onclick="window.__mepedeStore.openProduct(window.__mepedeStore.data.products.find(x => x.id === '${p.id}'))">
            <div class="product-media" style="opacity:${p.active ? '1' : '0.45'}">
              ${p.img
                ? `<img src="${p.img}" alt="${p.name}">`
                : `<div class="product-no-img"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"></path><circle cx="12" cy="13" r="3.5"></circle></svg><span style="font-size:12px; font-weight:500">Adicionar foto</span></div>`
              }
              ${p.badge ? `<div style="position:absolute; top:8px; left:8px; z-index:2">${renderBadgeHtml(p.badge, 'box-shadow:0 2px 6px rgba(0,0,0,0.1)')}</div>` : ''}
            </div>

            <div style="padding:12px 4px 4px; display:flex; flex-direction:column; gap:4px; flex:1">
              <div style="font-size:15px; font-weight:600; line-height:1.3">${p.name}</div>
              <div style="font-size:12px; color:var(--gray-500); line-height:1.45; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; min-height:34px">
                ${p.desc || 'Sem descrição'}
              </div>
              <div style="display:flex; align-items:baseline; gap:8px; margin-top:4px; flex-wrap:wrap">
                <span style="font-size:16px; font-weight:600; color:var(--green)">${priceOf(p)}</span>
                ${disc ? `
                  <span style="font-size:12px; color:var(--gray-400); text-decoration:line-through">${money(p.orig)}</span>
                  <span style="font-size:11px; font-weight:600; color:#fff; background:var(--green); border-radius:8px; padding:1px 6px">${disc}</span>
                ` : ''}
              </div>
              <div style="font-size:12px; color:var(--gray-400); margin-top:2px">${metaList.join(' · ') || 'Sem complementos'}</div>
              ${!p.catIds.length ? `<div style="font-size:12px; color:var(--amber); background:var(--amber-light); border-radius:8px; padding:4px 8px; margin-top:2px">Sem categoria — não aparece no celular</div>` : ''}
            </div>

            <div style="display:flex; align-items:center; gap:8px; padding:10px 4px 2px; border-top:1px solid var(--gray-100); margin-top:8px" onclick="event.stopPropagation()">
              <div style="display:flex; align-items:center; gap:8px; cursor:pointer; flex:1" onclick="window.__mepedeStore.mut(d => { const x = d.products.find(y => y.id === '${p.id}'); if(x) x.active = !x.active; }, '${p.active ? '“' + p.name + '” ocultado' : '“' + p.name + '” visível'}')">
                <div class="toggle-switch" style="width:36px; height:22px; background:${p.active ? '#FF6100' : '#D5D9E0'}">
                  <div class="toggle-knob" style="width:18px; height:18px; top:2px; left:${p.active ? '16px' : '2px'}"></div>
                </div>
                <span style="font-size:12px; color:var(--gray-700)">${p.active ? 'Visível' : 'Oculto'}</span>
              </div>

              <div style="position:relative">
                <div onclick="window.__mepedeStore.menuFor = (window.__mepedeStore.menuFor === '${p.id}' ? null : '${p.id}'); window.__mepedeStore.notify()" style="width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--gray-700); cursor:pointer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"></circle><circle cx="12" cy="12" r="1.6"></circle><circle cx="19" cy="12" r="1.6"></circle></svg>
                </div>

                ${isMenuOpen ? `
                  <div style="position:absolute; right:0; bottom:36px; z-index:30; background:#fff; border:1px solid var(--gray-100); border-radius:12px; box-shadow:0 12px 32px rgba(20,23,31,.18); padding:6px; min-width:190px">
                    <div style="padding:8px 12px; border-radius:8px; font-size:13px; cursor:pointer" onclick="window.__mepedeStore.openProduct(window.__mepedeStore.data.products.find(x => x.id === '${p.id}'))">Editar</div>
                    <div style="padding:8px 12px; border-radius:8px; font-size:13px; cursor:pointer" onclick="window.__mepedeStore.menuFor=null; window.__mepedeStore.setPhone({ pid: '${p.id}', view: 'home', qty: 1, sel: { v: null, g: {} } })">Ver no celular</div>
                    <div style="padding:8px 12px; border-radius:8px; font-size:13px; cursor:pointer" onclick="window.__mepedeStore.dupProduct('${p.id}')">Duplicar produto</div>
                    ${curCatObj ? `<div style="padding:8px 12px; border-radius:8px; font-size:13px; cursor:pointer" onclick="window.__mepedeStore.mut(d => { const x = d.products.find(y => y.id === '${p.id}'); if(x) x.catIds = x.catIds.filter(c => c !== '${curCatObj.id}'); }, 'Removido de ${curCatObj.name}', true); window.__mepedeStore.menuFor=null;">Tirar desta categoria</div>` : ''}
                    <div style="padding:8px 12px; border-radius:8px; font-size:13px; cursor:pointer; color:var(--red)" onclick="window.__mepedeStore.deleteProduct('${p.id}')">Excluir produto</div>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Bloco principal de Produtos
      const productsSectionHtml = `
        <div class="card-box" style="margin-top:20px">
          <div style="display:flex; align-items:flex-start; gap:16px; flex-wrap:wrap; padding-bottom:18px; border-bottom:1px solid var(--gray-100)">
            <div style="flex:1; min-width:220px">
              <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap">
                <div style="font-size:20px; font-weight:600; letter-spacing:-0.2px">${catHeadTitle}</div>
                ${curCatObj ? `<span style="display:inline-flex; align-items:center; gap:6px; height:26px; padding:0 10px; border-radius:13px; background:${S.catStatus(curCatObj).bg}; color:${S.catStatus(curCatObj).fg}; font-size:12px; font-weight:500"><span style="width:6px; height:6px; border-radius:3px; background:${S.catStatus(curCatObj).fg}"></span>${S.catStatus(curCatObj).label}</span>` : ''}
              </div>
              <div style="font-size:13px; color:var(--gray-400); margin-top:4px">${catHeadSub}</div>
            </div>

            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap">
              <div style="display:flex; align-items:center; gap:8px; height:40px; padding:0 12px; border:1px solid var(--gray-200); border-radius:10px; width:200px; background:#fff">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A91A0" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
                <input id="main-product-search" value="${S.search}" oninput="window.__mepedeStore.search = this.value; window.__mepedeStore.notify()" placeholder="Buscar produto" style="flex:1; min-width:0; border:none; outline:none; font-size:13px; background:transparent">
              </div>

              ${catHeadActions}

              <button id="tut-btn-new-product" class="btn-orange" onclick="window.__mepedeStore.openProduct(null, window.__mepedeStore.selCat !== 'all' ? [window.__mepedeStore.selCat] : []); if(window.__mepedeStore.tutorialStep === 4) window.__mepedeStore.nextTutorial();">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>
                Novo produto
              </button>
            </div>
          </div>

          ${prodList.length ? `
            <div class="product-grid">
              ${productCardsHtml}
              <div id="tut-card-add-placeholder" class="card-add-placeholder" onclick="window.__mepedeStore.openProduct(null, window.__mepedeStore.selCat !== 'all' ? [window.__mepedeStore.selCat] : []); if(window.__mepedeStore.tutorialStep === 4) window.__mepedeStore.nextTutorial();">
                <div style="width:44px; height:44px; border-radius:22px; background:var(--orange); color:#fff; display:flex; align-items:center; justify-content:center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>
                </div>
                <div style="font-size:14px; font-weight:600">Novo produto</div>
                <div style="font-size:12px; color:var(--gray-400)">${curCatObj ? 'em ' + curCatObj.name : 'Escolha a categoria'}</div>
              </div>
            </div>
          ` : `
            <div style="text-align:center; padding:48px 20px 24px">
              <div style="font-size:17px; font-weight:600">${q ? 'Nada encontrado para “' + S.search + '”' : curCatObj ? 'Nenhum produto em ' + curCatObj.name + ' ainda' : 'Nenhum produto cadastrado'}</div>
              <div style="font-size:13px; color:var(--gray-500); margin-top:6px">${q ? 'Tente buscar por outro termo.' : 'Cadastre o primeiro produto com foto, preço e adicionais.'}</div>
              <div style="display:flex; gap:10px; justify-content:center; margin-top:20px">
                <button id="tut-btn-new-product-empty" class="btn-orange" onclick="window.__mepedeStore.openProduct(null, window.__mepedeStore.selCat !== 'all' ? [window.__mepedeStore.selCat] : []); if(window.__mepedeStore.tutorialStep === 4) window.__mepedeStore.nextTutorial();">Criar produto</button>
                ${curCatObj && data.products.length ? `
                  <button class="btn-outline" onclick="window.__mepedeStore.drawer = 'pick'; window.__mepedeStore.pick = { q: '', sel: {} }; window.__mepedeStore.notify()">Usar produto existente</button>
                ` : ''}
              </div>
            </div>
          `}
        </div>
      `;

      bodyHtml = `
        <div style="display:flex; flex-direction:column; width:100%">
          <!-- Gerenciador de Cardápios -->
          <div class="card-box" style="padding:16px">
            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap">
              <span style="font-size:15px; font-weight:600">Cardápios</span>
              ${liveBarText}
              <div style="flex:1"></div>
              <button id="tut-btn-new-menu-top" class="btn-outline" style="height:36px; padding:0 12px" onclick="window.__mepedeStore.openMenu(null); if(window.__mepedeStore.tutorialStep === 1) window.__mepedeStore.nextTutorial();">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>
                Novo cardápio
              </button>
            </div>
            <div class="menu-cards-container">
              ${menuCardsHtml}
            </div>
          </div>

          ${checklistHtml}
          ${emptyCatsBanner}

          ${mCats.length ? `
            <div class="chips-bar">
              <div class="chip ${S.selCat === 'all' ? 'active' : ''}" onclick="window.__mepedeStore.selCat = 'all'; window.__mepedeStore.notify()">
                <span>Todos</span>
                <span class="chip-count">${allCount}</span>
              </div>
              ${chipsHtml}
              ${newCatInputHtml}
            </div>
            ${productsSectionHtml}
          ` : ''}
        </div>
      `;
    } else if (S.tab === 'groups') {
      // Aba de Complementos
      const groupCardsHtml = data.groups.map(g => {
        const used = data.products.filter(p => p.groupIds.includes(g.id));
        const rule = ruleText(g);
        const reqTag = g.min > 0 ? 'OBRIGATÓRIO' : 'OPCIONAL';
        const reqBg = g.min > 0 ? '#FFF1E8' : '#F1F2F5';
        const reqFg = g.min > 0 ? '#E85700' : '#4A5160';

        const optItems = g.options.map(o => `
          <div style="display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid #F6F7F9">
            ${o.img ? `<img src="${o.img}" alt="" style="width:28px; height:28px; border-radius:8px; object-fit:cover">` : ''}
            <span style="flex:1; font-size:13px">${o.name}</span>
            <span style="font-size:12px; color:var(--gray-700); background:#F6F7F9; border-radius:8px; padding:3px 8px">${o.price ? '+ ' + money(o.price) : 'Grátis'}</span>
          </div>
        `).join('');

        return `
          <div class="card-box" style="padding:18px 20px; cursor:pointer; display:flex; flex-direction:column; gap:12px" onclick="window.__mepedeStore.openGroup(window.__mepedeStore.data.groups.find(x => x.id === '${g.id}'))">
            <div style="display:flex; align-items:flex-start; gap:10px">
              <div style="flex:1; min-width:0">
                <div style="font-size:16px; font-weight:600">${g.name}</div>
                <div style="font-size:12px; color:var(--gray-400); margin-top:2px">${rule}</div>
              </div>
              <span style="height:24px; padding:0 10px; border-radius:12px; background:${reqBg}; color:${reqFg}; font-size:11px; font-weight:600; display:flex; align-items:center">${reqTag}</span>
            </div>
            <div style="display:flex; flex-direction:column; border-top:1px solid var(--gray-100)">
              ${optItems}
            </div>
            <div style="font-size:12px; color:var(--gray-500)">
              ${used.length ? 'Usado em ' + used.length + ': ' + used.map(p => p.name).join(', ') : 'Ainda não vinculado a nenhum produto'}
            </div>
          </div>
        `;
      }).join('');

      bodyHtml = `
        <div style="display:flex; flex-direction:column; gap:16px; width:100%">
          <div style="display:flex; align-items:center; gap:16px; background:#EEF4FF; color:#2F6FEB; border-radius:14px; padding:14px 18px; font-size:13px; font-weight:500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5M12 8h.01"></path></svg>
            <span style="flex:1">Grupos são reutilizáveis: crie uma vez (ex.: “Ponto da carne”, “Adicionais”) e vincule em vários produtos. Alterar aqui atualiza todos ao mesmo tempo.</span>
          </div>

          <div style="display:flex; align-items:center; gap:12px">
            <div style="flex:1; font-size:13px; color:var(--gray-400)">${data.groups.length} grupos cadastrados</div>
            <button class="btn-orange" onclick="window.__mepedeStore.openGroup(null)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>
              Novo grupo
            </button>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:16px">
            ${groupCardsHtml}
          </div>
        </div>
      `;
    } else if (S.tab === 'settings') {
      // Aba Loja e Link
      bodyHtml = `
        <div style="display:flex; flex-direction:column; gap:16px; max-width:760px">
          <div class="card-box">
            <div style="font-size:16px; font-weight:600">Dados da loja</div>
            <div style="font-size:13px; color:var(--gray-400); margin-top:2px">Aparecem no cabeçalho do cardápio do cliente.</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:20px">
              <label style="display:flex; flex-direction:column; gap:6px; grid-column:1 / -1">
                <span style="font-size:13px; font-weight:500">Nome da loja</span>
                <input id="setting-store-name" value="${data.store.name}" oninput="window.__mepedeStore.data.store.name = this.value;" onchange="window.__mepedeStore.mut(d => { d.store.name = this.value; }, 'Nome da loja salvo')" style="height:44px; padding:0 14px; border:1px solid var(--gray-200); border-radius:10px; font-size:14px; outline:none">
              </label>
              <label style="display:flex; flex-direction:column; gap:6px">
                <span style="font-size:13px; font-weight:500">Tempo de preparo/entrega</span>
                <input id="setting-store-eta" value="${data.store.eta}" oninput="window.__mepedeStore.data.store.eta = this.value;" onchange="window.__mepedeStore.mut(d => { d.store.eta = this.value; }, 'Tempo de preparo salvo')" placeholder="35-45 min" style="height:44px; padding:0 14px; border:1px solid var(--gray-200); border-radius:10px; font-size:14px; outline:none">
              </label>
              <label style="display:flex; flex-direction:column; gap:6px">
                <span style="font-size:13px; font-weight:500">Taxa de entrega (0 = grátis)</span>
                <input id="setting-store-fee" value="${ms(data.store.fee)}" oninput="window.__mepedeStore.data.store.fee = pm(this.value);" onchange="window.__mepedeStore.mut(d => { d.store.fee = pm(this.value); }, 'Taxa de entrega salva')" placeholder="0,00" style="height:44px; padding:0 14px; border:1px solid var(--gray-200); border-radius:10px; font-size:14px; outline:none">
              </label>
              <label style="display:flex; flex-direction:column; gap:6px">
                <span style="font-size:13px; font-weight:500">Pedido mínimo</span>
                <input id="setting-store-min" value="${ms(data.store.min)}" oninput="window.__mepedeStore.data.store.min = pm(this.value);" onchange="window.__mepedeStore.mut(d => { d.store.min = pm(this.value); }, 'Pedido mínimo salvo')" placeholder="0,00" style="height:44px; padding:0 14px; border:1px solid var(--gray-200); border-radius:10px; font-size:14px; outline:none">
              </label>
              <label style="display:flex; flex-direction:column; gap:6px">
                <span style="font-size:13px; font-weight:500">Link personalizado</span>
                <div style="display:flex; align-items:center; height:44px; border:1px solid var(--gray-200); border-radius:10px; overflow:hidden">
                  <span style="padding:0 4px 0 14px; font-size:14px; color:var(--gray-400)">mepede.ai/</span>
                  <input id="setting-store-slug" value="${data.store.slug}" oninput="window.__mepedeStore.data.store.slug = this.value.toLowerCase().replace(/[^a-z0-9-]/g,'');" onchange="window.__mepedeStore.mut(d => { d.store.slug = this.value.toLowerCase().replace(/[^a-z0-9-]/g,''); }, 'Link salvo')" style="flex:1; min-width:0; height:100%; border:none; outline:none; font-size:14px">
                </div>
              </label>
            </div>
          </div>

          <div class="card-box" style="display:flex; align-items:center; gap:16px">
            <div style="flex:1">
              <div style="font-size:16px; font-weight:600">Dados de exemplo</div>
              <div style="font-size:13px; color:var(--gray-400); margin-top:2px">Comece com cardápio limpo do zero ou restaure o exemplo completo.</div>
            </div>
            <button class="btn-outline" onclick="window.__mepedeStore.data = emptyData(); window.__mepedeStore.setToast('Cardápio zerado!'); window.__mepedeStore.notify()">Começar do zero</button>
            <button class="btn-dark" onclick="window.__mepedeStore.data = seed(); window.__mepedeStore.setToast('Exemplo restaurado!'); window.__mepedeStore.notify()">Restaurar exemplo</button>
          </div>
        </div>
      `;
    }

    // Smartphone do Cliente (Live Preview)
    const ph = S.ph;
    const editingProduct = S.drawer === 'product' && S.draft;
    const selProd = editingProduct
      ? {
          id: S.draft.id || 'draft',
          name: S.draft.name || 'Nome do produto',
          desc: S.draft.desc || 'A descrição do produto aparece aqui.',
          img: S.draft.img,
          badge: S.draft.badge,
          serves: S.draft.serves,
          type: S.draft.type,
          price: pm(S.draft.priceStr),
          orig: pm(S.draft.origStr),
          varName: S.draft.varName || 'Tamanho',
          varOpts: S.draft.varOpts.filter(o => o.name.trim() || o.priceStr).map(o => ({ id: o.id, name: o.name.trim() || 'Opção', price: pm(o.priceStr) })),
          groupIds: S.draft.groupIds,
          active: S.draft.active
        }
      : (ph.pid ? data.products.find(p => p.id === ph.pid) : null);

    // Categorias ao vivo no celular (exibe mesmo sem produtos cadastrados ainda)
    const liveCats = mCats.filter(c => S.catStatus(c).live).map(c => ({
      c,
      prods: data.products.filter(p => p.active && p.catIds.includes(c.id))
    }));

    const activePhCat = liveCats.find(x => x.c.id === ph.cat) || liveCats[0];

    const getCatIcon = name => {
      const n = (name || '').toLowerCase();
      if (n.includes('mais') || n.includes('destaque') || n.includes('promo')) return '🔥';
      if (n.includes('lanche') || n.includes('burger') || n.includes('hamb')) return '🍔';
      if (n.includes('combo')) return '🍟';
      if (n.includes('bebida') || n.includes('refrig') || n.includes('suco')) return '🥤';
      if (n.includes('açaí') || n.includes('acai') || n.includes('sobrem')) return '🍧';
      return '✨';
    };

    const phChipsHtml = liveCats.map(x => {
      const isSel = activePhCat && x.c.id === activePhCat.c.id;
      const icon = getCatIcon(x.c.name);
      return `
        <div onclick="window.__mepedeStore.setPhone({ cat: '${x.c.id}' })" style="flex:none; height:32px; padding:0 14px; border-radius:16px; background:${isSel ? '#FF5B00' : '#F4F5F7'}; color:${isSel ? '#fff' : '#6B7280'}; font-size:11.5px; font-weight:${isSel ? '700' : '600'}; display:flex; align-items:center; gap:6px; cursor:pointer; box-shadow:${isSel ? '0 2px 6px rgba(255,91,0,0.25)' : 'none'}">
          <span>${icon}</span>
          <span>${x.c.name}</span>
        </div>
      `;
    }).join('');

    let phProductsHtml = '';
    if (activePhCat && activePhCat.prods.length > 0) {
      phProductsHtml = activePhCat.prods.map((p, idx) => {
        const disc = discOf(p);
        const isFirst = idx === 0;
        const tagInfo = p.badge ? getTagInfo(p.badge) : null;
        return `
          <div ${isFirst ? 'id="tut-phone-product-card"' : ''} onclick="window.__mepedeStore.setPhone({ pid: '${p.id}', view: 'home', qty: 1 }); if(window.__mepedeStore.tutorialStep === 7) window.__mepedeStore.nextTutorial();" style="position:relative; margin-top:${tagInfo ? '14px' : '2px'}; border:1px solid #FFE7D6; border-radius:18px; background:#fff; padding:12px 10px; box-shadow:0 2px 8px rgba(0,0,0,0.02); cursor:pointer; display:flex; gap:10px; align-items:flex-start">
            ${tagInfo ? `
              <div style="position:absolute; top:-11px; left:14px; z-index:3; pointer-events:none">
                <span class="product-tag-pill" style="display:inline-flex; align-items:center; gap:4px; background:${tagInfo.bg}; color:${tagInfo.color}; border:1px solid ${tagInfo.color}55; padding:2.5px 9px; border-radius:9999px; font-size:10.5px; font-weight:700; line-height:1.2; box-shadow:0 1px 4px rgba(0,0,0,0.06); user-select:none">
                  <span style="font-size:12px; line-height:1">${tagInfo.emoji}</span>
                  <span>${tagInfo.label}</span>
                </span>
              </div>
            ` : ''}
            <div style="width:86px; height:86px; min-width:86px; max-width:86px; aspect-ratio:1/1; border-radius:14px; overflow:hidden; flex:none; background:#F8F9FA">
              ${p.img ? `<img src="${p.img}" alt="" style="width:100%; height:100%; object-fit:cover; display:block">` : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:24px; color:#FF5B00; background:#FFF1E8">🍔</div>`}
            </div>
            <div style="flex:1; min-width:0; display:flex; flex-direction:column; justify-content:space-between; min-height:86px">
              <div>
                <div style="font-size:13px; font-weight:700; color:#1E293B; line-height:1.25; margin:0 0 3px 0; word-break:break-word">${p.name}</div>
                <div style="font-size:10.5px; color:#8A9CAE; line-height:1.35; margin:0 0 6px 0; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden">${p.desc || ''}</div>
              </div>
              <div style="display:flex; align-items:flex-end; justify-content:space-between; gap:6px; margin-top:auto">
                <div style="flex:1; min-width:0; white-space:nowrap">
                  ${disc ? `
                    <div style="display:flex; align-items:center; gap:4px; line-height:1; margin-bottom:2px; white-space:nowrap">
                      <span style="font-size:10px; color:#94A3B8; text-decoration:line-through; white-space:nowrap">${money(p.orig)}</span>
                      <span style="background:#00B368; color:#fff; border-radius:5px; padding:1px 4.5px; font-size:8.5px; font-weight:700; line-height:1; white-space:nowrap">${disc}</span>
                    </div>
                  ` : ''}
                  <div style="font-size:15px; font-weight:800; color:#00B368; line-height:1.1; letter-spacing:-0.2px; white-space:nowrap">${priceOf(p)}</div>
                </div>
                <button type="button" style="border:none; background:#FF5800; color:#fff; border-radius:14px; padding:6px 9px; font-size:10px; font-weight:700; display:inline-flex; align-items:center; gap:4px; cursor:pointer; white-space:nowrap; flex:none; box-shadow:0 3px 10px rgba(255,88,0,0.28); line-height:1">
                  <span>Add carrinho</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d="M4 10h16l-2 10H6L4 10z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/><line x1="9" y1="13" x2="9" y2="16"/><line x1="12" y1="13" x2="12" y2="16"/><line x1="15" y1="13" x2="15" y2="16"/></svg>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } else if (activePhCat) {
      // Categoria criada, mas sem produtos ainda
      phProductsHtml = `
        <div style="text-align:center; padding:32px 14px 22px; display:flex; flex-direction:column; align-items:center; background:#FAFBFD; border:1.5px dashed #E3E6EB; border-radius:18px; margin:4px 0">
          <div style="width:44px; height:44px; border-radius:22px; background:#FFF1E8; color:#FF6100; font-size:22px; display:flex; align-items:center; justify-content:center; margin-bottom:10px">🍔</div>
          <div style="font-size:13px; font-weight:700; color:var(--dark)">Categoria “${activePhCat.c.name}” criada!</div>
          <div style="font-size:11px; color:var(--gray-500); margin-top:4px; line-height:1.4">
            Pronta para receber produtos. Cadastre seu primeiro hambúrguer no painel para vê-lo aqui na hora.
          </div>
          <div style="display:inline-flex; align-items:center; gap:6px; margin-top:12px; padding:5px 12px; border-radius:12px; background:#FFF1E8; color:#E85700; font-size:10px; font-weight:600">
            👈 Próximo passo: Cadastrar produto
          </div>
        </div>
      `;
    } else if (curMenu) {
      // Cardápio criado, mas sem categorias ainda
      phProductsHtml = `
        <div style="text-align:center; padding:32px 14px 24px; display:flex; flex-direction:column; align-items:center; background:#FAFBFD; border:1.5px dashed #E3E6EB; border-radius:18px; margin:4px 0">
          <div style="width:44px; height:44px; border-radius:22px; background:#E8F7EE; color:#12A150; font-size:22px; display:flex; align-items:center; justify-content:center; margin-bottom:10px">📋</div>
          <div style="font-size:13px; font-weight:700; color:var(--dark)">“${curMenu.name}” criado!</div>
          <div style="font-size:11px; color:var(--gray-500); margin-top:4px; line-height:1.4">
            Adicione sua primeira categoria (como <b>Lanches</b>) para montar seu cardápio.
          </div>
          <div style="display:inline-flex; align-items:center; gap:6px; margin-top:12px; padding:5px 12px; border-radius:12px; background:#E8F7EE; color:#12A150; font-size:10px; font-weight:600">
            👈 Crie uma categoria ao lado
          </div>
        </div>
      `;
    } else {
      // Início absoluto: nenhum cardápio criado ainda
      phProductsHtml = `
        <div style="text-align:center; padding:36px 14px 24px; display:flex; flex-direction:column; align-items:center; background:#FAFBFD; border:1.5px dashed #E3E6EB; border-radius:18px; margin:4px 0">
          <div style="width:46px; height:46px; border-radius:23px; background:#FFF1E8; color:#FF6100; font-size:22px; display:flex; align-items:center; justify-content:center; margin-bottom:10px">✨</div>
          <div style="font-size:13px; font-weight:700; color:var(--dark)">Seu cardápio aparecerá aqui</div>
          <div style="font-size:11px; color:var(--gray-500); margin-top:4px; line-height:1.4">
            Conforme você for criando no painel, a prévia do cliente é montada automaticamente em tempo real!
          </div>
          <div style="display:inline-flex; align-items:center; gap:6px; margin-top:12px; padding:5px 12px; border-radius:12px; background:#FFF1E8; color:#E85700; font-size:10px; font-weight:600">
            👈 Comece clicando em Criar cardápio
          </div>
        </div>
      `;
    }

    // Bottom Sheet do Produto no Celular (100% fiel ao Perfil - Inicio-1.png)
    let phSheetHtml = '';
    if (selProd) {
      const sp = selProd;
      const vOk = sp.type === 'var' ? sp.varOpts.find(o => o.id === ph.sel.v) : null;
      const gList = sp.groupIds.map(id => data.groups.find(g => g.id === id)).filter(Boolean);

      const extras = gList.reduce((acc, g) => {
        const chosen = ph.sel.g[g.id] || [];
        return acc + chosen.reduce((b, oid) => {
          const opt = g.options.find(x => x.id === oid);
          return b + (opt ? opt.price : 0);
        }, 0);
      }, 0);

      const basePrice = sp.type === 'var' ? (vOk ? vOk.price : 0) : sp.price;
      const sheetTotal = (basePrice + extras) * ph.qty;

      const missReqGroup = gList.find(g => (ph.sel.g[g.id] || []).length < g.min);
      const needVar = sp.type === 'var' && !vOk;
      const sheetCanAdd = !needVar && !missReqGroup;

      const addBtnLabel = sheetCanAdd
        ? 'Adicionar ao carrinho'
        : (needVar ? 'Escolha o(a) ' + (sp.varName || 'tamanho').toLowerCase() : 'Escolha: ' + missReqGroup.name);

      const varsHtml = sp.type === 'var' ? `
        <div style="margin-top:16px">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px">
            <div>
              <div style="font-size:12.5px; font-weight:700; color:#14171F">Escolha o(a) ${sp.varName || 'Tamanho'}</div>
              <div style="font-size:9.5px; color:#8F95A3">Escolha 1 opção</div>
            </div>
            <span style="font-size:8.5px; font-weight:700; color:#fff; background:#14171F; border-radius:6px; padding:3px 8px">OBRIGATÓRIO</span>
          </div>
          ${sp.varOpts.map(o => {
            const isVSelected = ph.sel.v === o.id;
            return `
              <div onclick="window.__mepedeStore.setPhone({ sel: { ...window.__mepedeStore.ph.sel, v: '${o.id}' } })" style="display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid #F3F4F6; cursor:pointer">
                <span style="flex:1; font-size:12px; font-weight:600; color:#14171F">${o.name}</span>
                <span style="font-size:12px; font-weight:700; color:#00B050">${money(o.price)}</span>
                <span style="width:18px; height:18px; border-radius:9px; border:1.5px solid ${isVSelected ? '#FF5B00' : '#C9CED8'}; display:flex; align-items:center; justify-content:center">
                  <span style="width:10px; height:10px; border-radius:5px; background:${isVSelected ? '#FF5B00' : 'transparent'}"></span>
                </span>
              </div>
            `;
          }).join('')}
        </div>
      ` : '';

      const groupsHtml = gList.map(g => {
        const chosen = ph.sel.g[g.id] || [];
        const isRadio = g.max === 1;

        const optHtml = g.options.map(o => {
          const isOptSel = chosen.includes(o.id);

          return `
            <div onclick="
              const s = window.__mepedeStore.ph.sel;
              const ch = (s.g['${g.id}'] || []).slice();
              let n;
              if (${isRadio}) {
                n = ch[0] === '${o.id}' ? [] : ['${o.id}'];
              } else if (ch.includes('${o.id}')) {
                n = ch.filter(x => x !== '${o.id}');
              } else {
                if (ch.length >= ${g.max}) {
                  window.__mepedeStore.phSay('Máximo de ${g.max} em “${g.name}”');
                  return;
                }
                n = ch.concat('${o.id}');
              }
              window.__mepedeStore.setPhone({ sel: { ...s, g: { ...s.g, '${g.id}': n } } });
            " style="display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid #F3F4F6; cursor:pointer">
              <div style="flex:1; min-width:0">
                <div style="font-size:12px; font-weight:700; color:#14171F">${o.name}</div>
                ${o.desc ? `<div style="font-size:9.5px; color:#8F95A3; margin-top:1px">${o.desc}</div>` : ''}
                ${o.price > 0 ? `<div style="font-size:10px; color:#8F95A3; margin-top:2px">+ ${money(o.price)}</div>` : ''}
              </div>
              ${o.img ? `
                <div style="width:44px; height:44px; border-radius:8px; overflow:hidden; flex:none; background:#F8F9FA">
                  <img src="${o.img}" alt="" style="width:100%; height:100%; object-fit:cover; display:block">
                </div>
              ` : ''}
              <div style="flex:none; margin-left:4px">
                ${isRadio ? `
                  <div style="width:18px; height:18px; border-radius:9px; border:${isOptSel ? '2px solid #FF5B00' : '1.5px solid #C9CED8'}; display:flex; align-items:center; justify-content:center">
                    ${isOptSel ? '<div style="width:10px; height:10px; border-radius:5px; background:#FF5B00"></div>' : ''}
                  </div>
                ` : `
                  ${isOptSel ? `
                    <div style="width:18px; height:18px; border-radius:5px; background:#FF5B00; color:#fff; display:flex; align-items:center; justify-content:center">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M20 6 9 17l-5-5"></path></svg>
                    </div>
                  ` : `
                    <div style="width:18px; height:18px; display:flex; align-items:center; justify-content:center; color:#FF5B00; font-size:17px; font-weight:700">+</div>
                  `}
                `}
              </div>
            </div>
          `;
        }).join('');

        return `
          <div style="margin-top:16px">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px">
              <div>
                <div style="font-size:12.5px; font-weight:700; color:#14171F">${g.name}</div>
                <div style="font-size:9.5px; color:#8F95A3">${ruleText(g)}</div>
              </div>
              <span style="font-size:8.5px; font-weight:700; color:${g.min > 0 ? '#fff' : '#6B7280'}; background:${g.min > 0 ? '#14171F' : '#F1F2F5'}; border-radius:6px; padding:3px 8px">
                ${g.min > 0 ? 'OBRIGATÓRIO' : 'OPCIONAL'}
              </span>
            </div>
            ${optHtml}
          </div>
        `;
      }).join('');

      phSheetHtml = `
        <div style="position:absolute; inset:0; background:#fff; z-index:45; display:flex; flex-direction:column; overflow:hidden">
          <div style="flex:1; overflow-y:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none">
            
            <!-- Hero Header with Image, Back, Search, and Floating Qty -->
            <div style="position:relative; height:220px; background:#1A1D26; flex:none; overflow:visible">
              <img src="${sp.img || 'assets/detroid_hero.png'}" alt="" style="width:100%; height:100%; object-fit:cover; display:block">
              
              <!-- Back button -->
              <div onclick="window.__mepedeStore.setPhone({ pid: null })" style="position:absolute; top:12px; left:12px; width:34px; height:34px; border-radius:17px; background:rgba(255,255,255,0.92); display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.15); z-index:10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A5160" stroke-width="2.5" stroke-linecap="round"><path d="m15 18-6-6 6-6"></path></svg>
              </div>

              <!-- Search button -->
              <div style="position:absolute; top:12px; right:12px; width:34px; height:34px; border-radius:17px; background:rgba(255,255,255,0.92); display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.15); z-index:10">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FF5B00" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="m21 21-4.3-4.3"></path></svg>
              </div>

              <!-- Floating Qty Pill -->
              <div style="position:absolute; bottom:-16px; right:16px; height:34px; background:#fff; border-radius:17px; border:1px solid #ECEEF2; box-shadow:0 3px 12px rgba(0,0,0,0.12); display:flex; align-items:center; padding:0 4px; z-index:25">
                <div onclick="window.__mepedeStore.setPhone({ qty: Math.max(1, window.__mepedeStore.ph.qty - 1) })" style="width:26px; height:26px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:17px; font-weight:700; color:#FF5B00; user-select:none">−</div>
                <span style="min-width:18px; text-align:center; font-size:12.5px; font-weight:700; color:#14171F">${ph.qty}</span>
                <div onclick="window.__mepedeStore.setPhone({ qty: window.__mepedeStore.ph.qty + 1 })" style="width:26px; height:26px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:17px; font-weight:700; color:#FF5B00; user-select:none">+</div>
              </div>
            </div>

            <!-- Sheet Content Body -->
            <div style="padding:18px 14px 16px">
              <!-- Badge -->
              ${sp.badge ? `
                <div style="margin-bottom:8px">
                  ${renderBadgeHtml(sp.badge, 'font-size:10.5px; padding:3px 9px; border-radius:10px')}
                </div>
              ` : ''}

              <!-- Title -->
              <div style="font-size:16.5px; font-weight:800; color:#14171F; line-height:1.25">${sp.name}</div>

              <!-- Rating and Price -->
              <div style="display:flex; align-items:baseline; justify-content:space-between; margin-top:6px">
                <div style="display:flex; align-items:center; gap:3px; font-size:10.5px">
                  <span style="color:#FF9800; font-size:11px">★ ★ ★ ★ ☆</span>
                  <strong style="color:#14171F; font-weight:700; margin-left:2px">4.5</strong>
                  <span style="color:#8F95A3; font-size:9.5px">(41 Reviews)</span>
                </div>
                <div style="display:flex; align-items:baseline; gap:5px">
                  ${sp.orig ? `<span style="font-size:10.5px; color:#8F95A3; text-decoration:line-through">${money(sp.orig)}</span>` : ''}
                  <span style="font-size:17px; font-weight:800; color:#00B050">${money(basePrice)}</span>
                </div>
              </div>

              <!-- Tabela nutricional (fiel a Perfil - Inicio-1.png) -->
              <div style="margin-top:14px">
                <div style="font-size:12.5px; font-weight:700; color:#14171F; margin-bottom:8px">Tabela nutricional</div>
                <div style="display:flex; gap:5px">
                  <div style="flex:1; border:1px solid #ECEEF2; border-radius:10px; background:#fff; padding:6px 2px; text-align:center">
                    <div style="font-size:11px; font-weight:700; color:#14171F">100g</div>
                    <div style="font-size:9px; color:#8F95A3; margin-top:2px">Peso</div>
                  </div>
                  <div style="flex:1; border:1px solid #ECEEF2; border-radius:10px; background:#fff; padding:6px 2px; text-align:center">
                    <div style="font-size:11px; font-weight:700; color:#14171F">740</div>
                    <div style="font-size:9px; color:#8F95A3; margin-top:2px">Kcal</div>
                  </div>
                  <div style="flex:1; border:1px solid #ECEEF2; border-radius:10px; background:#fff; padding:6px 2px; text-align:center">
                    <div style="font-size:11px; font-weight:700; color:#14171F">35g</div>
                    <div style="font-size:9px; color:#8F95A3; margin-top:2px">Proteína</div>
                  </div>
                  <div style="flex:1; border:1px solid #ECEEF2; border-radius:10px; background:#fff; padding:6px 2px; text-align:center">
                    <div style="font-size:11px; font-weight:700; color:#14171F">45g</div>
                    <div style="font-size:9px; color:#8F95A3; margin-top:2px">Gord.</div>
                  </div>
                  <div style="flex:1; border:1px solid #ECEEF2; border-radius:10px; background:#fff; padding:6px 2px; text-align:center">
                    <div style="font-size:11px; font-weight:700; color:#14171F">102g</div>
                    <div style="font-size:9px; color:#8F95A3; margin-top:2px">Carbo.</div>
                  </div>
                </div>
              </div>

              <!-- Descrição & 2 Info Cards -->
              <div style="margin-top:14px">
                <div style="font-size:12.5px; font-weight:700; color:#14171F; margin-bottom:4px">Descrição</div>
                <div style="font-size:10.5px; color:#6B7280; line-height:1.45">${sp.desc || 'Blend 180g, peso de 350g, queijo cheddar, alface, tomate e maionese da casa'}</div>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px">
                  <div style="background:#F8F9FA; border:1px solid #ECEEF2; border-radius:14px; padding:7px 10px; display:flex; align-items:center; justify-content:space-between">
                    <div>
                      <div style="font-size:9.5px; color:#8F95A3">Serve até</div>
                      <div style="font-size:11px; font-weight:700; color:#14171F">${sp.serves || '1 pessoa'}</div>
                    </div>
                    <div style="width:26px; height:26px; border-radius:13px; background:#fff; border:1px solid #ECEEF2; display:flex; align-items:center; justify-content:center; color:#8F95A3">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                  </div>
                  <div style="background:#F8F9FA; border:1px solid #ECEEF2; border-radius:14px; padding:7px 10px; display:flex; align-items:center; justify-content:space-between">
                    <div>
                      <div style="font-size:9.5px; color:#8F95A3">Entrega</div>
                      <div style="font-size:11px; font-weight:700; color:#14171F">${data.store.eta || '35 - 45 min'}</div>
                    </div>
                    <div style="width:26px; height:26px; border-radius:13px; background:#fff; border:1px solid #ECEEF2; display:flex; align-items:center; justify-content:center; color:#8F95A3">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="18" r="3"></circle><path d="M6 18h4l3-8h5"></path><path d="M14 6h3l2 4"></path></svg>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Grupos (Base, Adicionais, etc.) -->
              ${varsHtml}
              ${groupsHtml}

              <!-- Observações * -->
              <div style="margin-top:16px; margin-bottom:8px">
                <div style="font-size:12px; font-weight:700; color:#14171F; margin-bottom:6px">Observações <span style="color:#FF3B30">*</span></div>
                <input type="text" placeholder="Ex: tirar cebola, maionese à parte..." style="width:100%; border:1px solid #ECEEF2; border-radius:12px; padding:9px 12px; font-size:11px; background:#FAFAFA; outline:none; box-sizing:border-box">
              </div>
            </div>
          </div>

          <!-- Sticky Bottom Button -->
          <div style="flex:none; padding:10px 14px 18px; border-top:1px solid #ECEEF2; background:#fff">
            <button id="tut-phone-add-to-cart" onclick="window.__mepedeStore.addPhoneToCart()" style="width:100%; height:46px; border-radius:14px; background:${sheetCanAdd ? '#FF5B00' : '#FFB98C'}; color:#fff; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:space-between; padding:0 16px; cursor:${sheetCanAdd ? 'pointer' : 'not-allowed'}; border:none; box-shadow:${sheetCanAdd ? '0 4px 12px rgba(255,91,0,0.3)' : 'none'}">
              <div style="display:flex; align-items:center; gap:8px">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                <span>${addBtnLabel}</span>
              </div>
              <span style="font-size:13.5px; font-weight:800">${money(sheetTotal)}</span>
            </button>
          </div>
        </div>
      `;
    }

    // Carrinho no Celular (Design iPhone-22.png & Novo Padrão)
    const cartSub = ph.cart.reduce((a, c) => a + c.total, 0);
    const minOk = cartSub >= (data.store.min || 0);
    const discount = ph.discountVal || 0;
    const fee = data.store.fee || 0;
    const serviceFee = ph.cart.length ? 0.99 : 0;
    const cartTotal = Math.max(0, cartSub + (ph.cart.length ? (fee + serviceFee - discount) : 0));
    const cartQty = ph.cart.reduce((a, c) => a + c.qty, 0);

    const phCartHtml = ph.view === 'cart' && !selProd ? `
      <div style="position:absolute; inset:0; background:#FAFAFB; z-index:40; display:flex; flex-direction:column; overflow:hidden">
        <!-- Top bar: Chevron down (voltar ao início) e Limpar -->
        <div style="display:flex; align-items:center; justify-content:space-between; padding:38px 14px 10px; background:#FAFAFB; flex:none">
          <div onclick="window.__mepedeStore.setPhone({ view: 'home' })" style="cursor:pointer; width:32px; height:32px; border-radius:16px; background:#fff; border:1px solid #ECEEF2; display:flex; align-items:center; justify-content:center; color:#FF5800; box-shadow:0 1px 4px rgba(0,0,0,0.04)" title="Voltar ao cardápio">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
          <div onclick="window.__mepedeStore.clearPhoneCart()" style="font-size:12.5px; font-weight:700; color:#FF5800; cursor:pointer; padding:6px 4px" title="Limpar carrinho">Limpar</div>
        </div>

        <!-- Store Info Pill Header -->
        <div style="display:flex; align-items:center; gap:10px; padding:0 14px 12px; background:#FAFAFB; flex:none; border-bottom:1px solid #ECEEF2">
          <div style="width:38px; height:38px; border-radius:19px; background:#FF5800; display:flex; align-items:center; justify-content:center; flex:none; box-shadow:0 3px 10px rgba(255,88,0,0.25)">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <rect x="3" y="3" width="26" height="22" rx="7" fill="#fff"></rect>
              <path d="M12 25 L8 30 L9 25 Z" fill="#fff"></path>
              <path d="M12 9 v5 m8 -5 v5 m-4 -5 v8 m0 0 v4" stroke="#FF5800" stroke-width="2.2" stroke-linecap="round"></path>
            </svg>
          </div>
          <div style="flex:1; min-width:0">
            <div style="font-size:14px; font-weight:800; color:#14171F; letter-spacing:-0.2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${data.store.name || 'Me Pede Burguer Ai!'}</div>
            <div style="font-size:10.5px; color:#8F95A3; margin-top:1px">${data.store.eta || '35-45 min'} • <span style="color:#00B368; font-weight:700">${data.store.fee ? money(data.store.fee) : 'Grátis'}</span></div>
          </div>
        </div>

        <!-- Scrollable Cart Body -->
        <div style="flex:1; overflow-y:auto; padding:12px 14px 18px; -webkit-overflow-scrolling:touch; scrollbar-width:none">
          <!-- Cart Items List -->
          ${ph.cart.map(c => `
            <div style="background:#FFFFFF; border:1px solid #ECEEF2; border-radius:18px; padding:12px; display:flex; gap:12px; align-items:center; box-shadow:0 2px 10px rgba(20,23,31,0.03); margin-bottom:12px">
              <img src="${c.img || 'assets/detroid_combo.png'}" alt="${c.name}" style="width:64px; height:64px; border-radius:14px; object-fit:cover; flex:none; background:#F6F7F9; border:1px solid #F0F1F4">
              <div style="flex:1; min-width:0">
                <div style="font-size:13px; font-weight:700; color:#14171F; line-height:1.25">${c.name}</div>
                <div style="font-size:10px; color:#8F95A3; margin-top:2px; line-height:1.3; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden">${c.detail || 'Sem adicionais'}</div>
                <div style="display:flex; align-items:center; justify-content:space-between; margin-top:6px">
                  <span style="font-size:13.5px; font-weight:800; color:#14171F">${money(c.total)}</span>
                  <div style="border:1px solid #ECEEF2; border-radius:10px; background:#FAFAFB; padding:3px 8px; display:flex; align-items:center; gap:8px">
                    <span onclick="window.__mepedeStore.changeCartItemQty('${c.id}', -1)" style="font-size:14px; font-weight:700; color:#FF5800; cursor:pointer; user-select:none; width:14px; text-align:center" title="Diminuir">−</span>
                    <span style="font-size:11.5px; font-weight:800; color:#14171F; min-width:14px; text-align:center">${c.qty}</span>
                    <span onclick="window.__mepedeStore.changeCartItemQty('${c.id}', 1)" style="font-size:14px; font-weight:700; color:#FF5800; cursor:pointer; user-select:none; width:14px; text-align:center" title="Aumentar">+</span>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}

          ${!ph.cart.length ? `
            <div style="text-align:center; padding:32px 14px; background:#fff; border-radius:18px; border:1px dashed #ECEEF2; margin:8px 0 16px">
              <div style="font-size:32px">🛒</div>
              <div style="font-size:13px; font-weight:700; color:#14171F; margin-top:8px">Seu carrinho está vazio</div>
              <div style="font-size:11px; color:#8F95A3; margin-top:4px">Escolha itens no cardápio ou veja as sugestões abaixo!</div>
              <button onclick="window.__mepedeStore.setPhone({ view: 'home' })" class="btn-orange" style="margin:12px auto 0; font-size:11.5px; height:34px; border-radius:10px; padding:0 16px">Ver cardápio</button>
            </div>
          ` : ''}

          <!-- Peça Também Section -->
          <div style="margin:16px 0 14px">
            <div style="font-size:14px; font-weight:800; color:#14171F; margin-bottom:10px; letter-spacing:-0.2px">Peça também</div>
            <div style="display:flex; gap:10px; overflow-x:auto; padding-bottom:6px; -webkit-overflow-scrolling:touch; scrollbar-width:none">
              ${[
                { key: 'maionese', name: 'Maionese extra', price: 5.00, img: 'assets/peca_maionese.png' },
                { key: 'sorvete', name: 'Sorvete no pote', price: 25.00, img: 'assets/peca_sorvete.png' },
                { key: 'coca', name: 'Coca Zero', price: 5.00, img: 'assets/peca_coca.png' },
                { key: 'batata', name: 'Batata crocante', price: 15.00, img: 'assets/detroid_combo.png' }
              ].map(item => `
                <div onclick="window.__mepedeStore.addPecaTambem('${item.key}')" style="width:86px; flex:none; cursor:pointer; display:flex; flex-direction:column">
                  <div style="width:86px; height:86px; border-radius:14px; overflow:hidden; position:relative; border:1px solid #ECEEF2; background:#F6F7F9">
                    <img src="${item.img}" alt="${item.name}" style="width:100%; height:100%; object-fit:cover; display:block">
                    <div style="position:absolute; right:5px; bottom:5px; width:26px; height:26px; border-radius:13px; background:#FF5800; color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 8px rgba(255,88,0,0.4); font-weight:800; font-size:15px">+</div>
                  </div>
                  <div style="font-size:11.5px; font-weight:800; color:#14171F; margin-top:6px">${money(item.price)}</div>
                  <div style="font-size:10px; color:#8F95A3; margin-top:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${item.name}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Cupom de Desconto -->
          <div style="margin:14px 0">
            <div style="font-size:13px; font-weight:700; color:#14171F; margin-bottom:6px">Cupom de desconto:</div>
            <div style="display:flex; gap:8px">
              <input id="ph-coupon-input" type="text" placeholder="DIGITE O CUPOM" value="${ph.coupon || ''}" onkeydown="if(event.key==='Enter') window.__mepedeStore.applyPhoneCoupon()" style="flex:1; height:42px; border:1.5px solid #ECEEF2; border-radius:12px; padding:0 12px; font-size:11.5px; font-weight:700; text-transform:uppercase; outline:none; background:#FFFFFF; color:#14171F; letter-spacing:0.5px">
              <button onclick="window.__mepedeStore.applyPhoneCoupon()" style="height:42px; padding:0 18px; border-radius:12px; background:#FF5800; color:#fff; font-size:12px; font-weight:700; border:none; cursor:pointer; flex:none; box-shadow:0 3px 10px rgba(255,88,0,0.25)">Aplicar</button>
            </div>
            ${ph.coupon ? `
              <div style="display:flex; align-items:center; justify-content:space-between; margin-top:6px; background:#E8F7EE; border:1px solid #B7EBCE; border-radius:10px; padding:6px 10px; font-size:11px; color:#00B368; font-weight:700">
                <span>✓ Cupom ${ph.coupon} aplicado (-${money(ph.discountVal || 5)})</span>
                <span onclick="window.__mepedeStore.removePhoneCoupon()" style="cursor:pointer; color:#8F95A3; font-weight:700; font-size:13px">✕</span>
              </div>
            ` : ''}
          </div>

          <!-- Forma de Pagamento (Padrão PIX) -->
          <div style="margin:16px 0 14px">
            <div style="font-size:13px; font-weight:700; color:#14171F; margin-bottom:8px">Forma de pagamento:</div>
            <div class="ph-pix-badge" style="border:1.5px solid #00B368; border-radius:14px; background:#FFFFFF; padding:10px 12px; display:flex; align-items:center; justify-content:space-between; box-shadow:0 2px 8px rgba(0,0,0,0.02)">
              <div style="display:flex; align-items:center; gap:10px">
                <div style="width:34px; height:34px; border-radius:10px; background:#E8F7EE; display:flex; align-items:center; justify-content:center; flex:none">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L6 8l6 6 6-6-6-6z" fill="#00B368"/>
                    <path d="M12 10l-6 6 6 6 6-6-6-6z" fill="#00B368" opacity="0.8"/>
                  </svg>
                </div>
                <div>
                  <div style="font-size:12.5px; font-weight:700; color:#14171F">Pix</div>
                  <div style="font-size:10px; color:#8F95A3; margin-top:1px">Aprovação automática</div>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:6px">
                <span style="background:#E8F7EE; color:#00B368; font-size:10px; font-weight:800; padding:3px 8px; border-radius:6px">PIX</span>
                <div style="width:18px; height:18px; border-radius:9px; background:#00B368; display:flex; align-items:center; justify-content:center; color:#fff; font-size:11px; font-weight:800">✓</div>
              </div>
            </div>
          </div>

          <!-- Resumo de Valores -->
          <div style="margin:16px 0 10px">
            <div style="font-size:13.5px; font-weight:800; color:#14171F; margin-bottom:8px">Resumo de valores</div>
            <div style="background:#FFFFFF; border:1px solid #ECEEF2; border-radius:14px; padding:12px; display:flex; flex-direction:column; gap:6px; font-size:11.5px">
              <div style="display:flex; justify-content:space-between">
                <span style="color:#8F95A3">Subtotal</span>
                <span style="font-weight:600; color:#14171F">${money(cartSub)}</span>
              </div>
              <div style="display:flex; justify-content:space-between">
                <span style="color:#8F95A3">Taxa de entrega</span>
                <span style="font-weight:700; color:#00B368">${data.store.fee ? money(data.store.fee) : 'Grátis'}</span>
              </div>
              <div style="display:flex; justify-content:space-between">
                <span style="color:#8F95A3">Taxa de serviço</span>
                <span style="font-weight:600; color:#14171F">R$ 0,99</span>
              </div>
              ${ph.coupon ? `
                <div style="display:flex; justify-content:space-between">
                  <span style="color:#00B368; font-weight:600">Desconto (${ph.coupon})</span>
                  <span style="font-weight:700; color:#00B368">-${money(discount)}</span>
                </div>
              ` : ''}
              <div style="display:flex; justify-content:space-between; font-size:14.5px; font-weight:800; color:#14171F; margin-top:6px; padding-top:8px; border-top:1px dashed #ECEEF2">
                <span>Total</span>
                <span>${money(cartTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sticky Bottom Checkout Bar -->
        <div style="flex:none; background:#FFFFFF; border-top:1px solid #ECEEF2; padding:12px 14px 16px; display:flex; align-items:center; justify-content:space-between; gap:12px; box-shadow:0 -4px 16px rgba(0,0,0,0.03)">
          <div>
            <div style="font-size:10px; color:#8F95A3; font-weight:500">Total com entrega grátis</div>
            <div style="font-size:14px; font-weight:800; color:#14171F; margin-top:1px">${money(cartTotal)} <span style="font-size:10.5px; font-weight:600; color:#8F95A3">/ ${cartQty} ${cartQty === 1 ? 'item' : 'itens'}</span></div>
          </div>
          <button id="tut-phone-checkout" onclick="window.__mepedeStore.checkoutPhone()" style="height:44px; padding:0 24px; border-radius:14px; background:${(ph.cart.length && minOk && data.store.open) || S.tutorialStep === 9 ? '#FF5800' : '#FFB98C'}; color:#fff; font-size:13px; font-weight:700; border:none; cursor:${(ph.cart.length && minOk && data.store.open) || S.tutorialStep === 9 ? 'pointer' : 'not-allowed'}; box-shadow:${(ph.cart.length && minOk && data.store.open) || S.tutorialStep === 9 ? '0 4px 14px rgba(255,88,0,0.35)' : 'none'}; display:flex; align-items:center; justify-content:center; gap:6px">
            <span>Continuar</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    ` : '';

    const phoneSectionHtml = `
      <section class="phone-preview-section">
        <div style="width:320px; display:flex; align-items:center; gap:8px">
          <div style="flex:1">
            <div style="font-size:15px; font-weight:700">Prévia do cliente</div>
            <div style="font-size:12px; color:var(--gray-400)">
              ${editingProduct ? 'Mostrando o produto que você está editando' : curMenu ? (isEditingLive ? curMenu.name + ' · no ar agora' : curMenu.name + ' · fora do horário') : 'Sem cardápio criado ainda'}
            </div>
          </div>
          <span style="display:flex; align-items:center; gap:6px; height:26px; padding:0 10px; border-radius:13px; background:#E5352B; color:#fff; font-size:12px; font-weight:600">
            <span style="width:6px; height:6px; border-radius:3px; background:#fff"></span>Ao vivo
          </span>
        </div>

        <div class="phone-mockup">
          <div class="phone-screen">
            <div class="phone-island"></div>

            <div class="phone-body-scroll">
              <!-- Cover (Perfil - Inicio.png) -->
              <div class="phone-header-cover" style="position:relative; height:130px; background:#14171F">
                <img src="assets/capa.png" alt="Capa Foodtruck" style="width:100%; height:100%; object-fit:cover; display:block">
              </div>

              <!-- Store Avatar (overlapping cover) & Store Info -->
              <div style="display:flex; flex-direction:column; align-items:center; position:relative">
                <div class="phone-store-avatar" style="width:52px; height:52px; border-radius:26px; background:#FF5B00; border:3px solid #fff; display:flex; align-items:center; justify-content:center; margin-top:-26px; box-shadow:0 3px 10px rgba(0,0,0,0.12); z-index:2">
                  <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                    <rect x="3" y="3" width="26" height="22" rx="7" fill="#fff"></rect>
                    <path d="M12 25 L8 30 L9 25 Z" fill="#fff"></path>
                    <path d="M12 9 v5 m8 -5 v5 m-4 -5 v8 m0 0 v4" stroke="#FF5B00" stroke-width="2.2" stroke-linecap="round"></path>
                  </svg>
                </div>
                <div style="font-size:17px; font-weight:700; color:#14171F; margin-top:8px; text-align:center; padding:0 12px; letter-spacing:-0.3px">${data.store.name}</div>
                <div style="display:flex; align-items:center; justify-content:center; gap:5px; font-size:11px; margin-top:4px; color:#8F95A3">
                  <span style="color:#FF9800; font-size:13px">★</span>
                  <strong style="color:#14171F; font-weight:700">4.6</strong>
                  <span>(170)</span>
                  <span>·</span>
                  <span style="color:${data.store.open ? '#FF5B00' : '#E5352B'}; font-weight:700">${data.store.open ? 'Aberto' : 'Fechado'}</span>
                  <span>·</span>
                  <span>2,7 km</span>
                </div>
              </div>

              <!-- Delivery Pill Card (Perfil - Inicio.png) -->
              <div style="margin:12px 14px 0; border-radius:28px; background:#F8F9FA; border:1px solid #ECEEF2; padding:8px 14px; display:flex; align-items:center; gap:12px">
                <div style="width:34px; height:34px; border-radius:17px; background:#fff; border:1px solid #ECEEF2; display:flex; align-items:center; justify-content:center; color:#8F95A3; flex:none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="18" r="3"></circle>
                    <path d="M6 18h4l3-8h5"></path><path d="M14 6h3l2 4"></path>
                  </svg>
                </div>
                <div style="flex:1; min-width:0">
                  <div style="font-size:11.5px; font-weight:700; color:#14171F">Tempo padrão: ${data.store.eta || '35-45 min'}</div>
                  <div style="font-size:10px; color:#8F95A3; margin-top:1px">Preço: <strong style="color:#00B050; font-weight:700">${data.store.fee ? money(data.store.fee) : 'Grátis'}</strong> · Pedido Min: ${money(data.store.min || 60)}</div>
                </div>
              </div>

              <!-- Horizontal Category Chips -->
              <div style="display:flex; gap:8px; overflow-x:auto; padding:14px 14px 6px; -webkit-overflow-scrolling:touch; scrollbar-width:none">
                ${phChipsHtml}
              </div>

              <!-- Product Cards List -->
              <div style="display:flex; flex-direction:column; gap:14px; padding:10px 14px 24px">
                ${phProductsHtml}
              </div>
            </div>

            ${phCartHtml}
            ${phSheetHtml}

            ${ph.msg ? `
              <div style="position:absolute; left:14px; right:14px; top:46px; z-index:50; background:#14171F; color:#fff; font-size:11px; border-radius:12px; padding:10px 12px; text-align:center; box-shadow:0 8px 24px rgba(0,0,0,0.3)">
                ${ph.msg}
              </div>
            ` : ''}

            <!-- Bottom Floating Navigation Bar (Perfil - Inicio.png) -->
            <div class="phone-nav-bar" style="position:absolute; left:10px; right:10px; bottom:10px; height:56px; border-radius:28px; background:#fff; box-shadow:0 4px 20px rgba(20,23,31,0.12); border:1px solid #ECEEF2; display:flex; align-items:center; justify-content:space-around; z-index:35">
              <div class="phone-nav-btn" style="color:${ph.view === 'home' && !selProd ? '#FF5B00' : '#8F95A3'}; position:relative" onclick="window.__mepedeStore.setPhone({ view: 'home', pid: null })">
                ${ph.view === 'home' && !selProd ? '<span style="position:absolute; top:-8px; width:22px; height:3px; border-radius:2px; background:#FF5B00"></span>' : ''}
                <svg width="19" height="19" viewBox="0 0 24 24" fill="${ph.view === 'home' && !selProd ? '#FF5B00' : 'none'}" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <span style="font-size:9.5px; font-weight:${ph.view === 'home' && !selProd ? '700' : '500'}">Início</span>
              </div>
              <div class="phone-nav-btn" style="color:${ph.view === 'cart' ? '#FF5B00' : '#8F95A3'}; position:relative" onclick="window.__mepedeStore.setPhone({ view: 'cart', pid: null })">
                ${ph.view === 'cart' ? '<span style="position:absolute; top:-8px; width:22px; height:3px; border-radius:2px; background:#FF5B00"></span>' : ''}
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                <span style="font-size:9.5px; font-weight:${ph.view === 'cart' ? '700' : '500'}">Carrinho</span>
                ${ph.cart.length ? `<span style="position:absolute; top:-4px; left:52%; min-width:15px; height:15px; border-radius:8px; background:#FF5B00; color:#fff; font-size:8.5px; font-weight:700; display:flex; align-items:center; justify-content:center; padding:0 3px">${ph.cart.reduce((a, c) => a + c.qty, 0)}</span>` : ''}
              </div>
              <div class="phone-nav-btn" style="color:#8F95A3; position:relative">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span style="font-size:9.5px; font-weight:500">Perfil</span>
              </div>
            </div>
          </div>
        </div>

        <div style="width:320px; font-size:11px; color:var(--gray-400); text-align:center; margin-top:12px">
          Tudo o que você edita aparece aqui na hora — toque para testar como o cliente.
        </div>
      </section>
    `;

    // Renderiza o esqueleto principal
    root.innerHTML = `
      ${sidebarHtml}
      <main class="main-content">
        ${headerHtml}
        <div class="scrollable-body">
          ${bodyHtml}
        </div>
      </main>
      ${phoneSectionHtml}
    `;

    // Renderiza Drawers e Modais
    renderDrawersAndModals(modalRoot);

    // Atualiza spotlight e anel pulsante com rastreamento contínuo
    startTutorialTracking();

    if (activeId) {
      const restored = document.getElementById(activeId);
      if (restored && typeof restored.focus === 'function') {
        restored.focus();
        if (typeof selStart === 'number' && typeof selEnd === 'number') {
          try { restored.setSelectionRange(selStart, selEnd); } catch (e) {}
        }
      }
    }
  }

  // Drawers de Edição
  function renderDrawersAndModals(container) {
    const wasDrawerOpen = !!container.querySelector('.drawer-content');
    const S = store;
    const data = S.data;
    let html = '';

    // Toast
    if (S.toast) {
      html += `
        <div class="toast-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" stroke-width="2.6" stroke-linecap="round"><path d="M20 6 9 17l-5-5"></path></svg>
          <span>${S.toast.msg}</span>
          ${S.toast.undo ? `<span onclick="window.__mepedeStore.undo()" style="color:#FF9A5C; font-weight:600; cursor:pointer">Desfazer</span>` : ''}
        </div>
      `;
    }

    // Modal QR Code
    if (S.qrOpen) {
      const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=8&data=' + encodeURIComponent('https://mepede.ai/' + (data.store.slug || ''));
      html += `
        <div class="modal-overlay" onclick="window.__mepedeStore.qrOpen = false; window.__mepedeStore.notify()">
          <div class="modal-box" onclick="event.stopPropagation()">
            <img src="${qrUrl}" alt="QR Code do Foodtruck" width="220" height="220" style="display:block; margin:0 auto; border-radius:12px; border:1px solid var(--gray-100)">
            <div style="font-size:16px; font-weight:600; margin-top:16px">QR Code do seu cardápio</div>
            <div style="font-size:13px; color:var(--gray-500); margin-top:4px">Imprima e cole nas mesas ou no balcão do foodtruck.</div>
            <div style="display:flex; gap:10px; margin-top:20px">
              <button class="btn-outline" style="flex:1" onclick="window.__mepedeStore.qrOpen = false; window.__mepedeStore.notify()">Fechar</button>
              <a href="${qrUrl}" target="_blank" download="qrcode-cardapio.png" class="btn-orange" style="flex:1; justify-content:center">Baixar imagem</a>
            </div>
          </div>
        </div>
      `;
    }

    // Modal de Pedido Finalizado (Simulação de WhatsApp)
    if (S.orderModalOpen) {
      const cart = S.ph.cart;
      const sub = cart.reduce((a, c) => a + c.total, 0);
      const fee = data.store.fee || 0;
      const discount = S.ph.discountVal || 0;
      const service = cart.length ? 0.99 : 0;
      const total = Math.max(0, sub + fee + service - discount);

      let msgWhats = `*Novo Pedido - ${data.store.name}*\n`;
      msgWhats += `-------------------------------\n`;
      cart.forEach(item => {
        msgWhats += `${item.qty}x ${item.name} (${money(item.total)})\n`;
        if (item.detail && item.detail !== 'Sem adicionais') {
          msgWhats += `   ${item.detail}\n`;
        }
      });
      msgWhats += `-------------------------------\n`;
      msgWhats += `Subtotal: ${money(sub)}\n`;
      msgWhats += `Entrega: ${fee ? money(fee) : 'Grátis'}\n`;
      msgWhats += `Taxa de serviço: ${money(service)}\n`;
      if (discount) msgWhats += `Cupom (${S.ph.coupon || 'PROMO'}): -${money(discount)}\n`;
      msgWhats += `*Total: ${money(total)}*\n`;
      msgWhats += `Forma de pagamento: PIX (Aprovação automática)\n`;

      html += `
        <div class="modal-overlay" onclick="window.__mepedeStore.finishTourFromModal()">
          <div class="modal-box" style="width:450px; text-align:left; position:relative" onclick="event.stopPropagation()">
            <div onclick="window.__mepedeStore.finishTourFromModal()" style="position:absolute; top:16px; right:16px; width:30px; height:30px; border-radius:15px; background:#F6F7F9; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#8F95A3; font-weight:700" title="Fechar">✕</div>

            <div style="display:flex; align-items:center; gap:10px">
              <div style="width:38px; height:38px; border-radius:19px; background:#E8F7EE; color:var(--green); display:flex; align-items:center; justify-content:center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"></path></svg>
              </div>
              <div>
                <div style="font-size:17px; font-weight:700; color:#14171F">Simulação de Pedido</div>
                <div style="font-size:11px; color:#8F95A3">Pedido pronto para entrega e WhatsApp</div>
              </div>
            </div>

            <div style="background:linear-gradient(135deg, #FFF1E8 0%, #FFE7D6 100%); border:1px solid #FFD2B5; border-radius:14px; padding:12px 14px; margin-top:14px; display:flex; align-items:center; gap:10px">
              <span style="font-size:24px">🎉</span>
              <div style="flex:1">
                <div style="font-size:13px; font-weight:700; color:#E85700">Tour Guiado Concluído!</div>
                <div style="font-size:11px; color:var(--gray-700)">Você montou o cardápio e concluiu a experiência do cliente de ponta a ponta!</div>
              </div>
            </div>

            <!-- Badge Forma de Pagamento Pix -->
            <div style="background:#FFFFFF; border:1.5px solid #00B368; border-radius:12px; padding:10px 14px; margin-top:12px; display:flex; align-items:center; justify-content:space-between">
              <div style="display:flex; align-items:center; gap:8px">
                <span style="font-size:16px">⚡</span>
                <span style="font-size:12px; font-weight:700; color:#14171F">Pagamento via Pix</span>
              </div>
              <span style="background:#E8F7EE; color:#00B368; font-size:10.5px; font-weight:800; padding:3px 8px; border-radius:6px">Aprovação Automática</span>
            </div>

            <div style="background:#F6F7F9; border:1px solid #ECEEF2; border-radius:12px; padding:14px; margin-top:12px; font-size:11.5px; line-height:1.6; max-height:200px; overflow-y:auto; white-space:pre-wrap; font-family:monospace">
${msgWhats}
            </div>

            <div style="font-size:11.5px; color:var(--gray-500); margin-top:10px">
              O cliente envia esse pedido formatado automaticamente para o seu WhatsApp!
            </div>

            <div style="display:flex; gap:10px; margin-top:18px">
              <button id="tut-btn-finish-tour" class="btn-orange" style="flex:1.2; justify-content:center; font-size:13px; font-weight:700; height:44px; box-shadow:0 4px 14px rgba(255,88,0,0.35); border-radius:12px" onclick="window.__mepedeStore.finishTourFromModal()">
                Fechar e Concluir Tour
              </button>
              <button class="btn-whatsapp" style="flex:1; justify-content:center; font-size:12.5px; height:44px; border-radius:12px" onclick="window.open('https://wa.me/?text=' + encodeURIComponent(\`${msgWhats}\`), '_blank'); window.__mepedeStore.finishTourFromModal()">
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      `;
    }

    // Modal de Documentação "O que mudou no painel: Antes e Depois"
    if (S.docModalOpen) {
      html += `
        <div class="modal-overlay" style="z-index:99999; background:rgba(15,23,42,0.65); backdrop-filter:blur(5px); padding:20px; display:flex; align-items:center; justify-content:center" onclick="window.__mepedeStore.closeDocModal()">
          <div class="modal-box" style="width:1040px; max-width:96vw; max-height:92vh; padding:0; display:flex; flex-direction:column; overflow:hidden; border-radius:24px; box-shadow:0 25px 60px rgba(0,0,0,0.35); text-align:left; background:#F8F9FA" onclick="event.stopPropagation()">
            <!-- Topbar Modal Header -->
            <div style="flex:none; display:flex; align-items:center; justify-content:space-between; padding:20px 28px; background:#fff; border-bottom:1px solid #ECEEF2">
              <div>
                <div style="font-size:12px; font-weight:700; color:#FF6100; text-transform:uppercase; letter-spacing:0.5px">mepede.ai · Painel de Cardápio · Redesign 2026</div>
                <div style="font-size:22px; font-weight:800; color:#14171F; margin-top:2px">O que mudou no painel: Antes e Depois</div>
              </div>
              <div style="display:flex; align-items:center; gap:10px">
                <a href="documentacao.html" target="_blank" class="btn-outline" style="height:36px; padding:0 14px; font-size:12px; font-weight:600; display:inline-flex; align-items:center; gap:6px; text-decoration:none; color:var(--dark)">
                  <span>Abrir em tela cheia</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
                <div onclick="window.__mepedeStore.closeDocModal()" style="width:36px; height:36px; border-radius:18px; border:1px solid #ECEEF2; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#6B7280; font-size:16px; font-weight:700; transition:all .15s ease" title="Fechar (Esc)">✕</div>
              </div>
            </div>

            <!-- Scrollable Content Body -->
            <div style="flex:1; overflow-y:auto; padding:28px; display:flex; flex-direction:column; gap:20px">
              <!-- Intro Banner -->
              <div style="background:#fff; border:1px solid #ECEEF2; border-radius:20px; padding:22px 24px">
                <p style="font-size:14px; color:#4A5160; line-height:1.6; margin:0">
                  O cardápio mobile ficou igual. O painel foi completamente refeito para o dono do foodtruck montar o cardápio sem se perder: menos telas, menos janelas e prévia interativa ao vivo no celular em tempo real.
                </p>
              </div>

              <!-- Stats Grid -->
              <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:12px">
                <div style="background:#fff; border:1px solid #ECEEF2; border-radius:16px; padding:18px">
                  <div style="font-size:28px; font-weight:700; color:#FF6100; line-height:1.1">6 → 1</div>
                  <div style="font-size:12.5px; color:#555A68; margin-top:4px">telas para criar um produto (tipo + 4–5 etapas → formulário único com rolagem)</div>
                </div>
                <div style="background:#fff; border:1px solid #ECEEF2; border-radius:16px; padding:18px">
                  <div style="font-size:28px; font-weight:700; color:#FF6100; line-height:1.1">0</div>
                  <div style="font-size:12.5px; color:#555A68; margin-top:4px">janelas por cima de janelas (antes: modal sobreposto por gaveta lateral)</div>
                </div>
                <div style="background:#fff; border:1px solid #ECEEF2; border-radius:16px; padding:18px">
                  <div style="font-size:28px; font-weight:700; color:#FF6100; line-height:1.1">Sempre</div>
                  <div style="font-size:12.5px; color:#555A68; margin-top:4px">prévia do celular visível e interativa, inclusive durante a edição do lanche</div>
                </div>
                <div style="background:#fff; border:1px solid #ECEEF2; border-radius:16px; padding:18px">
                  <div style="font-size:28px; font-weight:700; color:#FF6100; line-height:1.1">Desfazer</div>
                  <div style="font-size:12.5px; color:#555A68; margin-top:4px">em toda exclusão, no lugar de modais punitivos de “não pode ser desfeito”</div>
                </div>
              </div>

              <!-- 01 ESTRUTURA -->
              <section style="background:#fff; border:1px solid #ECEEF2; border-radius:20px; padding:24px; display:grid; grid-template-columns:minmax(0,320px) minmax(0,1fr); gap:24px; align-items:start">
                <div>
                  <img src="assets/ref/tela-inicial.png" alt="Tela original: Cardápio Digital" style="width:100%; border-radius:12px; border:1px solid #ECEEF2; display:block">
                </div>
                <div>
                  <div style="font-size:11.5px; font-weight:700; color:#8A91A0; letter-spacing:.5px">01 · ESTRUTURA</div>
                  <h2 style="font-size:18px; font-weight:700; margin:4px 0 12px; color:#14171F">Uma tela de trabalho, não uma lista de cardápios</h2>
                  <div style="display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:700; color:#E5352B; background:#FEECEB; padding:2px 8px; border-radius:6px; margin-bottom:4px">✕ Antes</div>
                  <ul style="margin:4px 0 14px; padding-left:18px; font-size:13px; color:#555A68; line-height:1.6">
                    <li>Entrar em “Cardápio Digital”, depois abrir o cardápio, depois escolher entre 4–5 abas desconexas.</li>
                    <li>Link, QR Code e WhatsApp ficavam restritos apenas à primeira tela.</li>
                    <li>Botão “Novo Cardápio” desabilitado sem explicação do motivo.</li>
                  </ul>
                  <div style="display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:700; color:#12A150; background:#E6F7EC; padding:2px 8px; border-radius:6px; margin-bottom:4px">✓ Agora</div>
                  <ul style="margin:4px 0 0; padding-left:18px; font-size:13px; color:#2D313A; line-height:1.6">
                    <li>Abre direto no cardápio de trabalho. As abas viraram o menu lateral principal: <b>Cardápio</b>, <b>Complementos</b>, <b>Loja e link</b>.</li>
                    <li>Link com 1-clique para copiar, QR Code instantâneo e botão WhatsApp fixos no topo em qualquer tela.</li>
                    <li>Interruptor “Loja aberta / fechada” direto no menu lateral — reflete no smartphone no mesmo segundo.</li>
                    <li>Checklist com progresso visual clicável: cada etapa pendente leva direto à ação correspondente.</li>
                  </ul>
                </div>
              </section>

              <!-- 02 CATEGORIAS E PRODUTOS -->
              <section style="background:#fff; border:1px solid #ECEEF2; border-radius:20px; padding:24px; display:grid; grid-template-columns:minmax(0,320px) minmax(0,1fr); gap:24px; align-items:start">
                <div style="display:flex; flex-direction:column; gap:10px">
                  <img src="assets/ref/categorias.png" alt="Tela original: Categorias" style="width:100%; border-radius:12px; border:1px solid #ECEEF2; display:block">
                  <img src="assets/ref/todos-produtos.png" alt="Tela original: Todos os produtos" style="width:100%; border-radius:12px; border:1px solid #ECEEF2; display:block">
                </div>
                <div>
                  <div style="font-size:11.5px; font-weight:700; color:#8A91A0; letter-spacing:.5px">02 · CATEGORIAS E PRODUTOS</div>
                  <h2 style="font-size:18px; font-weight:700; margin:4px 0 12px; color:#14171F">Categorias e produtos unificados na mesma tela</h2>
                  <div style="display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:700; color:#E5352B; background:#FEECEB; padding:2px 8px; border-radius:6px; margin-bottom:4px">✕ Antes</div>
                  <ul style="margin:4px 0 14px; padding-left:18px; font-size:13px; color:#555A68; line-height:1.6">
                    <li>Duas abas separadas (“Categorias” e “Todos os produtos”) para gerenciar os mesmos dados.</li>
                    <li>Lista em tabela fria, sem fotos grandes — difícil identificar itens sem imagem ou sem descrição.</li>
                    <li>Prévia do celular estática e presente apenas na aba Categorias.</li>
                  </ul>
                  <div style="display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:700; color:#12A150; background:#E6F7EC; padding:2px 8px; border-radius:6px; margin-bottom:4px">✓ Agora</div>
                  <ul style="margin:4px 0 0; padding-left:18px; font-size:13px; color:#2D313A; line-height:1.6">
                    <li>Barra de categorias em chips dinâmicos (“Todos” + cada categoria com contagem e status). Clicar filtra os produtos na grade e navega o celular simultaneamente.</li>
                    <li>Produtos em cards modernos com foto grande, preço, desconto, complementos e interruptor “Visível”.</li>
                    <li>Itens sem foto ganham botão de destaque “Adicionar foto”; itens sem categoria avisam com clareza que estão ocultos do cliente.</li>
                    <li>Reordenação intuitiva de categorias (← →), busca instantânea e produto associável a múltiplas categorias.</li>
                  </ul>
                </div>
              </section>

              <!-- 03 CRIAR CATEGORIA -->
              <section style="background:#fff; border:1px solid #ECEEF2; border-radius:20px; padding:24px; display:grid; grid-template-columns:minmax(0,320px) minmax(0,1fr); gap:24px; align-items:start">
                <div style="display:flex; flex-direction:column; gap:10px">
                  <img src="assets/ref/criar-categoria.png" alt="Tela original: Nova categoria" style="width:100%; border-radius:12px; border:1px solid #ECEEF2; display:block">
                  <img src="assets/ref/excluir-categoria.png" alt="Tela original: Excluir categoria" style="width:100%; border-radius:12px; border:1px solid #ECEEF2; display:block">
                </div>
                <div>
                  <div style="font-size:11.5px; font-weight:700; color:#8A91A0; letter-spacing:.5px">03 · CRIAR CATEGORIA</div>
                  <h2 style="font-size:18px; font-weight:700; margin:4px 0 12px; color:#14171F">Criar categoria em um passo simplificado</h2>
                  <div style="display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:700; color:#E5352B; background:#FEECEB; padding:2px 8px; border-radius:6px; margin-bottom:4px">✕ Antes</div>
                  <ul style="margin:4px 0 14px; padding-left:18px; font-size:13px; color:#555A68; line-height:1.6">
                    <li>Modal burocrático com nome + 3 opções de disponibilidade já no primeiro instante.</li>
                    <li>“Não disponível no momento” duplicava a função do interruptor “Ativar”.</li>
                    <li>Exclusão bloqueava a tela com mensagem intimidadora de “Essa ação não pode ser desfeita”.</li>
                  </ul>
                  <div style="display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:700; color:#12A150; background:#E6F7EC; padding:2px 8px; border-radius:6px; margin-bottom:4px">✓ Agora</div>
                  <ul style="margin:4px 0 0; padding-left:18px; font-size:13px; color:#2D313A; line-height:1.6">
                    <li>“+ Nova categoria”: digite o nome e aperte Enter. No cardápio vazio, sugestões inteligentes de 1 clique (Lanches, Bebidas, Combos, Sobremesas).</li>
                    <li>Horários de atendimento configurados em aba dedicada: <b>Sempre</b> ou <b>Dias e horários</b> com status em tempo real.</li>
                    <li>Exclusão simplificada que mantém os produtos salvos e permite <b>Desfazer</b> imediatamente via toast.</li>
                  </ul>
                </div>
              </section>

              <!-- 04 CRIAR PRODUTO -->
              <section style="background:#fff; border:1px solid #ECEEF2; border-radius:20px; padding:24px; display:grid; grid-template-columns:minmax(0,320px) minmax(0,1fr); gap:24px; align-items:start">
                <div style="display:flex; flex-direction:column; gap:10px">
                  <img src="assets/ref/tipo-produto.png" alt="Tela original: Tipo de produto" style="width:100%; border-radius:12px; border:1px solid #ECEEF2; display:block">
                  <img src="assets/ref/wizard-dados.png" alt="Tela original: Etapas do produto" style="width:100%; border-radius:12px; border:1px solid #ECEEF2; display:block">
                </div>
                <div>
                  <div style="font-size:11.5px; font-weight:700; color:#8A91A0; letter-spacing:.5px">04 · CRIAR PRODUTO</div>
                  <h2 style="font-size:18px; font-weight:700; margin:4px 0 12px; color:#14171F">De assistente em etapas para formulário com prévia ao vivo</h2>
                  <div style="display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:700; color:#E5352B; background:#FEECEB; padding:2px 8px; border-radius:6px; margin-bottom:4px">✕ Antes</div>
                  <ul style="margin:4px 0 14px; padding-left:18px; font-size:13px; color:#555A68; line-height:1.6">
                    <li>Obrigatoriedade de escolher “Simples” ou “Com variação” antes de tudo — mudando arbitrariamente o número de passos (3 ou 4 etapas).</li>
                    <li>Navegação de vai-e-volta entre etapas; o resultado final só podia ser conferido ao salvar.</li>
                    <li>Modal centralizado cobria completamente a tela do celular.</li>
                  </ul>
                  <div style="display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:700; color:#12A150; background:#E6F7EC; padding:2px 8px; border-radius:6px; margin-bottom:4px">✓ Agora</div>
                  <ul style="margin:4px 0 0; padding-left:18px; font-size:13px; color:#2D313A; line-height:1.6">
                    <li>Gaveta lateral elegante com 4 seções contínuas: <b>Básico</b>, <b>Preço</b>, <b>Complementos</b> e <b>Visibilidade</b>.</li>
                    <li>Tipo de produto simplificado: <b>Preço único</b> ou <b>Varia por tamanho/tipo</b> alternável com 1 clique a qualquer instante.</li>
                    <li>Prévia imediata no smartphone: a foto, selo/destaque, preço e complementos são renderizados no iPhone ao vivo conforme você digita.</li>
                    <li>Cálculo automático de porcentagem de desconto com base no preço de comparação.</li>
                    <li>Validação visual amigável que aponta exatamente os campos pendentes.</li>
                  </ul>
                </div>
              </section>

              <!-- 05 COMPLEMENTOS -->
              <section style="background:#fff; border:1px solid #ECEEF2; border-radius:20px; padding:24px; display:grid; grid-template-columns:minmax(0,320px) minmax(0,1fr); gap:24px; align-items:start">
                <div style="display:flex; flex-direction:column; gap:10px">
                  <img src="assets/ref/wizard-complemento.png" alt="Tela original: Criar complemento" style="width:100%; border-radius:12px; border:1px solid #ECEEF2; display:block">
                  <img src="assets/ref/grupos.png" alt="Tela original: Grupo de complementos" style="width:100%; border-radius:12px; border:1px solid #ECEEF2; display:block">
                </div>
                <div>
                  <div style="font-size:11.5px; font-weight:700; color:#8A91A0; letter-spacing:.5px">05 · COMPLEMENTOS</div>
                  <h2 style="font-size:18px; font-weight:700; margin:4px 0 12px; color:#14171F">Complementos sem janela dentro de janela</h2>
                  <div style="display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:700; color:#E5352B; background:#FEECEB; padding:2px 8px; border-radius:6px; margin-bottom:4px">✕ Antes</div>
                  <ul style="margin:4px 0 14px; padding-left:18px; font-size:13px; color:#555A68; line-height:1.6">
                    <li>Criar uma opção abria um painel lateral empilhado em cima do modal do produto.</li>
                    <li>Terminologia técnica fria (“Qtde mínima / máxima”) sem clareza do que o cliente leria.</li>
                    <li>Lista interminável de complementos misturados.</li>
                  </ul>
                  <div style="display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:700; color:#12A150; background:#E6F7EC; padding:2px 8px; border-radius:6px; margin-bottom:4px">✓ Agora</div>
                  <ul style="margin:4px 0 0; padding-left:18px; font-size:13px; color:#2D313A; line-height:1.6">
                    <li>No próprio produto: “Usar da biblioteca” ou “Criar novo grupo” com opções diretas em linhas de nome + valor.</li>
                    <li>Regras em linguagem natural: <b>Opcional / Obrigatório</b> com a frase exata que o cliente lê na tela.</li>
                    <li>Reorganização de ordem com setas e biblioteca centralizada com contagem de produtos vinculados.</li>
                    <li>O smartphone simula as regras fielmente: valida escolhas mínimas e calcula o subtotal instantaneamente.</li>
                  </ul>
                </div>
              </section>

              <!-- 06 VÁRIOS CARDÁPIOS -->
              <section style="background:#fff; border:1px solid #ECEEF2; border-radius:20px; padding:24px; display:grid; grid-template-columns:minmax(0,320px) minmax(0,1fr); gap:24px; align-items:start">
                <div>
                  <img src="assets/ref/tela-inicial.png" alt="Tela original: Lista de cardápios" style="width:100%; border-radius:12px; border:1px solid #ECEEF2; display:block">
                </div>
                <div>
                  <div style="font-size:11.5px; font-weight:700; color:#8A91A0; letter-spacing:.5px">06 · VÁRIOS CARDÁPIOS</div>
                  <h2 style="font-size:18px; font-weight:700; margin:4px 0 12px; color:#14171F">Múltiplos cardápios sem troca de contexto</h2>
                  <div style="display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:700; color:#E5352B; background:#FEECEB; padding:2px 8px; border-radius:6px; margin-bottom:4px">✕ Antes</div>
                  <ul style="margin:4px 0 14px; padding-left:18px; font-size:13px; color:#555A68; line-height:1.6">
                    <li>Tela isolada exclusiva para listagem de cardápios.</li>
                    <li>Falta de transparência sobre qual cardápio ficava visível em cada turno ou dia.</li>
                  </ul>
                  <div style="display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:700; color:#12A150; background:#E6F7EC; padding:2px 8px; border-radius:6px; margin-bottom:4px">✓ Agora</div>
                  <ul style="margin:4px 0 0; padding-left:18px; font-size:13px; color:#2D313A; line-height:1.6">
                    <li>Cards “Seus cardápios” no topo do painel com horário de vigência, status e contagem de itens. Clicar troca o cardápio em edição e a prévia do celular em tempo real.</li>
                    <li>Criação flexível: começar do zero ou duplicar a estrutura de categorias existente.</li>
                    <li>Selo visual indicativo de qual cardápio está no ar agora no link único do foodtruck.</li>
                  </ul>
                </div>
              </section>

              <!-- 07 PRÉVIA E DETALHES -->
              <section style="background:#fff; border:1px solid #ECEEF2; border-radius:20px; padding:24px; display:grid; grid-template-columns:minmax(0,320px) minmax(0,1fr); gap:24px; align-items:start">
                <div>
                  <img src="assets/ref/existente.png" alt="Tela original: Adicionar produto existente" style="width:100%; border-radius:12px; border:1px solid #ECEEF2; display:block">
                </div>
                <div>
                  <div style="font-size:11.5px; font-weight:700; color:#8A91A0; letter-spacing:.5px">07 · PRÉVIA E DETALHES</div>
                  <h2 style="font-size:18px; font-weight:700; margin:4px 0 12px; color:#14171F">Smartphone 100% interativo e simulação real de pedidos</h2>
                  <ul style="margin:4px 0 0; padding-left:18px; font-size:13px; color:#2D313A; line-height:1.6">
                    <li><b>Smartphone funcional:</b> alterne abas, clique no lanche, personalize complementos, ajuste a quantidade, adicione à sacola e simule a finalização de pedido direto para o WhatsApp.</li>
                    <li>Gestão de loja com taxa de entrega, tempo estimado e pedido mínimo refletidos no cabeçalho do smartphone.</li>
                    <li>Suporte completo para iniciar do zero no tour guiado interativo ou restaurar dados de exemplo a qualquer momento.</li>
                  </ul>
                </div>
              </section>
            </div>

            <!-- Modal Footer -->
            <div style="flex:none; padding:16px 28px; background:#fff; border-top:1px solid #ECEEF2; display:flex; justify-content:flex-end; gap:10px">
              <a href="documentacao.html" target="_blank" class="btn-outline" style="height:40px; padding:0 20px; font-size:13px; text-decoration:none; display:inline-flex; align-items:center; gap:6px; color:var(--dark)">
                Abrir em nova aba ↗
              </a>
              <button class="btn-orange" style="height:40px; padding:0 24px; font-size:13px" onclick="window.__mepedeStore.closeDocModal()">
                Entendi, voltar para o painel
              </button>
            </div>
          </div>
        </div>
      `;
    }

    // Drawer de Produto
    if (S.drawer === 'product' && S.draft) {
      const d = S.draft;
      const miss = S.missingFields(d);
      const pr = pm(d.priceStr);
      const orr = pm(d.origStr);
      let discHint = '';
      if (orr > 0 && pr > 0 && orr > pr) {
        discHint = `O cliente verá ${money(orr)} riscado e -${Math.round((1 - pr / orr) * 100)}% de desconto.`;
      }

      const mCats = data.categories.filter(c => c.menuId === S.curMenuId());
      const linkedGroups = d.groupIds.map(id => data.groups.find(g => g.id === id)).filter(Boolean);
      const libGroups = data.groups.filter(g => !d.groupIds.includes(g.id));

      html += `
        <div class="drawer-overlay" onclick="window.__mepedeStore.closeDrawer()"></div>
        <div class="drawer-content">
          <div style="flex:none; padding:22px 28px 0; border-bottom:1px solid var(--gray-100)">
            <div style="display:flex; align-items:flex-start; gap:12px">
              <div style="flex:1; min-width:0">
                <div style="font-size:12px; font-weight:500; color:var(--orange)">${d.id ? 'Editar produto' : 'Novo produto'}</div>
                <div id="drawer-prod-title" style="font-size:22px; font-weight:600; letter-spacing:-0.3px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${d.name || (d.id ? 'Produto' : 'Novo produto')}</div>
              </div>
              <div onclick="window.__mepedeStore.closeDrawer()" style="width:36px; height:36px; border-radius:18px; border:1px solid var(--gray-100); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--gray-700)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>
              </div>
            </div>
          </div>

          <div id="drawer-scroll" style="flex:1; overflow-y:auto; padding:24px 28px 32px; display:flex; flex-direction:column; gap:24px">
            <div id="tut-quickfill-product" onclick="
              window.__mepedeStore.draft.name = 'X-Burguer Clássico + Coca-cola Zero';
              window.__mepedeStore.draft.desc = 'Blend 180g, queijo cheddar, alface, tomate e maionese da casa';
              window.__mepedeStore.draft.priceStr = '32,90';
              window.__mepedeStore.draft.origStr = '49,90';
              window.__mepedeStore.draft.img = 'assets/burger.png';
              window.__mepedeStore.draft.badge = 'mais pedido';
              window.__mepedeStore.draft.groupIds = ['g0', 'g2'];
              if (!window.__mepedeStore.draft.catIds.length && window.__mepedeStore.data.categories.length) {
                window.__mepedeStore.draft.catIds = [window.__mepedeStore.data.categories[0].id];
              }
              window.__mepedeStore.notify();
              window.__mepedeStore.setToast('✨ Dados do burger preenchidos com sucesso!');
              if (window.__mepedeStore.tutorialStep === 5) window.__mepedeStore.nextTutorial();
            " style="background:#FFF1E8; border:1.5px dashed #FF6100; border-radius:14px; padding:12px 16px; display:flex; align-items:center; gap:12px; cursor:pointer">
              <div style="font-size:22px">✨</div>
              <div style="flex:1">
                <div style="font-size:13px; font-weight:700; color:#E85700">Preencher Burger Artesanal (Auto-preenchimento)</div>
                <div style="font-size:11px; color:var(--gray-700)">Adiciona foto, nome, ingredientes, valor e desconto de -50% automaticamente.</div>
              </div>
              <button class="btn-orange" style="height:32px; padding:0 12px; font-size:12px">Preencher agora</button>
            </div>

            <!-- Básico -->
            <div style="display:flex; flex-direction:column; gap:18px">
              <div style="display:grid; grid-template-columns:150px 1fr; gap:20px">
                <div style="display:flex; flex-direction:column; gap:8px">
                  <span style="font-size:13px; font-weight:500">Foto</span>
                  ${d.img ? `
                    <img src="${d.img}" alt="" style="width:150px; height:150px; border-radius:14px; object-fit:cover; display:block">
                    <div style="display:flex; gap:6px">
                      <label style="flex:1; height:32px; border:1px solid var(--gray-200); border-radius:8px; font-size:12px; font-weight:500; display:flex; align-items:center; justify-content:center; cursor:pointer">
                        Trocar
                        <input type="file" accept="image/*" style="display:none" onchange="
                          const f = this.files[0];
                          if(f) {
                            const r = new FileReader();
                            r.onload = e => { window.__mepedeStore.draft.img = e.target.result; window.__mepedeStore.notify(); };
                            r.readAsDataURL(f);
                          }
                        ">
                      </label>
                      <div onclick="window.__mepedeStore.draft.img = ''; window.__mepedeStore.notify()" style="width:32px; height:32px; border:1px solid var(--gray-200); border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--red)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"></path></svg>
                      </div>
                    </div>
                  ` : `
                    <label style="width:150px; height:150px; border:1.5px dashed var(--orange-border); border-radius:14px; background:var(--orange-light); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; cursor:pointer; color:var(--orange-hover); text-align:center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"></path><circle cx="12" cy="13" r="3.5"></circle></svg>
                      <span style="font-size:13px; font-weight:600">Enviar foto</span>
                      <span style="font-size:11px; color:var(--gray-400)">Produtos com foto<br>vendem mais</span>
                      <input type="file" accept="image/*" style="display:none" onchange="
                        const f = this.files[0];
                        if(f) {
                          const r = new FileReader();
                          r.onload = e => { window.__mepedeStore.draft.img = e.target.result; window.__mepedeStore.notify(); };
                          r.readAsDataURL(f);
                        }
                      ">
                    </label>
                  `}
                  <div style="font-size:11px; color:var(--gray-400); margin-top:2px">Ou escolha do banco:</div>
                  <div class="preset-photos">
                    ${PRESET_PHOTOS.map(ph => `
                      <img src="${ph.url}" title="${ph.name}" class="preset-photo-item" onclick="window.__mepedeStore.draft.img = '${ph.url}'; window.__mepedeStore.notify()">
                    `).join('')}
                  </div>
                </div>

                <div style="display:flex; flex-direction:column; gap:14px">
                  <label style="display:flex; flex-direction:column; gap:6px">
                    <span style="font-size:13px; font-weight:500">Nome do produto <span style="color:#FF6100">*</span></span>
                    <input id="input-draft-name" value="${d.name}" oninput="window.__mepedeStore.draft.name = this.value; const t = document.getElementById('drawer-prod-title'); if(t) t.textContent = this.value || 'Novo produto';" placeholder="Ex: X-Burguer Clássico" style="height:44px; padding:0 14px; border:1px solid ${d.tried && !d.name.trim() ? '#E5352B' : 'var(--gray-200)'}; border-radius:10px; font-size:14px; outline:none">
                  </label>

                  <label style="display:flex; flex-direction:column; gap:6px">
                    <span style="font-size:13px; font-weight:500; display:flex">
                      <span style="flex:1">Descrição</span>
                      <span id="draft-desc-cnt" style="font-weight:400; color:var(--gray-400); font-size:12px">${d.desc.length}/160</span>
                    </span>
                    <textarea id="input-draft-desc" maxlength="160" oninput="window.__mepedeStore.draft.desc = this.value; const c = document.getElementById('draft-desc-cnt'); if(c) c.textContent = this.value.length + '/160';" placeholder="Ingredientes e diferenciais. Ex: Blend 180g, cheddar e bacon" style="height:84px; padding:12px 14px; border:1px solid var(--gray-200); border-radius:10px; font-size:14px; outline:none; resize:none">${d.desc}</textarea>
                  </label>
                </div>
              </div>

              <!-- Categorias -->
              <div style="display:flex; flex-direction:column; gap:8px">
                <span style="font-size:13px; font-weight:500">Em quais categorias aparece? <span style="color:#FF6100">*</span></span>
                <div style="display:flex; gap:8px; flex-wrap:wrap">
                  ${mCats.map(c => {
                    const isChecked = d.catIds.includes(c.id);
                    return `
                      <div onclick="
                        const ids = window.__mepedeStore.draft.catIds;
                        window.__mepedeStore.draft.catIds = ids.includes('${c.id}') ? ids.filter(x => x !== '${c.id}') : ids.concat('${c.id}');
                        window.__mepedeStore.notify();
                      " style="display:flex; align-items:center; gap:6px; height:36px; padding:0 14px; border-radius:18px; border:1px solid ${isChecked ? '#FF6100' : 'var(--gray-200)'}; background:${isChecked ? '#FFF1E8' : '#fff'}; color:${isChecked ? '#C24A00' : 'var(--gray-700)'}; font-size:13px; font-weight:500; cursor:pointer">
                        ${isChecked ? '✓ ' : ''}${c.name}
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Destaques -->
              <div style="display:flex; flex-direction:column; gap:10px; padding:16px 0 8px; border-top:1px solid var(--gray-100)">
                <div style="display:flex; justify-content:space-between; align-items:center">
                  <div>
                    <span style="font-size:13.5px; font-weight:600; color:#14171F">Selo de destaque no produto</span>
                    <span style="color:var(--gray-400); font-weight:400; font-size:12px; margin-left:4px">opcional</span>
                  </div>
                  ${d.badge ? `
                    <button type="button" onclick="window.__mepedeStore.draft.badge = ''; window.__mepedeStore.notify()" style="background:none; border:none; color:var(--red); font-size:12px; cursor:pointer; font-weight:500; display:inline-flex; align-items:center; gap:4px; text-decoration:none">
                      <span>✕ Remover selo</span>
                    </button>
                  ` : ''}
                </div>

                <div style="display:flex; align-items:center; gap:10px">
                  <select id="select-draft-badge" onchange="window.__mepedeStore.draft.badge = this.value; window.__mepedeStore.notify()" style="flex:1; height:42px; padding:0 12px; border:1px solid var(--gray-200); border-radius:10px; font-size:13.5px; background:#fff; outline:none; color:var(--dark); cursor:pointer">
                    <option value="">Sem selo (nenhum destaque)</option>
                    ${PRODUCT_TAGS.map(t => {
                      const isSelected = d.badge && (d.badge.toLowerCase() === t.label.toLowerCase() || d.badge === t.id);
                      return `<option value="${t.label}" ${isSelected ? 'selected' : ''}>${t.emoji} ${t.label}</option>`;
                    }).join('')}
                  </select>
                  ${d.badge ? `
                    <div style="flex:none">
                      ${renderBadgeHtml(d.badge, 'font-size:12px; padding:5px 12px; border-radius:12px')}
                    </div>
                  ` : ''}
                </div>

                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap">
                  <span style="font-size:11.5px; color:var(--gray-400)">Sugestões rápidas:</span>
                  ${[
                    { label: 'mais pedido', emoji: '🔥' },
                    { label: 'promoção', emoji: '🎉' },
                    { label: 'Novidade', emoji: '✨' },
                    { label: 'O Queridinho', emoji: '😇' }
                  ].map(sug => {
                    const isSel = d.badge && (d.badge.toLowerCase() === sug.label.toLowerCase());
                    return `
                      <button type="button" onclick="window.__mepedeStore.draft.badge = '${isSel ? '' : sug.label}'; window.__mepedeStore.notify()" style="height:28px; padding:0 10px; border-radius:14px; border:1px solid ${isSel ? '#FF6100' : 'var(--gray-200)'}; background:${isSel ? '#FFF1E8' : '#fff'}; color:${isSel ? '#E85700' : 'var(--gray-700)'}; font-size:11.5px; font-weight:${isSel ? '700' : '500'}; cursor:pointer; display:inline-flex; align-items:center; gap:4px; transition:all .15s ease">
                        <span>${sug.emoji}</span>
                        <span>${sug.label}</span>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Serve até -->
              <div style="display:flex; flex-direction:column; gap:8px">
                <label style="display:flex; flex-direction:column; gap:8px; max-width:240px">
                  <span style="font-size:13px; font-weight:500">Serve até</span>
                  <select onchange="window.__mepedeStore.draft.serves = this.value; window.__mepedeStore.notify()" style="height:40px; padding:0 10px; border:1px solid var(--gray-200); border-radius:10px; font-size:13px; background:#fff; outline:none">
                    <option value="" ${!d.serves ? 'selected' : ''}>Não se aplica</option>
                    <option value="1 pessoa" ${d.serves === '1 pessoa' ? 'selected' : ''}>1 pessoa</option>
                    <option value="2 pessoas" ${d.serves === '2 pessoas' ? 'selected' : ''}>2 pessoas</option>
                    <option value="3 pessoas" ${d.serves === '3 pessoas' ? 'selected' : ''}>3 pessoas</option>
                    <option value="4 pessoas" ${d.serves === '4 pessoas' ? 'selected' : ''}>4 pessoas</option>
                  </select>
                </label>
              </div>
            </div>

            <!-- Preço -->
            <div style="display:flex; flex-direction:column; gap:14px; padding-top:24px; border-top:1px solid var(--gray-100)">
              <div style="font-size:16px; font-weight:600">Preço</div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
                <div onclick="window.__mepedeStore.draft.type = 'simple'; window.__mepedeStore.notify()" style="padding:14px 16px; border-radius:14px; border:1.5px solid ${d.type === 'simple' ? '#FF6100' : 'var(--gray-200)'}; background:${d.type === 'simple' ? '#FFF6F0' : '#fff'}; cursor:pointer">
                  <div style="font-size:14px; font-weight:600">Preço único</div>
                  <div style="font-size:12px; color:var(--gray-500); margin-top:2px">Ex: X-Burguer, lata de refri</div>
                </div>
                <div onclick="window.__mepedeStore.draft.type = 'var'; window.__mepedeStore.notify()" style="padding:14px 16px; border-radius:14px; border:1.5px solid ${d.type === 'var' ? '#FF6100' : 'var(--gray-200)'}; background:${d.type === 'var' ? '#FFF6F0' : '#fff'}; cursor:pointer">
                  <div style="font-size:14px; font-weight:600">Varia por tamanho/tipo</div>
                  <div style="font-size:12px; color:var(--gray-500); margin-top:2px">Ex: Açaí 300/500ml, Pizza P/M/G</div>
                </div>
              </div>

              ${d.type === 'simple' ? `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px">
                  <label style="display:flex; flex-direction:column; gap:6px">
                    <span style="font-size:13px; font-weight:500">Preço de venda <span style="color:#FF6100">*</span></span>
                    <div style="display:flex; align-items:center; height:44px; border:1px solid ${d.tried && pr <= 0 ? '#E5352B' : 'var(--gray-200)'}; border-radius:10px; padding:0 14px; gap:6px; background:#fff">
                      <span style="font-size:14px; font-weight:600; color:var(--gray-700)">R$</span>
                      <input id="input-draft-price" value="${d.priceStr}" oninput="this.value = window.__mepedeStore.cleanMoneyStr(this.value); window.__mepedeStore.draft.priceStr = this.value; window.__mepedeStore.updatePriceHint();" onblur="this.value = window.__mepedeStore.formatMoneyBlur(this.value); window.__mepedeStore.draft.priceStr = this.value; window.__mepedeStore.updatePriceHint();" inputmode="decimal" placeholder="0,00" style="flex:1; min-width:0; border:none; outline:none; font-size:14px">
                    </div>
                  </label>
                  <label style="display:flex; flex-direction:column; gap:6px">
                    <span style="font-size:13px; font-weight:500">Preço antes <span style="color:var(--gray-400); font-weight:400">riscado</span></span>
                    <div style="display:flex; align-items:center; height:44px; border:1px solid var(--gray-200); border-radius:10px; padding:0 14px; gap:6px; background:#fff">
                      <span style="font-size:14px; font-weight:600; color:var(--gray-400)">R$</span>
                      <input id="input-draft-orig" value="${d.origStr}" oninput="this.value = window.__mepedeStore.cleanMoneyStr(this.value); window.__mepedeStore.draft.origStr = this.value; window.__mepedeStore.updatePriceHint();" onblur="this.value = window.__mepedeStore.formatMoneyBlur(this.value); window.__mepedeStore.draft.origStr = this.value; window.__mepedeStore.updatePriceHint();" inputmode="decimal" placeholder="0,00" style="flex:1; min-width:0; border:none; outline:none; font-size:14px">
                    </div>
                  </label>
                </div>
                <div id="drawer-disc-hint" style="font-size:12px; color:var(--green); background:var(--green-light); border-radius:10px; padding:8px 12px; display:${discHint ? 'block' : 'none'}">${discHint}</div>
              ` : `
                <div style="background:#F6F7F9; border-radius:14px; padding:16px; display:flex; flex-direction:column; gap:10px">
                  <label style="display:flex; align-items:center; gap:10px">
                    <span style="font-size:13px; font-weight:500">O cliente escolhe o(a)</span>
                    <input id="input-draft-varname" value="${d.varName}" oninput="window.__mepedeStore.draft.varName = this.value;" placeholder="Tamanho" style="flex:1; height:38px; padding:0 12px; border:1px solid var(--gray-200); border-radius:10px; font-size:14px; outline:none; background:#fff">
                  </label>
                  <div style="display:grid; grid-template-columns:1fr 140px 32px; gap:8px; font-size:12px; color:var(--gray-400); padding:4px 2px 0">
                    <span>Opção</span><span>Preço</span><span></span>
                  </div>
                  ${d.varOpts.map((vr, idx) => `
                    <div style="display:grid; grid-template-columns:1fr 140px 32px; gap:8px; align-items:center">
                      <input id="input-draft-varopt-name-${idx}" value="${vr.name}" oninput="window.__mepedeStore.draft.varOpts[${idx}].name = this.value;" placeholder="Ex: 300ml" style="height:42px; padding:0 12px; border:1px solid var(--gray-200); border-radius:10px; font-size:14px; outline:none; background:#fff">
                      <div style="display:flex; align-items:center; height:42px; border:1px solid var(--gray-200); border-radius:10px; padding:0 12px; gap:6px; background:#fff">
                        <span style="font-size:13px; font-weight:600; color:var(--gray-700)">R$</span>
                        <input id="input-draft-varopt-price-${idx}" value="${vr.priceStr}" oninput="this.value = window.__mepedeStore.cleanMoneyStr(this.value); window.__mepedeStore.draft.varOpts[${idx}].priceStr = this.value;" onblur="this.value = window.__mepedeStore.formatMoneyBlur(this.value); window.__mepedeStore.draft.varOpts[${idx}].priceStr = this.value;" inputmode="decimal" placeholder="0,00" style="flex:1; min-width:0; border:none; outline:none; font-size:14px">
                      </div>
                      <div onclick="if(window.__mepedeStore.draft.varOpts.length > 1){ window.__mepedeStore.draft.varOpts = window.__mepedeStore.draft.varOpts.filter((_,j) => j !== ${idx}); window.__mepedeStore.notify(); }" style="width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--gray-400)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>
                      </div>
                    </div>
                  `).join('')}
                  <div onclick="window.__mepedeStore.draft.varOpts.push({ id: '${uid()}', name: '', priceStr: '' }); window.__mepedeStore.notify()" style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:500; color:var(--orange-hover); cursor:pointer; padding:6px 2px; width:fit-content">
                    <span style="width:20px; height:20px; border-radius:10px; background:var(--orange); color:#fff; display:flex; align-items:center; justify-content:center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg></span>
                    Adicionar opção
                  </div>
                </div>
              `}
            </div>

            <!-- Complementos -->
            <div style="display:flex; flex-direction:column; gap:12px; padding-top:24px; border-top:1px solid var(--gray-100)">
              <div>
                <div style="font-size:16px; font-weight:600">Complementos <span style="font-size:13px; font-weight:400; color:var(--gray-400)">opcional</span></div>
                <div style="font-size:13px; color:var(--gray-500); margin-top:2px">Extras que o cliente escolhe, como adicionais ou ponto da carne.</div>
              </div>

              ${linkedGroups.map((lg, i) => {
                d.expandedGroups = d.expandedGroups || {};
                const isExpanded = d.expandedGroups[lg.id] !== false;
                return `
                  <div style="border:1px solid #ECEEF2; border-radius:14px; background:#fff; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.02)">
                    <div style="display:flex; align-items:center; gap:10px; padding:12px 14px; background:#FAFBFD; border-bottom:${isExpanded ? '1px solid #ECEEF2' : 'none'}">
                      <div style="flex:1; min-width:0">
                        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap">
                          <span style="font-size:14px; font-weight:700; color:#14171F">${lg.name}</span>
                          <span style="height:20px; padding:0 8px; border-radius:10px; background:${lg.min > 0 ? '#FFF1E8' : '#F1F2F5'}; color:${lg.min > 0 ? '#E85700' : '#4A5160'}; font-size:10px; font-weight:700; display:inline-flex; align-items:center">
                            ${lg.min > 0 ? 'OBRIGATÓRIO' : 'OPCIONAL'}
                          </span>
                          <span style="font-size:11.5px; color:var(--gray-500); font-weight:500">(${lg.options.length} ${lg.options.length === 1 ? 'adicional' : 'adicionais'})</span>
                        </div>
                        <div style="font-size:12px; color:var(--gray-500); margin-top:3px">
                          ${ruleText(lg)}
                        </div>
                      </div>

                      <div style="display:flex; align-items:center; gap:6px; flex:none">
                        <button type="button" onclick="
                          window.__mepedeStore.draft.expandedGroups = window.__mepedeStore.draft.expandedGroups || {};
                          window.__mepedeStore.draft.expandedGroups['${lg.id}'] = !${isExpanded};
                          window.__mepedeStore.notify();
                        " style="height:30px; padding:0 10px; border-radius:8px; border:1px solid var(--gray-200); background:#fff; font-size:11.5px; font-weight:600; color:var(--gray-700); cursor:pointer; display:inline-flex; align-items:center; gap:5px">
                          <span>${isExpanded ? 'Ocultar' : 'Ver adicionais'}</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="transform:${isExpanded ? 'rotate(180deg)' : 'none'}; transition:transform .15s ease"><path d="m6 9 6 6 6-6"></path></svg>
                        </button>

                        <button type="button" onclick="window.__mepedeStore.openGroup(window.__mepedeStore.data.groups.find(x => x.id === '${lg.id}'))" title="Editar este grupo de complementos" style="height:30px; padding:0 8px; border-radius:8px; border:1px solid var(--gray-200); background:#fff; font-size:11.5px; font-weight:500; color:var(--gray-700); cursor:pointer; display:inline-flex; align-items:center; gap:4px">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                          <span>Editar</span>
                        </button>

                        ${linkedGroups.length > 1 ? `
                          <div style="display:flex; border:1px solid var(--gray-200); border-radius:8px; overflow:hidden; background:#fff">
                            <button type="button" onclick="const a = window.__mepedeStore.draft.groupIds.slice(); if(${i} > 0){ [a[${i}], a[${i}-1]] = [a[${i}-1], a[${i}]]; window.__mepedeStore.draft.groupIds = a; window.__mepedeStore.notify(); }" title="Subir ordem" ${i === 0 ? 'disabled style="opacity:0.3; cursor:not-allowed"' : ''} style="width:26px; height:28px; border:none; background:transparent; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--gray-700)">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m18 15-6-6-6 6"></path></svg>
                            </button>
                            <button type="button" onclick="const a = window.__mepedeStore.draft.groupIds.slice(); if(${i} < a.length - 1){ [a[${i}], a[${i}+1]] = [a[${i}+1], a[${i}]]; window.__mepedeStore.draft.groupIds = a; window.__mepedeStore.notify(); }" title="Descer ordem" ${i === linkedGroups.length - 1 ? 'disabled style="opacity:0.3; cursor:not-allowed"' : ''} style="width:26px; height:28px; border:none; border-left:1px solid var(--gray-200); background:transparent; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--gray-700)">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m6 9 6 6 6-6"></path></svg>
                            </button>
                          </div>
                        ` : ''}

                        <button type="button" onclick="window.__mepedeStore.draft.groupIds = window.__mepedeStore.draft.groupIds.filter(x => x !== '${lg.id}'); window.__mepedeStore.notify()" title="Desvincular deste produto" style="width:28px; height:28px; border-radius:8px; border:1px solid #FEECEB; background:#FFF5F5; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--red)">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>
                        </button>
                      </div>
                    </div>

                    ${isExpanded ? `
                      <div style="padding:10px 14px; background:#fff">
                        <div style="font-size:11px; font-weight:700; color:var(--gray-400); margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px">
                          Todos os adicionais disponíveis neste grupo:
                        </div>
                        <div style="display:flex; flex-wrap:wrap; gap:6px">
                          ${lg.options.map(o => `
                            <div style="display:inline-flex; align-items:center; gap:6px; background:#F8F9FA; border:1px solid #E5E7EB; border-radius:8px; padding:4px 10px; font-size:12px">
                              ${o.img ? `<img src="${o.img}" alt="" style="width:16px; height:16px; border-radius:4px; object-fit:cover; display:block">` : ''}
                              <span style="font-weight:600; color:#1F2937">${o.name}</span>
                              <span style="color:#00B368; font-weight:700; font-size:11px; background:#E8F7EE; padding:1px 6px; border-radius:5px">
                                ${o.price > 0 ? '+ ' + money(o.price) : 'Grátis'}
                              </span>
                            </div>
                          `).join('')}
                        </div>
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}

              ${d.libOpen ? `
                <div style="border:1px solid var(--gray-100); border-radius:14px; padding:10px; background:#FAFBFC">
                  <div style="font-size:12px; color:var(--gray-400); padding:4px 8px">Da sua biblioteca — clique para vincular</div>
                  ${libGroups.map(lb => `
                    <div onclick="window.__mepedeStore.draft.groupIds.push('${lb.id}'); window.__mepedeStore.notify()" style="display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:10px; cursor:pointer; background:#fff; margin-top:4px; border:1px solid var(--gray-200)">
                      <span style="width:24px; height:24px; border-radius:12px; background:#FFF1E8; color:#FF6100; display:flex; align-items:center; justify-content:center; flex:none">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>
                      </span>
                      <div style="flex:1; min-width:0">
                        <div style="display:flex; align-items:center; gap:8px">
                          <span style="font-size:13.5px; font-weight:600">${lb.name}</span>
                          <span style="font-size:10.5px; font-weight:700; color:${lb.min > 0 ? '#E85700' : '#4A5160'}; background:${lb.min > 0 ? '#FFF1E8' : '#F1F2F5'}; padding:1px 6px; border-radius:6px">${lb.min > 0 ? 'OBRIGATÓRIO' : 'OPCIONAL'}</span>
                        </div>
                        <div style="font-size:12px; color:var(--gray-500); margin-top:2px">
                          ${lb.options.map(o => o.name + (o.price ? ' (+' + money(o.price) + ')' : '')).join(' · ')}
                        </div>
                      </div>
                    </div>
                  `).join('')}
                  ${!libGroups.length ? `<div style="font-size:13px; color:var(--gray-500); padding:8px">Todos os grupos já estão vinculados.</div>` : ''}
                </div>
              ` : ''}

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
                <div class="btn-new-cat-dashed" style="height:44px; justify-content:center" onclick="window.__mepedeStore.draft.libOpen = !window.__mepedeStore.draft.libOpen; window.__mepedeStore.notify()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 9 5-9 5-9-5Z"></path><path d="m3 13 9 5 9-5"></path></svg>
                  ${d.libOpen ? 'Fechar biblioteca' : 'Usar da biblioteca (' + libGroups.length + ')'}
                </div>
                <div class="btn-new-cat-dashed" style="height:44px; justify-content:center" onclick="window.__mepedeStore.openGroup(null)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>
                  Criar novo grupo
                </div>
              </div>
            </div>

            <!-- Visibilidade -->
            <div style="display:flex; flex-direction:column; gap:12px; padding-top:24px; border-top:1px solid var(--gray-100)">
              <div onclick="window.__mepedeStore.draft.active = !window.__mepedeStore.draft.active; window.__mepedeStore.notify()" style="display:flex; align-items:center; gap:14px; cursor:pointer">
                <div style="flex:1">
                  <div style="font-size:16px; font-weight:600">Visível no cardápio</div>
                  <div style="font-size:13px; color:var(--gray-500); margin-top:2px">Desligue quando acabar o estoque — o produto continua salvo.</div>
                </div>
                <div class="toggle-switch" style="width:44px; height:26px; background:${d.active ? '#FF6100' : '#D5D9E0'}">
                  <div class="toggle-knob" style="width:20px; height:20px; top:3px; left:${d.active ? '21px' : '3px'}"></div>
                </div>
              </div>
              ${d.id ? `<div onclick="window.__mepedeStore.deleteProduct('${d.id}')" style="font-size:13px; font-weight:500; color:var(--red); cursor:pointer; width:fit-content; padding:4px 0">Excluir este produto</div>` : ''}
            </div>
          </div>

          <div style="flex:none; display:flex; align-items:center; gap:10px; padding:14px 28px; border-top:1px solid var(--gray-100); background:#fff">
            <div style="flex:1; font-size:12px; color:${miss.length ? (d.tried ? '#E5352B' : 'var(--gray-400)') : 'var(--green)'}">
              ${miss.length ? 'Falta: ' + miss.join(', ') : 'Tudo certo! Confira a prévia ao vivo ao lado.'}
            </div>
            <button class="btn-outline" onclick="window.__mepedeStore.closeDrawer()">Cancelar</button>
            ${!d.id ? `<button class="btn-outline" style="border-color:#FF6100; color:var(--orange-hover)" onclick="window.__mepedeStore.saveProduct(true)">Salvar e criar outro</button>` : ''}
            <button id="tut-btn-save-product" class="btn-orange" onclick="window.__mepedeStore.saveProduct(false); if(window.__mepedeStore.tutorialStep === 6) window.__mepedeStore.nextTutorial();">${d.id ? 'Salvar alterações' : 'Salvar produto'}</button>
          </div>
        </div>
      `;
    }

    // Drawer de Categoria
    if (S.drawer === 'category' && S.cd) {
      const cd = S.cd;
      const st = S.catStatus(cd);
      const prodCnt = data.products.filter(p => p.catIds.includes(cd.id)).length;

      html += `
        <div class="drawer-overlay" onclick="window.__mepedeStore.closeDrawer()"></div>
        <div class="drawer-content">
          <div style="flex:none; display:flex; align-items:flex-start; gap:12px; padding:22px 28px 18px; border-bottom:1px solid var(--gray-100)">
            <div style="flex:1">
              <div style="font-size:12px; font-weight:500; color:var(--orange)">Categoria</div>
              <div id="drawer-cat-title" style="font-size:22px; font-weight:600">${cd.name || 'Nova categoria'}</div>
            </div>
            <div onclick="window.__mepedeStore.closeDrawer()" style="width:36px; height:36px; border-radius:18px; border:1px solid var(--gray-100); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--gray-700)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>
            </div>
          </div>

          <div style="flex:1; overflow-y:auto; padding:24px 28px; display:flex; flex-direction:column; gap:24px">
            <label style="display:flex; flex-direction:column; gap:6px">
              <span style="font-size:13px; font-weight:500">Nome da categoria</span>
              <input id="input-cd-name" value="${cd.name}" oninput="window.__mepedeStore.cd.name = this.value; const t = document.getElementById('drawer-cat-title'); if(t) t.textContent = this.value || 'Nova categoria';" placeholder="Ex: Hambúrgueres artesanais" style="height:44px; padding:0 14px; border:1px solid var(--gray-200); border-radius:10px; font-size:14px; outline:none">
            </label>

            <div onclick="window.__mepedeStore.cd.active = !window.__mepedeStore.cd.active; window.__mepedeStore.notify()" style="display:flex; align-items:center; gap:14px; cursor:pointer; padding:14px 16px; border:1px solid var(--gray-100); border-radius:14px">
              <div style="flex:1">
                <div style="font-size:14px; font-weight:600">Visível no cardápio</div>
                <div style="font-size:12px; color:var(--gray-500)">Desligue para esconder a categoria inteira do celular.</div>
              </div>
              <div class="toggle-switch" style="width:44px; height:26px; background:${cd.active ? '#FF6100' : '#D5D9E0'}">
                <div class="toggle-knob" style="width:20px; height:20px; top:3px; left:${cd.active ? '21px' : '3px'}"></div>
              </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:10px">
              <span style="font-size:13px; font-weight:500">Quando aparece?</span>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
                <div onclick="window.__mepedeStore.cd.avail = 'always'; window.__mepedeStore.notify()" style="padding:14px 16px; border-radius:14px; border:1.5px solid ${cd.avail !== 'schedule' ? '#FF6100' : 'var(--gray-200)'}; background:${cd.avail !== 'schedule' ? '#FFF6F0' : '#fff'}; cursor:pointer">
                  <div style="font-size:14px; font-weight:600">Sempre</div>
                  <div style="font-size:12px; color:var(--gray-500)">Enquanto a loja estiver aberta</div>
                </div>
                <div onclick="window.__mepedeStore.cd.avail = 'schedule'; window.__mepedeStore.notify()" style="padding:14px 16px; border-radius:14px; border:1.5px solid ${cd.avail === 'schedule' ? '#FF6100' : 'var(--gray-200)'}; background:${cd.avail === 'schedule' ? '#FFF6F0' : '#fff'}; cursor:pointer">
                  <div style="font-size:14px; font-weight:600">Dias e horários</div>
                  <div style="font-size:12px; color:var(--gray-500)">Ex: Açaí só no fim de semana</div>
                </div>
              </div>

              ${cd.avail === 'schedule' ? `
                <div style="background:#F6F7F9; border-radius:14px; padding:16px; display:flex; flex-direction:column; gap:14px">
                  <div style="display:flex; gap:6px; flex-wrap:wrap">
                    ${DAY_ORDER.map(dd => {
                      const on = cd.days.includes(dd);
                      return `
                        <div onclick="
                          const ds = window.__mepedeStore.cd.days;
                          window.__mepedeStore.cd.days = ds.includes(${dd}) ? ds.filter(x => x !== ${dd}) : ds.concat(${dd});
                          window.__mepedeStore.notify();
                        " style="width:46px; height:46px; border-radius:23px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:500; cursor:pointer; background:${on ? '#FF6100' : '#fff'}; color:${on ? '#fff' : 'var(--gray-400)'}; border:1px solid ${on ? '#FF6100' : 'var(--gray-200)'}">
                          ${DAYS[dd]}
                        </div>
                      `;
                    }).join('')}
                  </div>
                  <div style="display:flex; gap:12px; align-items:flex-end">
                    <label style="display:flex; flex-direction:column; gap:6px">
                      <span style="font-size:12px; color:var(--gray-700)">Das</span>
                      <input id="input-cd-start" type="time" value="${cd.start}" oninput="window.__mepedeStore.cd.start = this.value;" style="height:42px; padding:0 12px; border:1px solid var(--gray-200); border-radius:10px; font-size:14px; background:#fff">
                    </label>
                    <label style="display:flex; flex-direction:column; gap:6px">
                      <span style="font-size:12px; color:var(--gray-700)">Até</span>
                      <input id="input-cd-end" type="time" value="${cd.end}" oninput="window.__mepedeStore.cd.end = this.value;" style="height:42px; padding:0 12px; border:1px solid var(--gray-200); border-radius:10px; font-size:14px; background:#fff">
                    </label>
                  </div>
                </div>
              ` : ''}

              <div style="display:flex; align-items:center; gap:8px; font-size:13px; color:var(--gray-700)">
                Status agora: <span style="display:inline-flex; align-items:center; gap:6px; height:26px; padding:0 10px; border-radius:13px; background:${st.bg}; color:${st.fg}; font-size:12px; font-weight:500">${st.label}</span>
              </div>
            </div>

            <div style="padding-top:20px; border-top:1px solid var(--gray-100)">
              ${!cd.confirm ? `
                <div onclick="window.__mepedeStore.cd.confirm = true; window.__mepedeStore.notify()" style="font-size:13px; font-weight:500; color:var(--red); cursor:pointer; width:fit-content">Excluir categoria</div>
              ` : `
                <div style="background:#FDECEB; border-radius:14px; padding:16px; display:flex; flex-direction:column; gap:12px">
                  <div style="font-size:14px; font-weight:600; color:#B42318">Excluir “${cd.name}”?</div>
                  <div style="font-size:13px; color:var(--gray-700)">${prodCnt ? `Os ${prodCnt} produtos dela não serão excluídos — só saem desta categoria.` : 'A categoria está vazia.'}</div>
                  <div style="display:flex; gap:8px">
                    <button class="btn-outline" style="height:38px" onclick="window.__mepedeStore.cd.confirm = false; window.__mepedeStore.notify()">Cancelar</button>
                    <button class="btn-orange" style="height:38px; background:var(--red)" onclick="window.__mepedeStore.deleteCat()">Excluir agora</button>
                  </div>
                </div>
              `}
            </div>
          </div>

          <div style="flex:none; display:flex; justify-content:flex-end; gap:10px; padding:14px 28px; border-top:1px solid var(--gray-100)">
            <button class="btn-outline" onclick="window.__mepedeStore.closeDrawer()">Cancelar</button>
            <button class="btn-orange" onclick="window.__mepedeStore.saveCat()">Salvar categoria</button>
          </div>
        </div>
      `;
    }

    // Drawer de Múltiplos Cardápios
    if (S.drawer === 'menu' && S.md) {
      const md = S.md;
      const st = S.catStatus(md);
      const isNew = !md.id;

      html += `
        <div class="drawer-overlay" onclick="window.__mepedeStore.closeDrawer()"></div>
        <div class="drawer-content">
          <div style="flex:none; display:flex; align-items:flex-start; gap:12px; padding:22px 28px 18px; border-bottom:1px solid var(--gray-100)">
            <div style="flex:1">
              <div style="font-size:12px; font-weight:500; color:var(--orange)">${isNew ? 'Novo cardápio' : 'Editar cardápio'}</div>
              <div id="drawer-md-title" style="font-size:22px; font-weight:600">${md.name || 'Cardápio'}</div>
            </div>
            <div onclick="window.__mepedeStore.closeDrawer()" style="width:36px; height:36px; border-radius:18px; border:1px solid var(--gray-100); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--gray-700)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>
            </div>
          </div>

          <div style="flex:1; overflow-y:auto; padding:24px 28px; display:flex; flex-direction:column; gap:24px">
            <label style="display:flex; flex-direction:column; gap:6px">
              <span style="font-size:13px; font-weight:500">Nome do cardápio</span>
              <input id="input-md-name" value="${md.name}" oninput="window.__mepedeStore.md.name = this.value; const t = document.getElementById('drawer-md-title'); if(t) t.textContent = this.value || 'Cardápio';" placeholder="Ex: Almoço executivo, Festival de Hambúrguer" style="height:44px; padding:0 14px; border:1px solid var(--gray-200); border-radius:10px; font-size:14px; outline:none">
            </label>

            ${isNew ? `
              <div style="display:flex; flex-direction:column; gap:8px">
                <span style="font-size:13px; font-weight:500">Como deseja começar?</span>
                <div style="display:flex; flex-direction:column; gap:8px">
                  <div onclick="window.__mepedeStore.md.copy = ''; window.__mepedeStore.notify()" style="display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:12px; border:1.5px solid ${!md.copy ? '#FF6100' : 'var(--gray-200)'}; background:${!md.copy ? '#FFF6F0' : '#fff'}; cursor:pointer">
                    <span style="width:18px; height:18px; border-radius:9px; border:1.5px solid ${!md.copy ? '#FF6100' : 'var(--gray-400)'}; display:flex; align-items:center; justify-content:center"><span style="width:10px; height:10px; border-radius:5px; background:${!md.copy ? '#FF6100' : 'transparent'}"></span></span>
                    <div>
                      <div style="font-size:14px; font-weight:500">Em branco</div>
                      <div style="font-size:12px; color:var(--gray-500)">Crie as categorias do zero</div>
                    </div>
                  </div>
                  ${data.menus.map(m => `
                    <div onclick="window.__mepedeStore.md.copy = '${m.id}'; window.__mepedeStore.notify()" style="display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:12px; border:1.5px solid ${md.copy === m.id ? '#FF6100' : 'var(--gray-200)'}; background:${md.copy === m.id ? '#FFF6F0' : '#fff'}; cursor:pointer">
                      <span style="width:18px; height:18px; border-radius:9px; border:1.5px solid ${md.copy === m.id ? '#FF6100' : 'var(--gray-400)'}; display:flex; align-items:center; justify-content:center"><span style="width:10px; height:10px; border-radius:5px; background:${md.copy === m.id ? '#FF6100' : 'transparent'}"></span></span>
                      <div>
                        <div style="font-size:14px; font-weight:500">Copiar de “${m.name}”</div>
                        <div style="font-size:12px; color:var(--gray-500)">Mesmas categorias e produtos compartilhados</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <div style="display:flex; flex-direction:column; gap:10px">
              <span style="font-size:13px; font-weight:500">Quando fica no ar?</span>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
                <div onclick="window.__mepedeStore.md.avail = 'always'; window.__mepedeStore.notify()" style="padding:14px 16px; border-radius:14px; border:1.5px solid ${md.avail !== 'schedule' ? '#FF6100' : 'var(--gray-200)'}; background:${md.avail !== 'schedule' ? '#FFF6F0' : '#fff'}; cursor:pointer">
                  <div style="font-size:14px; font-weight:600">Sempre</div>
                  <div style="font-size:12px; color:var(--gray-500)">Enquanto a loja estiver aberta</div>
                </div>
                <div onclick="window.__mepedeStore.md.avail = 'schedule'; window.__mepedeStore.notify()" style="padding:14px 16px; border-radius:14px; border:1.5px solid ${md.avail === 'schedule' ? '#FF6100' : 'var(--gray-200)'}; background:${md.avail === 'schedule' ? '#FFF6F0' : '#fff'}; cursor:pointer">
                  <div style="font-size:14px; font-weight:600">Dias e horários</div>
                  <div style="font-size:12px; color:var(--gray-500)">Ex: Seg a Sex, 11h às 15h</div>
                </div>
              </div>

              ${md.avail === 'schedule' ? `
                <div style="background:#F6F7F9; border-radius:14px; padding:16px; display:flex; flex-direction:column; gap:14px">
                  <div style="display:flex; gap:6px; flex-wrap:wrap">
                    ${DAY_ORDER.map(dd => {
                      const on = md.days.includes(dd);
                      return `
                        <div onclick="
                          const ds = window.__mepedeStore.md.days;
                          window.__mepedeStore.md.days = ds.includes(${dd}) ? ds.filter(x => x !== ${dd}) : ds.concat(${dd});
                          window.__mepedeStore.notify();
                        " style="width:46px; height:46px; border-radius:23px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:500; cursor:pointer; background:${on ? '#FF6100' : '#fff'}; color:${on ? '#fff' : 'var(--gray-400)'}; border:1px solid ${on ? '#FF6100' : 'var(--gray-200)'}">
                          ${DAYS[dd]}
                        </div>
                      `;
                    }).join('')}
                  </div>
                  <div style="display:flex; gap:12px">
                    <label style="display:flex; flex-direction:column; gap:6px">
                      <span style="font-size:12px; color:var(--gray-700)">Das</span>
                      <input id="input-md-start" type="time" value="${md.start}" oninput="window.__mepedeStore.md.start = this.value;" style="height:42px; padding:0 12px; border:1px solid var(--gray-200); border-radius:10px; font-size:14px; background:#fff">
                    </label>
                    <label style="display:flex; flex-direction:column; gap:6px">
                      <span style="font-size:12px; color:var(--gray-700)">Até</span>
                      <input id="input-md-end" type="time" value="${md.end}" oninput="window.__mepedeStore.md.end = this.value;" style="height:42px; padding:0 12px; border:1px solid var(--gray-200); border-radius:10px; font-size:14px; background:#fff">
                    </label>
                  </div>
                </div>
              ` : ''}

              <div style="font-size:12px; color:#2F6FEB; background:#EEF4FF; border-radius:10px; padding:8px 12px">
                O cliente usa sempre o mesmo link. Ele vê automaticamente o cardápio no horário programado.
              </div>
            </div>

            <div onclick="window.__mepedeStore.md.active = !window.__mepedeStore.md.active; window.__mepedeStore.notify()" style="display:flex; align-items:center; gap:14px; cursor:pointer; padding:14px 16px; border:1px solid var(--gray-100); border-radius:14px">
              <div style="flex:1">
                <div style="font-size:14px; font-weight:600">Cardápio ligado</div>
                <div style="font-size:12px; color:var(--gray-500)">Desligue para tirar do ar sem apagar os produtos.</div>
              </div>
              <div class="toggle-switch" style="width:44px; height:26px; background:${md.active ? '#FF6100' : '#D5D9E0'}">
                <div class="toggle-knob" style="width:20px; height:20px; top:3px; left:${md.active ? '21px' : '3px'}"></div>
              </div>
            </div>

            ${!isNew && data.menus.length > 1 ? `
              <div style="padding-top:20px; border-top:1px solid var(--gray-100)">
                ${!md.confirm ? `
                  <div onclick="window.__mepedeStore.md.confirm = true; window.__mepedeStore.notify()" style="font-size:13px; font-weight:500; color:var(--red); cursor:pointer; width:fit-content">Excluir cardápio</div>
                ` : `
                  <div style="background:#FDECEB; border-radius:14px; padding:16px; display:flex; flex-direction:column; gap:12px">
                    <div style="font-size:14px; font-weight:600; color:#B42318">Excluir “${md.name}”?</div>
                    <div style="font-size:13px; color:var(--gray-700)">As categorias deste cardápio sairão do ar. Os produtos continuam salvos nos outros cardápios.</div>
                    <div style="display:flex; gap:8px">
                      <button class="btn-outline" style="height:38px" onclick="window.__mepedeStore.md.confirm = false; window.__mepedeStore.notify()">Cancelar</button>
                      <button class="btn-orange" style="height:38px; background:var(--red)" onclick="window.__mepedeStore.deleteMenu()">Excluir agora</button>
                    </div>
                  </div>
                `}
              </div>
            ` : ''}
          </div>

          <div style="flex:none; display:flex; justify-content:flex-end; gap:10px; padding:14px 28px; border-top:1px solid var(--gray-100)">
            <button class="btn-outline" onclick="window.__mepedeStore.closeDrawer()">Cancelar</button>
            <button id="tut-btn-save-menu" class="btn-orange" onclick="window.__mepedeStore.saveMenu(); if(window.__mepedeStore.tutorialStep === 2) window.__mepedeStore.nextTutorial();">Salvar cardápio</button>
          </div>
        </div>
      `;
    }

    // Drawer de Grupo de Complementos
    if (S.drawer === 'group' && S.gd) {
      const gd = S.gd;
      const isReq = gd.min > 0;

      html += `
        <div class="drawer-overlay" onclick="window.__mepedeStore.closeDrawer()"></div>
        <div class="drawer-content">
          <div style="flex:none; display:flex; align-items:flex-start; gap:12px; padding:22px 28px 18px; border-bottom:1px solid var(--gray-100)">
            <div style="flex:1">
              <div style="font-size:12px; font-weight:500; color:var(--orange)">Grupo de complementos</div>
              <div id="drawer-group-title" style="font-size:22px; font-weight:600">${gd.name || 'Novo grupo'}</div>
            </div>
            <div onclick="window.__mepedeStore.closeDrawer()" style="width:36px; height:36px; border-radius:18px; border:1px solid var(--gray-100); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--gray-700)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>
            </div>
          </div>

          <div style="flex:1; overflow-y:auto; padding:24px 28px; display:flex; flex-direction:column; gap:20px">
            <label style="display:flex; flex-direction:column; gap:6px">
              <span style="font-size:13px; font-weight:500">Nome do grupo</span>
              <input id="input-gd-name" value="${gd.name}" oninput="window.__mepedeStore.gd.name = this.value; const t = document.getElementById('drawer-group-title'); if(t) t.textContent = this.value || 'Novo grupo';" placeholder="Ex: Adicionais, Ponto da carne, Bebida" style="height:44px; padding:0 14px; border:1px solid var(--gray-200); border-radius:10px; font-size:14px; outline:none">
            </label>

            <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap">
              <div style="display:flex; background:#fff; border:1px solid var(--gray-200); border-radius:10px; padding:3px">
                <div onclick="window.__mepedeStore.gd.min = 0; window.__mepedeStore.notify()" style="padding:6px 14px; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; background:${!isReq ? '#14171F' : 'transparent'}; color:${!isReq ? '#fff' : 'var(--gray-700)'}">Opcional</div>
                <div onclick="window.__mepedeStore.gd.min = 1; window.__mepedeStore.notify()" style="padding:6px 14px; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; background:${isReq ? '#14171F' : 'transparent'}; color:${isReq ? '#fff' : 'var(--gray-700)'}">Obrigatório</div>
              </div>

              <div style="display:flex; align-items:center; gap:8px; font-size:13px">
                Escolhe até
                <div style="display:flex; align-items:center; border:1px solid var(--gray-200); border-radius:10px; background:#fff; height:34px">
                  <div onclick="window.__mepedeStore.gd.max = Math.max(1, window.__mepedeStore.gd.max - 1); window.__mepedeStore.notify()" style="width:30px; text-align:center; cursor:pointer; font-size:16px">−</div>
                  <span style="min-width:24px; text-align:center; font-weight:600">${gd.max}</span>
                  <div onclick="window.__mepedeStore.gd.max = window.__mepedeStore.gd.max + 1; window.__mepedeStore.notify()" style="width:30px; text-align:center; cursor:pointer; font-size:16px">+</div>
                </div>
              </div>
            </div>

            <div style="font-size:12px; color:var(--gray-500); background:#F6F7F9; border-radius:10px; padding:8px 12px">
              O cliente vai ver: “${ruleText({ min: gd.min, max: gd.max })}”
            </div>

            <div style="display:flex; flex-direction:column; gap:10px">
              <span style="font-size:13px; font-weight:500">Opções do grupo</span>
              ${gd.rows.map((r, i) => `
                <div style="display:grid; grid-template-columns:1fr 130px 32px; gap:8px; align-items:center">
                  <input id="input-gd-row-name-${i}" value="${r.name}" oninput="window.__mepedeStore.gd.rows[${i}].name = this.value;" placeholder="Opção. Ex: Bacon crocante" style="height:40px; padding:0 12px; border:1px solid var(--gray-200); border-radius:10px; font-size:14px; outline:none; background:#fff">
                  <div style="display:flex; align-items:center; height:40px; border:1px solid var(--gray-200); border-radius:10px; padding:0 10px; gap:6px; background:#fff">
                    <span style="font-size:13px; font-weight:600; color:var(--gray-700)">+R$</span>
                    <input id="input-gd-row-price-${i}" value="${r.priceStr}" oninput="this.value = window.__mepedeStore.cleanMoneyStr(this.value); window.__mepedeStore.gd.rows[${i}].priceStr = this.value;" onblur="this.value = window.__mepedeStore.formatMoneyBlur(this.value); window.__mepedeStore.gd.rows[${i}].priceStr = this.value;" inputmode="decimal" placeholder="0,00" style="flex:1; min-width:0; border:none; outline:none; font-size:14px">
                  </div>
                  <div onclick="if(window.__mepedeStore.gd.rows.length > 1){ window.__mepedeStore.gd.rows = window.__mepedeStore.gd.rows.filter((_,j) => j !== ${i}); window.__mepedeStore.notify(); }" style="width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--gray-400)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>
                  </div>
                </div>
              `).join('')}

              <div onclick="window.__mepedeStore.gd.rows.push({ id: '${uid()}', name: '', desc: '', img: '', priceStr: '' }); window.__mepedeStore.notify()" style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:500; color:var(--orange-hover); cursor:pointer; padding:6px 2px; width:fit-content">
                <span style="width:20px; height:20px; border-radius:10px; background:var(--orange); color:#fff; display:flex; align-items:center; justify-content:center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg></span>
                + Adicionar opção (R$ 0,00 = grátis)
              </div>
            </div>

            ${gd.id ? `
              <div style="padding-top:20px; border-top:1px solid var(--gray-100)">
                <div onclick="window.__mepedeStore.deleteGroup()" style="font-size:13px; font-weight:500; color:var(--red); cursor:pointer; width:fit-content">Excluir este grupo</div>
              </div>
            ` : ''}
          </div>

          <div style="flex:none; display:flex; justify-content:flex-end; gap:10px; padding:14px 28px; border-top:1px solid var(--gray-100)">
            <button class="btn-outline" onclick="window.__mepedeStore.closeDrawer()">Cancelar</button>
            <button class="btn-orange" onclick="window.__mepedeStore.saveGroup()">Salvar grupo</button>
          </div>
        </div>
      `;
    }

    // Drawer de Pick (Adicionar produto existente na categoria)
    if (S.drawer === 'pick' && S.pick) {
      const curCat = data.categories.find(c => c.id === S.selCat);
      const catName = curCat ? curCat.name : 'Categoria';
      const pq = S.pick.q.trim().toLowerCase();
      const candidates = data.products
        .filter(p => !p.catIds.includes(S.selCat))
        .filter(p => !pq || p.name.toLowerCase().includes(pq));

      const selectedCount = Object.values(S.pick.sel).filter(Boolean).length;

      html += `
        <div class="drawer-overlay" onclick="window.__mepedeStore.closeDrawer()"></div>
        <div class="drawer-content">
          <div style="flex:none; display:flex; align-items:flex-start; gap:12px; padding:22px 28px 18px; border-bottom:1px solid var(--gray-100)">
            <div style="flex:1">
              <div style="font-size:12px; font-weight:500; color:var(--orange)">${catName}</div>
              <div style="font-size:22px; font-weight:600">Adicionar produto existente</div>
              <div style="font-size:13px; color:var(--gray-400)">O produto continua nas outras categorias.</div>
            </div>
            <div onclick="window.__mepedeStore.closeDrawer()" style="width:36px; height:36px; border-radius:18px; border:1px solid var(--gray-100); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--gray-700)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>
            </div>
          </div>

          <div style="flex:1; overflow-y:auto; padding:20px 28px; display:flex; flex-direction:column; gap:8px">
            <div style="display:flex; align-items:center; gap:8px; height:44px; padding:0 14px; border:1px solid var(--gray-200); border-radius:10px; margin-bottom:8px">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A91A0" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
              <input id="input-pick-search" value="${S.pick.q}" oninput="window.__mepedeStore.pick.q = this.value; window.__mepedeStore.notify()" placeholder="Buscar pelo nome" style="flex:1; border:none; outline:none; font-size:14px">
            </div>

            ${candidates.map(p => {
              const isSel = !!S.pick.sel[p.id];
              return `
                <div onclick="window.__mepedeStore.pick.sel['${p.id}'] = !window.__mepedeStore.pick.sel['${p.id}']; window.__mepedeStore.notify()" style="display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:12px; border:1px solid ${isSel ? '#FF6100' : 'var(--gray-100)'}; background:${isSel ? '#FFF6F0' : '#fff'}; cursor:pointer">
                  <span style="width:20px; height:20px; border-radius:6px; border:1.5px solid ${isSel ? '#FF6100' : 'var(--gray-400)'}; background:${isSel ? '#FF6100' : '#fff'}; color:#fff; display:flex; align-items:center; justify-content:center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M20 6 9 17l-5-5"></path></svg>
                  </span>
                  <div style="width:40px; height:40px; border-radius:10px; overflow:hidden; background:#FFF1E8; display:flex; align-items:center; justify-content:center; color:#E85700; font-weight:600">
                    ${p.img ? `<img src="${p.img}" alt="" style="width:100%; height:100%; object-fit:cover">` : `<span>${p.name[0] || 'P'}</span>`}
                  </div>
                  <div style="flex:1; min-width:0">
                    <div style="font-size:14px; font-weight:500">${p.name}</div>
                    <div style="font-size:12px; color:var(--gray-400)">${p.catIds.map(id => { const cc = data.categories.find(x => x.id === id); return cc ? cc.name : ''; }).filter(Boolean).join(', ') || 'Sem categoria'}</div>
                  </div>
                  <span style="font-size:14px; font-weight:600">${priceOf(p)}</span>
                </div>
              `;
            }).join('')}

            ${!candidates.length ? `<div style="font-size:13px; color:var(--gray-500); padding:24px 0; text-align:center">Nenhum outro produto disponível para adicionar.</div>` : ''}
          </div>

          <div style="flex:none; display:flex; justify-content:flex-end; gap:10px; padding:14px 28px; border-top:1px solid var(--gray-100)">
            <button class="btn-outline" onclick="window.__mepedeStore.closeDrawer()">Cancelar</button>
            <button class="btn-orange" onclick="
              const ids = Object.keys(window.__mepedeStore.pick.sel).filter(k => window.__mepedeStore.pick.sel[k]);
              if (!ids.length) return;
              window.__mepedeStore.mut(dd => {
                dd.products.forEach(p => {
                  if (ids.includes(p.id) && !p.catIds.includes(window.__mepedeStore.selCat)) {
                    p.catIds.push(window.__mepedeStore.selCat);
                  }
                });
              }, ids.length + ' produto(s) vinculado(s) à categoria', true);
              window.__mepedeStore.closeDrawer();
            ">${selectedCount ? 'Adicionar ' + selectedCount + (selectedCount > 1 ? ' produtos' : ' produto') : 'Adicionar'}</button>
          </div>
        </div>
      `;
    }

    // Card do Tutorial Guiado: oculto por padrão conforme solicitado (o usuário se guia exclusivamente pelo "Clique aqui")
    if (S.tutorialStep && S.showTutorialCard) {
      const step = S.tutorialStep;
      const curTut = TUTORIAL_STEPS_CONFIG.find(x => x.num === step) || TUTORIAL_STEPS_CONFIG[0];
      const progPct = (step / 10) * 100;

      const isLeft = step >= 5;
      html += `
        <div class="tutorial-floating-card ${isLeft ? 'pos-left' : 'pos-right'}">
          <div style="display:flex; align-items:center; gap:8px">
            <span style="font-size:11px; font-weight:700; color:#E85700; background:#FFF1E8; padding:3px 8px; border-radius:6px; letter-spacing:0.5px">🎓 TOUR GUIADO</span>
            <span style="font-size:12px; color:var(--gray-400); font-weight:500">Passo ${step} de 10</span>
            <div style="flex:1"></div>
            <div onclick="window.__mepedeStore.showTutorialCard = false; window.__mepedeStore.notify()" style="width:28px; height:28px; border-radius:14px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--gray-400)" title="Fechar card">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>
            </div>
          </div>

          <div style="width:100%; height:5px; background:#ECEEF2; border-radius:3px; margin-top:10px; overflow:hidden">
            <div style="width:${progPct}%; height:100%; background:linear-gradient(90deg, #FF6100, #FF8A3D); transition:width .35s ease; border-radius:3px"></div>
          </div>

          <div style="font-size:16px; font-weight:700; margin-top:12px; color:var(--dark)">${curTut.title}</div>
          <div style="font-size:13px; color:var(--gray-700); line-height:1.45; margin-top:6px">${curTut.desc}</div>

          <div style="font-size:11px; color:#B45309; background:#FFF4E0; border-radius:8px; padding:7px 10px; margin-top:10px; display:flex; align-items:center; gap:6px">
            <span>💡</span> <span style="font-weight:500">${curTut.tip}</span>
          </div>

          <div style="margin-top:16px; display:flex; flex-direction:column; gap:8px">
            <button class="btn-orange" style="width:100%; justify-content:center; height:42px" onclick="window.__mepedeStore.executeTutorialStep()">
              ⚡ ${curTut.btn}
            </button>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px">
              <button class="btn-outline" style="height:34px; padding:0 12px; font-size:12px" onclick="window.__mepedeStore.prevTutorial()" ${step === 1 ? 'disabled style="opacity:0.4; cursor:not-allowed"' : ''}>← Anterior</button>
              <button class="btn-dark" style="height:34px; padding:0 16px; font-size:12px" onclick="window.__mepedeStore.nextTutorial()">
                ${step === 10 ? 'Concluir Tour ✓' : 'Próximo →'}
              </button>
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
    if (wasDrawerOpen) {
      const newDrawer = container.querySelector('.drawer-content');
      if (newDrawer) newDrawer.style.animation = 'none';
    }
  }

  const TUTORIAL_STEPS_CONFIG = [
    {
      num: 1,
      title: 'Criar o Primeiro Cardápio',
      targetSelector: '#tut-btn-new-menu',
      desc: 'Comece criando o cardápio do seu foodtruck para organizar categorias e produtos.',
      tip: 'Clique no botão indicado para abrir a tela de criação.',
      btn: 'Criar Cardápio'
    },
    {
      num: 2,
      title: 'Salvar o Cardápio',
      targetSelector: '#tut-btn-save-menu',
      desc: 'Defina o nome e horários do cardápio e clique em salvar.',
      tip: 'Clique em Salvar cardápio no rodapé da gaveta.',
      btn: 'Salvar Cardápio'
    },
    {
      num: 3,
      title: 'Criar Primeira Categoria',
      targetSelector: '#tut-quick-cat-lanches',
      desc: 'As categorias dividem o cardápio em abas no smartphone do cliente (ex.: Lanches, Bebidas). Clique em “+ Lanches” para criar com 1 clique!',
      tip: 'Clique na pílula + Lanches indicada com o anel pulsante.',
      btn: 'Criar Categoria “Lanches”'
    },
    {
      num: 4,
      title: 'Cadastrar o Primeiro Produto',
      targetSelector: '#tut-btn-new-product-empty, #tut-btn-new-product, #tut-checklist-prod',
      desc: 'Categoria criada! Agora vamos cadastrar seu primeiro hambúrguer artesanal.',
      tip: 'Clique no botão laranja “Criar produto” para abrir a gaveta.',
      btn: 'Cadastrar Produto'
    },
    {
      num: 5,
      title: 'Personalizar Nome, Foto e Desconto',
      targetSelector: '#tut-quickfill-product',
      desc: 'Defina foto de dar água na boca, ingredientes e preço de venda.',
      tip: 'Clique no card tracejado laranja para preencher automaticamente.',
      btn: 'Preencher Dados do Burger'
    },
    {
      num: 6,
      title: 'Salvar e Publicar no Cardápio',
      targetSelector: '#tut-btn-save-product',
      desc: 'Tudo pronto! Clique em “Salvar alterações” para publicá-lo no cardápio!',
      tip: 'O produto aparecerá na grade e no smartphone instantaneamente.',
      btn: 'Salvar Produto'
    },
    {
      num: 7,
      title: 'A Visão do Cliente no Smartphone',
      targetSelector: '#tut-phone-product-card',
      desc: 'Veja o cardápio exatamente como o seu cliente vê! Toque no hambúrguer dentro do smartphone.',
      tip: 'Toque no lanche dentro da tela do iPhone à direita.',
      btn: 'Abrir no Smartphone'
    },
    {
      num: 8,
      title: 'Escolher Adicionais e Adicionar ao Pedido',
      targetSelector: '#tut-phone-add-to-cart',
      desc: 'O cliente escolhe os complementos desejados e adiciona à sacola.',
      tip: 'O botão calcula o total e valida escolhas obrigatórias.',
      btn: 'Adicionar ao Carrinho'
    },
    {
      num: 9,
      title: 'Carrinho e Continuar Pedido',
      targetSelector: '#tut-phone-checkout',
      desc: 'Veja os detalhes do carrinho completo com adicionais, cupom e total. Clique em “Continuar”!',
      tip: 'Clique no botão laranja Continuar indicado no rodapé do carrinho.',
      btn: 'Continuar Pedido'
    },
    {
      num: 10,
      title: 'Finalizar Tour Guiado',
      targetSelector: '#tut-btn-finish-tour',
      desc: 'Pedido simulado com sucesso! Clique em Fechar para concluir o tour guiado do Me Pede Aí.',
      tip: 'Clique no botão indicado para finalizar o tour guiado!',
      btn: 'Finalizar Tour'
    }
  ];

  let tutTrackingRaf = null;

  function startTutorialTracking() {
    if (tutTrackingRaf) cancelAnimationFrame(tutTrackingRaf);
    function loop() {
      updateTutorialSpotlight();
      const S = window.__mepedeStore;
      if (S && S.tutorialStep && !S.docModalOpen) {
        tutTrackingRaf = requestAnimationFrame(loop);
      } else {
        tutTrackingRaf = null;
      }
    }
    tutTrackingRaf = requestAnimationFrame(loop);
  }

  function updateTutorialSpotlight() {
    const S = window.__mepedeStore;
    let spotlight = document.getElementById('tutorial-spotlight');

    if (!S || !S.tutorialStep || S.docModalOpen) {
      if (spotlight) {
        spotlight.style.opacity = '0';
        spotlight.style.display = 'none';
      }
      return;
    }

    const step = S.tutorialStep;
    const curTut = TUTORIAL_STEPS_CONFIG.find(x => x.num === step);
    if (!curTut) {
      if (spotlight) {
        spotlight.style.opacity = '0';
        spotlight.style.display = 'none';
      }
      return;
    }

    if (!spotlight) {
      spotlight = document.createElement('div');
      spotlight.id = 'tutorial-spotlight';
      spotlight.innerHTML = `
        <div id="tut-beacon-pin" class="tut-beacon-pin">
          <span style="display:inline-block; width:7px; height:7px; border-radius:4px; background:#FF6100"></span>
          <span>👉 Clique aqui</span>
        </div>
      `;
      document.body.appendChild(spotlight);
    }

    let target = document.querySelector(curTut.targetSelector);
    if (!target && step === 1) {
      target = document.querySelector('#tut-btn-new-menu') || document.querySelector('#tut-btn-new-menu-top');
    }
    if (!target && step === 2) {
      target = document.querySelector('#tut-btn-save-menu');
    }
    if (!target && step === 3) {
      target = document.querySelector('#tut-quick-cat-lanches') || document.querySelector('.btn-new-cat-dashed');
    }
    if (!target && step === 4) {
      target = document.querySelector('#tut-btn-new-product-empty') || document.querySelector('#tut-btn-new-product') || document.querySelector('#tut-checklist-prod');
    }
    if (!target && step === 5) {
      target = document.querySelector('#tut-quickfill-product');
    }
    if (!target && step === 6) {
      target = document.querySelector('#tut-btn-save-product');
    }
    if (!target && step === 7) {
      target = document.querySelector('#tut-phone-product-card');
    }
    if (!target && step === 8) {
      target = document.querySelector('#tut-phone-add-to-cart');
    }
    if (!target && step === 9) {
      target = document.querySelector('#tut-phone-checkout');
    }
    if (!target && step === 10) {
      target = document.querySelector('#tut-btn-finish-tour');
    }

    if (!target) {
      spotlight.style.opacity = '0';
      spotlight.style.display = 'none';
      return;
    }

    const rect = target.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0 || rect.bottom < -20 || rect.top > window.innerHeight + 20) {
      spotlight.style.opacity = '0';
      spotlight.style.display = 'none';
      return;
    }

    const pad = 4;
    const top = Math.round(rect.top - pad);
    const left = Math.round(rect.left - pad);
    const width = Math.round(rect.width + (pad * 2));
    const height = Math.round(rect.height + (pad * 2));

    const cs = window.getComputedStyle(target);
    const r = parseFloat(cs.borderRadius) || 10;
    spotlight.style.borderRadius = (r + pad) + 'px';

    spotlight.style.display = 'block';
    spotlight.style.top = top + 'px';
    spotlight.style.left = left + 'px';
    spotlight.style.width = width + 'px';
    spotlight.style.height = height + 'px';
    spotlight.style.opacity = '1';

    const pin = document.getElementById('tut-beacon-pin');
    if (pin) {
      if (top < 50) {
        pin.classList.add('below');
      } else {
        pin.classList.remove('below');
      }
      if (left + (width / 2) > window.innerWidth - 80) {
        pin.style.left = 'auto';
        pin.style.right = '4px';
        pin.style.transform = 'none';
      } else if (left < 70) {
        pin.style.left = '4px';
        pin.style.right = 'auto';
        pin.style.transform = 'none';
      } else {
        pin.style.left = '50%';
        pin.style.right = 'auto';
        pin.style.transform = 'translateX(-50%)';
      }

      pin.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (target) target.click();
      };
    }
  }

  window.addEventListener('resize', () => { startTutorialTracking(); });
  window.addEventListener('scroll', () => { startTutorialTracking(); }, true);
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && store.docModalOpen) {
      store.closeDocModal();
    }
  });

  // Parâmetros de URL para testes e atalhos de usabilidade
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'doc' || params.get('doc') === '1') {
      store.openDocModal();
    } else if (params.get('action') === 'newProduct') {
      store.openProduct(null);
    } else if (params.get('action') === 'phoneSheet') {
      store.setPhone({ pid: store.data.products[0].id });
    } else if (params.get('action') === 'cart') {
      store.setPhone({
        view: 'cart',
        cart: [
          { id: 'c1', name: 'X-Burguer Clássico', detail: 'Ao ponto, Bacon, Cheddar extra', qty: 2, total: 75.80 },
          { id: 'c2', name: 'Suco natural', detail: '500ml', qty: 1, total: 13.00 }
        ]
      });
    } else if (params.get('action') === 'qr') {
      store.qrOpen = true;
    } else if (params.get('action') === 'tutorial') {
      store.startTutorial();
    } else if (params.get('tab')) {
      store.tab = params.get('tab');
    }
  } catch (e) {}

  // Inicialização
  store.subscribe(render);
  render();

})();
