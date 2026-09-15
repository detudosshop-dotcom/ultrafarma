/**
 * CONFIGURAÇÃO GERAL DO PRODUTO E DA LOJA
 * Produto: Tirzepatida T.G. Solução Injetável (4 Canetas Aplicadoras)
 */
window.STORE_CONFIG = {
  // Informações da Loja
  storeName: "Ultrafarma",
  sellerName: "Ultrafarma Medicamentos Especiais",
  supportEmail: "atendimento@ultrafarma.com.br",
  supportPhone: "0800 000 0000",
  
  // Informações do Produto Principal
  product: {
    id: "tirzepatida-tg",
    baseSku: "TRZ-TG",
    brand: "T.G. PHARMA",
    category: "Medicamentos > Controle de Peso e Diabetes > Tirzepatida",
    totalSold: "+ 14.850 unidades entregues",
    rating: 5.0,
    reviewsCount: 7,
    inStock: true,
    storageType: "Refrigerado (2°C a 8°C)",
    presentation: "Caixa com 4 Canetas Aplicadoras Descartáveis (0,5 mL cada) + 4 Agulhas",
    
    // Imagens principais do produto
    images: [
      {
        id: "img-1",
        thumb: "/images/tirzepatida-all.png",
        large: "/images/tirzepatida-all.png",
        alt: "Tirzepatida T.G. Solução Injetável - Todas as Dosagens Disponíveis"
      }
    ],

    // Todas as dosagens / apresentações que existem
    // 80% OFF aplicado sobre os preços originais do site
    // priceOriginal = preço antigo do site (riscado), pricePromo = preço com 80% de desconto
    defaultVariantId: "tirz-2-5",
    variants: [
      {
        id: "tirz-2-5",
        dosage: "2,5 mg",
        volume: "0,5 mL",
        fullLabel: "2,5 mg / 0,5 mL",
        badge: "Dose Inicial",
        color: "#6b7280",
        colorName: "Cinza",
        priceOriginal: 1099.00,
        pricePromo: 219.80,
        discountPercent: 80,
        pixPrice: 213.21,
        installmentCount: 3,
        installmentValue: 73.27,
        cashbackValue: 10.99,
        progressivePrice2: 197.82,
        sku: "TRZ-25-TG",
        ean: "7891023501021",
        title: "Tirzepatida T.G. 2,5 mg/0,5 mL Solução Injetável (4 Canetas Aplicadoras)"
      },
      {
        id: "tirz-5-0",
        dosage: "5 mg",
        volume: "0,5 mL",
        fullLabel: "5 mg / 0,5 mL",
        badge: "Mais Vendido",
        color: "#7c3aed",
        colorName: "Roxo",
        priceOriginal: 1349.00,
        pricePromo: 269.80,
        discountPercent: 80,
        pixPrice: 261.71,
        installmentCount: 3,
        installmentValue: 89.93,
        cashbackValue: 13.49,
        progressivePrice2: 242.82,
        sku: "TRZ-50-TG",
        ean: "7891023501052",
        title: "Tirzepatida T.G. 5 mg/0,5 mL Solução Injetável (4 Canetas Aplicadoras)"
      },
      {
        id: "tirz-7-5",
        dosage: "7,5 mg",
        volume: "0,5 mL",
        fullLabel: "7,5 mg / 0,5 mL",
        badge: "Escalonamento 1",
        color: "#0f766e",
        colorName: "Verde Petróleo",
        priceOriginal: 1599.00,
        pricePromo: 319.80,
        discountPercent: 80,
        pixPrice: 310.21,
        installmentCount: 3,
        installmentValue: 106.60,
        cashbackValue: 15.99,
        progressivePrice2: 287.82,
        sku: "TRZ-75-TG",
        ean: "7891023501076",
        title: "Tirzepatida T.G. 7,5 mg/0,5 mL Solução Injetável (4 Canetas Aplicadoras)"
      },
      {
        id: "tirz-10-0",
        dosage: "10 mg",
        volume: "0,5 mL",
        fullLabel: "10 mg / 0,5 mL",
        badge: "Manutenção",
        color: "#be185d",
        colorName: "Magenta",
        priceOriginal: 1849.00,
        pricePromo: 369.80,
        discountPercent: 80,
        pixPrice: 358.71,
        installmentCount: 3,
        installmentValue: 123.27,
        cashbackValue: 18.49,
        progressivePrice2: 332.82,
        sku: "TRZ-100-TG",
        ean: "7891023501106",
        title: "Tirzepatida T.G. 10 mg/0,5 mL Solução Injetável (4 Canetas Aplicadoras)"
      },
      {
        id: "tirz-12-5",
        dosage: "12,5 mg",
        volume: "0,5 mL",
        fullLabel: "12,5 mg / 0,5 mL",
        badge: "Escalonamento 2",
        color: "#1d4ed8",
        colorName: "Azul",
        priceOriginal: 2099.00,
        pricePromo: 419.80,
        discountPercent: 80,
        pixPrice: 407.21,
        installmentCount: 3,
        installmentValue: 139.93,
        cashbackValue: 20.99,
        progressivePrice2: 377.82,
        sku: "TRZ-125-TG",
        ean: "7891023501120",
        title: "Tirzepatida T.G. 12,5 mg/0,5 mL Solução Injetável (4 Canetas Aplicadoras)"
      },
      {
        id: "tirz-15-0",
        dosage: "15 mg",
        volume: "0,5 mL",
        fullLabel: "15 mg / 0,5 mL",
        badge: "Dose Máxima",
        color: "#ea580c",
        colorName: "Laranja",
        priceOriginal: 2299.00,
        pricePromo: 459.80,
        discountPercent: 80,
        pixPrice: 446.01,
        installmentCount: 3,
        installmentValue: 153.27,
        cashbackValue: 22.99,
        progressivePrice2: 413.82,
        sku: "TRZ-150-TG",
        ean: "7891023501151",
        title: "Tirzepatida T.G. 15 mg/0,5 mL Solução Injetável (4 Canetas Aplicadoras)"
      }
    ],

    // Desconto no PIX à vista (%)
    pixDiscountPercent: 3,
    
    // Valores padrão do variant inicial (2.5 mg)
    title: "Tirzepatida T.G. 2,5 mg/0,5 mL Solução Injetável (4 Canetas Aplicadoras)",
    sku: "TRZ-25-TG",
    ean: "7891023501021",
    priceOriginal: 1099.00,
    pricePromo: 219.80,
    discountPercent: 80,
    maxInstallments: 3,
    installmentValue: 73.27,
    cashbackValue: 10.99,
    pixUnitPricePromo: 213.21
  },

  // Configurações do Checkout
  checkout: {
    freeShippingThreshold: 100.00, // Frete grátis garantido
    defaultShippingCost: 0.00,     // Frete Grátis Especial Refrigerado
    pixKey: "02.543.945/0006-90",  // Chave PIX da Ultrafarma
    pixReceiver: "ULTRAFARMA SAUDE EIRELI",
    pixCity: "SAO PAULO"
  }
};
