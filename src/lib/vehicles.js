const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

const LMU_BASE = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Le Mans Ultimate\\UserData\\Liveries';

/**
 * Display order for the class-grouped vehicle picker. Any class not listed here is
 * appended after these, so adding a class to VEHICLES can never hide it.
 */
export const CLASS_ORDER = ['Hypercar', 'LMP2', 'LMP3', 'LMGT3'];

/**
 * NOTE: `id` is persisted as `saved_designs.vehicle_id` (free text, no FK), and an
 * unknown id silently falls back to VEHICLES[0]. Never rename an existing id.
 */
export const VEHICLES = [
  {
    id: 'aston_martin_gt3',
    name: 'Aston Martin Vantage GT3',
    class: 'LMGT3',
    uvMap: '/lmutemplates/AstonMartinVantage_2025_UV.webp',
    classStickers: '/lmutemplates/TOP_GT3_AstonMartinVantage_2025.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
    liveryPath: `${LMU_BASE}\\Aston Martin Vantage GT3`,
  },
  {
    id: 'corvette_z06_lmgt3',
    name: 'Corvette Z06 LMGT3',
    class: 'LMGT3',
    uvMap: '/lmutemplates/CorvetteZ06LMGT3_2025_UV.webp',
    classStickers: '/lmutemplates/TOP_CorvetteZ06LMGT3_2025_.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
    liveryPath: `${LMU_BASE}\\Corvette Z06 LMGT3`,
  },
  {
    id: 'ferrari_296_lmgt3',
    name: 'Ferrari 296 LMGT3',
    class: 'LMGT3',
    uvMap: '/lmutemplates/Ferrari296LMGT3_2025_UV.webp',
    classStickers: '/lmutemplates/TOP_Ferrari296LMGT3_2025.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
    liveryPath: `${LMU_BASE}\\Ferrari 296 LMGT3`,
  },
  {
    id: 'bmw_m4_lmgt3',
    name: 'BMW M4 LMGT3',
    class: 'LMGT3',
    uvMap: '/lmutemplates/BMWM4LMGT3_2025_UV.webp',
    classStickers: '/lmutemplates/TOP GT3_BMWM4LMGT3_2025.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
    liveryPath: `${LMU_BASE}\\BMW M4 LMGT3`,
  },
  {
    id: 'ford_mustang_lmgt3',
    name: 'Ford Mustang LMGT3',
    class: 'LMGT3',
    uvMap: '/lmutemplates/FordMustangLMGT3_2025_UV.webp',
    classStickers: '/lmutemplates/TOP_FordMustangLMGT3_2025.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
    liveryPath: `${LMU_BASE}\\Ford Mustang LMGT3`,
  },
  {
    id: 'lamborghini_huracan_lmgt3',
    name: 'Lamborghini Huracan LMGT3',
    class: 'LMGT3',
    uvMap: '/lmutemplates/LamborghiniHuracan_UV.webp',
    classStickers: '/lmutemplates/TOP_LamborghiniHuracan.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
    liveryPath: `${LMU_BASE}\\Lamborghini Huracan LMGT3`,
  },
  {
    id: 'lexus_rcf_lmgt3',
    name: 'Lexus RCF LMGT3',
    class: 'LMGT3',
    uvMap: '/lmutemplates/LexusRCF_2025_UV.webp',
    classStickers: '/lmutemplates/TOP_LexusRCF_2025.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
    liveryPath: `${LMU_BASE}\\Lexus RCF LMGT3`,
  },
  {
    id: 'mclaren_720evo_lmgt3',
    name: 'McLaren 720 EVO LMGT3',
    class: 'LMGT3',
    uvMap: '/lmutemplates/McLaren720EVO_2025_UV.webp',
    classStickers: '/lmutemplates/TOP_McLaren720EVO_2025.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
    liveryPath: `${LMU_BASE}\\McLaren 720 EVO LMGT3`,
  },
  {
    id: 'mercedes_amg_lmgt3',
    name: 'Mercedes AMG LMGT3',
    class: 'LMGT3',
    uvMap: '/lmutemplates/MercedesAMG_2025_UV.webp',
    classStickers: '/lmutemplates/TOP_MercedesAMG_2025.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
    liveryPath: `${LMU_BASE}\\Mercedes AMG LMGT3`,
  },
  {
    id: 'porsche_911_lmgt3',
    name: 'Porsche 911 LMGT3',
    class: 'LMGT3',
    uvMap: '/lmutemplates/Porsche911LMGT3R_2025_UV.webp',
    classStickers: '/lmutemplates/TOP_Porsche911LMGT3R_2025.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
    liveryPath: `${LMU_BASE}\\Porsche 911 LMGT3`,
  },

  // --- Hypercar (WEC) --------------------------------------------------------
  // Hypercar runs in the WEC only, so these carry no ELMS variant.
  {
    id: 'ferrari_499p_hypercar',
    name: 'Ferrari 499P',
    class: 'Hypercar',
    series: 'WEC',
    uvMap: '/lmutemplates/Ferrari499P_2025_UV.webp',
    classStickers: '/lmutemplates/TOP_Ferrari499P_2025.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
  },
  {
    id: 'toyota_gr010_hypercar',
    name: 'Toyota GR010 Hybrid',
    class: 'Hypercar',
    series: 'WEC',
    uvMap: '/lmutemplates/ToyotaGR010_2025_UV.webp',
    classStickers: '/lmutemplates/TOP_ToyotaGR010_2025.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
  },
  {
    id: 'porsche_963_hypercar',
    name: 'Porsche 963',
    class: 'Hypercar',
    series: 'WEC',
    uvMap: '/lmutemplates/Porsche963_2025_UV.webp',
    classStickers: '/lmutemplates/TOP_Porsche963_2025.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
  },
  {
    id: 'cadillac_vseries_hypercar',
    name: 'Cadillac V-Series.R',
    class: 'Hypercar',
    series: 'WEC',
    uvMap: '/lmutemplates/CadillacVSeries_2026_UV.webp',
    classStickers: '/lmutemplates/TOP_CadillacVSeries_2026.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
  },
  {
    id: 'peugeot_9x8_hypercar',
    name: 'Peugeot 9X8',
    class: 'Hypercar',
    series: 'WEC',
    uvMap: '/lmutemplates/Peugeot9X8_2026_UV.webp',
    classStickers: '/lmutemplates/TOP_Peugeot9X8_2026.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
  },
  {
    id: 'bmw_m_hybrid_hypercar',
    name: 'BMW M Hybrid V8',
    class: 'Hypercar',
    series: 'WEC',
    uvMap: '/lmutemplates/BMWMHybridV8_EVO_UV.webp',
    classStickers: '/lmutemplates/TOP_BMWMHybridV8_EVO.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
  },
  {
    id: 'alpine_a424_hypercar',
    name: 'Alpine A424',
    class: 'Hypercar',
    series: 'WEC',
    uvMap: '/lmutemplates/AlpineA424_2026_UV.webp',
    classStickers: '/lmutemplates/TOP_AlpineA424_2026.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
  },
  {
    id: 'lamborghini_sc63_hypercar',
    name: 'Lamborghini SC63',
    class: 'Hypercar',
    series: 'WEC',
    uvMap: '/lmutemplates/LamborghiniSC63_UV.webp',
    classStickers: '/lmutemplates/TOP_LamborghiniSC63.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
  },
  {
    id: 'aston_valkyrie_hypercar',
    name: 'Aston Martin Valkyrie',
    class: 'Hypercar',
    series: 'WEC',
    uvMap: '/lmutemplates/AstonMartinValkyrie_UV.webp',
    classStickers: '/lmutemplates/TOP_AstonMartinValkyrie.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
  },
  {
    id: 'genesis_gmr001_hypercar',
    name: 'Genesis GMR-001',
    class: 'Hypercar',
    series: 'WEC',
    uvMap: '/lmutemplates/GenesisGMR001_UV.webp',
    classStickers: '/lmutemplates/TOP_GenesisGMR001.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
  },
  {
    id: 'isotta_tipo6_hypercar',
    name: 'Isotta Fraschini Tipo 6',
    class: 'Hypercar',
    series: 'WEC',
    uvMap: '/lmutemplates/IsottaFraschiniTipo6_UV.webp',
    classStickers: '/lmutemplates/TOP_IsottaFraschiniTipo6.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
  },
  {
    id: 'vanwall_680_hypercar',
    name: 'Vanwall Vandervell 680',
    class: 'Hypercar',
    series: 'WEC',
    uvMap: '/lmutemplates/Vanwall680_UV.webp',
    classStickers: '/lmutemplates/TOP_Vanwall680.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
  },
  {
    id: 'glickenhaus_scg007_hypercar',
    name: 'Glickenhaus SCG 007',
    class: 'Hypercar',
    series: 'WEC',
    uvMap: '/lmutemplates/GlickenhausSCG007_UV.webp',
    classStickers: '/lmutemplates/TOP_GlickenhausSCG007.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
  },

  // --- LMP2 ------------------------------------------------------------------
  // The only class with a genuine ELMS/WEC template split in the official pack.
  {
    id: 'oreca_07_lmp2_wec',
    name: 'Oreca 07 LMP2 (WEC)',
    class: 'LMP2',
    series: 'WEC',
    uvMap: '/lmutemplates/Oreca07LMP2_2025_WEC_UV.webp',
    classStickers: '/lmutemplates/TOP_Oreca07LMP2_2025_WEC.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
  },
  {
    id: 'oreca_07_lmp2_elms',
    name: 'Oreca 07 LMP2 (ELMS)',
    class: 'LMP2',
    series: 'ELMS',
    uvMap: '/lmutemplates/Oreca07LMP2_2025_ELMS_UV.webp',
    classStickers: '/lmutemplates/TOP_Oreca07LMP2_2025_ELMS.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
  },

  // --- LMP3 ------------------------------------------------------------------
  // LMP3 is an ELMS / Le Mans Cup category; the official pack has no WEC variant.
  {
    id: 'ligier_jsp325_lmp3',
    name: 'Ligier JS P325 LMP3',
    class: 'LMP3',
    series: 'ELMS',
    uvMap: '/lmutemplates/LigierJSP325LMP3_UV.webp',
    classStickers: '/lmutemplates/TOP_LigierJSP325LMP3.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
  },
  {
    id: 'duqueine_d09_lmp3',
    name: 'Duqueine D09 LMP3',
    class: 'LMP3',
    series: 'ELMS',
    uvMap: '/lmutemplates/DuqueineD09LMP3_UV.webp',
    classStickers: '/lmutemplates/TOP_DuqueineD09LMP3.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
  },
  {
    id: 'ginetta_g61evo_lmp3',
    name: 'Ginetta G61 Evo LMP3',
    class: 'LMP3',
    series: 'ELMS',
    uvMap: '/lmutemplates/GinettaG61EvoLMP3_UV.webp',
    classStickers: '/lmutemplates/TOP_GinettaG61EvoLMP3.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
  },
  {
    id: 'adess_ad25_lmp3',
    name: 'ADESS AD25 LMP3',
    class: 'LMP3',
    series: 'ELMS',
    uvMap: '/lmutemplates/AdessAD25LMP3_UV.webp',
    classStickers: '/lmutemplates/TOP_AdessAD25LMP3.webp',
    canvasWidth: 4096,
    canvasHeight: 4096,
  },
];

