'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Beer, 
  Utensils, 
  ChefHat, 
  Thermometer, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Send, 
  Info, 
  GlassWater, 
  Flame, 
  Compass, 
  Loader2,
  Check,
  GlassWater as BeerIcon,
  MessageSquare,
  Search,
  MapPin,
  ShoppingBag,
  Store,
  Globe,
  Coins,
  Instagram,
  ExternalLink
} from 'lucide-react';

interface Pairing {
  dishName: string;
  dishType: string;
  whySecret: string;
}

interface BeerRecommendation {
  styleName: string;
  visualColor: string;
  abv: string;
  ibu: string;
  description: string;
  whyIdeal: string;
  idealTemp: string;
  pairings: Pairing[];
}

interface SommelierResponse {
  sommelierIntro: string;
  recommendations: BeerRecommendation[];
  sommelierTips: string[];
}

interface ChatMessage {
  sender: 'user' | 'sommelier';
  text: string;
}

interface RegionStyle {
  styleName: string;
  originReason: string;
  description: string;
}

interface RegionBrewery {
  name: string;
  location: string;
  description: string;
  signatureBeer: string;
  website: string;
  instagram: string;
}

interface RegionResult {
  regionIntro: string;
  classicStyles: RegionStyle[];
  breweries: RegionBrewery[];
}

interface OnlineStore {
  name: string;
  estimatedPrice: string;
  description: string;
  website: string;
  instagram: string;
}

interface PhysicalStore {
  type: string;
  name: string;
  description: string;
  website: string;
  instagram: string;
}

interface ShoppingResult {
  beerStyle: string;
  averagePriceRange: string;
  onlineStores: OnlineStore[];
  physicalStores: PhysicalStore[];
  buyingTips: string[];
}

// Preset beer styles for exploration (dynamic per language)
const PRESET_STYLES: Record<'pt' | 'en', Array<{
  styleName: string;
  description: string;
  abv: string;
  ibu: string;
  visualColor: string;
  idealTemp: string;
  whyIdeal: string;
  pairings: Array<{ dishName: string; dishType: string; whySecret: string }>;
}>> = {
  pt: [
    {
      styleName: "American IPA (India Pale Ale)",
      description: "Conhecida pela explosão de lúpulos americanos. Aromas que remetem a frutas cítricas, tropicais e resina, com um amargor limpo, marcante e persistente.",
      abv: "6.0% - 7.5% ABV",
      ibu: "50 - 70 IBU",
      visualColor: "Dourado profundo a cobre pálido",
      idealTemp: "6°C a 8°C",
      whyIdeal: "Excelente para quem aprecia frescor, aromas potentes e um amargor refrescante.",
      pairings: [
        { dishName: "Hambúrguer Gourmet de Costela", dishType: "Prato Principal", whySecret: "A alta carbonatação e o amargor limpam a gordura da carne e do queijo cheddar, enquanto as notas cítricas contrastam deliciously com o defumado do hambúrguer." },
        { dishName: "Petiscos Fritos & Batatas Rústicas", dishType: "Petisco / Entrada", whySecret: "A fritura é limpa pelo amargor herbal da cerveja, preparando o paladar para a próxima mordida." },
        { dishName: "Mousse de Maracujá", dishType: "Sobremesa", whySecret: "Uma harmonização surpreendente por semelhança entre as notas cítricas tropicais do lúpulo da IPA e a acidez do maracujá." }
      ]
    },
    {
      styleName: "Dry Stout",
      description: "Cerveja escura de tradição irlandesa. Apresenta caráter tostado proeminente que lembra café expresso, cevada queimada e sutil cacau amargo. Corpo leve e final seco.",
      abv: "4.0% - 5.0% ABV",
      ibu: "30 - 45 IBU",
      visualColor: "Preto opaco, com colarinho cremoso persistente cor marfim",
      idealTemp: "8°C a 12°C",
      whyIdeal: "Ideal para dias mais amenos e paladares que buscam notas torradas sofisticadas sem dulçor excessivo.",
      pairings: [
        { dishName: "Costelinha de Porco ao Molho Barbecue", dishType: "Prato Principal", whySecret: "As notas tostadas da cerveja fazem uma ponte perfeita com as partes caramelizadas da carne assada e seu molho agridoce defumado." },
        { dishName: "Ostras Frescas", dishType: "Petisco / Entrada", whySecret: "Uma das harmonizações mais tradicionais do mundo: o frescor salino das ostras contrasta espetacularmente com a secura tostada da Stout." },
        { dishName: "Brownie com Chocolate Meio Amargo", dishType: "Sobremesa", whySecret: "Harmonização clássica por semelhança. Os sabores tostados e de chocolate da cerveja fundem-se ao brownie, criando um terceiro sabor sublime." }
      ]
    },
    {
      styleName: "German Weissbier",
      description: "Clássica cerveja de trigo da Baviera, não filtrada. Destaca-se pelos ricos aromas de banana fresca, cravo da índia e leve panificação gerados por sua levedura especial.",
      abv: "4.9% - 5.6% ABV",
      ibu: "10 - 15 IBU",
      visualColor: "Amarela turva, com espuma branca abundante e de alta consistência",
      idealTemp: "4°C a 6°C",
      whyIdeal: "A escolha perfeita para quem busca cremosidade, baixíssimo amargor e frescor frutado.",
      pairings: [
        { dishName: "Risoto de Queijo Brie com Damascos", dishType: "Prato Principal", whySecret: "A alta carbonatação da Weissbier quebra a untuosidade rica do queijo Brie, enquanto a fruta (damasco) harmoniza de forma excelente com a levedura frutada." },
        { dishName: "Salsichas Brancas com Mostarda Escura", dishType: "Petisco / Entrada", whySecret: "A herança típica alemã no seu melhor. O trigo limpa de forma suave os condimentos cozidos da salsicha tradicional." },
        { dishName: "Apfelstrudel (Torta de Maçã Alemã)", dishType: "Sobremesa", whySecret: "As especiarias da receita (canela e maçã frita) casam-se perfeitamente com as notas condimentadas de cravo e fermento da própria cerveja." }
      ]
    },
    {
      styleName: "Belgian Witbier",
      description: "Cerveja de trigo de tradição belga, extremamente refrescante. Infusionada tradicionalmente com sementes de coentro moídas e cascas de laranja fresca.",
      abv: "4.5% - 5.5% ABV",
      ibu: "8 - 15 IBU",
      visualColor: "Amarelo palha claro, opaca e esbranquiçada",
      idealTemp: "3°C a 5°C",
      whyIdeal: "Ideal para paladares delicados, dias quentes e pessoas que amam notas herbais e cítricas discretas.",
      pairings: [
        { dishName: "Filé de Peixe Branco Grelhado com Limão", dishType: "Prato Principal", whySecret: "Os cítricos se encontram de forma leve, sem sobrecarregar a textura delicada e o sabor sutil do peixe grelhado." },
        { dishName: "Salada Caprese com Queijo de Búfala", dishType: "Petisco / Entrada", whySecret: "Uma combinação de extrema leveza: as notas de tempero fresco e coentro complementam o manjericão e os tomates maduros perfeitamente." },
        { dishName: "Petit Gâteau de Limão Siciliano", dishType: "Sobremesa", whySecret: "O frescor adocicado e ácido da sobremesa é elevado pela citricidade natural e sedosidade do trigo belga." }
      ]
    }
  ],
  en: [
    {
      styleName: "American IPA (India Pale Ale)",
      description: "Renowned for its explosion of American hops. Aromas reminding of citrus, tropical fruits and resin, with a clean, striking and persistent bitterness.",
      abv: "6.0% - 7.5% ABV",
      ibu: "50 - 70 IBU",
      visualColor: "Deep golden to pale copper",
      idealTemp: "6°C to 8°C",
      whyIdeal: "Excellent for those who appreciate absolute freshness, potent aromas and an invigorating bitter finish.",
      pairings: [
        { dishName: "Gourmet Rib Burger", dishType: "Main Course", whySecret: "The high carbonation and hop bitterness scrub fats from the beef and cheddar cheese, while bright citrus aromas contrast flawlessly with the smoky profile." },
        { dishName: "Fried Finger Foods & Rustic Fries", dishType: "Snack / Starter", whySecret: "Oily frying is cleansed beautifully by the crisp hop bitterness, priming the tongue for the next bite." },
        { dishName: "Passion Fruit Mousse", dishType: "Dessert", whySecret: "A surprisingly pleasant pairing by affinity between the tropical citrus notes of hops and the tart exotic fruit acidity." }
      ]
    },
    {
      styleName: "Dry Stout",
      description: "Dark, deeply-roasted beer of Irish tradition. Displays prominent roasted character reminiscent of freshly-brewed espresso coffee, roasted barley, and fine dark cocoa. Light body and dry snap.",
      abv: "4.0% - 5.0% ABV",
      ibu: "30 - 45 IBU",
      visualColor: "Opaque jet black with a persistent ivory-creamy head",
      idealTemp: "8°C to 12°C",
      whyIdeal: "Perfect for cool days and sophisticated palates seeking roasted nuances without heavy sweetness.",
      pairings: [
        { dishName: "Pork Ribs with Barbecue Sauce", dishType: "Main Course", whySecret: "Malt-roast characters build a seamless bridge with the caramelized bark of smoked pork and the sweet-savory glaze of barbecue." },
        { dishName: "Fresh Oysters", dishType: "Snack / Starter", whySecret: "One of the world's most historic pairings: the salty, oceanic crispness of oysters contrasts majestically with the dry roast character." },
        { dishName: "Dark Chocolate Brownie", dishType: "Dessert", whySecret: "A textbook pairing by similarity. The chocolate-coffee aromas of the brew fuse with the dense cake, creating a magnificent third flavor." }
      ]
    },
    {
      styleName: "German Weissbier",
      description: "Classic wheat beer of Bavarian tradition, unfiltered. Unveils aromatic esters of fresh banana, cloves, and light doughy bread derived from specialized top-fermenting yeast.",
      abv: "4.9% - 5.6% ABV",
      ibu: "10 - 15 IBU",
      visualColor: "Cloudy yellow-gold with a thick, massive white head",
      idealTemp: "4°C to 6°C",
      whyIdeal: "The top selection for enthusiasts looking for silky creaminess, zero bitter bite and fruity yeast freshness.",
      pairings: [
        { dishName: "Brie Cheese & Apricot Risotto", dishType: "Main Course", whySecret: "The robust carbonation of Weissbier easily cuts the richness of Brie, while the stone fruit flavor aligns with the beer's banana esters." },
        { dishName: "White Veal Sausage (Weisswurst) with Sweet Mustard", dishType: "Snack / Starter", whySecret: "Rich Bavarian heritage at its absolute optimal. Soft wheat acids cleanse the delicate herbs and spices of the sausage." },
        { dishName: "Apple Strudel (Classic German Apfelstrudel)", dishType: "Dessert", whySecret: "The cinnamon and baked apple spices marry beautifully with clove-like yeast accents of the wheat beer." }
      ]
    },
    {
      styleName: "Belgian Witbier",
      description: "Crisp wheat beer of Belgian origin, incredibly refreshing. Infused with freshly crushed coriander seeds and sweet orange peels.",
      abv: "4.5% - 5.5% ABV",
      ibu: "8 - 15 IBU",
      visualColor: "Hazy pale straw, opaque white glow",
      idealTemp: "3°C to 5°C",
      whyIdeal: "Tailored to delicate palates, warm afternoons, and anyone who appreciates botanical, herbal hints and gentle citrus.",
      pairings: [
        { dishName: "Grilled Sea Bass with Lemon", dishType: "Main Course", whySecret: "The zesty coriander and citrus of the beer meet the delicate white fish smoothly without overpowering its soft texture." },
        { dishName: "Caprese Salad with Buffalo Mozzarella", dishType: "Snack / Starter", whySecret: "Extremely light and elegant: botanical notes of fresh coriander complement sweet tomatoes and wild basil." },
        { dishName: "Meyer Lemon Petit Gâteau", dishType: "Dessert", whySecret: "Sweet-tart acidity is magnified, and the floury pastry textures find match in the silky, soft body of Belgian raw wheat." }
      ]
    }
  ]
};

