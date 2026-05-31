import { MenuItem, Category, Review } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'sorvetes',
    name: 'Sorvetes',
    icon: 'IceCream',
    description: 'Gelatos artesanais e taças montadas com os melhores ingredientes.'
  },
  {
    id: 'lanches',
    name: 'Lanches',
    icon: 'Utensils',
    description: 'Hambúrgueres artesanais e sanduíches tostados perfeitos para qualquer hora.'
  },
  {
    id: 'bebidas',
    name: 'Bebidas',
    icon: 'GlassWater',
    description: 'Sucos naturais, milkshakes cremosos, cafés especiais e refrigerantes.'
  },
  {
    id: 'sobremesas',
    name: 'Sobremesas',
    icon: 'Cake',
    description: 'Waffles crocantes, petit gâteaus e delícias para adoçar seu dia.'
  }
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // Sorvetes
  {
    id: 'sor-1',
    name: 'Sorvete Artesanal de Morango Supremo',
    description: 'Duas bolas de sorvete artesanal cremoso de morango silvestre com calda de frutas vermelhas caseira, pedaços de morangos selecionados frescos e generosa camada de chantilly batido.',
    price: 24.00,
    category: 'sorvetes',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', // We will select high quality ice cream images
    tags: ['Artesanal', 'Mais Vendido'],
    ingredients: ['Sorvete de Morango', 'Pedaços de Morango', 'Calda Caseira', 'Chantilly'],
    available: true,
    calories: 340,
    prepTime: '5 min',
    options: [
      {
        name: 'Covers & Adicionais',
        type: 'multiple',
        choices: [
          { name: 'Confete colorido', priceModifier: 2.00 },
          { name: 'Granulado Belga', priceModifier: 3.50 },
          { name: 'Farofa doce de Castanha', priceModifier: 4.00 }
        ]
      }
    ]
  },
  {
    id: 'sor-2',
    name: 'Taça de Gelato Doce Sabor',
    description: 'Nossa famosa taça composta por gelato artesanal de Pistache Imperial e chocolate belga, camadas de brigadeiro gourmet mole de colher, farofa crocante de nozes e casquinha suíça wafer.',
    price: 36.00,
    category: 'sorvetes',
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
    tags: ['Especialidade', 'Recomendado'],
    ingredients: ['Gelato de Pistache', 'Gelato de Chocolate', 'Brigadeiro Mole', 'Nozes', 'Crocante Wafer'],
    available: true,
    calories: 520,
    prepTime: '8 min',
    options: [
      {
        name: 'Tipo de Calda',
        type: 'single',
        required: true,
        choices: [
          { name: 'Calda de Chocolate Belga', priceModifier: 0 },
          { name: 'Calda de Doce de Leite Viçosa', priceModifier: 0 },
          { name: 'Sem Calda adicional', priceModifier: 0 }
        ]
      }
    ]
  },
  {
    id: 'sor-3',
    name: 'Sundae Clássico Caramel & Nuts',
    description: 'Três deliciosas bolas de sorvete de baunilha de Madagascar cobertas por calda quente de caramelo toffee salgado salpicado com castanhas de caju caramelizadas e crocantes.',
    price: 28.00,
    category: 'sorvetes',
    imageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
    tags: ['Clássico', 'Vegano Disponível'],
    ingredients: ['Sorvete de Baunilha', 'Caramelo Salgado', 'Castanha de Caju Tostada'],
    available: true,
    calories: 410,
    prepTime: '6 min'
  },

  // Lanches
  {
    id: 'lan-1',
    name: 'Burger Goumet Doce Sabor',
    description: 'Blend suculento de 150g de carnes nobres grelhado na chapa com duas fatias de queijo cheddar cheddar cremoso derretido, cebola caramelizada artesanalmente e molho da casa no pão brioche selado na manteiga de garrafa.',
    price: 42.00,
    category: 'lanches',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    tags: ['Queridinho', 'Completíssimo'],
    ingredients: ['Pão Brioche', 'Blend de Carne 155g', 'Cheddar Inglês', 'Cebola Caramelizada', 'Molho Secreto'],
    available: true,
    calories: 780,
    prepTime: '15 min',
    options: [
      {
        name: 'Ponto da Carne',
        type: 'single',
        required: true,
        choices: [
          { name: 'Ao Ponto (Rosado no centro)', priceModifier: 0 },
          { name: 'Bem Passado', priceModifier: 0 },
          { name: 'Mal Passado', priceModifier: 0 }
        ]
      },
      {
        name: 'Acompanhamento',
        type: 'single',
        choices: [
          { name: 'Batatas rústicas fritas (Incluso)', priceModifier: 0 },
          { name: 'Anéis de Cebola Crocantes', priceModifier: 5.00 },
          { name: 'Sem acompanhamento', priceModifier: -3.00 }
        ]
      }
    ]
  },
  {
    id: 'lan-2',
    name: 'Toasty Croque Monsier de Minas',
    description: 'Dois generosos pedaços de pão de brioche tostados na manteiga recheados com peito de peru defumado fresco, bastante queijo minas padrão derretido e uma fina cobertura de molho bechamel gratinado com queijo parmesão no maçarico.',
    price: 29.00,
    category: 'lanches',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    tags: ['Tostado no Capricho'],
    ingredients: ['Pão Petrópolis', 'Peito de Peru', 'Queijo Minas', 'Molho Bechamel', 'Parmesão'],
    available: true,
    calories: 490,
    prepTime: '10 min'
  },
  {
    id: 'lan-3',
    name: 'Batata Frita Crinkle Suprema',
    description: 'Porção grande de batatas fritas onduladas extra crocantes por fora e macias por dentro, temperadas com sal rosa e alecrim fresco da horta. Acompanha maionese verde gourmet caseira de alho.',
    price: 26.00,
    category: 'lanches',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    tags: ['Para Compartilhar', 'Vegetariano'],
    ingredients: ['Batatas Crinkle', 'Sal Especial', 'Alecrim', 'Maionese Temperada'],
    available: true,
    calories: 450,
    prepTime: '12 min'
  },

  // Bebidas
  {
    id: 'beb-1',
    name: 'Milkshake Double Chocolate Belga',
    description: 'Cremoso milkshake clássico batido com gelato cremoso de chocolate puro suíço de alta qualidade, fitas de fudge de chocolate adicionais e granulado belga por todo o copo. Puro deleite!',
    price: 22.00,
    category: 'bebidas',
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    tags: ['Divino', 'Cremosidade Única'],
    ingredients: ['Sorvete de Chocolate', 'Leite Integral', 'Calda Suprema', 'Frapé de Chocolate'],
    available: true,
    calories: 480,
    prepTime: '5 min'
  },
  {
    id: 'beb-2',
    name: 'Soda Italiana de Maçã Verde',
    description: 'Bebida gaseificada extremamente refrescante elaborada com xarope Fabbri premium de Maçã Verde, água mineral com gás de fonte natural leve e gelo picado filtrado.',
    price: 15.00,
    category: 'bebidas',
    imageUrl: 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?auto=format&fit=crop&w=600&q=80',
    tags: ['100% Refrescante', 'Sem Glúten', 'Vegano'],
    ingredients: ['Xarope de Maçã Verde Fabbri', 'Água com Gás', 'Laminas de Maçã', 'Pedras de Gelo'],
    available: true,
    calories: 120,
    prepTime: '3 min'
  },
  {
    id: 'beb-3',
    name: 'Suco Natural Detox Verde',
    description: 'Suco terapêutico prensado a frio extraído na hora com laranjas maduras espremidas, maçã do amor doce, couve folha orgânica fresca, lascas crocantes de gengibre e hortelã cultivada sem agrotóxicos.',
    price: 16.00,
    category: 'bebidas',
    imageUrl: 'https://images.unsplash.com/photo-1628113315911-31422741d48d?auto=format&fit=crop&w=600&q=80',
    tags: ['Saudável', 'Prensado na Hora'],
    ingredients: ['Suco de Laranja', 'Couve Orgânica', 'Maçã Inteira', 'Gengibre Nacional', 'Hortelã'],
    available: true,
    calories: 90,
    prepTime: '4 min'
  },

  // Sobremesas
  {
    id: 'sob-1',
    name: 'Waffle Belga Doce Deleite',
    description: 'Waffle artesanal crocante com calda generosa de creme de avelã Nutella original ou doce de leite cremoso Viçosa, decorado com morangos frescos cortados e polvilhado açúcar de confeiteiro.',
    price: 27.00,
    category: 'sobremesas',
    imageUrl: 'https://images.unsplash.com/photo-1562376502-6f769499c886?auto=format&fit=crop&w=600&q=80',
    tags: ['Mais Pedido', 'Quentinho'],
    ingredients: ['Waffle de Liege', 'Nutella de Avelã', 'Doce de Leite', 'Morangos Selecionados'],
    available: true,
    calories: 540,
    prepTime: '8 min',
    options: [
      {
        name: 'Escolha a Cobertura',
        type: 'single',
        required: true,
        choices: [
          { name: 'Creme de Avelã Nutella', priceModifier: 0 },
          { name: 'Doce de Leite Viçosa', priceModifier: 0 },
          { name: 'Metade de Cada sabor', priceModifier: 2.00 }
        ]
      }
    ]
  },
  {
    id: 'sob-2',
    name: 'Taça de Petit Gâteau Clássico',
    description: 'Bolinho quente no ponto ideal com casca fina de chocolate amargo que se rompe liberando recheio líquido fervente, servido com sorvete de creme supremo e morangos frescos.',
    price: 29.00,
    category: 'sobremesas',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    tags: ['Clássico Imperdível'],
    ingredients: ['Bolo Chocolate', 'Recheio Líquido', 'Sorvete de Creme', 'Calda de Chocolate'],
    available: true,
    calories: 460,
    prepTime: '10 min'
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    userName: 'Mariana Silva',
    rating: 5,
    comment: 'O sorvete de morango com chantilly é o melhor que já comi na vida! Textura fantástica, pedaços de fruta rústica reais e nada enjoativo.',
    date: 'Ontem'
  },
  {
    id: 'rev-2',
    userName: 'Roberto Correia',
    rating: 5,
    comment: 'O hambúrguer artesanal é estupendo, super suculento e no ponto exato pedido. Os gelatos também não deixam a desejar.',
    date: 'Há 3 dias'
  },
  {
    id: 'rev-3',
    userName: 'Clara Vasconcellos',
    rating: 5,
    comment: 'Ambiente maravilhoso, atendimento pelo tablet inteligente super ágil. Waffle com Nutella crocante por fora e muito macio por dentro.',
    date: 'Há 1 semana'
  }
];
