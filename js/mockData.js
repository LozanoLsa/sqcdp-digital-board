/* ============================================
   DMS Dashboard - Mock Data (Abril 2026)
   ============================================
   Simulated manufacturing data for demo.
   Format matches the current data model.

   Patterns:
   - Safety:   ~93% green, ~7% red (2 incidentes)
   - Quality:  ~60% green, ~27% amarillo, ~13% rojo
   - Cost:     ~63% green, ~27% amarillo, ~10% rojo
   - Delivery: ~73% green, ~17% amarillo, ~10% rojo
   - People:   ~80% green, ~17% amarillo, ~3% rojo
   ============================================ */

function generateMockData() {
  const s = (incidents, type = '', notes = '') =>
    ({ incidents, type, notes });

  const q = (scrapPct, hasAlert, alertType = '', alertCount = 0, category = '', description = '') =>
    ({ scrapPct, hasAlert, alertType, alertCount, category, description });

  const c = (oee, failures = 0, repairTime = 0, equipment = '', notes = '') =>
    ({ oee, failures, repairTime, equipment, notes });

  const d = (total, completed, backlog = 0, notes = '') =>
    ({ total, completed, backlog, notes });

  const p = (present, total, trainingHrs = 0, kaizen = 0, notes = '') =>
    ({ present, total, trainingHrs, kaizen, notes });

  return {
    1:  { safety: s(0),                                         quality: q(1.2, 'no'),                                                cost: c(87.5),              delivery: d(200, 198, 2),  people: p(47, 48) },
    2:  { safety: s(0),                                         quality: q(1.8, 'no'),                                                cost: c(85.0),              delivery: d(200, 196, 4),  people: p(46, 48) },
    3:  { safety: s(0),                                         quality: q(0.9, 'no'),                                                cost: c(91.2),              delivery: d(200, 200, 0),  people: p(48, 48) },
    4:  { safety: s(0),                                         quality: q(2.3, 'yes', 'internal', 1, 'Dimensional', 'Piezas fuera de tolerancia'), cost: c(72.1, 1, 45, 'Prensa #2'), delivery: d(200, 192, 8),  people: p(45, 48) },
    5:  { safety: s(0),                                         quality: q(1.5, 'no'),                                                cost: c(88.3),              delivery: d(200, 197, 3),  people: p(47, 48) },

    6:  { safety: s(1, 'Near miss', 'Piso resbaloso línea 3'),  quality: q(3.2, 'yes', 'internal', 2, 'Funcional', 'Falla en ensamble'), cost: c(61.5, 2, 120, 'Robot L2', 'Falla eléctrica'), delivery: d(200, 188, 12), people: p(44, 48) },
    7:  { safety: s(0),                                         quality: q(2.8, 'yes', 'internal', 1, 'Dimensional'),                 cost: c(78.4, 1, 30, 'Prensa #1'), delivery: d(200, 190, 10), people: p(43, 48) },
    8:  { safety: s(0),                                         quality: q(1.1, 'no'),                                                cost: c(86.7),              delivery: d(200, 196, 4),  people: p(47, 48) },
    9:  { safety: s(0),                                         quality: q(0.7, 'no'),                                                cost: c(92.1),              delivery: d(200, 199, 1),  people: p(48, 48) },
    10: { safety: s(0),                                         quality: q(1.4, 'no'),                                                cost: c(87.9),              delivery: d(200, 198, 2),  people: p(46, 48) },

    11: { safety: s(0),                                         quality: q(4.1, 'yes', 'external', 1, 'Funcional', 'Reclamo cliente A'), cost: c(58.3, 3, 180, 'Línea 1 completa', 'Mantenimiento correctivo'), delivery: d(200, 185, 15), people: p(44, 48) },
    12: { safety: s(0),                                         quality: q(5.2, 'yes', 'external', 2, 'Dimensional', 'Reclamo cliente B'), cost: c(55.1, 2, 90, 'Prensa #3'), delivery: d(200, 178, 22), people: p(45, 48) },
    13: { safety: s(0),                                         quality: q(3.8, 'yes', 'internal', 1, 'Funcional'),                   cost: c(74.6, 1, 60, 'Robot L1'), delivery: d(200, 186, 14), people: p(46, 48) },
    14: { safety: s(0),                                         quality: q(4.5, 'yes', 'internal', 2, 'Dimensional', 'Calibración requerida'), cost: c(68.2, 1, 45, 'Prensa #2'), delivery: d(200, 182, 18), people: p(43, 48) },
    15: { safety: s(1, 'First aid', 'Corte menor mano operador L2'), quality: q(6.1, 'yes', 'external', 1, 'Funcional', 'Reclamo urgente cliente C'), cost: c(59.8, 3, 150, 'Múltiples'), delivery: d(200, 170, 30), people: p(42, 48) },

    16: { safety: s(0),                                         quality: q(3.5, 'yes', 'internal', 1, 'Visual'),                      cost: c(76.3, 1, 35, 'Banda transportadora'), delivery: d(200, 189, 11), people: p(45, 48) },
    17: { safety: s(0),                                         quality: q(2.1, 'no'),                                                cost: c(82.4),              delivery: d(200, 193, 7),  people: p(46, 48) },
    18: { safety: s(0),                                         quality: q(1.6, 'no'),                                                cost: c(88.1),              delivery: d(200, 196, 4),  people: p(47, 48) },
    19: { safety: s(0),                                         quality: q(1.3, 'no'),                                                cost: c(89.5),              delivery: d(200, 198, 2),  people: p(48, 48, 2, 1) },
    20: { safety: s(0),                                         quality: q(0.8, 'no'),                                                cost: c(91.0),              delivery: d(200, 199, 1),  people: p(47, 48, 0, 2) },

    21: { safety: s(0),                                         quality: q(1.0, 'no'),                                                cost: c(90.2),              delivery: d(200, 197, 3),  people: p(44, 48, 4, 0, 'Capacitación 5S') },
    22: { safety: s(0),                                         quality: q(1.9, 'no'),                                                cost: c(85.7),              delivery: d(200, 195, 5),  people: p(46, 48) },
    23: { safety: s(0),                                         quality: q(1.4, 'no'),                                                cost: c(87.3),              delivery: d(200, 198, 2),  people: p(47, 48, 1, 1) },
    24: { safety: s(0),                                         quality: q(2.5, 'yes', 'internal', 1, 'Dimensional'),                 cost: c(79.1, 1, 20, 'Prensa #1'), delivery: d(200, 191, 9),  people: p(45, 48) },
    25: { safety: s(0),                                         quality: q(1.1, 'no'),                                                cost: c(88.6),              delivery: d(200, 196, 4),  people: p(47, 48, 0, 1) },

    26: { safety: s(0),                                         quality: q(0.6, 'no'),                                                cost: c(93.2),              delivery: d(200, 200, 0),  people: p(48, 48, 3, 2) },
    27: { safety: s(0),                                         quality: q(1.7, 'no'),                                                cost: c(86.4),              delivery: d(200, 194, 6),  people: p(46, 48) },
    28: { safety: s(0),                                         quality: q(2.2, 'yes', 'internal', 1, 'Funcional'),                   cost: c(80.3, 1, 25, 'Ensamble final'), delivery: d(200, 192, 8),  people: p(45, 48) },
    29: { safety: s(0),                                         quality: q(1.0, 'no'),                                                cost: c(89.1),              delivery: d(200, 198, 2),  people: p(47, 48, 2, 0) },
    30: { safety: s(0),                                         quality: q(0.5, 'no'),                                                cost: c(92.5),              delivery: d(200, 200, 0),  people: p(48, 48, 0, 3) },
  };
}

export { generateMockData };
