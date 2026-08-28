export const mockPlatformSettings = {
  globalMaintenance: false,
  broadcastBanner: '', // "Mise à jour v2.4 ce soir à 23h00."
};

export const mockCompanies = [
  {
    id: 'c1',
    name: 'BâtiPro Construct',
    siren: '123456789',
    contactEmail: 'admin@batipro.fr',
    planType: 'Enterprise',
    status: 'Actif', // Actif / Suspendu / Maintenance
    memberCount: 45,
    activeSites: 12,
    monthlyFee: 999,
    renewalDate: '2024-12-01',
    maintenanceMode: false,
    features: {
      grosEngins: true,
      exportPaie: true,
      situations: true,
      signatureElectronique: true
    }
  },
  {
    id: 'c2',
    name: 'Artisans Réunis',
    siren: '987654321',
    contactEmail: 'contact@artisans-reunis.fr',
    planType: 'Starter',
    status: 'Actif',
    memberCount: 5,
    activeSites: 2,
    monthlyFee: 49,
    renewalDate: '2024-10-15',
    maintenanceMode: false,
    features: {
      grosEngins: false,
      exportPaie: true,
      situations: false,
      signatureElectronique: false
    }
  },
  {
    id: 'c3',
    name: 'GrosOeuvre SA',
    siren: '555444333',
    contactEmail: 'direction@grosoeuvre.com',
    planType: 'Pro',
    status: 'Suspendu',
    memberCount: 20,
    activeSites: 0,
    monthlyFee: 299,
    renewalDate: '2024-08-01',
    maintenanceMode: false,
    features: {
      grosEngins: true,
      exportPaie: true,
      situations: true,
      signatureElectronique: false
    }
  },
];

export const mockSites = [
  {
    id: 's1',
    companyId: 'c1',
    name: 'Tour Montparnasse Rénovation',
    address: '33 Avenue du Maine, 75015 Paris',
    managerName: 'Jean Dupont',
    status: 'En cours',
    budget: 5000000,
    budgetConsumed: 3200000,
    progress: 65,
    workersCount: 25,
  },
  {
    id: 's2',
    companyId: 'c1',
    name: 'Immeuble de Bureaux Lyon',
    address: '10 Rue de la République, 69001 Lyon',
    managerName: 'Marie Curie',
    status: 'En retard',
    budget: 1200000,
    budgetConsumed: 1100000,
    progress: 70,
    workersCount: 15,
  },
  {
    id: 's3',
    companyId: 'c2',
    name: 'Rénovation Maison Individuelle',
    address: '15 Chemin des Pins, 33000 Bordeaux',
    managerName: 'Paul Martin',
    status: 'Terminé',
    budget: 80000,
    budgetConsumed: 78000,
    progress: 100,
    workersCount: 3,
  },
];

export const mockWorkers = [
  {
    id: 'w1',
    companyId: 'c1',
    name: 'Jean Dupont',
    role: 'Chef de chantier',
    siteAssigned: 's1',
    phone: '0612345678',
    caces: 'CACES R482 Cat A',
    medicalExpiry: '2025-06-12',
    hoursLoggedThisWeek: 39,
  },
  {
    id: 'w2',
    companyId: 'c1',
    name: 'Luc Durand',
    role: 'Compagnon',
    siteAssigned: 's1',
    phone: '0698765432',
    caces: 'CACES R486',
    medicalExpiry: '2024-11-20',
    hoursLoggedThisWeek: 35,
  },
  {
    id: 'w3',
    companyId: 'c2',
    name: 'Paul Martin',
    role: 'Chef de chantier',
    siteAssigned: 's3',
    phone: '0655443322',
    caces: 'Aucun',
    medicalExpiry: '2025-01-10',
    hoursLoggedThisWeek: 42,
  },
  {
    id: 'w4',
    companyId: 'c1',
    name: 'Marc Leroi',
    role: 'Compagnon',
    siteAssigned: 's2',
    phone: '0677889900',
    caces: 'Aucun',
    medicalExpiry: '2024-09-30',
    hoursLoggedThisWeek: 20,
  },
];

export const mockAuditLogs = [
  {
    id: 'l1',
    timestamp: '2024-09-01T08:30:00Z',
    actor: 'Super Admin',
    companyId: 'system',
    companyName: 'System',
    action: 'Created new company BâtiPro Construct',
    level: 'INFO',
  },
  {
    id: 'l2',
    timestamp: '2024-09-02T10:15:00Z',
    actor: 'Patron',
    companyId: 'c1',
    companyName: 'BâtiPro Construct',
    action: 'Added new site Tour Montparnasse Rénovation',
    level: 'INFO',
  },
  {
    id: 'l3',
    timestamp: '2024-09-03T14:45:00Z',
    actor: 'Chef de chantier (Jean Dupont)',
    companyId: 'c1',
    companyName: 'BâtiPro Construct',
    action: 'Reported site En retard',
    level: 'WARNING',
  },
  {
    id: 'l4',
    timestamp: '2024-09-04T09:00:00Z',
    actor: 'System',
    companyId: 'c3',
    companyName: 'GrosOeuvre SA',
    action: 'Suspended account due to unpaid dues',
    level: 'ERROR',
  },
];

export const mockStats = {
  mrr: 1347,
  activeTenants: 2,
  totalActiveSites: 14,
  systemHealth: 99.9,
};

