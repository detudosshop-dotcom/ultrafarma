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
        thumb: "images/tirzepatida-all.png",
        large: "images/tirzepatida-all.png",
        alt: "Tirzepatida T.G. Solução Injetável - Todas as Dosagens Disponíveis"
      }
    ],

    // Todas as dosagens / apresentações que existem
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
        priceOriginal: 1490.00,
        pricePromo: 1099.00,
        pixPrice: 1066.03, // 3% OFF
        installmentCount: 3,
        installmentValue: 366.33,
        cashbackValue: 54.95,
        progressivePrice2: 989.10, // economia comprando 2 caixas
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
        priceOriginal: 1790.00,
        pricePromo: 1349.00,
        pixPrice: 1308.53,
        installmentCount: 3,
        installmentValue: 449.66,
        cashbackValue: 67.45,
        progressivePrice2: 1214.10,
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
        priceOriginal: 2090.00,
        pricePromo: 1599.00,
        pixPrice: 1551.03,
        installmentCount: 3,
        installmentValue: 533.00,
        cashbackValue: 79.95,
        progressivePrice2: 1439.10,
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
        priceOriginal: 2390.00,
        pricePromo: 1849.00,
        pixPrice: 1793.53,
        installmentCount: 3,
        installmentValue: 616.33,
        cashbackValue: 92.45,
        progressivePrice2: 1664.10,
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
        priceOriginal: 2690.00,
        pricePromo: 2099.00,
        pixPrice: 2036.03,
        installmentCount: 3,
        installmentValue: 699.66,
        cashbackValue: 104.95,
        progressivePrice2: 1889.10,
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
        priceOriginal: 2990.00,
        pricePromo: 2299.00,
        pixPrice: 2230.03,
        installmentCount: 3,
        installmentValue: 766.33,
        cashbackValue: 114.95,
        progressivePrice2: 2069.10,
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
    priceOriginal: 1490.00,
    pricePromo: 1099.00,
    discountPercent: 26,
    maxInstallments: 3,
    installmentValue: 366.33,
    cashbackValue: 54.95,
    pixUnitPricePromo: 1066.03
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
