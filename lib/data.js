// lib/data.js — Source unique de vérité pour tout le projet

export const WEDDING = {
  mariee:    'Katty',
  marie:     'Pascal',
  date:      '30 Juin 2026',
  dateISO:   '2026-06-30',
  rsvpLimit: '01 Mai 2026',

  ceremonieCivile: {
    heure:   '11h30',
    lieu:    'Mairie de Grigny',
    adresse: '19 Rte de Corbeil, 91350 Grigny',
    maps:    'https://maps.google.com/?q=19+Route+de+Corbeil+91350+Grigny',
  },
  vinHonneur: {
    heure:   '13h00',
    lieu:    'Salle Jasmine',
    adresse: '8 rue des Gaillards, 95140 Garges-lès-Gonesse',
    maps:    'https://maps.google.com/?q=8+rue+des+Gaillards+95140+Garges-les-Gonesse',
  },
  ceremonieLaique: {
    heure:   '16h00',
    lieu:    'Salle Jasmine',
    adresse: '8 rue des Gaillards, 95140 Garges-lès-Gonesse',
    maps:    'https://maps.google.com/?q=8+rue+des+Gaillards+95140+Garges-les-Gonesse',
  },
  diner: {
    heure:   '19h30',
    lieu:    'Salle Jasmine',
    adresse: '8 rue des Gaillards, 95140 Garges-lès-Gonesse',
  },
  soiree: {
    heure:   '23h59',
    lieu:    'Salle Jasmine',
  },
}

export const TIMELINE = [
  { heure: '11h30', icon: '⚖️',  titre: 'Cérémonie Civile',  lieu: 'Mairie de Grigny',  desc: '19 Rte de Corbeil, 91350 Grigny',                         color: '#c9a84c' },
  { heure: '13h00', icon: '🥂',  titre: "Vin d'Honneur",     lieu: 'Salle Jasmine',       desc: '8 rue des Gaillards, 95140 Garges-lès-Gonesse',       color: '#4caf7d' },
  { heure: '16h00', icon: '💍',  titre: 'Cérémonie Laïque',  lieu: 'Salle Jasmine',       desc: 'Échange des vœurs & des alliances',                   color: '#e91e8c' },
  { heure: '19h30', icon: '🍽️', titre: 'Dîner de Gala',     lieu: 'Salle Jasmine',       desc: 'Menu Balade Tropicale',                               color: '#f39c12' },
  { heure: '23h59', icon: '🎶',  titre: 'Soirée Dansante',   lieu: 'Salle Jasmine',       desc: "La nuit n'est que le début…",                         color: '#9b59b6' },
]

export const MENU = {
  cocktail: ['Accras de morue'],
  froide: [
    'Salade composée de batavia verte',
    'Tomate en rondelle & carotte râpée',
    'Vinaigrette maison',
  ],
  chaude: [
    'Riz djondjon collé aux pois d\'angole',
    'Sauce tomate, oignons & poivrons',
    'Banane pesée',
    'Cuisses de poulet frit',
    'Pikliz',
    'Dorade entière frite à l\'haïtienne',
    'Gratin dauphinois',
  ],
  boissons: ['Oasis Tropical', 'Jus de pomme', 'Coca-Cola', 'Eau plate'],
}

export const TABLES = [
  { id: 1,  name: 'Hibiscus',           flower: '🌺', capacity: 8, theme: 'Hibiscus rouge des Antilles'     },
  { id: 2,  name: 'Frangipanier',       flower: '🌸', capacity: 8, theme: 'Frangipanier rose et blanc'      },
  { id: 3,  name: 'Balisier',           flower: '🌷', capacity: 8, theme: 'Balisier rouge national'         },
  { id: 4,  name: 'Bouganvillée',       flower: '💜', capacity: 8, theme: 'Bouganvillée violette'           },
  { id: 5,  name: 'Lantana',            flower: '🌼', capacity: 8, theme: 'Lantana jaune-orange'            },
  { id: 6,  name: 'Alamanda',           flower: '🌻', capacity: 8, theme: 'Alamanda dorée'                  },
  { id: 7,  name: 'Anthurium',          flower: '❤️', capacity: 8, theme: 'Anthurium rouge flamme'          },
  { id: 8,  name: 'Heliconias',         flower: '🦜', capacity: 8, theme: 'Heliconia exotique'              },
  { id: 9,  name: 'Oiseau du Paradis',  flower: '🐦', capacity: 8, theme: 'Strelitzia — Oiseau du Paradis'  },
  { id: 10, name: 'Cactus',             flower: '🌵', capacity: 8, theme: 'Cactus fleuri'                   },
  { id: 11, name: "Cœur d'Amour",       flower: '💛', capacity: 8, theme: 'Table des mariés'                },
  { id: 12, name: 'Palmier & Bambou',   flower: '🌿', capacity: 6, theme: 'Palmier et bambou tropicaux'     },
  { id: 13, name: 'Orchidée',           flower: '🌸', capacity: 6, theme: 'Orchidée des Tropiques'          },
  { id: 14, name: 'Pivoine Tropicale',  flower: '🌷', capacity: 8, theme: 'Pivoine tropicale parfumée'      },
]

export const HOTELS = [
  { name: 'Ibis Styles Garges',     stars: '★★★', dist: '3 min',  maps: 'https://maps.google.com/?q=Ibis+Styles+Garges-les-Gonesse' },
  { name: 'Kyriad Roissy CDG',      stars: '★★★', dist: '15 min', maps: 'https://maps.google.com/?q=Kyriad+Roissy+CDG'              },
  { name: 'Novotel Paris Roissy',   stars: '★★★★',dist: '20 min', maps: 'https://maps.google.com/?q=Novotel+Paris+Roissy'           },
  { name: 'B&B Hotel Stains',       stars: '★★',  dist: '8 min',  maps: 'https://maps.google.com/?q=BB+Hotel+Stains'                },
]

export const GROUP_COLORS = {
  mariee:    { bg: '#e91e8c20', border: '#e91e8c60', text: '#e91e8c', icon: '👰', label: 'Mariée'   },
  marie:     { bg: '#3498db20', border: '#3498db60', text: '#3498db', icon: '🤵', label: 'Marié'    },
  famille:   { bg: '#c9a84c20', border: '#c9a84c60', text: '#c9a84c', icon: '👨‍👩‍👧', label: 'Famille' },
  amis:      { bg: '#4caf7d20', border: '#4caf7d60', text: '#4caf7d', icon: '👫', label: 'Amis'     },
  collegue:  { bg: '#9b59b620', border: '#9b59b660', text: '#9b59b6', icon: '💼', label: 'Collègue' },
  autre:     { bg: '#ffffff10', border: '#ffffff30', text: '#aaaaaa', icon: '🌺', label: 'Autre'    },
}
