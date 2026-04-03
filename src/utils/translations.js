export const translations = {
  en: {
    // Nav
    navBrowse:    'Browse GPs',
    navPost:      '+ Post a trip',
    navHow:       'How it works',

    // Hero
    heroTag:      '🌍 Trusted by the Senegalese diaspora',
    heroTitle1:   'Send packages',
    heroTitleEm:  'home,',
    heroTitle2:   'through people you trust.',
    heroSub:      'Find verified travelers going to Dakar, Conakry, and beyond. Your package travels with a real person from your community — not a faceless courier.',
    heroCta1:     'Find a traveler',
    heroCta2:     "I'm a traveler",

    // Stats
    stat1: 'packages delivered',
    stat2: 'success rate',
    stat3: 'families trust us',
    stat4: 'active routes',

    // Trust
    trustStrip:   'Every GP is phone-verified. ID-verified travelers carry a shield badge. Your package is protected.',
    browseTrust:  'Every GP is phone-verified. ID-verified travelers carry a shield badge.',

    // How it works
    hiwTitle: 'How Yobbu works',
    hiwSub:   'Three simple steps to send your package home',
    hiw1Title: 'Find a traveler',
    hiw1Text:  'Browse verified GPs traveling to your destination. Filter by route, date, and available space.',
    hiw2Title: 'Contact & agree',
    hiw2Text:  'Reach the traveler directly on WhatsApp. Agree on price, pickup, and package details.',
    hiw3Title: 'Package delivered',
    hiw3Text:  'Your family receives the package. Leave a review to help the next sender in the community.',

    // Browse
    countLabel:   (n) => `${n} traveler${n !== 1 ? 's' : ''} available`,
    noResults:    'No travelers found for this route.',
    memberSince:  'Member since',
    tripsLabel:   'trips',
    deliveredLabel: 'kg delivered',
    responds:     'Responds',
    seeReview:    'See review ↓',
    hideReview:   'Hide review ↑',
    contact:      'Contact',
    idPending:    'ID pending',

    // Badges
    badgePhone:     'Phone',
    badgeId:        'ID verified',
    badgeCommunity: 'Community',

    // Form
    formTitle:   'Post your trip',
    formSub:     'List your available luggage space and connect with senders in the community.',
    fsPersonal:  'Your info',
    fsTrip:      'Trip details',
    flName:      'Full name',
    flPhone:     'WhatsApp number',
    flFrom:      'Departing from',
    flTo:        'Destination',
    flDate:      'Travel date',
    flSpace:     'Space available (kg)',
    flPrice:     'Price per kg',
    flNote:      'Short note (optional)',
    flNotePh:    'e.g. Available for fragile items. Contact me on WhatsApp.',
    btnSubmit:   'Post my trip',
    btnCancel:   'Cancel',
    formRequired:'Please fill in required fields.',
    successMsg:  'Your trip is posted! Senders can now find you. Yobbu!',

    // Sidebar
    sidebarTitle: 'Are you a traveler?',
    sidebarText:  'Earn extra money on your next trip home. Post your available luggage space and connect with senders.',
    sidebarCta:   'Post your trip →',
  },

  fr: {
    navBrowse:    'Voir les GPs',
    navPost:      '+ Poster un voyage',
    navHow:       'Comment ça marche',

    heroTag:      '🌍 Approuvé par la diaspora sénégalaise',
    heroTitle1:   'Envoyez vos colis',
    heroTitleEm:  'chez vous,',
    heroTitle2:   'avec des personnes de confiance.',
    heroSub:      'Trouvez des voyageurs vérifiés qui vont à Dakar, Conakry et ailleurs. Votre colis voyage avec une vraie personne de votre communauté.',
    heroCta1:     'Trouver un voyageur',
    heroCta2:     'Je suis voyageur',

    stat1: 'colis livrés',
    stat2: 'taux de réussite',
    stat3: 'familles nous font confiance',
    stat4: 'routes actives',

    trustStrip:  "Chaque GP est vérifié par téléphone. Les voyageurs vérifiés par pièce d'identité portent un badge.",
    browseTrust: "Chaque GP est vérifié par téléphone. Les voyageurs vérifiés portent un badge bouclier.",

    hiwTitle: 'Comment fonctionne Yobbu',
    hiwSub:   'Trois étapes simples pour envoyer votre colis',
    hiw1Title: 'Trouver un voyageur',
    hiw1Text:  'Parcourez les GPs vérifiés voyageant vers votre destination. Filtrez par route, date et espace disponible.',
    hiw2Title: 'Contacter & s\'entendre',
    hiw2Text:  'Contactez le voyageur directement sur WhatsApp. Convenez du prix et des détails du colis.',
    hiw3Title: 'Colis livré',
    hiw3Text:  'Votre famille reçoit le colis. Laissez un avis pour aider la prochaine personne.',

    countLabel:     (n) => `${n} voyageur${n !== 1 ? 's' : ''} disponible${n !== 1 ? 's' : ''}`,
    noResults:      'Aucun voyageur trouvé pour cette route.',
    memberSince:    'Membre depuis',
    tripsLabel:     'voyages',
    deliveredLabel: 'kg livrés',
    responds:       'Répond en',
    seeReview:      "Voir l'avis ↓",
    hideReview:     "Masquer l'avis ↑",
    contact:        'Contacter',
    idPending:      'ID en attente',

    badgePhone:     'Téléphone',
    badgeId:        'ID vérifié',
    badgeCommunity: 'Communauté',

    formTitle:   'Poster votre voyage',
    formSub:     'Listez l\'espace disponible dans vos bagages et connectez-vous avec des expéditeurs.',
    fsPersonal:  'Vos informations',
    fsTrip:      'Détails du voyage',
    flName:      'Nom complet',
    flPhone:     'Numéro WhatsApp',
    flFrom:      'Ville de départ',
    flTo:        'Destination',
    flDate:      'Date de voyage',
    flSpace:     'Espace disponible (kg)',
    flPrice:     'Prix par kg',
    flNote:      'Note courte (optionnel)',
    flNotePh:    'ex. Disponible pour les articles fragiles. Contactez-moi sur WhatsApp.',
    btnSubmit:   'Poster mon voyage',
    btnCancel:   'Annuler',
    formRequired:'Veuillez remplir les champs obligatoires.',
    successMsg:  'Votre voyage est posté ! Les expéditeurs peuvent vous trouver. Yobbu!',

    sidebarTitle: 'Vous êtes voyageur ?',
    sidebarText:  'Gagnez de l\'argent supplémentaire lors de votre prochain voyage. Postez votre espace disponible.',
    sidebarCta:   'Poster votre voyage →',
  },
}
