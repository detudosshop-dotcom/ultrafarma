/**
 * LÓGICA ULTRA-FLUIDA DA PÁGINA DE PRODUTO ULTRAFARMA
 * Suporte a Tirzepatida, Carrossel de Caixas Individuais e Seletor Interativo
 */
document.addEventListener('DOMContentLoaded', function() {
  const config = window.STORE_CONFIG || {};
  const productConfig = config.product || {};
  const variants = productConfig.variants || [];

  // Mapeamento de imagens para cada dosagem
  const variantImages = {
    'tirz-2-5': '/images/box-2-5.jpg',
    'tirz-5-0': '/images/box-5-0.jpg',
    'tirz-7-5': '/images/box-7-5.jpg',
    'tirz-10-0': '/images/tirzepatida-all.png',
    'tirz-12-5': '/images/tirzepatida-all.png',
    'tirz-15-0': '/images/tirzepatida-all.png'
  };

  // Variável de estado da dosagem selecionada (padrão 2,5 mg)
  let selectedVariant = variants.find(v => v.id === productConfig.defaultVariantId) || variants[0] || {
    id: 'tirz-2-5',
    dosage: '2,5 mg',
    volume: '0,5 mL',
    badge: 'Dose Inicial',
    color: '#6b7280',
    priceOriginal: 1490.00,
    pricePromo: 1099.00,
    pixPrice: 1066.03,
    installmentCount: 3,
    installmentValue: 366.33,
    cashbackValue: 54.95,
    progressivePrice2: 989.10,
    sku: 'TRZ-25-TG',
    ean: '7891023501021',
    title: 'Tirzepatida T.G. 2,5 mg/0,5 mL Solução Injetável (4 Canetas Aplicadoras)'
  };

  function formatMoney(val) {
    return 'R$ ' + (val || 0).toFixed(2).replace('.', ',');
  }

  // Galeria de Fotos
  const mainImage = document.getElementById('product-image');
  const thumbnails = document.querySelectorAll('.thumb-item');

  function changeMainImage(src) {
    if (!mainImage || !src) return;
    mainImage.style.opacity = '0.5';
    setTimeout(() => {
      mainImage.src = src;
      mainImage.style.opacity = '1';
    }, 70);
  }

  function highlightThumbForVariant(variantId) {
    thumbnails.forEach(t => {
      const tVid = t.getAttribute('data-variant-id');
      if (tVid === variantId) {
        t.classList.add('active');
        t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        t.classList.remove('active');
      }
    });
  }

  // Atualiza todos os elementos de preço, títulos e imagem com a dosagem selecionada
  function updateVariantUI(variant) {
    selectedVariant = variant;

    // Título e Código
    const titleEl = document.getElementById('pdp-product-title');
    const codeEl = document.getElementById('pdp-product-code');
    if (titleEl) titleEl.textContent = variant.title;
    if (codeEl) codeEl.innerHTML = 'Código: <strong>' + variant.sku + '</strong>';

    // Preços Card Principal
    const priceDeEl = document.getElementById('pdp-price-de');
    const priceCashbackEl = document.getElementById('pdp-price-cashback');
    const pricePorEl = document.getElementById('pdp-price-por');
    const priceInstallmentsEl = document.getElementById('pdp-price-installments');
    const pricePixEl = document.getElementById('pdp-price-pix');
    const unitPromoNoteEl = document.getElementById('pdp-unit-promo-note');

    if (priceDeEl) priceDeEl.textContent = 'De ' + formatMoney(variant.priceOriginal);
    if (priceCashbackEl) priceCashbackEl.textContent = '*Cashback ' + formatMoney(variant.cashbackValue);
    if (pricePorEl) pricePorEl.textContent = formatMoney(variant.pricePromo);
    if (priceInstallmentsEl) {
      priceInstallmentsEl.innerHTML = 'em até <strong>' + variant.installmentCount + 'x de ' + formatMoney(variant.installmentValue) + '</strong> sem juros';
    }
    if (pricePixEl) pricePixEl.textContent = formatMoney(variant.pixPrice);
    if (unitPromoNoteEl) {
      unitPromoNoteEl.innerHTML = 'Preço unitário no combo de 2 un: <strong>' + formatMoney(variant.progressivePrice2) + ' cada</strong>';
    }

    // Cards de Desconto Progressivo
    const prog1 = document.getElementById('prog-price-qty1');
    const prog2 = document.getElementById('prog-price-qty2');
    if (prog1) prog1.textContent = formatMoney(variant.pricePromo);
    if (prog2) prog2.textContent = formatMoney(variant.progressivePrice2);

    // Troca a foto da galeria para a foto da caixa selecionada (se disponível)
    const boxImg = variantImages[variant.id] || '/images/tirzepatida-all.png';
    changeMainImage(boxImg);
    highlightThumbForVariant(variant.id);
  }

  // 1. Interação do Seletor de Dosagens (Pills)
  const dosagePills = document.querySelectorAll('.dosage-pill-btn');
  dosagePills.forEach(pill => {
    pill.addEventListener('click', function(e) {
      e.preventDefault();
      dosagePills.forEach(p => p.classList.remove('active'));
      this.classList.add('active');

      const variantId = this.getAttribute('data-variant-id');
      const found = variants.find(v => v.id === variantId);
      if (found) {
        updateVariantUI(found);
      }
    });
  });

  // 2. Interação com as Miniaturas do Carrossel de Fotos
  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', function(e) {
      e.preventDefault();
      thumbnails.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      const targetSrc = this.getAttribute('data-img');
      changeMainImage(targetSrc);

      const targetVid = this.getAttribute('data-variant-id');
      if (targetVid && targetVid !== 'all') {
        const found = variants.find(v => v.id === targetVid);
        if (found) {
          dosagePills.forEach(p => {
            if (p.getAttribute('data-variant-id') === targetVid) {
              p.classList.add('active');
            } else {
              p.classList.remove('active');
            }
          });
          updateVariantUI(found);
        }
      }
    });
  });

  // 3. Controle de Quantidade da PDP - 100% fluido e sem bugs
  let currentQuantity = 1;
  const qtyInput = document.getElementById('pdp-quantity-input');
  const btnMinus = document.getElementById('pdp-btn-minus');
  const btnPlus = document.getElementById('pdp-btn-plus');

  function setQty(newQty) {
    newQty = parseInt(newQty, 10);
    if (isNaN(newQty) || newQty < 1) newQty = 1;
    currentQuantity = newQty;
    if (qtyInput) qtyInput.value = currentQuantity;
    if (btnMinus) {
      btnMinus.style.opacity = currentQuantity <= 1 ? '0.4' : '1';
      btnMinus.style.cursor = currentQuantity <= 1 ? 'not-allowed' : 'pointer';
    }
  }

  if (btnMinus) {
    btnMinus.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      setQty(currentQuantity - 1);
    });
  }

  if (btnPlus) {
    btnPlus.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      setQty(currentQuantity + 1);
    });
  }

  // Constrói objeto completo para o CartManager com a dosagem e imagem correspondente
  function getProductToAdd() {
    const itemImg = variantImages[selectedVariant.id] || '/images/tirzepatida-all.png';
    return {
      id: selectedVariant.id,
      variantId: selectedVariant.id,
      sku: selectedVariant.sku,
      dosage: selectedVariant.dosage,
      volume: selectedVariant.volume,
      color: selectedVariant.color,
      colorName: selectedVariant.colorName,
      badge: selectedVariant.badge,
      title: selectedVariant.title,
      pricePromo: selectedVariant.pricePromo,
      priceOriginal: selectedVariant.priceOriginal,
      progressivePrice2: selectedVariant.progressivePrice2,
      pixPrice: selectedVariant.pixPrice,
      images: [{ thumb: itemImg, large: itemImg }]
    };
  }

  // 4. Botão Principal "Comprar"
  const btnBuyMain = document.getElementById('btn-buy-main');
  if (btnBuyMain) {
    btnBuyMain.addEventListener('click', function(e) {
      e.preventDefault();
      const qty = parseInt(qtyInput ? qtyInput.value : currentQuantity, 10) || 1;
      if (window.CartManager) {
        window.CartManager.addItem(getProductToAdd(), qty);
      }
    });
  }

  // 6. Cards de Desconto Progressivo (1 un. e 2 un.)
  const progressiveBuyButtons = document.querySelectorAll('.progressive-buy-action');
  progressiveBuyButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const qty = parseInt(this.getAttribute('data-qty'), 10) || 1;
      setQty(qty);
      if (window.CartManager) {
        window.CartManager.addItem(getProductToAdd(), qty);
      }
    });
  });

  // 7. Abas / Acordeões
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', function() {
      const item = this.parentElement;
      item.classList.toggle('active');
    });
  });

  // 8. Calculador de Frete PDP com Resposta Instantânea
  const btnCalcularFrete = document.getElementById('btn-calc-frete-pdp');
  const cepInput = document.getElementById('cep-pdp-input');
  const freteOutput = document.getElementById('frete-result-pdp');

  function renderFreteResult() {
    if (!freteOutput) return;
    freteOutput.innerHTML = `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:10px;margin-top:8px;font-size:12px;">
        <div style="display:flex;justify-content:space-between;color:#166534;font-weight:700;">
          <span>🚚 Sedex Refrigerado (2°C a 8°C):</span>
          <span style="color:#009640;">GRÁTIS (Cortesia Especial)</span>
        </div>
        <div style="font-size:11px;color:#4b5563;margin-top:4px;">Embalagem isotérmica especial com gel biológico lacrado. Prazo: 1 a 2 dias úteis.</div>
      </div>
    `;
  }

  if (btnCalcularFrete && cepInput && freteOutput) {
    btnCalcularFrete.addEventListener('click', function() {
      const cep = cepInput.value.replace(/\D/g, '');
      if (cep.length !== 8) {
        freteOutput.innerHTML = '<div style="color:#ef4444;font-size:12px;margin-top:6px;">Por favor, digite um CEP válido com 8 dígitos.</div>';
        return;
      }
      try { localStorage.setItem('monja_user_cep', cep); } catch(e){}
      renderFreteResult();
    });

    cepInput.addEventListener('input', function(e) {
      let v = e.target.value.replace(/\D/g, '').slice(0, 8);
      if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
      e.target.value = v;
      if (v.replace(/\D/g, '').length === 8) {
        const rawCep = v.replace(/\D/g, '');
        try { localStorage.setItem('monja_user_cep', rawCep); } catch(e){}
        renderFreteResult();
        if (window.LocationManager) {
          fetch('https://viacep.com.br/ws/' + rawCep + '/json/')
            .then(function(r){ return r.json(); })
            .then(function(data){
              if (data && !data.erro && data.localidade) {
                window.LocationManager.onCepResolved(data.localidade, data.uf);
              }
            })
            .catch(function(){});
        }
      }
    });
  }

  // 9. Botão de Favoritar
  const btnFavorite = document.getElementById('btn-favorite');
  if (btnFavorite) {
    btnFavorite.addEventListener('click', function() {
      this.classList.toggle('favorited');
    });
  }

  // 10. Botão de Compartilhar
  const btnShare = document.getElementById('btn-share');
  const shareModal = document.getElementById('compartilharProdutoModal');
  if (btnShare && shareModal) {
    btnShare.addEventListener('click', function() {
      shareModal.style.display = 'flex';
    });
  }

  // 11. Fechamento de Modais
  document.querySelectorAll('.modal-close').forEach(el => {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      const modal = document.getElementById('produtoAdicionadoModal');
      if (modal) modal.style.display = 'none';
      if (shareModal) shareModal.style.display = 'none';
    });
  });

  window.addEventListener('click', function(e) {
    const modal = document.getElementById('produtoAdicionadoModal');
    if (e.target === modal) modal.style.display = 'none';
    if (e.target === shareModal) shareModal.style.display = 'none';
  });

  const btnCopyShare = document.getElementById('btn-copy-share-link');
  const shareInput = document.getElementById('share-link-input');
  if (btnCopyShare && shareInput) {
    shareInput.value = window.location.href;
    btnCopyShare.addEventListener('click', function() {
      shareInput.select();
      navigator.clipboard.writeText(shareInput.value).then(() => {
        btnCopyShare.textContent = 'Link Copiado!';
        setTimeout(() => {
          btnCopyShare.textContent = 'Copiar Link';
        }, 2000);
      });
    });
  }
});
