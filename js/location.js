/**
 * location.js - Gerenciador Inteligente de Localização Ultrafarma
 * Detecta a localização do visitante e, caso resida no interior,
 * direciona e exibe sempre a maior cidade polo regional mais próxima.
 */

(function(window) {
  'use strict';

  const STATE_CAPITALS = {
    'AC': 'Rio Branco', 'AL': 'Maceió', 'AP': 'Macapá', 'AM': 'Manaus',
    'BA': 'Salvador', 'CE': 'Fortaleza', 'DF': 'Brasília', 'ES': 'Vitória',
    'GO': 'Goiânia', 'MA': 'São Luís', 'MT': 'Cuiabá', 'MS': 'Campo Grande',
    'MG': 'Belo Horizonte', 'PA': 'Belém', 'PB': 'João Pessoa', 'PR': 'Curitiba',
    'PE': 'Recife', 'PI': 'Teresina', 'RJ': 'Rio de Janeiro', 'RN': 'Natal',
    'RS': 'Porto Alegre', 'RO': 'Porto Velho', 'RR': 'Boa Vista', 'SC': 'Florianópolis',
    'SP': 'São Paulo', 'SE': 'Aracaju', 'TO': 'Palmas'
  };

  const MAJOR_HUBS = [
    // São Paulo (Grande SP e Polos Regionais do Interior)
    { name: 'São Paulo', uf: 'SP', lat: -23.5505, lon: -46.6333 },
    { name: 'Campinas', uf: 'SP', lat: -22.9099, lon: -47.0626 },
    { name: 'Ribeirão Preto', uf: 'SP', lat: -21.1704, lon: -47.8103 },
    { name: 'São José dos Campos', uf: 'SP', lat: -23.2237, lon: -45.9009 },
    { name: 'Santos', uf: 'SP', lat: -23.9618, lon: -46.3322 },
    { name: 'Sorocaba', uf: 'SP', lat: -23.5015, lon: -47.4521 },
    { name: 'São José do Rio Preto', uf: 'SP', lat: -20.8113, lon: -49.3758 },
    { name: 'Bauru', uf: 'SP', lat: -22.3145, lon: -49.0587 },
    { name: 'Piracicaba', uf: 'SP', lat: -22.7338, lon: -47.6476 },
    { name: 'São Carlos', uf: 'SP', lat: -22.0174, lon: -47.8908 },
    { name: 'Presidente Prudente', uf: 'SP', lat: -22.1256, lon: -51.3889 },
    { name: 'Araçatuba', uf: 'SP', lat: -21.2089, lon: -50.4328 },
    { name: 'Franca', uf: 'SP', lat: -20.5386, lon: -47.4008 },
    { name: 'Marília', uf: 'SP', lat: -22.2139, lon: -49.9458 },

    // Rio de Janeiro
    { name: 'Rio de Janeiro', uf: 'RJ', lat: -22.9068, lon: -43.1729 },
    { name: 'Petrópolis', uf: 'RJ', lat: -22.5050, lon: -43.1789 },
    { name: 'Campos dos Goytacazes', uf: 'RJ', lat: -21.7545, lon: -41.3244 },
    { name: 'Volta Redonda', uf: 'RJ', lat: -22.5232, lon: -44.1041 },
    { name: 'Macaé', uf: 'RJ', lat: -22.3768, lon: -41.7869 },

    // Minas Gerais
    { name: 'Belo Horizonte', uf: 'MG', lat: -19.9167, lon: -43.9345 },
    { name: 'Uberlândia', uf: 'MG', lat: -18.9186, lon: -48.2772 },
    { name: 'Juiz de Fora', uf: 'MG', lat: -21.7595, lon: -43.3398 },
    { name: 'Montes Claros', uf: 'MG', lat: -16.7350, lon: -43.8617 },
    { name: 'Governador Valadares', uf: 'MG', lat: -18.8511, lon: -41.9494 },
    { name: 'Ipatinga', uf: 'MG', lat: -19.4685, lon: -42.5367 },
    { name: 'Pouso Alegre', uf: 'MG', lat: -22.2300, lon: -45.9364 },
    { name: 'Varginha', uf: 'MG', lat: -21.5515, lon: -45.4303 },
    { name: 'Divinópolis', uf: 'MG', lat: -20.1439, lon: -44.8919 },
    { name: 'Poços de Caldas', uf: 'MG', lat: -21.7877, lon: -46.5614 },

    // Espírito Santo
    { name: 'Vitória', uf: 'ES', lat: -20.3155, lon: -40.3128 },
    { name: 'Cachoeiro de Itapemirim', uf: 'ES', lat: -20.8489, lon: -41.1128 },
    { name: 'Linhares', uf: 'ES', lat: -19.3967, lon: -40.0639 },

    // Paraná
    { name: 'Curitiba', uf: 'PR', lat: -25.4290, lon: -49.2671 },
    { name: 'Londrina', uf: 'PR', lat: -23.3045, lon: -51.1696 },
    { name: 'Maringá', uf: 'PR', lat: -23.4210, lon: -51.9331 },
    { name: 'Cascavel', uf: 'PR', lat: -24.9578, lon: -53.4595 },
    { name: 'Ponta Grossa', uf: 'PR', lat: -25.0994, lon: -50.1583 },
    { name: 'Foz do Iguaçu', uf: 'PR', lat: -25.5159, lon: -54.5881 },

    // Santa Catarina
    { name: 'Florianópolis', uf: 'SC', lat: -27.5954, lon: -48.5480 },
    { name: 'Joinville', uf: 'SC', lat: -26.3045, lon: -48.8487 },
    { name: 'Blumenau', uf: 'SC', lat: -26.9194, lon: -49.0661 },
    { name: 'Chapecó', uf: 'SC', lat: -27.1004, lon: -52.6152 },
    { name: 'Criciúma', uf: 'SC', lat: -28.6775, lon: -49.3695 },
    { name: 'Itajaí', uf: 'SC', lat: -26.9078, lon: -48.6619 },

    // Rio Grande do Sul
    { name: 'Porto Alegre', uf: 'RS', lat: -30.0346, lon: -51.2177 },
    { name: 'Caxias do Sul', uf: 'RS', lat: -29.1678, lon: -51.1794 },
    { name: 'Pelotas', uf: 'RS', lat: -31.7654, lon: -52.3376 },
    { name: 'Santa Maria', uf: 'RS', lat: -29.6842, lon: -53.8069 },
    { name: 'Passo Fundo', uf: 'RS', lat: -28.2628, lon: -52.4067 },

    // Centro-Oeste
    { name: 'Campo Grande', uf: 'MS', lat: -20.4697, lon: -54.6201 },
    { name: 'Dourados', uf: 'MS', lat: -22.2211, lon: -54.8056 },
    { name: 'Cuiabá', uf: 'MT', lat: -15.6014, lon: -56.0979 },
    { name: 'Rondonópolis', uf: 'MT', lat: -16.4674, lon: -54.6358 },
    { name: 'Sinop', uf: 'MT', lat: -11.8608, lon: -55.5095 },
    { name: 'Goiânia', uf: 'GO', lat: -16.6869, lon: -49.2648 },
    { name: 'Anápolis', uf: 'GO', lat: -16.3268, lon: -48.9534 },
    { name: 'Rio Verde', uf: 'GO', lat: -17.7924, lon: -50.9192 },
    { name: 'Brasília', uf: 'DF', lat: -15.7975, lon: -47.8919 },

    // Nordeste
    { name: 'Salvador', uf: 'BA', lat: -12.9714, lon: -38.5014 },
    { name: 'Feira de Santana', uf: 'BA', lat: -12.2664, lon: -38.9663 },
    { name: 'Vitória da Conquista', uf: 'BA', lat: -14.8661, lon: -40.8394 },
    { name: 'Itabuna', uf: 'BA', lat: -14.7891, lon: -39.2797 },
    { name: 'Juazeiro', uf: 'BA', lat: -9.4162, lon: -40.5033 },
    { name: 'Barreiras', uf: 'BA', lat: -12.1528, lon: -44.9961 },
    { name: 'Recife', uf: 'PE', lat: -8.0476, lon: -34.8770 },
    { name: 'Caruaru', uf: 'PE', lat: -8.2837, lon: -35.9761 },
    { name: 'Petrolina', uf: 'PE', lat: -9.3989, lon: -40.5008 },
    { name: 'Fortaleza', uf: 'CE', lat: -3.7172, lon: -38.5433 },
    { name: 'Juazeiro do Norte', uf: 'CE', lat: -7.2131, lon: -39.3153 },
    { name: 'Sobral', uf: 'CE', lat: -3.6880, lon: -40.3497 },
    { name: 'Natal', uf: 'RN', lat: -5.7945, lon: -35.2110 },
    { name: 'Mossoró', uf: 'RN', lat: -5.1878, lon: -37.3441 },
    { name: 'João Pessoa', uf: 'PB', lat: -7.1195, lon: -34.8450 },
    { name: 'Campina Grande', uf: 'PB', lat: -7.2306, lon: -35.8811 },
    { name: 'Maceió', uf: 'AL', lat: -9.6498, lon: -35.7089 },
    { name: 'Arapiraca', uf: 'AL', lat: -9.7517, lon: -36.6606 },
    { name: 'Teresina', uf: 'PI', lat: -5.0920, lon: -42.8038 },
    { name: 'Parnaíba', uf: 'PI', lat: -2.9038, lon: -41.7769 },
    { name: 'São Luís', uf: 'MA', lat: -2.5391, lon: -44.2829 },
    { name: 'Imperatriz', uf: 'MA', lat: -5.5266, lon: -47.4917 },
    { name: 'Aracaju', uf: 'SE', lat: -10.9472, lon: -37.0731 },

    // Norte
    { name: 'Belém', uf: 'PA', lat: -1.4558, lon: -48.4902 },
    { name: 'Santarém', uf: 'PA', lat: -2.4431, lon: -54.7083 },
    { name: 'Marabá', uf: 'PA', lat: -5.3686, lon: -49.1178 },
    { name: 'Manaus', uf: 'AM', lat: -3.1190, lon: -60.0217 },
    { name: 'Porto Velho', uf: 'RO', lat: -8.7619, lon: -63.9039 },
    { name: 'Ji-Paraná', uf: 'RO', lat: -10.8847, lon: -61.9515 },
    { name: 'Palmas', uf: 'TO', lat: -10.2491, lon: -48.3243 },
    { name: 'Araguaína', uf: 'TO', lat: -7.1926, lon: -48.2045 },
    { name: 'Macapá', uf: 'AP', lat: 0.0355, lon: -51.0705 },
    { name: 'Boa Vista', uf: 'RR', lat: 2.8235, lon: -60.6758 },
    { name: 'Rio Branco', uf: 'AC', lat: -9.9754, lon: -67.8249 }
  ];

  const INTERIOR_MAPPING = {
    // Região Metropolitana e Interior de Campinas
    'sumare': { city: 'Campinas', uf: 'SP' },
    'hortolandia': { city: 'Campinas', uf: 'SP' },
    'paulinia': { city: 'Campinas', uf: 'SP' },
    'americana': { city: 'Campinas', uf: 'SP' },
    'santa barbara d oeste': { city: 'Campinas', uf: 'SP' },
    'indaiatuba': { city: 'Campinas', uf: 'SP' },
    'valinhos': { city: 'Campinas', uf: 'SP' },
    'vinhedo': { city: 'Campinas', uf: 'SP' },
    'jaguariuna': { city: 'Campinas', uf: 'SP' },
    'cosmopolis': { city: 'Campinas', uf: 'SP' },
    'nova odessa': { city: 'Campinas', uf: 'SP' },
    'monte mor': { city: 'Campinas', uf: 'SP' },
    'itatiba': { city: 'Campinas', uf: 'SP' },
    'atibaia': { city: 'Campinas', uf: 'SP' },
    'braganca paulista': { city: 'Campinas', uf: 'SP' },
    'amparo': { city: 'Campinas', uf: 'SP' },
    'pedreira': { city: 'Campinas', uf: 'SP' },
    'serra negra': { city: 'Campinas', uf: 'SP' },
    'socorro': { city: 'Campinas', uf: 'SP' },

    // Região de Ribeirão Preto
    'sertaozinho': { city: 'Ribeirão Preto', uf: 'SP' },
    'cravinhos': { city: 'Ribeirão Preto', uf: 'SP' },
    'jardinopolis': { city: 'Ribeirão Preto', uf: 'SP' },
    'pontal': { city: 'Ribeirão Preto', uf: 'SP' },
    'jaboticabal': { city: 'Ribeirão Preto', uf: 'SP' },
    'serrana': { city: 'Ribeirão Preto', uf: 'SP' },
    'barretos': { city: 'Ribeirão Preto', uf: 'SP' },
    'bebedouro': { city: 'Ribeirão Preto', uf: 'SP' },
    'batatais': { city: 'Ribeirão Preto', uf: 'SP' },
    'orlandia': { city: 'Ribeirão Preto', uf: 'SP' },
    'sao simao': { city: 'Ribeirão Preto', uf: 'SP' },
    'pitangueiras': { city: 'Ribeirão Preto', uf: 'SP' },

    // Região de Sorocaba
    'votorantim': { city: 'Sorocaba', uf: 'SP' },
    'itu': { city: 'Sorocaba', uf: 'SP' },
    'salto': { city: 'Sorocaba', uf: 'SP' },
    'porto feliz': { city: 'Sorocaba', uf: 'SP' },
    'sao roque': { city: 'Sorocaba', uf: 'SP' },
    'itapetininga': { city: 'Sorocaba', uf: 'SP' },
    'boituva': { city: 'Sorocaba', uf: 'SP' },
    'piedade': { city: 'Sorocaba', uf: 'SP' },
    'ibiuna': { city: 'Sorocaba', uf: 'SP' },

    // Região de São José dos Campos (Vale do Paraíba e Litoral Norte)
    'taubate': { city: 'São José dos Campos', uf: 'SP' },
    'pindamonhangaba': { city: 'São José dos Campos', uf: 'SP' },
    'jacarei': { city: 'São José dos Campos', uf: 'SP' },
    'cacapava': { city: 'São José dos Campos', uf: 'SP' },
    'guaratingueta': { city: 'São José dos Campos', uf: 'SP' },
    'lorena': { city: 'São José dos Campos', uf: 'SP' },
    'cruzeiro': { city: 'São José dos Campos', uf: 'SP' },
    'aparecida': { city: 'São José dos Campos', uf: 'SP' },
    'campos do jordao': { city: 'São José dos Campos', uf: 'SP' },
    'caraguatatuba': { city: 'São José dos Campos', uf: 'SP' },
    'ubatuba': { city: 'São José dos Campos', uf: 'SP' },
    'sao sebastiao': { city: 'São José dos Campos', uf: 'SP' },
    'ilhabela': { city: 'São José dos Campos', uf: 'SP' },

    // Baixada Santista e Vale do Ribeira
    'sao vicente': { city: 'Santos', uf: 'SP' },
    'praia grande': { city: 'Santos', uf: 'SP' },
    'guaruja': { city: 'Santos', uf: 'SP' },
    'cubatao': { city: 'Santos', uf: 'SP' },
    'bertioga': { city: 'Santos', uf: 'SP' },
    'itanhaem': { city: 'Santos', uf: 'SP' },
    'peruibe': { city: 'Santos', uf: 'SP' },
    'mongagua': { city: 'Santos', uf: 'SP' },
    'registro': { city: 'Santos', uf: 'SP' },

    // Bauru / Marília / Jaú
    'jau': { city: 'Bauru', uf: 'SP' },
    'botucatu': { city: 'Bauru', uf: 'SP' },
    'lencois paulista': { city: 'Bauru', uf: 'SP' },
    'lins': { city: 'Bauru', uf: 'SP' },
    'assis': { city: 'Bauru', uf: 'SP' },
    'pederneiras': { city: 'Bauru', uf: 'SP' },
    'garca': { city: 'Bauru', uf: 'SP' },

    // São Carlos / Araraquara
    'araraquara': { city: 'São Carlos', uf: 'SP' },
    'matao': { city: 'São Carlos', uf: 'SP' },
    'ibate': { city: 'São Carlos', uf: 'SP' },
    'porto ferreira': { city: 'São Carlos', uf: 'SP' },
    'descalvado': { city: 'São Carlos', uf: 'SP' },

    // São José do Rio Preto
    'mirassol': { city: 'São José do Rio Preto', uf: 'SP' },
    'catanduva': { city: 'São José do Rio Preto', uf: 'SP' },
    'votuporanga': { city: 'São José do Rio Preto', uf: 'SP' },
    'fernandopolis': { city: 'São José do Rio Preto', uf: 'SP' },
    'olimpia': { city: 'São José do Rio Preto', uf: 'SP' },
    'jales': { city: 'São José do Rio Preto', uf: 'SP' },

    // Piracicaba / Limeira
    'limeira': { city: 'Piracicaba', uf: 'SP' },
    'rio claro': { city: 'Piracicaba', uf: 'SP' },
    'araras': { city: 'Piracicaba', uf: 'SP' },
    'leme': { city: 'Piracicaba', uf: 'SP' },
    'capivari': { city: 'Piracicaba', uf: 'SP' },

    // Presidente Prudente / Araçatuba
    'presidente venceslau': { city: 'Presidente Prudente', uf: 'SP' },
    'presidente epitacio': { city: 'Presidente Prudente', uf: 'SP' },
    'dracena': { city: 'Presidente Prudente', uf: 'SP' },
    'adamantina': { city: 'Presidente Prudente', uf: 'SP' },
    'birigui': { city: 'Araçatuba', uf: 'SP' },
    'penapolis': { city: 'Araçatuba', uf: 'SP' },
    'andradina': { city: 'Araçatuba', uf: 'SP' },

    // Minas Gerais
    'betim': { city: 'Belo Horizonte', uf: 'MG' },
    'contagem': { city: 'Belo Horizonte', uf: 'MG' },
    'nova lima': { city: 'Belo Horizonte', uf: 'MG' },
    'santa luzia': { city: 'Belo Horizonte', uf: 'MG' },
    'sabara': { city: 'Belo Horizonte', uf: 'MG' },
    'ibirite': { city: 'Belo Horizonte', uf: 'MG' },
    'sete lagoas': { city: 'Belo Horizonte', uf: 'MG' },
    'araguari': { city: 'Uberlândia', uf: 'MG' },
    'uberaba': { city: 'Uberlândia', uf: 'MG' },
    'patos de minas': { city: 'Uberlândia', uf: 'MG' },
    'ituiutaba': { city: 'Uberlândia', uf: 'MG' },
    'araxa': { city: 'Uberlândia', uf: 'MG' },
    'uba': { city: 'Juiz de Fora', uf: 'MG' },
    'muriae': { city: 'Juiz de Fora', uf: 'MG' },
    'barbacena': { city: 'Juiz de Fora', uf: 'MG' },
    'sao joao del rei': { city: 'Juiz de Fora', uf: 'MG' },
    'pocos de caldas': { city: 'Pouso Alegre', uf: 'MG' },
    'varginha': { city: 'Pouso Alegre', uf: 'MG' },
    'alfenas': { city: 'Pouso Alegre', uf: 'MG' },
    'lavras': { city: 'Pouso Alegre', uf: 'MG' },
    'itajuva': { city: 'Pouso Alegre', uf: 'MG' },
    'passos': { city: 'Pouso Alegre', uf: 'MG' },
    'coronel fabriciano': { city: 'Ipatinga', uf: 'MG' },
    'timoteo': { city: 'Ipatinga', uf: 'MG' },
    'itauna': { city: 'Divinópolis', uf: 'MG' },
    'para de minas': { city: 'Divinópolis', uf: 'MG' },
    'nova serrana': { city: 'Divinópolis', uf: 'MG' },

    // Rio de Janeiro
    'niteroi': { city: 'Rio de Janeiro', uf: 'RJ' },
    'sao goncalo': { city: 'Rio de Janeiro', uf: 'RJ' },
    'duque de caxias': { city: 'Rio de Janeiro', uf: 'RJ' },
    'nova iguacu': { city: 'Rio de Janeiro', uf: 'RJ' },
    'belford roxo': { city: 'Rio de Janeiro', uf: 'RJ' },
    'sao joao de meriti': { city: 'Rio de Janeiro', uf: 'RJ' },
    'teresopolis': { city: 'Petrópolis', uf: 'RJ' },
    'nova friburgo': { city: 'Petrópolis', uf: 'RJ' },
    'barra mansa': { city: 'Volta Redonda', uf: 'RJ' },
    'resende': { city: 'Volta Redonda', uf: 'RJ' },
    'angra dos reis': { city: 'Volta Redonda', uf: 'RJ' },
    'rio das ostras': { city: 'Macaé', uf: 'RJ' },
    'cabo frio': { city: 'Campos dos Goytacazes', uf: 'RJ' },
    'armacao dos buzios': { city: 'Campos dos Goytacazes', uf: 'RJ' },

    // Paraná
    'sao jose dos pinhais': { city: 'Curitiba', uf: 'PR' },
    'colombo': { city: 'Curitiba', uf: 'PR' },
    'pinhais': { city: 'Curitiba', uf: 'PR' },
    'araucaria': { city: 'Curitiba', uf: 'PR' },
    'campo largo': { city: 'Curitiba', uf: 'PR' },
    'fazenda rio grande': { city: 'Curitiba', uf: 'PR' },
    'arapongas': { city: 'Londrina', uf: 'PR' },
    'apucarana': { city: 'Londrina', uf: 'PR' },
    'rolandia': { city: 'Londrina', uf: 'PR' },
    'sarandi': { city: 'Maringá', uf: 'PR' },
    'paranavai': { city: 'Maringá', uf: 'PR' },
    'campo mourao': { city: 'Maringá', uf: 'PR' },
    'toledo': { city: 'Cascavel', uf: 'PR' },
    'medianeira': { city: 'Cascavel', uf: 'PR' },
    'castro': { city: 'Ponta Grossa', uf: 'PR' },
    'telemaco borba': { city: 'Ponta Grossa', uf: 'PR' },

    // Santa Catarina
    'sao jose': { city: 'Florianópolis', uf: 'SC' },
    'palhoca': { city: 'Florianópolis', uf: 'SC' },
    'biguacu': { city: 'Florianópolis', uf: 'SC' },
    'jaragua do sul': { city: 'Joinville', uf: 'SC' },
    'sao bento do sul': { city: 'Joinville', uf: 'SC' },
    'itajas': { city: 'Blumenau', uf: 'SC' },
    'balneario camboriu': { city: 'Blumenau', uf: 'SC' },
    'brusque': { city: 'Blumenau', uf: 'SC' },
    'gaspar': { city: 'Blumenau', uf: 'SC' },
    'navegantes': { city: 'Blumenau', uf: 'SC' },
    'camboriu': { city: 'Blumenau', uf: 'SC' },
    'itapema': { city: 'Blumenau', uf: 'SC' },
    'concordia': { city: 'Chapecó', uf: 'SC' },
    'xanxere': { city: 'Chapecó', uf: 'SC' },
    'sao miguel do oeste': { city: 'Chapecó', uf: 'SC' },
    'tubarao': { city: 'Criciúma', uf: 'SC' },
    'icara': { city: 'Criciúma', uf: 'SC' },
    'ararangua': { city: 'Criciúma', uf: 'SC' },

    // Rio Grande do Sul
    'canoas': { city: 'Porto Alegre', uf: 'RS' },
    'gravatai': { city: 'Porto Alegre', uf: 'RS' },
    'viamao': { city: 'Porto Alegre', uf: 'RS' },
    'novo hamburgo': { city: 'Porto Alegre', uf: 'RS' },
    'sao leopoldo': { city: 'Porto Alegre', uf: 'RS' },
    'alvorada': { city: 'Porto Alegre', uf: 'RS' },
    'sapucaia do sul': { city: 'Porto Alegre', uf: 'RS' },
    'esteio': { city: 'Porto Alegre', uf: 'RS' },
    'bento goncalves': { city: 'Caxias do Sul', uf: 'RS' },
    'farroupilha': { city: 'Caxias do Sul', uf: 'RS' },
    'gramado': { city: 'Caxias do Sul', uf: 'RS' },
    'canela': { city: 'Caxias do Sul', uf: 'RS' },
    'vacaria': { city: 'Caxias do Sul', uf: 'RS' },
    'rio grande': { city: 'Pelotas', uf: 'RS' },
    'bage': { city: 'Pelotas', uf: 'RS' },
    'cruz alta': { city: 'Santa Maria', uf: 'RS' },
    'erechim': { city: 'Passo Fundo', uf: 'RS' },

    // Mato Grosso do Sul
    'sao gabriel do oeste': { city: 'Campo Grande', uf: 'MS' },
    'coxim': { city: 'Campo Grande', uf: 'MS' },
    'sidrolandia': { city: 'Campo Grande', uf: 'MS' },
    'aquidauana': { city: 'Campo Grande', uf: 'MS' },
    'ribas do rio pardo': { city: 'Campo Grande', uf: 'MS' },
    'terenos': { city: 'Campo Grande', uf: 'MS' },
    'rio verde de mato grosso': { city: 'Campo Grande', uf: 'MS' },
    'miranda': { city: 'Campo Grande', uf: 'MS' },
    'ponta pora': { city: 'Dourados', uf: 'MS' },
    'navirai': { city: 'Dourados', uf: 'MS' },
    'fatima do sul': { city: 'Dourados', uf: 'MS' },
    'tres lagoas': { city: 'Campo Grande', uf: 'MS' },
    'corumba': { city: 'Campo Grande', uf: 'MS' },

    // Goiás e Entorno do DF
    'aparecida de goiania': { city: 'Goiânia', uf: 'GO' },
    'senador canedo': { city: 'Goiânia', uf: 'GO' },
    'trindade': { city: 'Goiânia', uf: 'GO' },
    'jatai': { city: 'Rio Verde', uf: 'GO' },
    'caldas novas': { city: 'Goiânia', uf: 'GO' },
    'valparaiso de goias': { city: 'Brasília', uf: 'DF' },
    'aguas lindas de goias': { city: 'Brasília', uf: 'DF' },
    'luziania': { city: 'Brasília', uf: 'DF' },
    'cidade ocidental': { city: 'Brasília', uf: 'DF' },
    'novo gama': { city: 'Brasília', uf: 'DF' },
    'formosa': { city: 'Brasília', uf: 'DF' },

    // Bahia
    'lauro de freitas': { city: 'Salvador', uf: 'BA' },
    'camacari': { city: 'Salvador', uf: 'BA' },
    'simoes filho': { city: 'Salvador', uf: 'BA' },
    'candeias': { city: 'Salvador', uf: 'BA' },
    'alagoinhas': { city: 'Feira de Santana', uf: 'BA' },
    'serrinha': { city: 'Feira de Santana', uf: 'BA' },
    'santo antonio de jesus': { city: 'Feira de Santana', uf: 'BA' },
    'jequie': { city: 'Vitória da Conquista', uf: 'BA' },
    'itapetinga': { city: 'Vitória da Conquista', uf: 'BA' },
    'ilheus': { city: 'Itabuna', uf: 'BA' }
  };

  function normalizeText(text) {
    if (!text) return '';
    return text.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function findNearestMajorHub(lat, lon, uf) {
    let best = null;
    let minD = Infinity;
    const ufUpper = uf ? uf.toUpperCase().trim() : null;

    if (ufUpper) {
      for (let i = 0; i < MAJOR_HUBS.length; i++) {
        const h = MAJOR_HUBS[i];
        if (h.uf === ufUpper) {
          const d = haversine(lat, lon, h.lat, h.lon);
          if (d < minD) {
            minD = d;
            best = h;
          }
        }
      }
    }

    if (!best || minD > 380) {
      for (let i = 0; i < MAJOR_HUBS.length; i++) {
        const h = MAJOR_HUBS[i];
        const d = haversine(lat, lon, h.lat, h.lon);
        if (d < minD) {
          minD = d;
          best = h;
        }
      }
    }

    return best ? { city: best.name, uf: best.uf, distanceKm: Math.round(minD) } : { city: 'São Paulo', uf: 'SP', distanceKm: 0 };
  }

  function resolveCityToMajorHub(cityName, uf) {
    const norm = normalizeText(cityName);
    const ufUpper = (uf || '').toUpperCase().trim();

    // 1. Já é diretamente uma das maiores cidades polos?
    for (let i = 0; i < MAJOR_HUBS.length; i++) {
      const h = MAJOR_HUBS[i];
      if (normalizeText(h.name) === norm && (!ufUpper || h.uf === ufUpper)) {
        return { city: h.name, uf: h.uf };
      }
    }

    // 2. Mapeamento direto de município do interior para o polo regional
    if (INTERIOR_MAPPING[norm]) {
      return INTERIOR_MAPPING[norm];
    }

    // 3. Fallback inteligente para a Capital do Estado
    if (ufUpper && STATE_CAPITALS[ufUpper]) {
      return { city: STATE_CAPITALS[ufUpper], uf: ufUpper };
    }

    return { city: 'São Paulo', uf: 'SP' };
  }

  function updateLocationDisplay(hub) {
    if (!hub || !hub.city) return;
    const locationEl = document.getElementById('user-location-text');
    if (locationEl) {
      locationEl.textContent = hub.city + ' - ' + hub.uf;
      locationEl.style.transition = 'opacity 0.2s ease';
      locationEl.style.opacity = '0.7';
      setTimeout(function() {
        locationEl.style.opacity = '1';
      }, 150);
    }
  }

  function saveHub(hub) {
    try {
      localStorage.setItem('ultrafarma_user_location', JSON.stringify({
        city: hub.city,
        uf: hub.uf,
        updatedAt: Date.now()
      }));
    } catch (e) {}
  }

  function getSavedLocation() {
    try {
      const data = localStorage.getItem('ultrafarma_user_location');
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {}
    return null;
  }

  const LocationManager = {
    init: function() {
      // 1. Aplica localização salva em cache imediatamente (sem flicker)
      const cached = getSavedLocation();
      if (cached && cached.city && cached.uf) {
        updateLocationDisplay(cached);
      }

      // 2. Tenta obter geolocalização do IP do visitante via geojs (rápido, livre, sem CORS)
      fetch('https://get.geojs.io/v1/ip/geo.json', { signal: AbortSignal.timeout(2800) })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (!data) return;
          let hub = null;

          // Se tiver coordenadas, calcula com precisão matemática a maior cidade mais próxima
          if (data.latitude && data.longitude) {
            const lat = parseFloat(data.latitude);
            const lon = parseFloat(data.longitude);
            hub = findNearestMajorHub(lat, lon, data.region_code || data.region);
          } else if (data.city) {
            hub = resolveCityToMajorHub(data.city, data.region_code || data.region);
          }

          if (hub) {
            updateLocationDisplay(hub);
            saveHub(hub);
          }
        })
        .catch(function() {
          // Se falhar a chamada IP e não houver cache, infere timezone
          if (!cached) {
            try {
              const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
              let fallbackHub = { city: 'São Paulo', uf: 'SP' };
              if (tz.includes('Campo_Grande')) fallbackHub = { city: 'Campo Grande', uf: 'MS' };
              else if (tz.includes('Cuiaba')) fallbackHub = { city: 'Cuiabá', uf: 'MT' };
              else if (tz.includes('Manaus')) fallbackHub = { city: 'Manaus', uf: 'AM' };
              else if (tz.includes('Bahia') || tz.includes('Salvador')) fallbackHub = { city: 'Salvador', uf: 'BA' };
              else if (tz.includes('Fortaleza')) fallbackHub = { city: 'Fortaleza', uf: 'CE' };
              else if (tz.includes('Recife')) fallbackHub = { city: 'Recife', uf: 'PE' };
              else if (tz.includes('Belem')) fallbackHub = { city: 'Belém', uf: 'PA' };
              else if (tz.includes('Porto_Velho')) fallbackHub = { city: 'Porto Velho', uf: 'RO' };
              
              updateLocationDisplay(fallbackHub);
              saveHub(fallbackHub);
            } catch (e) {}
          }
        });
    },

    onCepResolved: function(cityName, uf) {
      if (!cityName) return;
      const hub = resolveCityToMajorHub(cityName, uf);
      if (hub) {
        updateLocationDisplay(hub);
        saveHub(hub);
      }
    },

    resolveCityToMajorHub: resolveCityToMajorHub,
    findNearestMajorHub: findNearestMajorHub,
    updateLocationDisplay: updateLocationDisplay,
    getSavedLocation: getSavedLocation
  };

  window.LocationManager = LocationManager;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      LocationManager.init();
    });
  } else {
    LocationManager.init();
  }
})(window);
