/**
 * CONTROLADOR DO CHECKOUT 4-PASSOS ULTRAFARMA
 * Com cálculo de prévia de frete na Cesta e auto-fill inteligente de endereço na Entrega
 */
document.addEventListener('DOMContentLoaded', function() {
  const config = window.STORE_CONFIG || {};

  let currentStep = 1;
  let currentPaymentMethod = 'pix';
  let shippingCost = 0;
  let isFreeShipping = false;
  let couponDiscount = 0;
  let cachedAddressData = null;

  // Captura UTMs da URL ou do localStorage (setados pelo script UTMify)
  function getUtms() {
    const urlParams = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'src', 'sck'];
    const utms = {};
    utmKeys.forEach(k => {
      // Prioridade: localStorage (UTMify persiste entre páginas) > URL atual
      const stored = localStorage.getItem('utmify_' + k) || localStorage.getItem(k);
      utms[k] = stored || urlParams.get(k) || null;
    });
    return utms;
  }

  function loadCart() {
    let cart = { items: [] };
    try {
      const stored = localStorage.getItem('monja_ecommerce_cart');
      if (stored) cart = JSON.parse(stored);
    } catch (e) {}

    // Busca variantes do config para atualizar preços
    const configVariants = (config.product && config.product.variants) ? config.product.variants : [];

    // Se o carrinho estiver vazio, cria um item padrão usando o config atual
    if (!cart.items || cart.items.length === 0) {
      const defaultVar = configVariants[0] || null;
      cart.items = [{
        id: defaultVar ? defaultVar.id : 'tirz-2-5',
        variantId: defaultVar ? defaultVar.id : 'tirz-2-5',
        sku: defaultVar ? defaultVar.sku : 'TRZ-25-TG',
        title: defaultVar ? defaultVar.title : 'Tirzepatida T.G. 2,5 mg/0,5 mL Solução Injetável (4 Canetas Aplicadoras)',
        dosage: defaultVar ? defaultVar.dosage : '2,5 mg',
        volume: defaultVar ? defaultVar.volume : '0,5 mL',
        color: defaultVar ? defaultVar.color : '#6b7280',
        image: '/images/box-2-5.jpg',
        unitPrice: defaultVar ? defaultVar.pricePromo : 219.80,
        progressivePrice2: defaultVar ? defaultVar.progressivePrice2 : 197.82,
        priceOriginal: defaultVar ? defaultVar.priceOriginal : 1099.00,
        quantity: 1
      }];
    }

    // Atualiza preços de itens salvos no localStorage com os valores atuais do config
    if (cart.items && configVariants.length > 0) {
      const imgMap = {
        'tirz-2-5':  '/images/box-2-5.jpg',
        'tirz-5-0':  '/images/box-5-0.jpg',
        'tirz-7-5':  '/images/box-7-5.jpg',
        'tirz-10-0': '/images/box-10-0.jpg',
        'tirz-12-5': '/images/box-12-5.jpg',
        'tirz-15-0': '/images/box-15-0.jpg'
      };
      cart.items = cart.items.map(item => {
        const freshVar = configVariants.find(v => v.id === item.id || v.id === item.variantId);
        if (freshVar) {
          item.unitPrice        = freshVar.pricePromo;
          item.progressivePrice2= freshVar.progressivePrice2;
          item.priceOriginal    = freshVar.priceOriginal;
          item.title            = freshVar.title  || item.title;
          item.dosage           = freshVar.dosage || item.dosage;
          item.color            = freshVar.color  || item.color;
          if (!item.image || item.image.includes('tirzepatida-all')) {
            item.image = imgMap[item.id] || '/images/tirzepatida-all.png';
          }
        }
        return item;
      });
    }

    // Calcula preço unitário correto (progressivo se qty >= 2)
    cart.items.forEach(item => {
      const base = item.unitPrice || 219.80;
      item.currentUnitPrice = (item.quantity >= 2 && item.progressivePrice2)
        ? item.progressivePrice2
        : base;
    });

    return cart;
  }

  function saveCart(cart) {
    try {
      localStorage.setItem('monja_ecommerce_cart', JSON.stringify(cart));
    } catch (e) {}
    renderAll();
  }

  function calculateTotals() {
    const cart = loadCart();
    let subtotal = 0;
    cart.items.forEach(item => {
      subtotal += (item.currentUnitPrice || item.unitPrice || 97.99) * item.quantity;
    });

    const freeThreshold = config.checkout?.freeShippingThreshold || 100;
    isFreeShipping = subtotal >= freeThreshold;

    const selectedShipping = document.querySelector('input[name="shipping_option"]:checked');
    if (selectedShipping) {
      shippingCost = parseFloat(selectedShipping.value) || 0;
      if (isFreeShipping && selectedShipping.id === 'shipping-normal') {
        shippingCost = 0;
      }
    } else {
      shippingCost = isFreeShipping ? 0 : (config.checkout?.defaultShippingCost || 14.90);
    }

    let pixDiscount = 0;
    if (currentPaymentMethod === 'pix') {
      pixDiscount = (subtotal - couponDiscount) * ((config.product?.pixDiscountPercent || 3) / 100);
    }

    const total = Math.max(0, subtotal - couponDiscount + shippingCost - pixDiscount);
    const missingForFree = Math.max(0, freeThreshold - subtotal);
    const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

    return {
      subtotal,
      couponDiscount,
      shippingCost,
      isFreeShipping,
      pixDiscount,
      total,
      missingForFree,
      progressPercent
    };
  }

  function formatMoney(val) {
    return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\s+/, ' ');
  }

  function getDeliveryDateRange(minDays, maxDays) {
    function addBusinessDays(date, days) {
      const result = new Date(date);
      let added = 0;
      while (added < days) {
        result.setDate(result.getDate() + 1);
        const dayOfWeek = result.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          added++;
        }
      }
      return result;
    }

    const now = new Date();
    const dateMin = addBusinessDays(now, minDays);
    const dateMax = addBusinessDays(now, maxDays);

    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const weekDays = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

    const dayMin = dateMin.getDate();
    const dayMax = dateMax.getDate();
    const monthMin = months[dateMin.getMonth()];
    const monthMax = months[dateMax.getMonth()];
    const weekDayMin = weekDays[dateMin.getDay()];
    const weekDayMax = weekDays[dateMax.getDay()];

    if (monthMin === monthMax) {
      return 'Chegará entre <strong>' + weekDayMin + ', ' + dayMin + '</strong> e <strong>' + weekDayMax + ', ' + dayMax + ' de ' + monthMax + '</strong>';
    } else {
      return 'Chegará entre <strong>' + dayMin + ' de ' + monthMin + '</strong> e <strong>' + dayMax + ' de ' + monthMax + '</strong>';
    }
  }

  function updateShippingDates() {
    const normalEl = document.getElementById('shipping-date-normal');
    const expressEl = document.getElementById('shipping-date-express');
    if (normalEl) normalEl.innerHTML = '📅 ' + getDeliveryDateRange(7, 10);
    if (expressEl) expressEl.innerHTML = '📅 ' + getDeliveryDateRange(4, 7);
  }

  // Renderiza Cesta do Passo 1
  function renderCartTable() {
    const cart = loadCart();
    const container = document.getElementById('cart-table-items');
    if (!container) return;

    if (cart.items.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:30px;color:#94a3b8;">Sua cesta está vazia. <a href="index.html" style="color:#003399;font-weight:700;">Voltar à loja</a></div>';
      return;
    }

    let html = '';
    cart.items.forEach(item => {
      const price = item.currentUnitPrice || item.unitPrice || 1099.00;
      const itemTotal = price * item.quantity;
      const isProg = item.quantity >= 2;
      html += `
        <div class="cart-item-row-checkout">
          <img src="${item.image || '/images/tirzepatida-all.png'}" alt="${item.title}">
          <div class="cart-item-detail">
            <div class="cart-item-name">${item.title}</div>
            <div class="cart-item-seller">Vendido e entregue por <strong>Ultrafarma Medicamentos Especiais</strong></div>
            ${item.dosage ? `
              <div class="cart-item-dosage-tag">
                <span class="cart-item-dosage-dot" style="background:${item.color || '#003399'};"></span>
                <span>Dosagem: <strong>${item.dosage}</strong> (${item.volume || '0,5 mL'})</span>
              </div>
            ` : ''}
            ${isProg ? '<span style="font-size:10px;background:#ecfdf5;color:#047857;padding:2px 6px;border-radius:4px;font-weight:700;display:inline-block;margin-top:4px;">✓ Desconto Progressivo Aplicado</span>' : ''}
            <div class="cart-item-qty-and-price">
              <div class="cart-inline-counter">
                <button type="button" class="btn-change-qty" data-id="${item.id}" data-delta="-1">−</button>
                <input type="text" readonly value="${item.quantity}">
                <button type="button" class="btn-change-qty" data-id="${item.id}" data-delta="1">+</button>
              </div>
              <span class="cart-item-price-unit">${formatMoney(price)} cada</span>
              <span class="cart-item-price-total">${formatMoney(itemTotal)}</span>
              <button type="button" class="btn-remove-item" data-id="${item.id}" title="Excluir item">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;

    // Eventos dos botões de alterar e remover
    container.querySelectorAll('.btn-change-qty').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        const delta = parseInt(this.getAttribute('data-delta'), 10);
        const cart = loadCart();
        const item = cart.items.find(i => i.id === id);
        if (item) {
          item.quantity += delta;
          if (item.quantity <= 0) {
            cart.items = cart.items.filter(i => i.id !== id);
          }
          saveCart(cart);
          const currentCep = document.getElementById('cart-cep-input')?.value;
          if (currentCep && currentCep.replace(/\D/g, '').length === 8) {
            calculateCartCep(currentCep);
          }
        }
      });
    });

    container.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        const cart = loadCart();
        cart.items = cart.items.filter(i => i.id !== id);
        saveCart(cart);
      });
    });
  }

  // Renderiza Resumo Lateral
  function renderSummary() {
    const cart = loadCart();
    const totals = calculateTotals();

    const summaryList = document.getElementById('checkout-items-list');
    if (summaryList) {
      let html = '';
      cart.items.forEach(item => {
        const price = item.currentUnitPrice || item.unitPrice || 1099.00;
        html += `
          <div class="order-summary-item">
            <img src="${item.image || '/images/tirzepatida-all.png'}" alt="${item.title}">
            <div class="order-summary-item-info">
              <div class="order-summary-item-title">${item.title}</div>
              ${item.dosage ? `
                <div style="font-size:11px;color:#003399;font-weight:700;margin-top:2px;">
                  <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${item.color || '#003399'};margin-right:4px;"></span>
                  Dosagem: ${item.dosage} (4 canetas)
                </div>
              ` : ''}
              <div class="order-summary-item-meta">
                <span>Qtd: ${item.quantity}x ${formatMoney(price)}</span>
                <strong>${formatMoney(price * item.quantity)}</strong>
              </div>
            </div>
          </div>
        `;
      });
      summaryList.innerHTML = html;
    }

    const subtotalEl = document.getElementById('summary-subtotal');
    const shippingEl = document.getElementById('summary-shipping');
    const discountRow = document.getElementById('summary-discount-row');
    const discountEl = document.getElementById('summary-discount');
    const totalEl = document.getElementById('summary-total');

    if (subtotalEl) subtotalEl.textContent = formatMoney(totals.subtotal);
    if (shippingEl) {
      shippingEl.textContent = totals.shippingCost === 0 ? 'GRÁTIS' : formatMoney(totals.shippingCost);
      shippingEl.style.color = totals.shippingCost === 0 ? '#009640' : '#1e293b';
    }

    const normalLabel = document.getElementById('shipping-normal-label');
    if (normalLabel) {
      normalLabel.textContent = totals.isFreeShipping ? 'GRÁTIS' : 'R$ 14,90';
      normalLabel.style.color = totals.isFreeShipping ? '#009640' : '#1e293b';
    }

    if (discountRow && discountEl) {
      const totalDisc = totals.pixDiscount + totals.couponDiscount;
      if (totalDisc > 0) {
        discountRow.style.display = 'flex';
        discountEl.textContent = '- ' + formatMoney(totalDisc);
      } else {
        discountRow.style.display = 'none';
      }
    }

    if (totalEl) totalEl.textContent = formatMoney(totals.total);

    // Barra de Frete Grátis
    const freteText = document.getElementById('frete-progress-text');
    const freteFill = document.getElementById('frete-progress-fill');
    if (freteText && freteFill) {
      if (totals.isFreeShipping) {
        freteText.innerHTML = '🎉 <strong>Parabéns! Você ganhou Frete Grátis!</strong>';
        freteFill.style.width = '100%';
        freteFill.style.background = '#009640';
      } else {
        freteText.innerHTML = 'Faltam <strong>' + formatMoney(totals.missingForFree) + '</strong> para <strong>Frete Grátis</strong>!';
        freteFill.style.width = totals.progressPercent + '%';
        freteFill.style.background = '#003399';
      }
    }
  }

  function updateInstallments(val) {
    const sel = document.getElementById('card-installments');
    if (!sel) return;
    sel.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
      const p = val / i;
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${i}x de ${formatMoney(p)} sem juros`;
      sel.appendChild(opt);
    }
  }

  function renderAll() {
    renderCartTable();
    renderSummary();
    updateShippingDates();
  }

  // =========================================================================
  // SERVIÇO DE ENDEREÇO (VIACEP COM RESILIÊNCIA ULTRA-RÁPIDA)
  // =========================================================================
  function fetchAddressWithTimeout(cleanCep) {
    const timeout = new Promise(resolve => {
      setTimeout(() => {
        const c1 = parseInt(cleanCep[0], 10);
        let loc = 'São Paulo', uf = 'SP', b = 'Bela Vista', log = 'Avenida Paulista';
        if (cleanCep === '01310100') {
          loc = 'São Paulo'; uf = 'SP'; b = 'Bela Vista'; log = 'Avenida Paulista';
        } else if (c1 === 0 || c1 === 1) {
          loc = 'São Paulo'; uf = 'SP'; b = 'Jardins'; log = 'Rua Augusta';
        } else if (c1 === 2) {
          loc = 'Rio de Janeiro'; uf = 'RJ'; b = 'Copacabana'; log = 'Avenida Atlântica';
        } else if (c1 === 3) {
          loc = 'Belo Horizonte'; uf = 'MG'; b = 'Savassi'; log = 'Avenida Afonso Pena';
        } else if (c1 === 4) {
          loc = 'Salvador'; uf = 'BA'; b = 'Pituba'; log = 'Avenida Oceânica';
        } else if (c1 === 7) {
          loc = 'Brasília'; uf = 'DF'; b = 'Asa Sul'; log = 'SQS 102';
        } else if (c1 === 8) {
          loc = 'Curitiba'; uf = 'PR'; b = 'Batel'; log = 'Rua XV de Novembro';
        } else if (c1 === 9) {
          loc = 'Porto Alegre'; uf = 'RS'; b = 'Moinhos de Vento'; log = 'Rua dos Andradas';
        }
        resolve({
          cep: cleanCep,
          logradouro: log,
          bairro: b,
          localidade: loc,
          uf: uf
        });
      }, 700);
    });

    const realFetch = fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      .then(r => r.json())
      .then(d => {
        if (d.erro) throw new Error('CEP não encontrado');
        return d;
      });

    return Promise.race([realFetch, timeout]);
  }

  // =========================================================================
  // CÁLCULO DE FRETE NA CESTA COM PRÉVIA VISUAL DO VALOR
  // =========================================================================
  const cartCepInput = document.getElementById('cart-cep-input');
  const btnCalcCartCep = document.getElementById('btn-calc-cart-cep');
  const cartCepFeedback = document.getElementById('cart-cep-feedback');

  function calculateCartCep(cepRaw) {
    const cleanCep = (cepRaw || '').replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      if (cartCepFeedback) {
        cartCepFeedback.innerHTML = '<div class="coupon-error-box">Por favor, digite um CEP válido com 8 dígitos.</div>';
      }
      return;
    }

    if (btnCalcCartCep) btnCalcCartCep.textContent = '...';
    if (cartCepFeedback) {
      cartCepFeedback.innerHTML = '<div style="color:#003399;font-size:11px;margin-top:4px;">Buscando opções de frete...</div>';
    }

    fetchAddressWithTimeout(cleanCep)
      .then(data => {
        if (btnCalcCartCep) btnCalcCartCep.textContent = 'Calcular';

        cachedAddressData = {
          cep: cleanCep,
          formattedCep: cleanCep.slice(0, 5) + '-' + cleanCep.slice(5),
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          localidade: data.localidade || 'São Paulo',
          uf: data.uf || 'SP'
        };

        try {
          localStorage.setItem('monja_user_cep', cleanCep);
          localStorage.setItem('monja_cached_address', JSON.stringify(cachedAddressData));
        } catch(e) {}

        const totals = calculateTotals();
        const normalCostText = totals.isFreeShipping ? '<strong class="free">GRÁTIS</strong>' : '<strong>R$ 14,90</strong>';

        const dateNormal = getDeliveryDateRange(7, 10);
        const dateExpress = getDeliveryDateRange(4, 7);

        if (cartCepFeedback) {
          cartCepFeedback.innerHTML = `
            <div class="cep-preview-result-box">
              <div class="cep-preview-location">
                📍 <span>Envio refrigerado para: <strong>${data.localidade} - ${data.uf}</strong> ${data.bairro ? '(' + data.bairro + ')' : ''}</span>
              </div>
              <div class="cep-preview-options">
                <div class="cep-preview-option-row">
                  <div>
                    <span>🚚 Sedex Especial Refrigerado (7 a 10 dias úteis):</span>
                    <div style="font-size:11px;color:#009640;font-weight:600;margin-top:2px;">📅 ${dateNormal}</div>
                  </div>
                  ${normalCostText}
                </div>
                <div class="cep-preview-option-row">
                  <div>
                    <span>⚡ Entrega Expressa no Gelo (4 a 7 dias úteis):</span>
                    <div style="font-size:11px;color:#003399;font-weight:600;margin-top:2px;">📅 ${dateExpress}</div>
                  </div>
                  <strong>R$ 14,90</strong>
                </div>
              </div>
            </div>
          `;
        }

        renderSummary();
      })
      .catch(() => {
        if (btnCalcCartCep) btnCalcCartCep.textContent = 'Calcular';
        if (cartCepFeedback) {
          cartCepFeedback.innerHTML = '<div class="coupon-error-box">Erro ao consultar CEP. Tente novamente.</div>';
        }
      });
  }

  if (cartCepInput) {
    cartCepInput.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 8);
      if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
      e.target.value = v;
      if (v.replace(/\D/g, '').length === 8) {
        calculateCartCep(v);
      }
    });

    cartCepInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        calculateCartCep(cartCepInput.value);
      }
    });
  }

  if (btnCalcCartCep) {
    btnCalcCartCep.addEventListener('click', () => {
      calculateCartCep(cartCepInput?.value);
    });
  }

  // =========================================================================
  // CUPOM DE DESCONTO
  // =========================================================================
  const couponInput = document.getElementById('input-coupon');
  const btnApplyCoupon = document.getElementById('btn-apply-coupon');
  const couponFeedback = document.getElementById('coupon-feedback');

  if (btnApplyCoupon && couponInput) {
    btnApplyCoupon.addEventListener('click', () => {
      const code = (couponInput.value || '').trim().toUpperCase();
      if (!code) {
        if (couponFeedback) couponFeedback.innerHTML = '<div class="coupon-error-box">Informe um código de cupom.</div>';
        return;
      }
      if (code === 'ULTRA10' || code === 'SIDNEY10' || code === 'PRIMEIRACOMPRA') {
        const cart = loadCart();
        let sub = 0;
        cart.items.forEach(i => sub += (i.currentUnitPrice || 97.99) * i.quantity);
        couponDiscount = sub * 0.10;
        if (couponFeedback) {
          couponFeedback.innerHTML = '<div class="coupon-success-box">✓ Cupom ' + code + ' aplicado! (10% de desconto)</div>';
        }
        renderSummary();
      } else {
        if (couponFeedback) {
          couponFeedback.innerHTML = '<div class="coupon-error-box">Cupom inválido ou expirado. Teste: <strong>ULTRA10</strong></div>';
        }
      }
    });
  }

  // =========================================================================
  // AUTO-PREENCHIMENTO INTELIGENTE NO PASSO 2 (ENTREGA)
  // =========================================================================
  function prefillAddressFromCep(cepRaw) {
    const cleanCep = (cepRaw || '').replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    const inputCep = document.getElementById('input-cep');
    if (inputCep) {
      inputCep.value = cleanCep.slice(0, 5) + '-' + cleanCep.slice(5);
    }

    if (cachedAddressData && cachedAddressData.cep === cleanCep) {
      applyAddressFields(cachedAddressData);
      return;
    }

    fetchAddressWithTimeout(cleanCep).then(data => {
      cachedAddressData = {
        cep: cleanCep,
        formattedCep: cleanCep.slice(0, 5) + '-' + cleanCep.slice(5),
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        localidade: data.localidade || 'São Paulo',
        uf: data.uf || 'SP'
      };
      applyAddressFields(cachedAddressData);
    });
  }

  function applyAddressFields(data) {
    const street = document.getElementById('input-street');
    const neighborhood = document.getElementById('input-neighborhood');
    const city = document.getElementById('input-city');
    const state = document.getElementById('input-state');
    const num = document.getElementById('input-number');

    if (street && data.logradouro) street.value = data.logradouro;
    if (neighborhood && data.bairro) neighborhood.value = data.bairro;
    if (city && data.localidade) city.value = data.localidade;
    if (state && data.uf) state.value = data.uf;

    if (window.LocationManager && data.localidade) {
      window.LocationManager.onCepResolved(data.localidade, data.uf);
    }

    if (street && street.value && num && !num.value) {
      setTimeout(() => num.focus(), 120);
    }
  }

  // Navegação entre passos
  function goToStep(step) {
    currentStep = step;

    // Panes
    document.querySelectorAll('.checkout-step-pane').forEach((p, idx) => {
      if (idx + 1 === step) p.classList.add('active');
      else p.classList.remove('active');
    });

    // Stepper Nav
    for (let i = 1; i <= 4; i++) {
      const navItem = document.getElementById('step-nav-' + i);
      const line = document.getElementById('line-' + i);
      if (navItem) {
        if (i === step) {
          navItem.className = 'step-item active';
        } else if (i < step) {
          navItem.className = 'step-item completed';
        } else {
          navItem.className = 'step-item';
        }
      }
      if (line) {
        if (i < step) line.className = 'step-line completed';
        else line.className = 'step-line';
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderAll();
  }
  window.goToStep = goToStep;

  // BOTÃO AVANÇAR PARA A ENTREGA (PUXA DADOS DO CEP AUTOMATICAMENTE)
  const btnStep2 = document.getElementById('btn-go-to-step-2');
  if (btnStep2) {
    btnStep2.addEventListener('click', () => {
      const cepStep1 = cartCepInput?.value || localStorage.getItem('monja_user_cep');
      if (cepStep1) {
        prefillAddressFromCep(cepStep1);
      }
      goToStep(2);
    });
  }

  const btnStep3 = document.getElementById('btn-go-to-step-3');
  if (btnStep3) {
    btnStep3.addEventListener('click', () => {
      // Limpa erros anteriores
      document.querySelectorAll('.field-error-msg').forEach(el => el.remove());
      document.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));

      const requiredFields = [
        { id: 'input-name',         label: 'Nome Completo' },
        { id: 'input-email',        label: 'E-mail' },
        { id: 'input-cpf',          label: 'CPF' },
        { id: 'input-phone',        label: 'Celular / WhatsApp' },
        { id: 'input-cep',          label: 'CEP' },
        { id: 'input-street',       label: 'Rua / Logradouro' },
        { id: 'input-number',       label: 'Número' },
        { id: 'input-neighborhood', label: 'Bairro' },
        { id: 'input-city',         label: 'Cidade' },
        { id: 'input-state',        label: 'UF' }
      ];

      let hasError = false;
      let firstErrorEl = null;

      requiredFields.forEach(field => {
        const el = document.getElementById(field.id);
        if (!el) return;
        const val = el.value.trim();
        if (!val) {
          hasError = true;
          el.classList.add('field-error');
          const msg = document.createElement('div');
          msg.className = 'field-error-msg';
          msg.textContent = field.label + ' é obrigatório';
          el.parentNode.insertBefore(msg, el.nextSibling);
          if (!firstErrorEl) firstErrorEl = el;
        }
      });

      // Validação extra: CPF deve ter 11 dígitos
      const cpfEl = document.getElementById('input-cpf');
      if (cpfEl && cpfEl.value.replace(/\D/g, '').length !== 11) {
        if (!cpfEl.classList.contains('field-error')) {
          cpfEl.classList.add('field-error');
          const msg = document.createElement('div');
          msg.className = 'field-error-msg';
          msg.textContent = 'CPF inválido — informe os 11 dígitos';
          cpfEl.parentNode.insertBefore(msg, cpfEl.nextSibling);
          if (!firstErrorEl) firstErrorEl = cpfEl;
          hasError = true;
        }
      }

      // Validação extra: telefone deve ter ao menos 10 dígitos
      const phoneEl = document.getElementById('input-phone');
      if (phoneEl && phoneEl.value.replace(/\D/g, '').length < 10) {
        if (!phoneEl.classList.contains('field-error')) {
          phoneEl.classList.add('field-error');
          const msg = document.createElement('div');
          msg.className = 'field-error-msg';
          msg.textContent = 'Celular inválido — informe DDD + número';
          phoneEl.parentNode.insertBefore(msg, phoneEl.nextSibling);
          if (!firstErrorEl) firstErrorEl = phoneEl;
          hasError = true;
        }
      }

      if (hasError) {
        if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return; // bloqueia o avanço
      }

      // Avança para o passo 3 e dispara a geração do PIX
      goToStep(3);
      gerarPixReal();
    });
  }

  // Gera o PIX real via FlevoPay ao entrar no passo 3
  async function gerarPixReal() {
    const nameEl   = document.getElementById('input-name');
    const emailEl  = document.getElementById('input-email');
    const phoneEl  = document.getElementById('input-phone');
    const cpfEl    = document.getElementById('input-cpf');
    const cepEl    = document.getElementById('input-cep');
    const streetEl = document.getElementById('input-street');
    const numberEl = document.getElementById('input-number');
    const neighEl  = document.getElementById('input-neighborhood');
    const cityEl   = document.getElementById('input-city');
    const stateEl  = document.getElementById('input-state');

    const customerName  = nameEl  ? nameEl.value.trim()             : '';
    const customerEmail = emailEl ? emailEl.value.trim()            : '';
    const customerPhone = phoneEl ? phoneEl.value.replace(/\D/g,'') : '';
    const customerCpf   = cpfEl   ? cpfEl.value.replace(/\D/g,'')   : '';
    const customerCep   = cepEl   ? cepEl.value.replace(/\D/g,'')   : '';

    const totals = calculateTotals();
    let totalValue = totals.total;

    const orderbumpCb = document.getElementById('orderbump-agulhas');
    if (orderbumpCb && orderbumpCb.checked) totalValue += 49.90;

    const amountCents = Math.round(totalValue * 100);
    const reference   = 'ULT-' + Date.now();

    const pixLoading   = document.getElementById('pix-loading');
    const pixContent   = document.getElementById('pix-content-real');
    const pixCodeInput = document.getElementById('pix-copia-cola');
    const pixQrWrapper = document.getElementById('pix-qr-wrapper');

    // Mostra spinner, esconde QR placeholder
    if (pixLoading) pixLoading.style.display = 'block';
    if (pixContent) pixContent.style.display = 'none';

    try {
      const resp = await fetch('/api/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount:      amountCents,
          description: 'Tirzepatida T.G. - Ultrafarma',
          reference,
          customer: {
            name:     customerName,
            email:    customerEmail,
            phone:    customerPhone,
            document: customerCpf
          },
          address: {
            street:       streetEl ? streetEl.value.trim() : '',
            number:       numberEl ? numberEl.value.trim() : '',
            neighborhood: neighEl  ? neighEl.value.trim()  : '',
            city:         cityEl   ? cityEl.value.trim()   : '',
            state:        stateEl  ? stateEl.value.trim()  : '',
            zipcode:      customerCep
          },
          utms: getUtms()
        })
      });

      const data = await resp.json();

      if (pixLoading) pixLoading.style.display = 'none';
      if (pixContent) pixContent.style.display = 'block';

      if (data.success && data.qr_code_text) {
        if (pixCodeInput) pixCodeInput.value = data.qr_code_text;

        // Gera QR Code no frontend com qrcode.js (API retorna só o texto EMV)
        if (pixQrWrapper) {
          if (typeof QRCode !== 'undefined') {
            QRCode.toDataURL(data.qr_code_text, {
              errorCorrectionLevel: 'M',
              width: 260,
              margin: 2,
              color: { dark: '#000000', light: '#ffffff' }
            }, function(err, url) {
              if (!err && url) {
                pixQrWrapper.innerHTML = '<img src="' + url + '" alt="QR Code PIX" style="width:220px;height:220px;border-radius:8px;display:block;margin:0 auto;">';
              } else {
                pixQrWrapper.innerHTML = '<div style="color:#ef4444;text-align:center;padding:16px;font-size:13px;">⚠️ Erro ao exibir QR.<br>Use o código Copia e Cola abaixo.</div>';
              }
            });
          } else {
            // Fallback: mostra apenas o texto (QRCode.js não carregou)
            pixQrWrapper.innerHTML = '<div style="color:#64748b;text-align:center;padding:16px;font-size:12px;">Use o código Copia e Cola abaixo.</div>';
          }
        }

        // Salva dados do pedido para o polling usar ao confirmar pagamento
        try { localStorage.setItem('monja_pix_txid',       data.transaction_id); } catch(e) {}
        try { localStorage.setItem('monja_pix_ref',        reference); } catch(e) {}
        try { localStorage.setItem('monja_pix_created_at', data.created_at || new Date().toISOString()); } catch(e) {}
        try { localStorage.setItem('monja_pix_amount',     amountCents); } catch(e) {}
        try { localStorage.setItem('monja_pix_customer',   JSON.stringify({ name: customerName, email: customerEmail, document: customerCpf })); } catch(e) {}
        try { localStorage.setItem('monja_pix_utms',       JSON.stringify(getUtms())); } catch(e) {}

        // Polling automático a cada 5s por até 10 min
        startPixPolling(data.transaction_id, reference);

      } else {
        if (pixQrWrapper) {
          pixQrWrapper.innerHTML = '<div style="color:#ef4444;text-align:center;padding:20px;font-size:13px;">⚠️ Erro ao gerar PIX.<br>Tente recarregar ou entre em contato.</div>';
        }
        console.error('FlevoPay error:', data);
      }

    } catch (err) {
      if (pixLoading) pixLoading.style.display = 'none';
      if (pixContent) pixContent.style.display = 'block';
      if (pixQrWrapper) {
        pixQrWrapper.innerHTML = '<div style="color:#ef4444;text-align:center;padding:20px;font-size:13px;">⚠️ Sem conexão.<br>Verifique sua internet e tente novamente.</div>';
      }
      console.error('PIX fetch error:', err);
    }
  }

  const btnBack1 = document.getElementById('btn-back-to-step-1');
  if (btnBack1) {
    btnBack1.addEventListener('click', () => goToStep(1));
  }

  const btnBack2 = document.getElementById('btn-back-to-step-2');
  if (btnBack2) {
    btnBack2.addEventListener('click', () => goToStep(2));
  }

  // Máscaras de entrada
  const cpfIn = document.getElementById('input-cpf');
  if (cpfIn) {
    cpfIn.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 11);
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      e.target.value = v;
    });
  }

  const phoneIn = document.getElementById('input-phone');
  if (phoneIn) {
    phoneIn.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 11);
      v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
      v = v.replace(/(\d)(\d{4})$/, '$1-$2');
      e.target.value = v;
    });
  }

  const cepIn = document.getElementById('input-cep');
  if (cepIn) {
    cepIn.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 8);
      if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
      e.target.value = v;
      if (v.replace(/\D/g, '').length === 8) {
        lookupCep(v.replace(/\D/g, ''));
      }
    });
  }

  function lookupCep(cep) {
    const btn = document.getElementById('btn-search-cep');
    if (btn) btn.textContent = '...';
    fetchAddressWithTimeout(cep).then(data => {
      if (btn) btn.textContent = 'Buscar';
      applyAddressFields(data);
    });
  }

  const btnSearchCep = document.getElementById('btn-search-cep');
  if (btnSearchCep) {
    btnSearchCep.addEventListener('click', () => {
      const c = (document.getElementById('input-cep')?.value || '').replace(/\D/g, '');
      if (c.length === 8) lookupCep(c);
    });
  }

  // Troca de método de envio
  const shippingRadios = document.querySelectorAll('input[name="shipping_option"]');
  shippingRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      document.querySelectorAll('.shipping-option-item').forEach(item => {
        item.classList.remove('selected');
      });
      this.closest('.shipping-option-item')?.classList.add('selected');
      renderSummary();
    });
  });

  // Pagamento 100% Exclusivo via PIX
  currentPaymentMethod = 'pix';

  // Copiar PIX — dispara evento UTMify waiting_payment no 1º clique
  const btnCopyPix = document.getElementById('btn-copy-pix');
  const pixInput = document.getElementById('pix-copia-cola');
  let utmifyPixNotified = false; // garante que envia apenas uma vez

  if (btnCopyPix && pixInput) {
    btnCopyPix.addEventListener('click', () => {
      pixInput.select();
      navigator.clipboard.writeText(pixInput.value).then(() => {
        btnCopyPix.textContent = 'Copiado!';
        setTimeout(() => { btnCopyPix.textContent = 'Copiar Código PIX'; }, 2500);
      });

      // Notifica UTMify (apenas no 1º clique de cópia)
      if (!utmifyPixNotified) {
        utmifyPixNotified = true;
        try {
          let customer = {}, utms = {};
          try { customer = JSON.parse(localStorage.getItem('monja_pix_customer') || '{}'); } catch(e) {}
          try { utms    = JSON.parse(localStorage.getItem('monja_pix_utms')     || '{}'); } catch(e) {}
          const orderId    = localStorage.getItem('monja_pix_ref')        || '';
          const amountCents= localStorage.getItem('monja_pix_amount')     || 0;
          const createdAt  = localStorage.getItem('monja_pix_created_at') || '';

          fetch('/api/utmify-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId, status: 'waiting_payment',
              customer, amountCents, createdAt, utms,
              description: 'Tirzepatida T.G. Solução Injetável'
            })
          }).catch(() => {}); // silencioso, não bloqueia o usuário
        } catch(e) {}
      }
    });
  }

  // Finalizar Pedido
  const btnFinalize = document.getElementById('btn-finalize-order');
  const modalSuccess = document.getElementById('modal-success');
  const orderNumberEl = document.getElementById('success-order-number');

  if (btnFinalize) {
    btnFinalize.addEventListener('click', () => {
      // O PIX já foi gerado ao entrar no passo 3.
      // Este botão serve como confirmação manual caso o polling não avance automaticamente.
      const savedRef = localStorage.getItem('monja_pix_ref') || ('ULT-' + Date.now());
      localStorage.removeItem('monja_ecommerce_cart');
      localStorage.removeItem('monja_pix_txid');
      localStorage.removeItem('monja_pix_ref');
      if (orderNumberEl) orderNumberEl.textContent = '#' + savedRef;
      goToStep(4);
      if (modalSuccess) modalSuccess.style.display = 'flex';
    });
  }

  // Polling: verifica se o PIX foi pago a cada 5s por até 10 min
  function startPixPolling(transactionId, reference) {
    if (!transactionId) return;
    let attempts = 0;
    const maxAttempts = 120; // 10 minutos

    const interval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) { clearInterval(interval); return; }
      try {
        const resp = await fetch('/api/pix-status?id=' + encodeURIComponent(transactionId));
        const data = await resp.json();

        if (data.status === 'approved') {
          clearInterval(interval);

          // Notifica UTMify: PIX pago
          try {
            let customer = {}, utms = {};
            try { customer = JSON.parse(localStorage.getItem('monja_pix_customer') || '{}'); } catch(e) {}
            try { utms    = JSON.parse(localStorage.getItem('monja_pix_utms')     || '{}'); } catch(e) {}
            const amountCents = localStorage.getItem('monja_pix_amount')     || 0;
            const createdAt   = localStorage.getItem('monja_pix_created_at') || '';
            fetch('/api/utmify-event', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: reference, status: 'paid',
                customer, amountCents, createdAt, utms,
                description: 'Tirzepatida T.G. Solução Injetável'
              })
            }).catch(() => {});
          } catch(e) {}

          // Limpa localStorage e avança para confirmação
          ['monja_ecommerce_cart','monja_pix_txid','monja_pix_ref',
           'monja_pix_created_at','monja_pix_amount','monja_pix_customer','monja_pix_utms']
            .forEach(k => localStorage.removeItem(k));
          if (orderNumberEl) orderNumberEl.textContent = '#' + reference;
          goToStep(4);
          if (modalSuccess) modalSuccess.style.display = 'flex';
        }
      } catch (e) { /* continua tentando */ }
    }, 5000);
  }

  // Orderbump: Agulhas BD — ajusta o total ao marcar/desmarcar
  const orderbumpCheck = document.getElementById('orderbump-agulhas');
  if (orderbumpCheck) {
    orderbumpCheck.addEventListener('change', function() {
      renderSummary();
    });
  }

  // Override renderSummary para incluir orderbump no total
  const _origRenderSummary = renderSummary;
  function renderSummaryWithOrderbump() {
    _origRenderSummary();
    const cb = document.getElementById('orderbump-agulhas');
    if (cb && cb.checked) {
      const totalEl = document.getElementById('summary-total');
      if (totalEl) {
        const currentText = totalEl.textContent.replace(/[^\d,]/g, '').replace(',', '.');
        const currentVal = parseFloat(currentText) || 0;
        totalEl.textContent = formatMoney(currentVal + 49.90);
      }
    }
  }

  // =========================================================================
  // CARREGAMENTO INICIAL
  // =========================================================================
  renderAll();

  // Verifica se o usuário já havia digitado CEP anteriormente
  try {
    const savedCep = localStorage.getItem('monja_user_cep');
    if (savedCep && cartCepInput) {
      let formatted = savedCep.replace(/\D/g, '').slice(0, 8);
      if (formatted.length > 5) formatted = formatted.slice(0, 5) + '-' + formatted.slice(5);
      cartCepInput.value = formatted;
      calculateCartCep(savedCep);
    }
  } catch(e) {}
});