// Body-parts mask (white = car panels, transparent = surround), used to confine the
// base colour to the car instead of flooding the whole texture. Derived from `id`
// rather than listed per entry so the two can never drift apart.
for (const v of VEHICLES) {
  v.bodyMask = `/lmutemplates/MASK_${v.id}.webp`;
}

/** VEHICLES bucketed by class, in CLASS_ORDER, for the grouped picker. */
export function vehiclesByClass(vehicles = VEHICLES) {
  const buckets = new Map();
  for (const v of vehicles) {
    const key = v.class || 'Other';
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(v);
  }
  const ordered = CLASS_ORDER.filter((c) => buckets.has(c));
  const rest = [...buckets.keys()].filter((c) => !CLASS_ORDER.includes(c));
  return [...ordered, ...rest].map((cls) => ({ cls, vehicles: buckets.get(cls) }));
}

export const BASE_COLOURS = [
  { label: 'Racing White', value: '#FFFFFF' },
  { label: 'Jet Black', value: '#0A0A0A' },
  { label: 'Gulf Blue', value: '#1E6FA8' },
  { label: 'Gulf Orange', value: '#F47920' },
  { label: 'British Racing Green', value: '#004225' },
  { label: 'Ferrari Red', value: '#CC0000' },
  { label: 'Porsche Silver', value: '#9B9EA4' },
  { label: 'Aston Racing Yellow', value: '#F5C400' },
  { label: 'Martini Blue', value: '#002D72' },
  { label: 'Rothmans Blue', value: '#003399' },
  { label: 'Candy Apple Red', value: '#FF0800' },
  { label: 'Midnight Navy', value: '#0D1B2A' },
  { label: 'Carbon Dark', value: '#1A1A1A' },
  { label: 'Champagne Gold', value: '#C5A028' },
  { label: 'Customâ€¦', value: 'custom' },
];