export const mockUsers = [
  {
    id: 'u1',
    name: 'Alice System',
    email: 'super@buildsync.com',
    phone: '0600000001',
    role: 'super_admin',
    companyId: 'system',
  },
  {
    id: 'u2',
    name: 'Boss Batipro',
    email: 'admin@batipro.fr',
    phone: '0600000002',
    role: 'company_admin',
    companyId: 'c1',
  },
  {
    id: 'u3',
    name: 'Jean Dupont',
    email: 'j.dupont@batipro.fr',
    phone: '0612345678',
    role: 'site_manager',
    companyId: 'c1',
    workerId: 'w1',
  },
  {
    id: 'u4',
    name: 'Luc Durand',
    email: 'l.durand@batipro.fr',
    phone: '0698765432',
    role: 'worker',
    companyId: 'c1',
    workerId: 'w2',
  },
];

export const mockEquipment = {
  heavyMachinery: [
    {
      id: 'hm1',
      companyId: 'c1',
      name: 'Pelleteuse sur chenilles Volvo EC220E',
      model: 'EC220E',
      serialNumber: 'VOL220E99812',
      assignedSiteId: 's1',
      status: 'En service',
      nextInspectionDate: '2025-05-15',
      hourlyCost: 45,
    },
    {
      id: 'hm2',
      companyId: 'c1',
      name: 'Grue à tour Potain',
      model: 'MDT 219',
      serialNumber: 'POT2194455',
      assignedSiteId: 's1',
      status: 'En service',
      nextInspectionDate: '2024-11-20',
      hourlyCost: 120,
    },
    {
      id: 'hm3',
      companyId: 'c1',
      name: 'Chargeuse JCB 409',
      model: '409',
      serialNumber: 'JCB4091122',
      assignedSiteId: null,
      status: 'Disponible',
      nextInspectionDate: '2025-02-10',
      hourlyCost: 35,
    },
  ],
  lightTools: [
    {
      id: 'lt1',
      companyId: 'c1',
      name: 'Perforateur Hilti TE 60',
      category: 'Électroportatif',
      currentHolderWorkerId: 'w2',
      assignedSiteId: 's1',
      condition: 'Bon',
    },
    {
      id: 'lt2',
      companyId: 'c1',
      name: 'Scie circulaire Makita',
      category: 'Électroportatif',
      currentHolderWorkerId: 'w4',
      assignedSiteId: 's2',
      condition: 'Usé',
    },
    {
      id: 'lt3',
      companyId: 'c1',
      name: 'Niveau laser Bosch',
      category: 'Mesure',
      currentHolderWorkerId: null,
      assignedSiteId: 's1',
      condition: 'Neuf',
    },
  ]
};

export const mockQuotes = [
  { id: 'q1', companyId: 'c1', siteId: 's1', client: 'Mairie de Paris', amount: 5000000, progressBilling: 30, paymentStatus: 'Payé' },
  { id: 'q2', companyId: 'c1', siteId: 's2', client: 'SCI Les Pins', amount: 1200000, progressBilling: 60, paymentStatus: 'En retard' },
  { id: 'q3', companyId: 'c2', siteId: 's3', client: 'M. Dubois', amount: 80000, progressBilling: 100, paymentStatus: 'Facturé' },
];

export const mockDeliveries = [
  { id: 'd1', companyId: 'c1', siteId: 's1', description: '14m³ Béton Lafarge', time: '08:30', signature: true },
  { id: 'd2', companyId: 'c1', siteId: 's1', description: '2 Palettes de parpaings', time: '10:00', signature: false },
];

export const mockSnags = [
  { id: 'sn1', companyId: 'c1', siteId: 's1', description: 'Reprise peinture mur nord', subcontractor: 'Peinture Pro', deadline: '2024-10-01', status: 'En cours' },
  { id: 'sn2', companyId: 'c1', siteId: 's1', description: 'Câble apparent tableau elec', subcontractor: 'Elec 2000', deadline: '2024-09-25', status: 'Ouvert' },
];

export const mockInvoicesSaaS = [
  { id: 'inv1', companyName: 'BâtiPro Construct', amount: 999, date: '2024-09-01', status: 'Payé' },
  { id: 'inv2', companyName: 'Artisans Réunis', amount: 49, date: '2024-09-05', status: 'Payé' },
  { id: 'inv3', companyName: 'GrosOeuvre SA', amount: 299, date: '2024-08-01', status: 'Rejeté' },
];

export const mockSubcontractors = [
  { id: 'sub1', companyId: 'c1', name: 'Peinture Pro', specialty: 'Peinture & Revêtements', insuranceExpiry: '2025-12-31', contact: 'contact@peinturepro.fr' },
  { id: 'sub2', companyId: 'c1', name: 'Elec 2000', specialty: 'Électricité Courants Forts/Faibles', insuranceExpiry: '2023-10-15', contact: 'contact@elec2000.com' },
];

export const mockGedFolders = [
  { id: 'f1', companyId: 'c1', siteId: 's1', name: "Plans Architecte", files: ["Plan_RDC_V2.pdf", "Coupe_Elevation.pdf"] },
  { id: 'f2', companyId: 'c1', siteId: 's1', name: "PPSPS / Sécurité", files: ["PPSPS_Signe.pdf"] },
  { id: 'f3', companyId: 'c1', siteId: 's1', name: "Devis Signés", files: ["Devis_Client_Signe.pdf"] },
];

export const mockExpenses = [
  { id: 'exp1', companyId: 'c1', siteId: 's1', amount: 450, supplier: 'Leroy Merlin', description: 'Vis et petit outillage', date: '2024-09-10' },
  { id: 'exp2', companyId: 'c1', siteId: 's1', amount: 120, supplier: 'Total Energies', description: 'Carburant engins', date: '2024-09-12' },
];