// UI and layout translations
const TRANSLATIONS = {
  pt: {
    appSub: "Defina seu perfil de gosto pessoal ou informe o prato que irá saborear. Nossa inteligência artificial atuará como seu especialista particular e sugerirá rótulos ideais e harmonizações gastronômicas sublimes.",
    digitalSommelier: "SOMMELIER DIGITAL",
    tabWizard: "Configurador de Paladar",
    tabExplorer: "Explorar Estilos Clássicos",
    tabRegions: "Cervejas por Região",
    tabShopping: "Shopping",
    targetStyle: "Estilo Alvo",
    previewTitle: "Pré-visualização",
    step: "PASSO",
    de: "DE",
    completado: "CONCLUÍDO",
    voltar: "Voltar",
    avancar: "Avançar",
    pedirSommelier: "Pedir ao Sommelier AI",
    mestrePensando: "Mestre Cervejeiro Pensando",
    recomendedSelection: "Selecionando a Seleção de Ouro...",
    recomendedSub: "A harmonia química e a física das bolhas estão se encontrando. O assistente está compilando notas de degustação específicas para os seus pratos escolhidos.",
    erroInesperado: "Erro ao processar as recomendações com o Sommelier.",
    fechar: "Fechar Detalhes",
    copiar: "Copiar",
    compartilhar: "Compartilhar",
    retry: "Tentar Novamente",

    // Step 1
    step1Title: "Intensidade do Amargor (Lúpulo)",
    step1Sub: "O amargor vem do lúpulo. Você prefere uma cerveja leve e adocicada ou algo que marque bem o paladar com sensações florais, herbais ou resinosas?",
    amargorLow: "Refrescante, maltado dominante.",
    amargorMed: "Amargor sutil de suporte (ex: Pilsner).",
    amargorHigh: "Lúpulo limpo e elegante (ex: Pale Ale).",
    amargorVHigh: "Marcante, amargo destacado (ex: IPA).",

    // Step 2
    step2Title: "Potência Alcoólica (ABV)",
    step2Sub: "Cervejas mais leves trazem refrescância para o dia a dia. Graduações mais potentes aquecem a boca, ideais para climas frios e pratos mais untuosos.",

    // Step 3
    step3Title: "Seu Perfil Sensorial (Notas de Sabor)",
    step3Sub: "Selecione as sensações que mais encantam o seu paladar. Você pode escolher mais de uma!",

    // Step 4
    step4Title: "Estrutura e Corpo das Cervejas",
    step4Sub: "O corpo diz respeito à viscosidade e peso da cerveja na boca. Prefere bebidas fluidas e fáceis ou bebidas licorosas, espessas e majestosas?",

    // Step 5
    step5Title: "Prato & Toque do Usuário",
    step5Sub: "Diga-nos de antemão se pretende comer algo específico para ajustarmos as regras de harmonização (corte, contraste ou afinidade):",
    dishLabel: "Algum prato em mente? (Opcional)",
    dishPlaceholder: "Ex: Risoto de Alho Poró, Pizza Margherita, Chocolate Belga, Churrasco...",
    prefLabel: "Preferências de Cerveja adicionais: (Opcional)",
    prefPlaceholder: "Ex: 'Não gosto de cerveja preta' ou 'Adoro notas bem florais'...",

    // Tab 2: Explorer
    expTitle: "Biblioteca de Estilos Artesanais",
    expSub: "Explore os estilos de maior sucesso no mundo, suas principais sensações visuais e gastronômicas antes de fazer sua recomendação detalhada.",
    beerSignature: "DESTAQUE",
    analyticalTitle: "Análise de Estilo Preservada",

    // Tab 3: Regions
    regionsTitle: "Explorador de Regiões Cervejeiras",
    regionsSub: "Digite um país e ou cidade para desvendar as tradições, estilos clássicos locais e as principais cervejarias artesanais da região.",
    regionsCountryLabel: "País",
    regionsCountryPlaceholder: "Ex: Bélgica, Alemanha, Brasil, República Tcheca...",
    regionsCityLabel: "Cidade (Opcional)",
    regionsCityPlaceholder: "Ex: Blumenau, Munique, Colônia, Bruxelas...",
    regionsSearchBtn: "Pesquisar Região",
    regionsSondando: "Sondando a Região...",
    regionsIntroTitle: "Tradição e História Local",
    regionsClassicStylesTitle: "Estilos Clássicos Locais",
    regionsRecommendedTitle: "Cervejarias Locais & Brewpubs Recomendados",
    visitSite: "Visitar Site",
    instagram: "Instagram",
    whereToBuy: "Onde Comprar este estilo",
    noBreweries: "Nenhuma cervejaria artesanal física relevante indexada para esta região específica. Explore as cervejas tradicionais locais!",

    // Tab 4: Shopping
    shoppingTitle: "Shopping Cervejeiro & Preços",
    shoppingSub: "Descubra onde adquirir a cerveja desejada online ou off-line, consulte a faixa média de preços atual e confira dicas de conservação antes de comprar.",
    shoppingQuickChips: "Sugestões de Busca rápidas:",
    shoppingInputLabel: "Estilo de Cerveja para Pesquisar Preços & Lojas",
    shoppingInputPlaceholder: "Ex: IPA, Weissbier, Catharina Sour, Imperial Stout...",
    shoppingSearchBtn: "Pesquisar Onde Comprar",
    shoppingSearching: "Investigando Lojas e Preços...",
    shoppingAvgPrice: "Média de Preço Estimada",
    shoppingOnlineStores: "Lojas Online Recomendadas (Web)",
    shoppingPhysicalStores: "Onde Encontrar Fisicamente",
    shoppingBuyingTips: "Dicas de Ouro do Sommelier ao Comprar Esse Estilo:",

    // Chatbot
    chatTitle: "Pergunte ao Sommelier",
    chatSub: "Dúvidas sobre copos, marcas e estilos",
    chatPlaceholder: "Perguntar sobre marcas de IPA, copo...",
    chatSendMessage: "O assistente está escrevendo...",
    chatFallback: "Perdão, tive um contratempo de conexão. Qual outra dúvida você gostaria de tirar sobre as sugestões de cervejas?",

    // Recommendation screen
    recVerdict: "O Veredito do Mestre",
    recIntro: "Sua Seleção Personalizada",
    recStyles: "Estilos de Cerveja Recomendados",
    recAlcohol: "Teor Alcoólico",
    recBitterness: "Amargor Mássico",
    recVisual: "Visual e Cor",
    recServing: "Temp. de Serviço",
    recIdealWhy: "Por que é ideal para você:",
    recPairingTitle: "Alquimia de Harmonização",
    recExtraTips: "Dicas Extras do Sommelier para Degustar",
    recAgainBtn: "Refazer Teste de Sabor"
  },
  en: {
    appSub: "Define your personal taste profile or enter the dish you are about to savor. Our artificial intelligence will act as your private expert, suggesting target beer styles and sublime gastronomic pairings.",
    digitalSommelier: "DIGITAL SOMMELIER",
    tabWizard: "Taste Configurator",
    tabExplorer: "Explore Classic Styles",
    tabRegions: "Beers by Region",
    tabShopping: "Shopping Guide",
    targetStyle: "Target Style",
    previewTitle: "Live Preview",
    step: "STEP",
    de: "OF",
    completado: "COMPLETED",
    voltar: "Back",
    avancar: "Next",
    pedirSommelier: "Ask AI Sommelier",
    mestrePensando: "Brewmaster Thinking",
    recomendedSelection: "Selecting the Golden Brews...",
    recomendedSub: "Chemical harmony and bubble physics are aligning. The sommelier is crafting specific tasting notes tailored to your selected dishes.",
    erroInesperado: "Error processing recommendations with the Sommelier.",
    fechar: "Close Details",
    copiar: "Copy",
    compartilhar: "Share",
    retry: "Try Again",

    // Step 1
    step1Title: "Bitterness Intensity (Hops)",
    step1Sub: "Bitterness comes from hops. Do you prefer a light, sweet beer, or something that robustly marks your palate with floral, herbal, or resinous notes?",
    amargorLow: "Refreshing, sweet malt dominant.",
    amargorMed: "Subtle back-up bitterness (e.g. Pilsner).",
    amargorHigh: "Clean, elegant hop presence (e.g. Pale Ale).",
    amargorVHigh: "Bold, pronounced bitterness (e.g. IPA).",

    // Step 2
    step2Title: "Alcohol Potency (ABV)",
    step2Sub: "Lighter beers deliver everyday refreshment. Stronger brews offer a warm mouthfeel, perfect for cool climates and richer dishes.",

    // Step 3
    step3Title: "Your Flavor Profile (Sensory Notes)",
    step3Sub: "Select the notes that captivate your palate the most. You can choose more than one!",

    // Step 4
    step4Title: "Beer Body & Structure",
    step4Sub: "Body refers to the viscosity and feel of the beer on your palate. Do you prefer light, watery drinks or thick, decadent, and liquor-like feels?",

    // Step 5
    step5Title: "Desired Dish & Personal Touches",
    step5Sub: "Let us know if you plan to eat something specific so we can calibrate the pairing rules (affinity, contrast, or cut):",
    dishLabel: "Any specific dish in mind? (Optional)",
    dishPlaceholder: "E.g. Mushroom Risotto, Pepperoni Pizza, Dark Chocolate, Roast Lamb...",
    prefLabel: "Additional beer preferences: (Optional)",
    prefPlaceholder: "E.g. 'I don't like dark beer' or 'I prefer extremely floral notes'...",

    // Tab 2: Explorer
    expTitle: "Classic Beer Styles Library",
    expSub: "Explore the most successful beer styles in the world, their visual properties, and gourmet pairings before customized profiling.",
    beerSignature: "SIGNATURE",
    analyticalTitle: "Preserved Style Analysis",

    // Tab 3: Regions
    regionsTitle: "Geographical Beer Traditions",
    regionsSub: "Type a country and/or city to discover the traditions, classic local styles, and recommended craft breweries of the region.",
    regionsCountryLabel: "Country",
    regionsCountryPlaceholder: "E.g. Belgium, Germany, United States, Czech Republic...",
    regionsCityLabel: "City (Optional)",
    regionsCityPlaceholder: "E.g. Munich, Brussels, Portland, Blumenau...",
    regionsSearchBtn: "Search Region",
    regionsSondando: "Sondando a Região...",
    regionsIntroTitle: "History & Local Tradition",
    regionsClassicStylesTitle: "Traditional Regional Styles",
    regionsRecommendedTitle: "Recommended Local Breweries & Brewpubs",
    visitSite: "Visit Website",
    instagram: "Instagram",
    whereToBuy: "Where to buy this style",
    noBreweries: "No relevant brick-and-mortar craft breweries indexed for this specific region. Try exploring traditional local beer styles!",

    // Tab 4: Shopping
    shoppingTitle: "Beer Shopping & Price Finder",
    shoppingSub: "Curious about where to buy or the price range of a particular style? Let our retail tool track online or local physical specialty channels.",
    shoppingQuickChips: "Quick Search Suggestions:",
    shoppingInputLabel: "Beer Style to Search Prices & Vendors",
    shoppingInputPlaceholder: "E.g. American IPA, Sour, Imperial Stout, German Pilsner...",
    shoppingSearchBtn: "Search Vendors",
    shoppingSearching: "Scanning Retail Channels...",
    shoppingAvgPrice: "Estimated Average Price",
    shoppingOnlineStores: "Recommended Online Shops (Web)",
    shoppingPhysicalStores: "Where to Find Physically",
    shoppingBuyingTips: "Sommelier's Golden Buying Advice for this Style:",

    // Chatbot
    chatTitle: "Ask the Sommelier",
    chatSub: "Ask questions on service, glassware, and styles",
    chatPlaceholder: "Ask about IPA brands, proper glasses...",
    chatSendMessage: "The sommelier is drafting...",
    chatFallback: "Apologies, I encountered a minor connection issue. What else would you like to ask about our beer suggestions?",

    // Recommendation screen
    recVerdict: "Master's Verdict",
    recIntro: "Your Taste Profile Selection",
    recStyles: "Suggested Beer Styles",
    recAlcohol: "Alcohol strength",
    recBitterness: "Hop Bitterness",
    recVisual: "Visual and Color",
    recServing: "Serving Temp",
    recIdealWhy: "Why it matches your profile:",
    recPairingTitle: "Pairing Alchemy",
    recExtraTips: "Expert Tasting Advice and Tips",
    recAgainBtn: "Redo Taste Test"
  }
};

