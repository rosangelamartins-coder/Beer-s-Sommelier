import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// We use lazy initialization inside the handler to prevent startup crashes if GEMINI_API_KEY is not defined right away.
let aiInstance: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("A chave GEMINI_API_KEY não foi configurada. Por favor, configure-a no painel de Secrets / Configurações.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      amargor, 
      teorAlcoolico, 
      comidaFoco, 
      experienciaText, 
      notasSabor, 
      corpo,
      chatContext, // For Q&A follow-ups
      isChatQnA,
      isRegionLookup,
      country,
      city,
      isShoppingLookup,
      beerStyle
    } = body;

    const ai = getAIClient();

    // If it's a regional lookup
    if (isRegionLookup) {
      const regionPrompt = `
        Apresente as características cervejeiras clássicas e tradicionais da seguinte região:
        País/Cidade fornecido: "${city ? city + ', ' : ''}${country || 'Não especificado'}"

        Sua resposta de mestre sommelier e historiador cervejeiro deve conter:
        1. Uma bela introdução histórica/geográfica de como a cultura cervejeira se desenvolveu nessa localidade (qualidade da água, colonização, influências).
        2. Estilos clássicos de cerveja originários da região ou amplamente consumidos e produzidos nela (como Kölsch em Colônia, Pilsner na República Tcheca, Pale Ale na Inglaterra, Double IPA na Califórnia, Catharina Sour no Brasil, etc.).
        3. Uma lista de cervejarias locais reais atuais ou tradicionais de relevância histórica e turística (pelo menos 3 cervejarias) com seu respectivo endereço/bairro explicativo, estilo assinatura, descrição rápida para o turista ou entusiasta de cerveja artesanal visitar, o site oficial do local (ou link representativo, ou link do Google Maps de busca se não souber o site exato) e o link ou handle oficial do Instagram (ex: @cervejaria ou link completo).

        Retorne em português no formato JSON especificado.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: regionPrompt,
        config: {
          temperature: 0.6,
          systemInstruction: "Você é um historiador cervejeiro e sommelier experiente de prestígio internacional. Responda em português.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              regionIntro: {
                type: Type.STRING,
                description: "Breve registro histórico e geográfico da cultura cervejeira de forma elegante e cativante em português."
              },
              classicStyles: {
                type: Type.ARRAY,
                description: "Estilos clássicos e tradicionais da região ou mais famosos por lá.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    styleName: { type: Type.STRING, description: "Nome do estilo clássico." },
                    originReason: { type: Type.STRING, description: "Por que se tornou tradicional nessa região." },
                    description: { type: Type.STRING, description: "Descrição de sabor, cor e sensações gerais." }
                  },
                  required: ["styleName", "originReason", "description"]
                }
              },
              breweries: {
                type: Type.ARRAY,
                description: "Lista de cervejarias locais, microcervejarias ou pubs históricos reais se existirem.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Nome da cervejaria ou brewpub." },
                    location: { type: Type.STRING, description: "Cidade, bairro ou endereço aproximado." },
                    description: { type: Type.STRING, description: "Diferencial de produção e vibe do local." },
                    signatureBeer: { type: Type.STRING, description: "Sua principal cerveja ou rótulo de destaque." },
                    website: { type: Type.STRING, description: "Site oficial da cervejaria (ex: https://cervejariacolorado.com.br) ou link de busca." },
                    instagram: { type: Type.STRING, description: "Arroba ou link do perfil do Instagram oficial (ex: @cervejaria ou link)." }
                  },
                  required: ["name", "location", "description", "signatureBeer", "website", "instagram"]
                }
              }
            },
            required: ["regionIntro", "classicStyles", "breweries"]
          }
        }
      });

      return NextResponse.json(JSON.parse(response.text || "{}"));
    }

    // If it's a shopping lookup
    if (isShoppingLookup) {
      const shoppingPrompt = `
        Você é um consultor de compras de cervejas de elite ("Personal Beer Shopper").
        Investigue onde comprar e a média de preços da cerveja do tipo/estilo: "${beerStyle || 'IPA clássica'}"

        Sua resposta deve conter:
        1. A faixa média de preços em Reais (R$) para cervejas artesanais nacionais e importadas desse estilo (ex: em latas de 473ml ou garrafas de 500ml).
        2. Lojas Online Recomendadas (ex: Empório da Cerveja, Clube do Malte, Clu_be Gourmet, e-commerces especializados) mostrando preços ou taxas estimativas e facilidade de entrega.
        3. Supermercados, empórios de bairro, cervejarias físicas locais ou lojas físicas premium onde é fácil encontrar esse estilo.
        4. Dicas de ouro do Sommelier para escolher um rótulo de bom custo-benefício, verificar validade, e evitar oxidação antes de comprar.

        Retorne em português no formato JSON especificado.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: shoppingPrompt,
        config: {
          temperature: 0.6,
          systemInstruction: "Você é um consultor sommelier ajudando o cliente a fazer a melhor compra inteligente de cervejas especiais em lojas brasileiras físicas e virtuais. Responda em português.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              beerStyle: { type: Type.STRING, description: "Estilo investigado." },
              averagePriceRange: { type: Type.STRING, description: "Preço médio estimado (ex: R$ 18,00 - R$ 35,00 por unidade)." },
              onlineStores: {
                type: Type.ARRAY,
                description: "Lista de lojas online de prestígio.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Nome da loja online." },
                    estimatedPrice: { type: Type.STRING, description: "Informação do preço de entrada ou custo de frete sugerido." },
                    description: { type: Type.STRING, description: "Se tem clube de assinatura, prazo habitual, etc." },
                    website: { type: Type.STRING, description: "Site oficial da loja online (ex: https://www.emporiodacerveja.com.br) ou link representativo." },
                    instagram: { type: Type.STRING, description: "Arroba ou link do Instagram oficial da loja (ex: @emporiodacerveja ou link completo)." }
                  },
                  required: ["name", "estimatedPrice", "description", "website", "instagram"]
                }
              },
              physicalStores: {
                type: Type.ARRAY,
                description: "Canais físicos ideais para busca imediata.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, description: "Categoria de loja física (ex: Supermercado Premium, Empório de Cervejas, Growler Station local)." },
                    name: { type: Type.STRING, description: "Exemplo representativo nacional ou local." },
                    description: { type: Type.STRING, description: "Vantagem de comprar presencialmente e curadoria." },
                    website: { type: Type.STRING, description: "Site oficial ou link do Google Maps para o estabelecimento (ex: https://site.com.br) ou link de busca." },
                    instagram: { type: Type.STRING, description: "Arroba ou link do Instagram oficial do local (ex: @emporiodacerveja ou link)." }
                  },
                  required: ["type", "name", "description", "website", "instagram"]
                }
              },
              buyingTips: {
                type: Type.ARRAY,
                description: "Conselhos de proteção contra cervejas envelhecidas ou mal conservadas.",
                items: { type: Type.STRING }
              }
            },
            required: ["beerStyle", "averagePriceRange", "onlineStores", "physicalStores", "buyingTips"]
          }
        }
      });

      return NextResponse.json(JSON.parse(response.text || "{}"));
    }

    // If it's a general Q&A chat message inside the recommendations context
    if (isChatQnA) {
      const chatPrompt = `
        Você é um Sommelier e Mestre em Cervejas ("Especialista em Cervejas") experiente, refinado e apaixonado.
        O usuário está conversando com você sobre cervejas artesanais e harmonizações.

        Histórico recente de preferências selecionadas pelo usuário:
        - Amargor preferido: ${amargor || 'Não especificado'}
        - Teor alcoólico preferido: ${teorAlcoolico || 'Não especificado'}
        - Nota de sabor: ${notasSabor ? notasSabor.join(", ") : 'Não especificado'}
        - Corpo de cerveja: ${corpo || 'Não especificado'}
        - Prato ou foco: ${comidaFoco || 'Não especificado'}
        - Informações adicionais enviadas anteriormente: "${experienciaText || 'Nenhuma'}"

        Mensagem atual do usuário: "${chatContext}"

        Responda em português de forma elegante, estimulante, educada e rica em conhecimento de sommelier. 
        Sugira estilos reais de cerveja, copos ideais (tulipa, pint, taça, cálice, etc.), temperatura ou regras de harmonização (semelhança, contraste, corte) dependendo da pergunta do usuário. Use Markdown simples para formatar com negrito, itálicos e listas.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: chatPrompt,
        config: {
          temperature: 0.7,
          systemInstruction: "Você é um mestre cervejeiro e sommelier experiente de prestígio internacional. Responda em português.",
        }
      });

      return NextResponse.json({ reply: response.text });
    }

    // Standard recommendation generation with JSON output
    const generationPrompt = `
      Recomende 3 estilos ideais de cervejas artesanais brasileiras ou clássicas internacionais com base no gosto pessoal do usuário e sugira harmonizações com pratos específicos.

      Preferências de sabor do usuário:
      - Amargor desejado: ${amargor} (Baixo = pouco lúpulo, Alto = amargo perceptível, Muito Alto = IPAs robustas e complexas)
      - Teor alcoólico desejado: ${teorAlcoolico} (Leve = refrescantes até 4.5%, Moderado = 4.5% a 7%, Forte = acima de 7%)
      - Notas de sabor preferidas: ${notasSabor ? notasSabor.join(", ") : 'Não especificado'}
      - Corpo preferido da cerveja: ${corpo} (Leve, Médio, Encorpado)
      ${comidaFoco ? `- Prato específico para harmonização (se especificado): "${comidaFoco}"` : ''} 
      ${experienciaText ? `- Gosto pessoal adicional descrito pelo usuário: "${experienciaText}"` : ''}

      Orientações importantes para a recomendação:
      1. Escolha 3 estilos de cervejas reais e consagrados (ex: IPA, Imperial Stout, Witbier, Weissbier, Belgian Tripel, Doppelbock, Sour, etc.).
      2. Se o usuário colocou um prato específico para harmonização ("comidaFoco"), garanta que pelo menos duas das cervejas recomendadas criem uma HARMONIZAÇÃO PERFEITA com esse prato em questão, explicando o porquê de forma científica/gastronômica impecável.
      3. Forneça detalhes ricos sobre a tonalidade visual, ABV médio, IBU médio de cada estilo recomendado.
      4. Selecione sugestões de harmonizações que combinem de verdade: sugira prato principal, petisco e sobremesa compatíveis.
      5. Escreva um texto de introdução do sommelier personalizado que explique o porquê destas escolhas em relação às preferências descritas.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: generationPrompt,
      config: {
        temperature: 0.5,
        systemInstruction: "Você é um dos maiores sommeliers de cervejas do mundo. Sua missão é traduzir termos técnicos em sensações gustativas de forma poética, refinada e precisa em português.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sommelierIntro: {
              type: Type.STRING,
              description: "Uma calorosa saudação do Sommelier em português, conectando as escolhas de cervejas às preferências específicas selecionadas pelo usuário.",
            },
            recommendations: {
              type: Type.ARRAY,
              description: "Exatamente 3 estilos recomendados.",
              items: {
                type: Type.OBJECT,
                properties: {
                  styleName: {
                    type: Type.STRING,
                    description: "Nome oficial do estilo (ex: American IPA, Belgian Dubbel, Session IPA)."
                  },
                  visualColor: {
                    type: Type.STRING,
                    description: "Tonalidade visual e aparência (ex: Âmbar translúcido, colarinho persistente marfim)."
                  },
                  abv: {
                    type: Type.STRING,
                    description: "Teor Alcoólico aproximado (ex: 6.0% - 7.5% ABV)."
                  },
                  ibu: {
                    type: Type.STRING,
                    description: "Unidades de Amargor aproximado (ex: 40 - 60 IBU)."
                  },
                  description: {
                    type: Type.STRING,
                    description: "Descrição gastronômica e sensorial das notas de sabor, aroma e sensações ao paladar."
                  },
                  whyIdeal: {
                    type: Type.STRING,
                    description: "Explicação clara e charmosa do porquê esse estilo atende os interesses específicos do usuário."
                  },
                  idealTemp: {
                    type: Type.STRING,
                    description: "Temperatura sugerida para servir (ex: 5°C a 7°C)."
                  },
                  pairings: {
                    type: Type.ARRAY,
                    description: "Sugestões de harmonização ricas com pratos refinados ou petiscos populares.",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        dishName: {
                          type: Type.STRING,
                          description: "Nome do prato ou ingrediente específico (ex: Risoto de queijo Gorgonzola, Pettit Gâteau, Hambúrguer bovino com bacon)."
                        },
                        dishType: {
                          type: Type.STRING,
                          description: "Tipo de prato: 'Prato Principal', 'Petisco / Entrada' ou 'Sobremesa'."
                        },
                        whySecret: {
                          type: Type.STRING,
                          description: "Exposição técnica da harmonização (ex: por que a acidez corta a gordura, ou por que as notas torradas fazem ponte com a sobremesa)."
                        }
                      },
                      required: ["dishName", "dishType", "whySecret"]
                    }
                  }
                },
                required: ["styleName", "visualColor", "abv", "ibu", "description", "whyIdeal", "idealTemp", "pairings"]
              }
            },
            sommelierTips: {
              type: Type.ARRAY,
              description: "Três dicas práticas breves e charmosas do sommelier sobre como servir, degustar ou conservar a cerveja craft de forma correta.",
              items: {
                type: Type.STRING
              }
            }
          },
          required: ["sommelierIntro", "recommendations", "sommelierTips"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Resposta vazia da API do Gemini.");
    }

    const parsedJson = JSON.parse(resultText);
    return NextResponse.json(parsedJson);

  } catch (error: any) {
    console.error("Erro no Sommelier API:", error);
    return NextResponse.json(
      { error: error?.message || "Ocorreu um erro ao processar sua recomendação de cerveja." },
      { status: 500 }
    );
  }
}
