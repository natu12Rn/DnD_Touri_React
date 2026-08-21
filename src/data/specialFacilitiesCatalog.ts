import { SpaceType } from '../types/blueprint';

export interface TableData {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface SpecialFacilityDetail {
  id: string;
  name: string;
  space: SpaceType;
  costEO: number;
  buildDays: number;
  prerequisite: string;
  employees: number;
  orderType: string;
  orderName: string;
  description: string;
  orderDescription: string;
  tables?: TableData[];
  additionalRules?: string[];
}

export const SPECIAL_FACILITIES_CATALOG: Record<string, SpecialFacilityDetail> = {
  aviario: {
    id: 'aviario',
    name: 'Aviario',
    space: 'APRETADO',
    costEO: 5000,
    buildDays: 7,
    prerequisite: 'Ninguno',
    employees: 1,
    orderType: 'Reclutar',
    orderName: 'Amigo aviar',
    description:
      'Un aviario generalmente se compone de una gran jaula para pájaros cerca de un pequeño escritorio con útiles de escritura que se utilizan para enviar mensajes adjuntos a criaturas aladas.',
    orderDescription:
      'Cuando emites la orden de Reclutar, encargas al empleado que entrene a un nuevo compañero animal volador (Cuervo, Búho o Halcón del Manual del Jugador 2024). Tarda 7 días en entrenarlo.',
    additionalRules: [
      'Órdenes aéreas: Puedes dar órdenes a distancia a tu Bastión enviando mensajes a través de tu compañero aviar.',
      'Ampliación a Espacioso (1.000 EO): Permite albergar criaturas aladas más fuertes (Imp, Quasit, Esfinge de Maravillas) que llevan objetos de hasta 10 kg.',
    ],
  },
  camara_meditacion: {
    id: 'camara_meditacion',
    name: 'Cámara de Meditación',
    space: 'APRETADO',
    costEO: 13000,
    buildDays: 10,
    prerequisite: 'Ninguno',
    employees: 0,
    orderType: 'Empoderar',
    orderName: 'Paz Interior / Fortalecerse',
    description:
      'Una cámara de meditación es un espacio relajante que ayuda a alinear la mente, el cuerpo y el espíritu.',
    orderDescription:
      'Al dar la orden de Empoderar, permites a todos los empleados obtener paz interior. Puedes emitir inmediatamente una orden adicional a otra edificación especial en este mismo turno.',
    tables: [
      {
        title: 'Salvaciones Fortificadas',
        headers: ['d6', 'Tirada de Salvación'],
        rows: [
          ['1', 'Fuerza'],
          ['2', 'Destreza'],
          ['3', 'Constitución'],
          ['4', 'Inteligencia'],
          ['5', 'Sabiduría'],
          ['6', 'Carisma'],
        ],
      },
    ],
    additionalRules: [
      'Fortalecerse a uno mismo: Medita hasta 7 días para obtener Ventaja en dos tipos de tiradas de salvación aleatorias durante una cantidad de días igual al tiempo meditatorio.',
    ],
  },
  relicario: {
    id: 'relicario',
    name: 'Relicario',
    space: 'APRETADO',
    costEO: 13000,
    buildDays: 10,
    prerequisite: 'Habilidad para usar un Símbolo Sagrado como Foco',
    employees: 1,
    orderType: 'Empoderar',
    orderName: 'Bendición Sagrada',
    description:
      'Un relicario contiene reliquias sagradas, fragmentos de santos o artefactos de devoción enmarcados en altares de cristal.',
    orderDescription:
      'Al emitir la orden de Empoderar, el relicario concede la bendición de la deidad. El personaje o un aliado obtiene Ventaja en tiradas de salvación contra la muerte y efectos dañinos durante 7 días.',
  },
  almacen: {
    id: 'almacen',
    name: 'Almacén',
    space: 'ESPACIOSO',
    costEO: 5000,
    buildDays: 20,
    prerequisite: 'Ninguno',
    employees: 1,
    orderType: 'Comerciar',
    orderName: 'Comerciar Bienes',
    description:
      'Este espacio fresco y oscuro está destinado a contener bienes comerciales o suministros generales del Bastión.',
    orderDescription:
      'El empleado pasa 7 días adquiriendo artículos no mágicos hasta un valor total de 500 EO o vendiendo mercancía con un margen comercial.',
    tables: [
      {
        title: 'Tabla de Ampliación de Almacén',
        headers: ['Ampliación', 'Capacidad', 'Venta', 'Costo'],
        rows: [
          ['0 (Base)', '500 EO', '110%', '-'],
          ['1', '2.000 EO', '120%', '1.500 EO'],
          ['2', '5.000 EO', '150%', '4.000 EO'],
          ['3', '10.000 EO', '200%', '7.500 EO'],
        ],
      },
    ],
  },
  archivo: {
    id: 'archivo',
    name: 'Archivo',
    space: 'ESPACIOSO',
    costEO: 13000,
    buildDays: 30,
    prerequisite: 'Ninguno',
    employees: 1,
    orderType: 'Investigar',
    orderName: 'Conocimiento Útil',
    description:
      'Un archivo es un depósito de libros, pergaminos y mapas valiosos, usualmente protegido tras puertas secretas.',
    orderDescription:
      'El empleado investiga durante 7 días y adquiere conocimientos equivalentes al conjuro Conocer las Leyendas.',
    tables: [
      {
        title: 'Libros de Referencia del Archivo',
        headers: ['Título del Libro', 'Beneficio en Juego'],
        rows: [
          [
            'Magnus Codex Magicae Caeruleae',
            'Ventaja en Inteligencia (Conocimiento Arcano) para recordar hechizos y símbolos.',
          ],
          [
            'Biblia de las Leyendas',
            'Ventaja en Inteligencia (Historia) para recordar civilizaciones y guerras antiguas.',
          ],
          [
            'Investigaciones de la Inquisitiva',
            'Ventaja en Inteligencia (Investigación) sobre trampas, cifrados y acertijos.',
          ],
          [
            'El Herbario de Primavera a Invierno',
            'Ventaja en Inteligencia (Naturaleza) para recordar conocimientos sobre clima y plantas.',
          ],
          [
            'Iris Fidei',
            'Ventaja en Inteligencia (Religión) para recordar deidades y ritos sagrados.',
          ],
        ],
      },
    ],
  },
  armeria: {
    id: 'armeria',
    name: 'Armería',
    space: 'ESPACIOSO',
    costEO: 5000,
    buildDays: 20,
    prerequisite: 'Ninguno',
    employees: 1,
    orderType: 'Comerciar',
    orderName: 'Llenar Armería',
    description:
      'Contiene maniquíes para exhibir armaduras, ganchos para escudos y estantes para armas. Abastece a los defensores del Bastión.',
    orderDescription:
      'El empleado abastece la armería por 100 EO + 100 EO por cada Defensor (costo a la mitad si el Bastión posee Forja).',
    additionalRules: [
      'Protección de Defensores: Mientras esté abastecida, cuando tiras dados para ver si pierdes defensores en eventos, tiras un d8 en lugar de d6.',
    ],
  },
  biblioteca: {
    id: 'biblioteca',
    name: 'Biblioteca',
    space: 'ESPACIOSO',
    costEO: 5000,
    buildDays: 20,
    prerequisite: 'Ninguno',
    employees: 1,
    orderType: 'Investigar',
    orderName: 'Investigar Tema',
    description:
      'Colección de tomos raros acompañados de escritorios y sillas de lectura.',
    orderDescription:
      'El empleado realiza una investigación de 7 días sobre una leyenda, persona, lugar o criatura, otorgando 3 datos precisos e inéditos.',
  },
  camara_adivinacion: {
    id: 'camara_adivinacion',
    name: 'Cámara de Adivinación',
    space: 'ESPACIOSO',
    costEO: 9000,
    buildDays: 25,
    prerequisite: 'Foco Arcano, Símbolo Sagrado o Foco Druídico',
    employees: 1,
    orderType: 'Investigar',
    orderName: 'Ojo Abierto / Escudriñar',
    description:
      'Habitación a oscuras sin ventanas con una bola de cristal mágica en el centro.',
    orderDescription:
      'El empleado mira en la bola de cristal y lanza Escudriñar (CD 13) diariamente sobre un objetivo durante 7 días.',
    additionalRules: [
      'Ojo Cerrado: Protege la habitación de magia exterior. Nadie en su interior puede ser detectado por conjuros de adivinación.',
    ],
  },
  circulo_teletransporte: {
    id: 'circulo_teletransporte',
    name: 'Círculo de Teletransportación',
    space: 'ESPACIOSO',
    costEO: 9000,
    buildDays: 25,
    prerequisite: 'Ninguno',
    employees: 0,
    orderType: 'Reclutar',
    orderName: 'Invitar Mago',
    description:
      'Círculo mágico permanente grabado en el suelo con runas de viaje plano.',
    orderDescription:
      'Invita a un Mago (o Archimago por 2.000 EO) durante 7 días. El visitante lanzará conjuros preparados o de su libro.',
  },
  cuartel: {
    id: 'cuartel',
    name: 'Cuartel',
    space: 'ESPACIOSO',
    costEO: 5000,
    buildDays: 20,
    prerequisite: 'Ninguno',
    employees: 0,
    orderType: 'Reclutar',
    orderName: 'Reclutar Defensores',
    description:
      'Dormitorio equipado para albergar hasta 12 Defensores del Bastión.',
    orderDescription:
      'Recluta hasta 4 Defensores sin costo alguno. Ampliable a Vasto por 2.000 EO para albergar hasta 25 Defensores.',
  },
  establo: {
    id: 'establo',
    name: 'Establo',
    space: 'ESPACIOSO',
    costEO: 9000,
    buildDays: 25,
    prerequisite: 'Ninguno',
    employees: 1,
    orderType: 'Comerciar',
    orderName: 'Comprar/Vender Monturas',
    description:
      'Viene con 1 Caballo de Montar (o Camello) y 2 Ponis (o Mulas). Alberga 3 animales Grandes.',
    orderDescription:
      'El empleado compra o vende monturas. Al vender, obtienes un 20% más que el precio estándar de mercado.',
  },
  estudio_arcano: {
    id: 'estudio_arcano',
    name: 'Estudio Arcano',
    space: 'ESPACIOSO',
    costEO: 5000,
    buildDays: 20,
    prerequisite: 'Foco Arcano',
    employees: 1,
    orderType: 'Fabricar',
    orderName: 'Fabricar Foco / Objeto Mágico',
    description:
      'Lugar de investigación silenciosa para encantamientos y magia arcana.',
    orderDescription:
      'Permite fabricar Focos Arcanos (50 EO), Libros en blanco (25 EO) u Objetos Mágicos.',
    tables: [
      {
        title: 'Tabla de Fabricación Arcana',
        headers: ['Rareza', 'Días', 'Costo'],
        rows: [
          ['Común', '1 día', 'Sin costo extra'],
          ['Poco Común', '3 días', 'Sin costo extra'],
          ['Rara', '7 días', '4.000 EO'],
          ['Muy Rara', '14 días', '40.000 EO'],
          ['Legendaria', '60 días', '200.000 EO'],
        ],
      },
    ],
  },
  fabrica_trampas: {
    id: 'fabrica_trampas',
    name: 'Fábrica de Trampas',
    space: 'ESPACIOSO',
    costEO: 5000,
    buildDays: 20,
    prerequisite: 'Competencia en Herramientas de Ladrón o Juego de Manos',
    employees: 1,
    orderType: 'Fabricar',
    orderName: 'Trampa Portátil / Mímico',
    description:
      'Taller para diseñar artilugios mecánicos y trampas mortales.',
    orderDescription:
      'Crea trampas portátiles multiusos por 50 EO (7 días) o un Mímico guardián a nivel 9+.',
  },
  forja: {
    id: 'forja',
    name: 'Forja',
    space: 'ESPACIOSO',
    costEO: 5000,
    buildDays: 20,
    prerequisite: 'Ninguno',
    employees: 2,
    orderType: 'Fabricar',
    orderName: 'Fabricar Armas / Armaduras / Objetos',
    description:
      'Contiene forja, yunque y herramientas pesadas para herrería.',
    orderDescription:
      'Fabrica 20 piezas de munición, armas, herramientas o armas mágicas según la tabla de forjado.',
  },
  invernadero: {
    id: 'invernadero',
    name: 'Invernadero',
    space: 'ESPACIOSO',
    costEO: 9000,
    buildDays: 25,
    prerequisite: 'Ninguno',
    employees: 1,
    orderType: 'Cosechar',
    orderName: 'Hierbas Curativas / Venenos',
    description:
      'Cultiva plantas y hongos raros en un clima místico controlado. Produce frutos con efecto de Restauración Menor.',
    orderDescription:
      'Cosecha Pociones de Curación Mayor o viales de veneno (Lágrimas de Medianoche, Tintura Pálida, Sopor, Suero de la Verdad).',
  },
  jardin: {
    id: 'jardin',
    name: 'Jardín',
    space: 'ESPACIOSO',
    costEO: 5000,
    buildDays: 20,
    prerequisite: 'Ninguno',
    employees: 1,
    orderType: 'Cosechar',
    orderName: 'Cosecha de Jardín',
    description:
      'Espacio verde disponible en 4 variantes: Decorativo, Comida, Hierbas o Veneno.',
    orderDescription:
      'Genera recursos según su tipo (Raciones, flores/perfume, kits de curandero o veneno básico).',
  },
  casa_fieras: {
    id: 'casa_fieras',
    name: 'Casa de Fieras',
    space: 'VASTO',
    costEO: 13000,
    buildDays: 40,
    prerequisite: 'Ninguno',
    employees: 2,
    orderType: 'Reclutar',
    orderName: 'Reclutar Criaturas / Bestias',
    description:
      'Mantiene varias criaturas en recintos reforzados. Puede albergar hasta 4 criaturas Grandes (o 16 Pequeñas/Medianas).',
    orderDescription:
      'Recluta criaturas del catálogo de bestias durante 7 días. Las criaturas alojadas cuentan como Defensores del Bastión.',
    tables: [
      {
        title: 'Criaturas de la Casa de Fieras',
        headers: ['Criatura', 'Tamaño', 'Costo en EO'],
        rows: [
          ['Simio', 'Mediano', '500 EO'],
          ['Oso Negro', 'Mediano', '500 EO'],
          ['Oso Pardo', 'Grande', '1.000 EO'],
          ['Serpiente Constrictora', 'Grande', '250 EO'],
          ['Cocodrilo', 'Grande', '500 EO'],
          ['Lobo Terrible', 'Grande', '1.000 EO'],
          ['Escorpión Gigante', 'Grande', '3.500 EO'],
          ['León', 'Grande', '1.000 EO'],
          ['Oso Lechuza', 'Grande', '3.500 EO'],
          ['Tigre', 'Grande', '1.000 EO'],
        ],
      },
    ],
  },
  demiplano: {
    id: 'demiplano',
    name: 'Demiplano',
    space: 'VASTO',
    costEO: 17000,
    buildDays: 45,
    prerequisite: 'Foco Arcano',
    employees: 1,
    orderType: 'Empoderar',
    orderName: 'Resistencia Arcana',
    description:
      'Puerta mística sobre una superficie sólida que conduce a una habitación extradimensional inmune a disiparse o espiarse.',
    orderDescription:
      'Otorga Puntos de Vida Temporales equivalentes a 5x tu nivel después de un Descanso Largo en el Demiplano.',
    additionalRules: [
      'Fabricación Mágica: Puedes usar una acción mágica para crear instantáneamente un objeto no mágico de hasta 5 ft.',
    ],
  },
  mina: {
    id: 'mina',
    name: 'Mina',
    space: 'VASTO',
    costEO: 9000,
    buildDays: 30,
    prerequisite: 'Ninguno',
    employees: 2,
    orderType: 'Cosechar',
    orderName: 'Cava un Agujero / Busca Oro',
    description:
      'Red de cuevas llenas de minerales valiosos, gemas y objetos arcanos.',
    orderDescription:
      'Los empleados extraen piedras preciosas, oro, plata o metales raros (Mithril, Adamantita) según tirada de d100.',
  },
  posada: {
    id: 'posada',
    name: 'Posada',
    space: 'VASTO',
    costEO: 9000,
    buildDays: 30,
    prerequisite: 'Ninguno',
    employees: 2,
    orderType: 'Comerciar',
    orderName: 'Hospedaje & Rumores',
    description:
      'Establecimiento de alojamiento y comida para viajeros y aventureros.',
    orderDescription:
      'Genera ingresos comerciales periódicos y recopila rumores locales de viajeros.',
  },
  sala_guerra: {
    id: 'sala_guerra',
    name: 'Sala de Guerra',
    space: 'VASTO',
    costEO: 17000,
    buildDays: 45,
    prerequisite: 'Ninguno',
    employees: 2,
    orderType: 'Empoderar',
    orderName: 'Estrategia de Batalla',
    description:
      'Mesa táctica con mapas detallados de reinos y maquetas militares.',
    orderDescription:
      'Concede Ventaja en tiradas de Iniciativa y pruebas de Sabiduría (Percepción) en combate durante 7 días.',
  },
  sanctum: {
    id: 'sanctum',
    name: 'Sanctum',
    space: 'ESPACIOSO',
    costEO: 17000,
    buildDays: 30,
    prerequisite: 'Foco Arcano o Símbolo Sagrado',
    employees: 1,
    orderType: 'Empoderar',
    orderName: 'Santuario Arcano',
    description:
      'Cámara sagrada o arcana de alta concentración de poder cósmico.',
    orderDescription:
      'Permite recuperar un espacio de conjuro de nivel 5 o inferior tras completar un descanso en el Sanctum.',
  },
  templo: {
    id: 'templo',
    name: 'Templo',
    space: 'ESPACIOSO',
    costEO: 13000,
    buildDays: 30,
    prerequisite: 'Ninguno',
    employees: 2,
    orderType: 'Empoderar',
    orderName: 'Bendición Divina',
    description:
      'Gran santuario de adoración con pilares tallados y altares de veneración.',
    orderDescription:
      'Otorga a los personajes el efecto de la orden Empoderar Divina durante 7 días.',
  },
};

/**
 * Devuelve los detalles técnicos completos de una edificación especial.
 */
export function getSpecialFacilityDetail(id: string): SpecialFacilityDetail | null {
  return SPECIAL_FACILITIES_CATALOG[id] || null;
}