// Selection displays helper functions
const getAmargorLabel = (val: string, l: 'pt' | 'en') => {
  if (l === 'en') {
    if (val === 'Baixo') return 'Low';
    if (val === 'Médio') return 'Medium';
    if (val === 'Alto') return 'High';
    if (val === 'Muito Alto') return 'Very High';
  }
  return val;
};

const getAbvLabel = (val: string, l: 'pt' | 'en') => {
  if (l === 'en') {
    if (val === 'Leve') return 'Light';
    if (val === 'Moderado') return 'Moderate';
    if (val === 'Forte') return 'Strong';
  }
  return val;
};

const getFlavorLabel = (val: string, l: 'pt' | 'en') => {
  if (l === 'en') {
    if (val === 'Frutado / Cítrico') return 'Fruity / Citrus';
    if (val === 'Maltado / Adocicado') return 'Malty / Sweet';
    if (val === 'Tostado / Café') return 'Roasted / Coffee';
    if (val === 'Condimentado / Cravo') return 'Spicy / Clove';
    if (val === 'Neutro / Limpo') return 'Neutral / Clean';
    if (val === 'Ácido / Sour') return 'Sour / Acidic';
  }
  return val;
};

const getBodyLabel = (val: string, l: 'pt' | 'en') => {
  if (l === 'en') {
    if (val === 'Leve') return 'Light';
    if (val === 'Médio') return 'Medium';
    if (val === 'Encorpado') return 'Full-Bodied';
  }
  return val;
};

