/**
 * GERENCIADOR DE CARRINHO / CESTA ULTRAFARMA
 * Suporte completo a variantes de dosagem de Tirzepatida
 */
(function() {
  const CART_STORAGE_KEY = 'monja_ecommerce_cart';

  window.CartManager = {
    getCart: function() {
      try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error('Erro ao ler carrinho do localStorage', e);
      }
      return { items: [] };
    },

    saveCart: function(cart) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (e) {
        console.error('Erro ao salvar carrinho no localStorage', e);
      }
      this.updateBadges();
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
    },

    addItem: function(product, quantity) {
      quantity = parseInt(quantity, 10);
      if (isNaN(quantity) || quantity <= 0) quantity = 1;

      const cart = this.getCart();
      const itemId = product.id || product.variantId || 'tirz-2-5';
      const existing = cart.items.find(i => i.id === itemId);

      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.items.push({
          id: itemId,
          variantId: product.variantId || itemId,
          sku: product.sku || 'TRZ-TG',
          title: product.title || 'Tirzepatida T.G. Solução Injetável',
          dosage: product.dosage || '2,5 mg',
          volume: product.volume || '0,5 mL',
          color: product.color || '#6b7280',
          image: (product.images && product.images[0]) ? (product.images[0].thumb || product.images[0]) : '/images/tirzepatida-all.png',
          unitPrice: product.pricePromo || 1099.00,
          progressivePrice2: product.progressivePrice2 || (product.pricePromo ? product.pricePromo * 0.9 : 989.10),
          priceOriginal: product.priceOriginal || 1490.00,
          quantity: quantity
        });
      }

      this.saveCart(cart);
      this.showAddedModal(product, quantity);
    },

    setQuantity: function(productId, qty) {
      const cart = this.getCart();
      const item = cart.items.find(i => i.id === productId);
      if (item) {
        if (qty <= 0) {
          cart.items = cart.items.filter(i => i.id !== productId);
        } else {
          item.quantity = qty;
        }
        this.saveCart(cart);
      }
    },

    changeQuantity: function(productId, delta) {
      const cart = this.getCart();
      const item = cart.items.find(i => i.id === productId);
      if (item) {
        this.setQuantity(productId, item.quantity + delta);
      }
    },

    removeItem: function(productId) {
      const cart = this.getCart();
      cart.items = cart.items.filter(i => i.id !== productId);
      this.saveCart(cart);
    },

    getTotals: function() {
      const cart = this.getCart();
      let subtotal = 0;
      let totalItems = 0;
      let totalOriginal = 0;

      cart.items.forEach(item => {
        totalItems += item.quantity;
        let price = item.unitPrice || 1099.00;
        if (item.quantity >= 2 && item.progressivePrice2) {
          price = item.progressivePrice2;
        }
        item.currentUnitPrice = price;
        subtotal += price * item.quantity;
        totalOriginal += (item.priceOriginal || (price * 1.35)) * item.quantity;
      });

      const freeThreshold = window.STORE_CONFIG?.checkout?.freeShippingThreshold || 100;
      const freeShipping = true; // Tirzepatida sempre qualifica para frete refrigerado grátis
      const shipping = 0;
      const total = subtotal + shipping;

      return {
        totalItems,
        subtotal,
        totalOriginal,
        shipping,
        freeShipping,
        missingForFreeShipping: 0,
        freeShippingProgress: 100,
        total
      };
    },

    showAddedModal: function(product, addedQty) {
      const modal = document.getElementById('produtoAdicionadoModal');
      const metaEl = document.getElementById('modal-item-meta');
      const imgEl = document.getElementById('modal-item-img');

      const cart = this.getCart();
      const totals = this.getTotals();

      if (imgEl) {
        imgEl.src = (product.images && product.images[0]) ? (product.images[0].thumb || product.images[0]) : '/images/tirzepatida-all.png';
      }

      const nameEl = document.getElementById('modal-item-name');
      if (nameEl) {
        nameEl.textContent = (product.name || product.title || 'Tirzepatida T.G.') + (product.dosage ? ' - ' + product.dosage : '');
      }

      if (metaEl) {
        const dosageLabel = product.dosage ? ' (' + product.dosage + ')' : '';
        metaEl.innerHTML = 'Dosagem: <strong>' + (product.dosage || '2,5 mg') + '</strong> • Adicionado: <strong>' + addedQty + ' un.</strong><br>Total na cesta: <strong>' + this.formatMoney(totals.subtotal) + '</strong>';
      }

      if (modal) {
        modal.style.display = 'flex';
      }
    },

    formatMoney: function(val) {
      return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\s+/, ' ');
    },

    updateBadges: function() {
      const totals = this.getTotals();
      const badges = document.querySelectorAll('.cart-badge-count, .carrinho-quantidade');
      badges.forEach(b => {
        b.textContent = totals.totalItems;
        b.style.display = totals.totalItems > 0 ? 'flex' : 'none';
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function() {
    CartManager.updateBadges();

    const cartTriggers = document.querySelectorAll('.header-cart-btn, .cart-open-trigger');
    cartTriggers.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'checkout.html';
      });
    });
  });
})();