export default function Home() {
  // Language selection state persistent using localstorage safely
  const [lang, setLang] = useState<'pt' | 'en'>('pt');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sommelier_lang');
      if (saved === 'en' || saved === 'pt') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLang(saved);
      }
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'pt' ? 'en' : 'pt';
    setLang(nextLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sommelier_lang', nextLang);
    }
  };

  const t = TRANSLATIONS[lang];

  // App states
  const [activeTab, setActiveTab] = useState<'wizard' | 'explorer' | 'regions' | 'shopping'>('wizard');
  const [selectedPreset, setSelectedPreset] = useState<typeof PRESET_STYLES.pt[0] | null>(null);

  // Preference wizard states
  const [currentStep, setCurrentStep] = useState(1);
  const [amargor, setAmargor] = useState('Médio');
  const [teorAlcoolico, setTeorAlcoolico] = useState('Moderado');
  const [corpo, setCorpo] = useState('Médio');
  const [notasSabor, setNotasSabor] = useState<string[]>(['Frutado / Cítrico']);
  const [comidaFoco, setComidaFoco] = useState('');
  const [experienciaText, setExperienciaText] = useState('');

  // Recommendation flow states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<SommelierResponse | null>(null);

  // Regional search states
  const [regionCountry, setRegionCountry] = useState('');
  const [regionCity, setRegionCity] = useState('');
  const [regionLoading, setRegionLoading] = useState(false);
  const [regionError, setRegionError] = useState<string | null>(null);
  const [regionResult, setRegionResult] = useState<RegionResult | null>(null);

  // Shopping search states
  const [shoppingBeerStyle, setShoppingBeerStyle] = useState('');
  const [shoppingLoading, setShoppingLoading] = useState(false);
  const [shoppingError, setShoppingError] = useState<string | null>(null);
  const [shoppingResult, setShoppingResult] = useState<ShoppingResult | null>(null);

  // Sommelier chat states
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const totalSteps = 5;

  // Sync scroll to chat bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Handle flavor selection toggle
  const handleToggleFlavor = (flavor: string) => {
    if (notasSabor.includes(flavor)) {
      if (notasSabor.length > 1) {
        setNotasSabor(notasSabor.filter(f => f !== flavor));
      }
    } else {
      setNotasSabor([...notasSabor, flavor]);
    }
  };

  // Generate color values based on preferences for dynamic beer preview
  const getDynamicBeerColorColor = () => {
    // Return CSS color of the liquid based on user preferences in the wizard
    if (notasSabor.includes('Tostado / Café') || corpo === 'Encorpado') {
      return 'bg-amber-950 shadow-[0_0_15px_rgba(45,20,5,0.4)]'; // Dark stout style
    }
    if (notasSabor.includes('Maltado / Adocicado') || teorAlcoolico === 'Forte') {
      return 'bg-amber-700 shadow-[0_0_15px_rgba(180,83,9,0.3)]'; // Amber style
    }
    return 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]'; // Gold pills/weiss style
  };

  // Run AI beer sommelier generation
  const handleGenerateRecommendations = async () => {
    setLoading(true);
    setErrorMsg(null);
    setResult(null);
    setSelectedPreset(null);
    setChatMessages([]);

    try {
      const response = await fetch('/api/sommelier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lang,
          amargor,
          teorAlcoolico,
          corpo,
          notasSabor,
          comidaFoco,
          experienciaText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t.erroInesperado);
      }

      const data: SommelierResponse = await response.json();
      setResult(data);

      // Initialize chat with sommelier intro
      setChatMessages([
        {
          sender: 'sommelier',
          text: data.sommelierIntro || (lang === 'en' ? 'Hello! I analyzed your taste profile and selected these outstanding craft beers.' : 'Olá! Analisei seu perfil de paladar e selecionei estes estilos excepcionais de cervejas.')
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || (lang === 'en' ? 'There was a connection issue with our AI Sommelier. Please check if your Gemini Secret key is set.' : 'Houve um imprevisto na comunicação com nosso Sommelier AI. Verifique se o seu segredo do Gemini está correto.'));
    } finally {
      setLoading(false);
    }
  };

  // Send message to the interactive sommelier chat
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/sommelier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lang,
          amargor,
          teorAlcoolico,
          corpo,
          notasSabor,
          comidaFoco,
          experienciaText,
          chatContext: userText,
          isChatQnA: true
        }),
      });

      if (!response.ok) {
        throw new Error(lang === 'en' ? 'Failed to get assistant response.' : 'Falha na resposta do assistente.');
      }

      const data = await response.json();
      setChatMessages(prev => [...prev, { sender: 'sommelier', text: data.reply }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { 
         sender: 'sommelier', 
         text: t.chatFallback 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Reset the wizard to start over
  const handleReset = () => {
    setCurrentStep(1);
    setAmargor('Médio');
    setTeorAlcoolico('Moderado');
    setCorpo('Médio');
    setNotasSabor(['Frutado / Cítrico']);
    setComidaFoco('');
    setExperienciaText('');
    setResult(null);
    setChatMessages([]);
    setErrorMsg(null);
    setSelectedPreset(null);
  };

  // Search beer styles and craft breweries by region
  const handleRegionSearch = async () => {
    if (!regionCountry.trim()) return;
    setRegionLoading(true);
    setRegionError(null);
    setRegionResult(null);

    try {
      const response = await fetch('/api/sommelier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lang,
          isRegionLookup: true,
          country: regionCountry,
          city: regionCity,
        }),
      });

      if (!response.ok) {
        throw new Error(lang === 'en' ? 'Failed to fetch regional data with AI Sommelier.' : 'Falha ao obter dados da região com o Sommelier AI.');
      }

      const data = await response.json();
      setRegionResult(data);
    } catch (err: any) {
      console.error(err);
      setRegionError(err.message || (lang === 'en' ? 'Unexpected error while accessing regional beer history.' : 'Erro inesperado ao consultar a tradição cervejeira da região.'));
    } finally {
      setRegionLoading(false);
    }
  };

  // Search stores and average retail prices for a beer style
  const handleShoppingSearch = async (overrideStyleName?: string) => {
    const styleToSearch = overrideStyleName || shoppingBeerStyle;
    if (!styleToSearch.trim()) return;

    setShoppingLoading(true);
    setShoppingError(null);
    setShoppingResult(null);

    try {
      const response = await fetch('/api/sommelier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lang,
          isShoppingLookup: true,
          beerStyle: styleToSearch,
        }),
      });

      if (!response.ok) {
        throw new Error(lang === 'en' ? 'Failed to fetch stores and price offers.' : 'Falha ao obter cotações de preços e lojas.');
      }

      const data = await response.json();
      setShoppingResult(data);
    } catch (err: any) {
      console.error(err);
      setShoppingError(err.message || (lang === 'en' ? 'Unexpected error while scanning retail channels.' : 'Erro inesperado ao buscar estimativas de shopping e preço.'));
    } finally {
      setShoppingLoading(false);
    }
  };

  // Cross-link styles to shopping view automatically
  const triggerShoppingSearch = (styleName: string) => {
    setShoppingBeerStyle(styleName);
    setActiveTab('shopping');
    handleShoppingSearch(styleName);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 border-t-4 border-gold">
      {/* LANGUAGE SELECT TOGGLE */}
      <div className="flex justify-end mb-4 relative z-20">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-mono font-bold tracking-wide transition border border-white/5 cursor-pointer shadow-md"
        >
          <Globe className="h-3.5 w-3.5 text-gold animate-spin-slow" />
          {lang === 'pt' ? 'ENGLISH (EN)' : 'PORTUGUÊS (PT)'}
        </button>
      </div>

      {/* HEADER SECTION */}
      <header className="text-center mb-10 mt-4 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center justify-center space-x-3 mb-3 relative z-10">
          <div className="p-3 bg-gradient-to-br from-gold/20 to-gold/40 border border-gold/30 rounded-2xl text-gold shadow-lg shadow-black/30 ring-4 ring-gold/10">
            <Beer className="h-8 w-8 animate-pulse" />
          </div>
          <span className="font-serif text-gold text-xs tracking-[0.2em] font-bold uppercase py-1.5 px-3 bg-[#121214] rounded-full border border-white/5">
            {t.digitalSommelier}
          </span>
        </div>
        <h1 id="app-title" className="font-serif text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mt-1">
          L’Sommelier d’Or
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-white/60 mt-3 px-2 font-light">
          {t.appSub}
        </p>

        {/* TOP LEVEL NAVIGATION MODAL */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          <button
            id="tab-wizard"
            onClick={() => { setActiveTab('wizard'); setSelectedPreset(null); }}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              activeTab === 'wizard'
                ? 'bg-gold text-black font-bold shadow-md shadow-gold/20 translate-y-[-1px]'
                : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/5'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            {t.tabWizard}
          </button>
          <button
            id="tab-explorer"
            onClick={() => { setActiveTab('explorer'); setSelectedPreset(null); }}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              activeTab === 'explorer'
                ? 'bg-gold text-black font-bold shadow-md shadow-gold/20 translate-y-[-1px]'
                : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/5'
            }`}
          >
            <Compass className="h-4 w-4" />
            {t.tabExplorer}
          </button>
          <button
            id="tab-regions"
            onClick={() => { setActiveTab('regions'); setSelectedPreset(null); }}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              activeTab === 'regions'
                ? 'bg-gold text-black font-bold shadow-md shadow-gold/20 translate-y-[-1px]'
                : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/5'
            }`}
          >
            <Globe className="h-4 w-4" />
            {t.tabRegions}
          </button>
          <button
            id="tab-shopping"
            onClick={() => { setActiveTab('shopping'); setSelectedPreset(null); }}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              activeTab === 'shopping'
                ? 'bg-gold text-black font-bold shadow-md shadow-gold/20 translate-y-[-1px]'
                : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/5'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            {t.tabShopping}
          </button>
        </div>
      </header>

      {/* CORE WORKSPACE COLUMN OR GRID */}
      <main className="grid grid-cols-1 gap-10">
        
        {/* WIZARD PALADAR TAB */}
        {activeTab === 'wizard' && (
          <div className="w-full">
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div
                  key="params-form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="max-w-3xl mx-auto bg-[#121214] border border-white/5 rounded-3xl p-6 sm:p-10 shadow-2xl relative"
                >
                  {/* Progressive indicator bar */}
                  <div className="w-full bg-white/5 rounded-full h-1.5 mb-8">
                    <div 
                      className="bg-[#c29b40] h-1.5 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(194,155,64,0.4)]"
                      style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                    <div className="flex justify-between text-xs text-white/40 font-mono mt-1.5 px-1">
                      <span>{t.step} <strong className="text-[#c29b40]">{currentStep}</strong> {t.de} {totalSteps}</span>
                      <span>{Math.round((currentStep / totalSteps) * 100)}% {t.completado}</span>
                    </div>
                  </div>

                  {/* SPLIT LIVE BEER GLASS VISUALS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    
                    {/* WIZARD INTERFACES */}
                    <div className="md:col-span-2 min-h-[280px] flex flex-col justify-between">
                      <div>
                        {currentStep === 1 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="p-1 px-2.5 rounded bg-gold/10 text-gold border border-gold/20 font-mono text-xs font-bold">{t.step} 1</span>
                              <h2 className="text-xl font-serif font-bold text-white">{t.step1Title}</h2>
                            </div>
                            <p className="text-sm text-white/60 font-light">
                              {t.step1Sub}
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                              {['Baixo', 'Médio', 'Alto', 'Muito Alto'].map((level) => (
                                <button
                                  key={level}
                                  id={`btn-amargor-${level}`}
                                  onClick={() => setAmargor(level)}
                                  className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                                    amargor === level
                                      ? 'border-[#c29b40] bg-[#c29b40]/10 font-bold text-white ring-2 ring-[#c29b40]/20'
                                      : 'border-white/5 bg-[#17171a] hover:bg-[#202024] hover:border-white/10 text-white/80'
                                  }`}
                                >
                                  <div className="text-sm font-semibold">{getAmargorLabel(level, lang)}</div>
                                  <div className="text-xs mt-1 font-light text-white/50">
                                    {level === 'Baixo' && t.amargorLow}
                                    {level === 'Médio' && t.amargorMed}
                                    {level === 'Alto' && t.amargorHigh}
                                    {level === 'Muito Alto' && t.amargorVHigh}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {currentStep === 2 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="p-1 px-2.5 rounded bg-gold/10 text-gold border border-gold/20 font-mono text-xs font-bold">{t.step} 2</span>
                              <h2 className="text-xl font-serif font-bold text-white">{t.step2Title}</h2>
                            </div>
                            <p className="text-sm text-white/60 font-light">
                              {t.step2Sub}
                            </p>
                            <div className="grid grid-cols-3 gap-3 pt-2">
                              {[
                                { val: 'Leve', desc: 'Até 4.5% ABV', note: lang === 'en' ? 'Very easy to drink' : 'Muito fácil de beber' },
                                { val: 'Moderado', desc: '4.5% a 7.0%', note: lang === 'en' ? 'Classic balance' : 'Equilíbrio clássico' },
                                { val: 'Forte', desc: 'Acima de 7.0%', note: lang === 'en' ? 'Warming and complex' : 'Aquecedora e complexa' }
                              ].map(({ val, desc, note }) => (
                                <button
                                  key={val}
                                  id={`btn-abv-${val}`}
                                  onClick={() => setTeorAlcoolico(val)}
                                  className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between h-32 ${
                                    teorAlcoolico === val
                                      ? 'border-[#c29b40] bg-[#c29b40]/10 font-bold text-white ring-2 ring-[#c29b40]/20'
                                      : 'border-white/5 bg-[#17171a] hover:bg-[#202024] hover:border-white/10 text-white/80'
                                  }`}
                                >
                                  <div>
                                    <div className="text-sm font-semibold">{getAbvLabel(val, lang)}</div>
                                    <div className="text-xs text-[#c29b40] font-mono font-medium mt-1">{desc}</div>
                                  </div>
                                  <div className="text-[11px] text-white/45 font-light mt-2">{note}</div>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {currentStep === 3 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="p-1 px-2.5 rounded bg-gold/10 text-gold border border-gold/20 font-mono text-xs font-bold">{t.step} 3</span>
                              <h2 className="text-xl font-serif font-bold text-white">{t.step3Title}</h2>
                            </div>
                            <p className="text-sm text-white/60 font-light">
                              {t.step3Sub}
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                              {[
                                { val: 'Frutado / Cítrico', detail: lang === 'en' ? 'Lemon, orange, passion fruit hints from hops.' : 'Limão, laranja, maracujá do lúpulo.' },
                                { val: 'Maltado / Adocicado', detail: lang === 'en' ? 'Caramel, sweet bread, cereal grains.' : 'Caramelo, pão doce, grãos.' },
                                { val: 'Tostado / Café', detail: lang === 'en' ? 'Burnt malt, rich cocoa, subtle dark roast.' : 'Malte queimado, cacau, sutil torrefação.' },
                                { val: 'Condimentado / Cravo', detail: lang === 'en' ? 'Traditional spices of Belgian and wheat styles.' : 'Especiarias típicas das belgas e trigo.' },
                                { val: 'Neutro / Limpo', detail: lang === 'en' ? 'Standard classic grain profile, low overlay.' : 'Sabor clássico de grão, sem exageros.' },
                                { val: 'Ácido / Sour', detail: lang === 'en' ? 'Crispy tart fruits, refreshing acidic snap.' : 'Frutas ácidas maduras, azedo refrescante.' }
                              ].map(({ val, detail }) => {
                                const selected = notasSabor.includes(val);
                                return (
                                  <button
                                    key={val}
                                    id={`btn-sabor-${val.replace(/\s+/g, '')}`}
                                    onClick={() => handleToggleFlavor(val)}
                                    className={`p-3.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer relative ${
                                      selected
                                        ? 'border-[#c29b40] bg-[#c29b40]/10 font-bold text-white ring-2 ring-[#c29b40]/20'
                                        : 'border-white/5 bg-[#17171a] hover:bg-[#202024] hover:border-white/10 text-white/80'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs sm:text-sm font-semibold">{getFlavorLabel(val, lang)}</span>
                                      {selected && <Check className="h-4 w-4 text-[#c29b40]" />}
                                    </div>
                                    <p className="text-xs text-white/45 mt-0.5 font-light">{detail}</p>
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
 
                        {currentStep === 4 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="p-1 px-2.5 rounded bg-gold/10 text-gold border border-gold/20 font-mono text-xs font-bold">{t.step} 4</span>
                              <h2 className="text-xl font-serif font-bold text-white">{t.step4Title}</h2>
                            </div>
                            <p className="text-sm text-white/60 font-light">
                              {t.step4Sub}
                            </p>
                            <div className="grid grid-cols-3 gap-3 pt-2">
                              {[
                                { val: 'Leve', highlight: lang === 'en' ? 'Discreet' : 'Discreta', desc: lang === 'en' ? 'Weightless and highly refreshing like coconut water.' : 'Como água de coco ou chá focado na leveza.' },
                                { val: 'Médio', highlight: lang === 'en' ? 'Balanced' : 'Equilíbrio', desc: lang === 'en' ? 'Like a fresh juice, structured without being heavy.' : 'Suco natural fresco, encorpado sem pesar.' },
                                { val: 'Encorpado', highlight: lang === 'en' ? 'Decadent' : 'Licorosa', desc: lang === 'en' ? 'Dense, velvety, with a highly prominent textury feel.' : 'Denso, avelulado, textura proeminente na boca.' }
                              ].map(({ val, highlight, desc }) => (
                                <button
                                  key={val}
                                  id={`btn-corpo-${val}`}
                                  onClick={() => setCorpo(val)}
                                  className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer h-36 flex flex-col justify-between ${
                                    corpo === val
                                      ? 'border-[#c29b40] bg-[#c29b40]/10 font-bold text-white ring-2 ring-[#c29b40]/20'
                                      : 'border-white/5 bg-[#17171a] hover:bg-[#202024] hover:border-white/10 text-white/80'
                                  }`}
                                >
                                  <div>
                                    <div className="text-xs text-[#c29b40] font-mono font-bold uppercase">{highlight}</div>
                                    <div className="text-sm font-bold text-white mt-1">{getBodyLabel(val, lang)}</div>
                                  </div>
                                  <p className="text-[11px] text-white/45 line-clamp-3 leading-tight mb-1">{desc}</p>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
 
                        {currentStep === 5 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="p-1 px-2.5 rounded bg-gold/10 text-gold border border-gold/20 font-mono text-xs font-bold">{t.step} 5</span>
                              <h2 className="text-xl font-serif font-bold text-white">{t.step5Title}</h2>
                            </div>
                            <p className="text-sm text-white/60 font-light">
                              {t.step5Sub}
                            </p>
                            
                            <div className="space-y-4">
                              <div>
                                <label className="block text-xs font-bold text-[#c29b40] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-mono">
                                  <Utensils className="h-3.5 w-3.5 text-[#c29b40]" />
                                  {t.dishLabel}
                                </label>
                                <input
                                  type="text"
                                  id="input-comida-foco"
                                  placeholder={t.dishPlaceholder}
                                  value={comidaFoco}
                                  onChange={(e) => setComidaFoco(e.target.value)}
                                  className="w-full p-4 rounded-xl border border-white/5 bg-[#17171a] text-sm text-white focus:outline-none focus:border-[#c29b40] focus:ring-4 focus:ring-[#c29b40]/10 font-medium placeholder-white/30"
                                />
                              </div>
 
                              <div>
                                <label className="block text-xs font-bold text-[#c29b40] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-mono">
                                  <ChefHat className="h-3.5 w-3.5 text-[#c29b40]" />
                                  {t.prefLabel}
                                </label>
                                <textarea
                                  id="input-experiencia-text"
                                  rows={2}
                                  placeholder={t.prefPlaceholder}
                                  value={experienciaText}
                                  onChange={(e) => setExperienciaText(e.target.value)}
                                  className="w-full p-4 rounded-xl border border-white/5 bg-[#17171a] text-sm text-white focus:outline-none focus:border-[#c29b40] focus:ring-4 focus:ring-[#c29b40]/10 font-medium resize-none placeholder-white/30"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* NAV BUTTONS */}
                      <div className="flex justify-between items-center pt-8 border-t border-white/5 mt-6">
                        <button
                          type="button"
                          id="btn-voltar"
                          disabled={currentStep === 1}
                          onClick={() => setCurrentStep(prev => prev - 1)}
                          className={`flex items-center gap-1.5 text-xs font-bold uppercase py-2.5 px-4 rounded-xl transition duration-200 ${
                            currentStep === 1 
                              ? 'opacity-30 cursor-not-allowed text-white/20' 
                              : 'bg-transparent text-white/80 hover:bg-white/5 hover:text-white cursor-pointer'
                          }`}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          {t.voltar}
                        </button>

                        {currentStep < totalSteps ? (
                          <button
                            type="button"
                            id="btn-avancar"
                            onClick={() => setCurrentStep(prev => prev + 1)}
                            className="bg-gold hover:bg-gold-hover text-black font-bold text-xs uppercase py-3 px-6 rounded-xl flex items-center gap-1.5 transition duration-200 shadow-md shadow-gold/20 cursor-pointer"
                          >
                            {t.avancar}
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            id="btn-gerar"
                            onClick={handleGenerateRecommendations}
                            className="bg-[#c29b40] hover:bg-[#b48a33] text-black font-bold text-xs uppercase py-3.5 px-7 rounded-xl flex items-center gap-2 transition duration-200 shadow-lg shadow-gold/30 cursor-pointer"
                          >
                            <Sparkles className="h-4 w-4 animate-spin-slow" />
                            {t.pedirSommelier}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* LIVE GLASS PREVIEW ILLUSTRATION (CRAFTSMANSHIP) */}
                    <div className="bg-[#17171a] p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                      <div className="text-xs uppercase tracking-widest font-mono text-white/40 font-bold mb-4">{t.previewTitle}</div>
                      
                      {/* Interactive pint beer glass */}
                      <div className="relative w-24 h-40 border-4 border-white/20 rounded-b-3xl rounded-t-lg bg-transparent p-1 overflow-hidden flex flex-col justify-end shadow-inner">
                        {/* Beer Foam */}
                        <motion.div 
                          animate={{ height: ['8px', '12px', '10px'] }}
                          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                          className="w-full bg-white/95 rounded-t-sm border-b border-white/10" 
                        />
                        {/* Beer Liquid body */}
                        <div className={`w-full transition-all duration-700 rounded-b-2xl h-32 ${getDynamicBeerColorColor()}`}>
                          {/* Bubbles animation */}
                          <div className="absolute inset-0 overflow-hidden flex justify-around">
                            <span className="w-1 h-1 bg-white/20 rounded-full animate-bounce delay-75 self-end mb-2" />
                            <span className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce delay-200 self-end mb-6" />
                            <span className="w-1 h-1 bg-white/20 rounded-full animate-bounce delay-300 self-end mb-4" />
                          </div>
                        </div>
                      </div>

                      {/* Technical tag */}
                      <div className="mt-4 space-y-1.5">
                        <div className="font-serif font-bold text-sm text-white">{t.targetStyle}:</div>
                        <div className="text-xs font-semibold text-gold bg-gold/10 border border-gold/20 py-1.5 px-3.5 rounded-full inline-block">
                          {getBodyLabel(corpo, lang)} • ABV {getAbvLabel(teorAlcoolico, lang)}
                        </div>
                        <div className="text-[11px] text-white/40 font-mono mt-1">
                          {lang === 'en' ? 'Bitterness' : 'Amargor'} {getAmargorLabel(amargor, lang)}
                        </div>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* LOADER DESIGN */}
              {loading && (
                <motion.div
                  key="loading-screen"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-2xl mx-auto h-[380px] bg-[#121214] border border-white/5 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="relative">
                    <Loader2 className="h-14 w-14 text-gold animate-spin" />
                    <Beer className="h-6 w-6 text-gold/80 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-xl text-white">{t.recomendedSelection}</h3>
                    <p className="text-sm text-white/60 max-w-sm mx-auto mt-2 font-light">
                       {t.recomendedSub}
                    </p>
                  </div>
                  <div className="text-xs font-mono text-[#c29b40] bg-[#c29b40]/10 border border-[#c29b40]/20 rounded-full py-1.5 px-3 uppercase tracking-widest animate-pulse">
                    {t.mestrePensando}
                  </div>
                </motion.div>
              )}

              {/* ERROR STATE */}
              {errorMsg && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="max-w-xl mx-auto p-6 bg-[#1c1214] border border-red-950/40 rounded-2xl text-center space-y-3"
                >
                  <p className="text-sm text-red-200 font-semibold">{errorMsg}</p>
                  <p className="text-xs text-red-300/70">{lang === 'en' ? 'Please ensure your GEMINI_API_KEY has been correctly injected in the Secrets lateral tab.' : 'Por favor, garanta que sua chave GEMINI_API_KEY foi devidamente injetada na aba lateral de segredos.'}</p>
                  <button
                    onClick={handleReset}
                    className="mt-2 text-xs uppercase tracking-wider font-bold text-black bg-gold hover:bg-gold-hover px-4 py-2 rounded-lg transition duration-200 cursor-pointer"
                  >
                    {t.retry}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* RESULTS ANALYSIS GENERATED */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Intro card banner */}
                <div className="bg-[#121214] rounded-3xl p-6 sm:p-8 border border-white/5 shadow-2xl flex flex-col md:flex-row gap-6 items-start">
                  <div className="p-4 bg-gold/10 rounded-2xl text-gold shadow-inner border border-gold/20 flex-shrink-0 self-center md:self-start">
                    <ChefHat className="h-8 w-8 text-[#c29b40]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold font-mono text-[#c29b40] uppercase tracking-[0.25em]">
                      {t.recVerdict}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-white mt-1">{t.recIntro}</h3>
                    <p className="text-sm text-white/80 leading-relaxed mt-2 italic font-light">
                      &ldquo;{result.sommelierIntro}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Split recommendations and dynamic chat panel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Recommendations container */}
                  <div className="lg:col-span-2 space-y-6">
                    <h4 className="font-serif text-lg font-bold text-gold border-b border-white/10 pb-2.5 flex items-center gap-2">
                      <BeerIcon className="h-5 w-5 text-gold" />
                      {t.recStyles}
                    </h4>

                    {result.recommendations?.map((beer, idx) => (
                      <motion.div
                        key={beer.styleName}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.15 }}
                        className="bg-[#121214] rounded-3xl border border-white/5 overflow-hidden shadow-2xl transition-all divide-y divide-white/5"
                      >
                        {/* Header card beer overview */}
                        <div className="p-6 bg-gradient-to-r from-gold/5 to-transparent">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <h5 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight">
                              {beer.styleName}
                            </h5>
                            <span className="inline-flex py-1 px-3 bg-gold/15 text-gold border border-gold/20 rounded-full font-mono text-xs font-bold uppercase tracking-wider">
                              {lang === 'en' ? 'STYLE' : 'ESTILO'} #{idx + 1}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                            <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5">
                              <span className="block text-[10px] text-white/40 font-semibold font-mono uppercase">{t.recAlcohol}</span>
                              <span className="text-xs sm:text-sm font-bold text-gold">{beer.abv}</span>
                            </div>
                            <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5">
                              <span className="block text-[10px] text-white/40 font-semibold font-mono uppercase">{t.recBitterness}</span>
                              <span className="text-xs sm:text-sm font-bold text-gold">{beer.ibu}</span>
                            </div>
                            <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5">
                              <span className="block text-[10px] text-white/40 font-semibold font-mono uppercase">{t.recVisual}</span>
                              <span className="text-xs sm:text-sm font-bold text-gold leading-tight">{beer.visualColor}</span>
                            </div>
                            <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5">
                              <span className="block text-[10px] text-white/40 font-semibold font-mono uppercase">{t.recServing}</span>
                              <span className="text-xs sm:text-sm font-bold text-gold">{beer.idealTemp}</span>
                            </div>
                          </div>

                          <p className="text-sm text-white/70 leading-relaxed mt-4 font-light bg-black/10 p-4 rounded-2xl border border-white/5">
                            {beer.description}
                          </p>

                          <div className="mt-4 flex items-start gap-2 bg-gold/5 border border-gold/10 p-3.5 rounded-xl">
                            <Info className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-white/80 font-medium">
                              <strong className="text-gold font-bold">{t.recIdealWhy}</strong> {beer.whyIdeal}
                            </p>
                          </div>
                        </div>

                        {/* Pairing Suggestion inside the card */}
                        <div className="p-6 bg-black/20">
                          <h6 className="text-xs tracking-wider font-bold text-white uppercase mb-4 flex items-center gap-1.5 font-mono">
                            <ChefHat className="h-3.5 w-3.5 text-[#c29b40]" />
                            {t.recPairingTitle}
                          </h6>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {beer.pairings?.map((pair, pIdx) => (
                              <div 
                                key={pair.dishName} 
                                className="bg-[#17171a] p-4 rounded-2xl border border-white/5 relative flex flex-col justify-between"
                              >
                                <div>
                                  <span className={`inline-block text-[9px] font-mono font-bold uppercase rounded py-0.5 px-2 mb-2 ${
                                    pair.dishType.toLowerCase().includes('principal') 
                                      ? 'bg-red-950/20 text-red-400 border border-red-900/40'
                                      : pair.dishType.toLowerCase().includes('sobremesa')
                                        ? 'bg-purple-950/20 text-purple-400 border border-purple-900/40'
                                        : 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/40'
                                  }`}>
                                    {pair.dishType}
                                  </span>
                                  <h6 className="block text-sm font-bold text-white mb-1 leading-snug">
                                    {pair.dishName}
                                  </h6>
                                </div>
                                <p className="text-xs text-white/60 leading-relaxed mt-2 italic font-light border-t border-white/5 pt-2">
                                  {pair.whySecret}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Sommelier tips block */}
                    <div className="bg-[#121214] border border-white/5 rounded-3xl p-6">
                      <h5 className="font-serif font-bold text-base text-gold mb-3 flex items-center gap-2">
                        <Utensils className="h-4.5 w-4.5 text-gold" />
                        {t.recExtraTips}
                      </h5>
                      <ul className="text-xs text-white/70 space-y-2.5 list-disc list-inside font-light">
                        {result.sommelierTips?.map((tip, tIdx) => (
                          <li key={tIdx} className="leading-relaxed">
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-center pt-4">
                      <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-black bg-gold hover:bg-gold-hover py-3 px-6 rounded-full transition cursor-pointer shadow-lg shadow-gold/20"
                      >
                        <RotateCcw className="h-4 w-4" />
                        {t.recAgainBtn}
                      </button>
                    </div>

                  </div>

                  {/* Sommelier interactive Chatbot Column */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-6 bg-[#121214] border border-white/5 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[520px]">
                      
                      {/* Chat Header */}
                      <div className="p-4 bg-[#1a1a1e] border-b border-white/5 flex items-center gap-2.5">
                        <div className="p-2 bg-gold/10 rounded-xl border border-gold/10">
                          <Beer className="h-5 w-5 text-gold" />
                        </div>
                        <div>
                          <h5 className="font-serif font-bold text-sm text-white">{t.chatTitle}</h5>
                          <p className="text-[10px] text-white/40">{t.chatSub}</p>
                        </div>
                      </div>

                      {/* Chat Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/10">
                        {chatMessages.map((msg, mIdx) => (
                          <div
                            key={mIdx}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                              msg.sender === 'user'
                                ? 'bg-gold text-black font-medium'
                                : 'bg-[#17171a] text-white/90 border border-white/5'
                            }`}>
                              <span className={`block font-mono font-bold text-[9px] uppercase tracking-wider mb-1 ${
                                msg.sender === 'user' ? 'text-black/60' : 'text-gold/80'
                              }`}>
                                {msg.sender === 'user' ? (lang === 'en' ? 'You' : 'Você') : (lang === 'en' ? 'Master Sommelier' : 'Mestre Cervejeiro')}
                              </span>
                              <div className="whitespace-pre-line">{msg.text}</div>
                            </div>
                          </div>
                        ))}

                        {chatLoading && (
                          <div className="flex justify-start">
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 flex items-center gap-2 text-xs text-white/40">
                              <Loader2 className="h-3 w-3 animate-spin text-gold" />
                              <span>{t.chatSendMessage}</span>
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Chat Form */}
                      <form onSubmit={handleSendChatMessage} className="p-3 border-t border-white/5 bg-[#17171a] flex gap-1.5">
                        <input
                          type="text"
                          placeholder={t.chatPlaceholder}
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          disabled={chatLoading}
                          className="flex-1 bg-black/25 text-xs text-white p-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-gold placeholder-white/20"
                        />
                        <button
                          type="submit"
                          disabled={chatLoading || !chatInput.trim()}
                          className="bg-gold hover:bg-gold-hover disabled:bg-white/5 text-black disabled:text-white/20 p-2.5 rounded-xl transition duration-200 cursor-pointer flex-shrink-0"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </form>

                    </div>
                  </div>

                </div>
              </motion.div>
            )}

          </div>
        )}

        {/* EXPLORER PRESET STYLES TAB */}
        {activeTab === 'explorer' && (
          <div className="w-full max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h3 className="font-serif text-2xl font-bold text-white">{t.expTitle}</h3>
              <p className="text-sm text-white/55 mt-1 max-w-lg mx-auto font-light">
                {t.expSub}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRESET_STYLES[lang].map((preset) => (
                <button
                  key={preset.styleName}
                  onClick={() => setSelectedPreset(preset)}
                  className={`p-5 rounded-2xl border text-left transition duration-300 cursor-pointer ${
                    selectedPreset?.styleName === preset.styleName 
                    ? 'bg-gold/10 border-[#c29b40] shadow-xl ring-2 ring-gold/20'
                    : 'bg-[#121214] border-white/5 hover:border-white/10 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-1 px-2.5 bg-gold/15 text-gold border border-gold/20 rounded font-mono text-[10px] font-bold">
                      {lang === 'en' ? 'CLASSIC STYLE' : 'ESTILO CLÁSSICO'}
                    </span>
                    <span className="text-[11px] font-mono text-white/40">{preset.abv}</span>
                  </div>
                  <h4 className="font-serif font-bold text-lg text-white">{preset.styleName}</h4>
                  <p className="text-xs text-white/60 mt-2 line-clamp-3 leading-relaxed font-light">
                    {preset.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-4 text-[11px] font-bold uppercase tracking-wider text-gold">
                    <span>{lang === 'en' ? 'See Chemistry & Pairings' : 'Ver Alquimia & Harmonizações'}</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </button>
              ))}
            </div>

            {/* Selected preset detail modal overlay or block */}
            <AnimatePresence>
              {selectedPreset && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-[#121214] border-2 border-gold/25 rounded-3xl p-6 sm:p-8 shadow-2xl"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="font-mono text-xs uppercase tracking-wider text-gold font-semibold">{t.analyticalTitle}</span>
                      <h4 className="font-serif text-2xl font-bold text-white mt-1">{selectedPreset.styleName}</h4>
                    </div>
                    <button 
                      onClick={() => setSelectedPreset(null)}
                      className="text-black hover:bg-gold-hover text-xs font-bold uppercase py-2 px-4 bg-gold rounded-xl transition duration-200 cursor-pointer"
                    >
                      {lang === 'en' ? 'Close Details' : 'Fechar Detalhes'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                      <span className="block text-[9px] font-mono font-bold uppercase text-white/40">{t.recAlcohol}</span>
                      <span className="text-xs sm:text-sm font-bold text-white">{selectedPreset.abv}</span>
                    </div>
                    <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                      <span className="block text-[9px] font-mono font-bold uppercase text-white/40">{t.recBitterness}</span>
                      <span className="text-xs sm:text-sm font-bold text-white">{selectedPreset.ibu}</span>
                    </div>
                    <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                      <span className="block text-[9px] font-mono font-bold uppercase text-white/40">{t.recVisual}</span>
                      <span className="text-xs sm:text-sm font-bold text-white">{selectedPreset.visualColor}</span>
                    </div>
                    <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                      <span className="block text-[9px] font-mono font-bold uppercase text-white/40">{t.recServing}</span>
                      <span className="text-xs sm:text-sm font-bold text-white">{selectedPreset.idealTemp}</span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div>
                      <h5 className="text-xs font-bold text-gold uppercase font-mono">{lang === 'en' ? 'Detailed Sensorial:' : 'Sensorial Detalhado:'}</h5>
                      <p className="text-xs sm:text-sm text-white/80 leading-relaxed mt-1 italic font-light">
                        &ldquo;{selectedPreset.description}&rdquo;
                      </p>
                    </div>

                    <div className="border-t border-white/5 pt-4">
                      <h5 className="text-xs font-bold text-gold uppercase font-mono flex items-center gap-1.5 mb-3">
                        <Utensils className="h-3.5 w-3.5" />
                        {lang === 'en' ? 'Critical Examples of Food Pairings:' : 'Exemplos Críticos de Harmonizações com Pratos Específicos:'}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {selectedPreset.pairings.map((pair) => (
                          <div key={pair.dishName} className="bg-[#17171a] p-4 rounded-xl border border-white/5 relative">
                            <span className="text-[9px] font-mono font-bold uppercase text-gold bg-gold/10 border border-gold/20 rounded px-1.5 py-0.5 inline-block mb-1">
                              {pair.dishType}
                            </span>
                            <h6 className="text-xs sm:text-sm font-bold text-white leading-tight block mb-1">
                              {pair.dishName}
                            </h6>
                            <p className="text-[11px] text-white/60 leading-normal italic mt-2 border-t border-white/5 pt-2 font-light">
                              {pair.whySecret}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        {activeTab === 'regions' && (
          <div className="w-full max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h3 className="font-serif text-2xl font-bold text-white">{t.regionsTitle}</h3>
              <p className="text-sm text-white/55 mt-1 max-w-lg mx-auto font-light">
                {t.regionsSub}
              </p>
            </div>

            <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 shadow-2xl">
              <form onSubmit={(e) => { e.preventDefault(); handleRegionSearch(); }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gold uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                      <Globe className="h-3.5 w-3.5" />
                      {t.regionsCountryLabel}
                    </label>
                    <input
                      type="text"
                      placeholder={t.regionsCountryPlaceholder}
                      value={regionCountry}
                      onChange={(e) => setRegionCountry(e.target.value)}
                      required
                      className="w-full p-4 rounded-xl border border-white/5 bg-[#17171a] text-sm text-white focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/10 font-medium placeholder-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gold uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                      <MapPin className="h-3.5 w-3.5" />
                      {t.regionsCityLabel}
                    </label>
                    <input
                      type="text"
                      placeholder={t.regionsCityPlaceholder}
                      value={regionCity}
                      onChange={(e) => setRegionCity(e.target.value)}
                      className="w-full p-4 rounded-xl border border-white/5 bg-[#17171a] text-sm text-white focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/10 font-medium placeholder-white/30"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={regionLoading || !regionCountry.trim()}
                    className="w-full sm:w-auto bg-[#c29b40] hover:bg-[#b48a33] disabled:bg-white/5 text-black disabled:text-white/20 font-bold text-xs uppercase py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-gold/20 cursor-pointer"
                  >
                    {regionLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t.regionsSondando}
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        {t.regionsSearchBtn}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {regionError && (
              <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-2xl text-center text-red-300 text-xs">
                {regionError}
              </div>
            )}

            <AnimatePresence mode="wait">
              {regionResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  {/* Historical Intro Card */}
                  <div className="bg-[#121214] rounded-3xl p-6 sm:p-8 border border-white/5 shadow-2xl flex flex-col md:flex-row gap-6 items-start">
                    <div className="p-4 bg-gold/10 rounded-2xl text-gold border border-gold/20 flex-shrink-0 self-center md:self-start">
                      <Globe className="h-8 w-8 text-[#c29b40]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold font-mono text-gold uppercase tracking-[0.25em]">
                        {t.regionsIntroTitle}
                      </span>
                      <h4 className="font-serif text-2xl font-bold text-white mt-1">
                        {lang === 'en' ? 'Beer Culture of ' : 'Cultura Cervejeira de '}{regionCity ? regionCity + ' – ' : ''}{regionCountry}
                      </h4>
                      <p className="text-sm text-white/80 leading-relaxed mt-3 font-light italic">
                        &ldquo;{regionResult.regionIntro}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Classic regional styles */}
                  <div className="space-y-4">
                    <h4 className="font-serif text-lg font-bold text-gold border-b border-white/10 pb-2 flex items-center gap-2 font-medium">
                      <BeerIcon className="h-5 w-5 text-gold" />
                      {t.regionsClassicStylesTitle}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {regionResult.classicStyles?.map((style, idx) => (
                        <div key={idx} className="bg-[#121214] p-6 rounded-2xl border border-white/5 flex flex-col justify-between shadow-lg">
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <h5 className="font-serif text-lg font-bold text-white">{style.styleName}</h5>
                              <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-2 rounded bg-gold/15 text-gold border border-gold/10">
                                {lang === 'en' ? 'LOCAL STYLE' : 'ESTILO LOCAL'}
                              </span>
                            </div>
                            <span className="text-xs text-gold/75 font-mono block mb-3 font-semibold">
                              {lang === 'en' ? 'Origin:' : 'Origem:'} {style.originReason}
                            </span>
                            <p className="text-xs text-white/60 leading-relaxed font-light">
                              {style.description}
                            </p>
                          </div>
                          
                          <div className="mt-5 pt-4 border-t border-white/5 flex justify-end">
                            <button
                              onClick={() => triggerShoppingSearch(style.styleName)}
                              className="text-[11px] font-bold text-gold hover:text-gold-hover uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <ShoppingBag className="h-3.5 w-3.5" />
                              {t.whereToBuy}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Local Breweries List */}
                  <div className="space-y-4">
                    <h4 className="font-serif text-lg font-bold text-gold border-b border-white/10 pb-2.5 flex items-center gap-2.5 font-medium tracking-wide">
                      <Store className="h-5 w-5 text-gold" />
                      {t.regionsRecommendedTitle}
                    </h4>
                    {regionResult.breweries && regionResult.breweries.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {regionResult.breweries.map((brewery, bIdx) => {
                          const websiteUrl = brewery.website?.startsWith('http') 
                            ? brewery.website 
                            : `https://${brewery.website}`;

                          const instagramUrl = brewery.instagram?.startsWith('http')
                            ? brewery.instagram
                            : brewery.instagram?.startsWith('@')
                            ? `https://instagram.com/${brewery.instagram.slice(1)}`
                            : `https://instagram.com/${brewery.instagram}`;

                          return (
                            <div 
                              key={bIdx} 
                              className="bg-[#121214] p-5 rounded-2xl border border-white/5 hover:border-gold/30 transition-all duration-300 flex flex-col justify-between shadow-md hover:shadow-lg group"
                            >
                              <div>
                                <div className="flex justify-between items-start gap-2 mb-3">
                                  <div className="p-2 bg-white/[0.02] border border-white/5 rounded-xl text-gold/80 group-hover:text-gold transition font-bold">
                                    <Store className="h-5 w-5" />
                                  </div>
                                  <div className="flex gap-1.5">
                                    {brewery.website && (
                                      <a 
                                        href={websiteUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-gold/20 text-white/70 hover:text-gold transition cursor-pointer"
                                        title={t.visitSite}
                                      >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                      </a>
                                    )}
                                    {brewery.instagram && (
                                      <a 
                                        href={instagramUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-gold/20 text-white/70 hover:text-gold transition cursor-pointer"
                                        title={t.instagram}
                                      >
                                        <Instagram className="h-3.5 w-3.5" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                                <h5 className="font-bold text-base text-white mb-1 group-hover:text-gold transition">
                                  <a href={websiteUrl || instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                    {brewery.name}
                                  </a>
                                </h5>
                                <p className="text-[11px] text-gold font-mono flex items-center gap-1 mb-3">
                                  <MapPin className="h-3 w-3" />
                                  {brewery.location}
                                </p>
                                <p className="text-xs text-white/60 leading-relaxed font-light line-clamp-4">
                                  {brewery.description}
                                </p>
                              </div>

                              <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-3">
                                <div>
                                  <span className="text-[10px] text-white/40 uppercase font-mono block">{t.beerSignature}</span>
                                  <span className="text-xs font-bold text-gold mt-0.5 block">{brewery.signatureBeer}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-1">
                                  {brewery.website && (
                                    <a
                                      href={websiteUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-center gap-1 py-1.5 rounded-xl bg-white/[0.03] hover:bg-gold hover:text-black border border-white/5 hover:border-gold text-[10px] font-bold text-white/80 transition duration-300 cursor-pointer"
                                    >
                                      {t.visitSite}
                                    </a>
                                  )}
                                  {brewery.instagram && (
                                    <a
                                      href={instagramUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-center gap-1 py-1.5 rounded-xl bg-white/[0.03] hover:bg-gold hover:text-black border border-white/5 hover:border-gold text-[10px] font-bold text-white/80 transition duration-300 cursor-pointer"
                                    >
                                      {t.instagram}
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl text-center text-xs text-white/40">
                        {t.noBreweries}
                      </div>
                    )}
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* SHOPPING TAB */}
        {activeTab === 'shopping' && (
          <div className="w-full max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h3 className="font-serif text-2xl font-bold text-white">{t.shoppingTitle}</h3>
              <p className="text-sm text-white/55 mt-1 max-w-lg mx-auto font-light">
                {t.shoppingSub}
              </p>
            </div>

            <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 shadow-2xl space-y-6">
              
              {/* Quickly tap suggestion chips */}
              <div className="space-y-2.5">
                <span className="text-xs font-mono font-bold text-gold uppercase tracking-wider block">{t.shoppingQuickChips}</span>
                <div className="flex flex-wrap gap-2">
                  {/* From taste quiz if generated */}
                  {result?.recommendations?.map((beer) => (
                    <button
                      key={beer.styleName}
                      onClick={() => { setShoppingBeerStyle(beer.styleName); }}
                      className={`text-[11px] font-medium py-1.5 px-3.5 rounded-full border transition cursor-pointer ${
                        shoppingBeerStyle === beer.styleName
                          ? 'bg-gold border-gold text-black font-semibold'
                          : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.08]'
                      }`}
                    >
                      ✨ {beer.styleName} ({lang === 'en' ? 'Your Profile' : 'Seu Perfil'})
                    </button>
                  ))}
                  {/* Preset styles */}
                  {PRESET_STYLES[lang].map((preset) => (
                    <button
                      key={preset.styleName}
                      onClick={() => { setShoppingBeerStyle(preset.styleName); }}
                      className={`text-[11px] font-medium py-1.5 px-3.5 rounded-full border transition cursor-pointer ${
                        shoppingBeerStyle === preset.styleName
                          ? 'bg-gold border-gold text-black font-semibold'
                          : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.08]'
                      }`}
                    >
                      🍺 {preset.styleName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real Input selector */}
              <form onSubmit={(e) => { e.preventDefault(); handleShoppingSearch(); }} className="space-y-4 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-xs font-bold text-gold uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    {t.shoppingInputLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={t.shoppingInputPlaceholder}
                    value={shoppingBeerStyle}
                    onChange={(e) => setShoppingBeerStyle(e.target.value)}
                    required
                    className="w-full p-4 rounded-xl border border-white/5 bg-[#17171a] text-sm text-white focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/10 font-medium placeholder-white/30"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={shoppingLoading || !shoppingBeerStyle.trim()}
                    className="w-full sm:w-auto bg-[#c29b40] hover:bg-[#b48a33] disabled:bg-white/5 text-black disabled:text-white/20 font-bold text-xs uppercase py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-gold/20 cursor-pointer"
                  >
                    {shoppingLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t.shoppingSearching}
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4" />
                        {t.shoppingSearchBtn}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {shoppingError && (
              <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-2xl text-center text-red-300 text-xs">
                {shoppingError}
              </div>
            )}

            <AnimatePresence mode="wait">
              {shoppingResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  {/* Style Header + Price banner block */}
                  <div className="bg-[#121214] border-2 border-gold/25 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
                    <div>
                      <span className="text-[10px] sm:text-xs font-bold font-mono text-gold uppercase tracking-[0.25em]">
                        {lang === 'en' ? 'Queried Style' : 'Estilo Consultado'}
                      </span>
                      <h4 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">{shoppingResult.beerStyle}</h4>
                    </div>
                    <div className="bg-gold/10 border border-gold/20 px-5 py-3.5 rounded-2xl flex flex-col items-start sm:items-end flex-shrink-0">
                      <span className="text-[9px] font-mono font-bold uppercase text-gold/75 tracking-wider">{t.shoppingAvgPrice}</span>
                      <span className="text-lg sm:text-xl font-bold text-gold mt-1 flex items-center gap-1">
                        <Coins className="h-4 w-4 text-[#c29b40]" />
                        {shoppingResult.averagePriceRange}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Online stores list */}
                    <div className="space-y-4">
                      <h4 className="font-serif text-lg font-bold text-[#c29b40] border-b border-white/10 pb-2 flex items-center gap-2 font-medium">
                        <Globe className="h-5 w-5 text-gold" />
                        {t.shoppingOnlineStores}
                      </h4>
                      <div className="space-y-3">
                        {shoppingResult.onlineStores?.map((store, idx) => {
                          const storeWebsiteUrl = store.website?.startsWith('http') 
                            ? store.website 
                            : `https://${store.website}`;

                          const storeInstagramUrl = store.instagram?.startsWith('http')
                            ? store.instagram
                            : store.instagram?.startsWith('@')
                            ? `https://instagram.com/${store.instagram.slice(1)}`
                            : `https://instagram.com/${store.instagram}`;

                          return (
                            <div 
                              key={idx} 
                              className="bg-[#121214] p-5 rounded-2xl border border-white/5 hover:border-gold/30 transition-all duration-300 flex flex-col justify-between shadow-md hover:shadow-lg group"
                            >
                              <div>
                                <div className="flex justify-between items-start gap-2 mb-2">
                                  <h5 className="font-bold text-sm text-white group-hover:text-gold transition-colors">
                                    {store.website || store.instagram ? (
                                      <a href={storeWebsiteUrl || storeInstagramUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                        {store.name}
                                      </a>
                                    ) : (
                                      store.name
                                    )}
                                  </h5>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <span className="text-[10px] font-mono text-gold font-bold py-0.5 px-2 bg-gold/5 rounded border border-gold/10">
                                      {store.estimatedPrice}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-xs text-white/60 leading-relaxed font-light mb-4">
                                  {store.description}
                                </p>
                              </div>

                              <div className="flex gap-2 pt-3 border-t border-white/5">
                                {store.website && (
                                  <a
                                    href={storeWebsiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-white/[0.03] hover:bg-gold hover:text-black border border-white/5 hover:border-gold text-[10px] font-bold text-white/80 transition duration-300 cursor-pointer"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    {t.visitSite}
                                  </a>
                                )}
                                {store.instagram && (
                                  <a
                                    href={storeInstagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-white/[0.03] hover:bg-gold hover:text-black border border-white/5 hover:border-gold text-[10px] font-bold text-white/80 transition duration-300 cursor-pointer"
                                  >
                                    <Instagram className="h-3.5 w-3.5" />
                                    {t.instagram}
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Physical stores list */}
                    <div className="space-y-4">
                      <h4 className="font-serif text-lg font-bold text-[#c29b40] border-b border-white/10 pb-2 flex items-center gap-2 font-medium">
                        <Store className="h-5 w-5 text-gold" />
                        {t.shoppingPhysicalStores}
                      </h4>
                      <div className="space-y-3">
                        {shoppingResult.physicalStores?.map((store, idx) => {
                          const storeWebsiteUrl = store.website?.startsWith('http') 
                            ? store.website 
                            : `https://${store.website}`;

                          const storeInstagramUrl = store.instagram?.startsWith('http')
                            ? store.instagram
                            : store.instagram?.startsWith('@')
                            ? `https://instagram.com/${store.instagram.slice(1)}`
                            : `https://instagram.com/${store.instagram}`;

                          return (
                            <div 
                              key={idx} 
                              className="bg-[#121214] p-5 rounded-2xl border border-white/5 hover:border-gold/30 transition-all duration-300 flex flex-col justify-between shadow-md hover:shadow-lg group"
                            >
                              <div>
                                <div className="flex justify-between items-start gap-2 mb-2">
                                  <h5 className="font-bold text-sm text-white group-hover:text-gold transition-colors">
                                    {store.website || store.instagram ? (
                                      <a href={storeWebsiteUrl || storeInstagramUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                        {store.name}
                                      </a>
                                    ) : (
                                      store.name
                                    )}
                                  </h5>
                                  <span className="text-[10px] font-mono text-gold/80 uppercase font-semibold">
                                    {store.type}
                                  </span>
                                </div>
                                <p className="text-xs text-white/60 leading-relaxed font-light mb-4">
                                  {store.description}
                                </p>
                              </div>

                              <div className="flex gap-2 pt-3 border-t border-white/5">
                                {store.website && (
                                  <a
                                    href={storeWebsiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-white/[0.03] hover:bg-gold hover:text-black border border-white/5 hover:border-gold text-[10px] font-bold text-white/80 transition duration-300 cursor-pointer"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    {lang === 'en' ? 'Visit Site / Map' : 'Visitar Site / Mapa'}
                                  </a>
                                )}
                                {store.instagram && (
                                  <a
                                    href={storeInstagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-white/[0.03] hover:bg-gold hover:text-black border border-white/5 hover:border-gold text-[10px] font-bold text-white/80 transition duration-300 cursor-pointer"
                                  >
                                    <Instagram className="h-3.5 w-3.5" />
                                    {t.instagram}
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Smart Personal Beer Shopper Buying Tips */}
                  <div className="bg-gold/5 border border-gold/10 rounded-3xl p-6 sm:p-8">
                    <h5 className="font-serif font-bold text-base text-gold mb-4 flex items-center gap-2">
                      <Info className="h-4.5 w-4.5 text-gold" />
                      {t.shoppingBuyingTips}
                    </h5>
                    <ul className="text-xs text-white/70 space-y-3 list-disc list-inside font-light leading-relaxed">
                      {shoppingResult.buyingTips?.map((tip, tIdx) => (
                        <li key={tIdx}>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </main>

      {/* FOOTER BRUTALIST AND INTENTIONAL */}
      <footer className="text-center mt-20 border-t border-white/5 pt-8 pb-12 max-w-3xl mx-auto">
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest font-bold">
          L’Sommelier d’Or • © 2026
        </span>
        <p className="text-[11px] text-white/40 mt-1 uppercase max-w-md mx-auto">
          {lang === 'en' ? "Enjoy craft beer responsibly. If you drink, don't drive." : "Aprecie cerveja artesanal com moderação. Se beber, não dirija."}
        </p>
      </footer>
    </div>
  );
}
