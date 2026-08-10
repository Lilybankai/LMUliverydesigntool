/**
 * Which official PSD becomes which in-app vehicle.
 *
 * This is the single source for both the extraction batch and the generated
 * `VEHICLES` entries, so the asset filenames and the registry cannot drift apart.
 *
 * Series notes (from the official pack, not an assumption):
 *   - LMP2 ships a genuinely separate ELMS file alongside the WEC one.
 *   - LMP3 is an ELMS/Le Mans Cup category; the PSDs carry no WEC variant at all.
 *   - Hypercar is WEC-only; its files carry WEC vs LM (Le Mans 24h) plate subgroups,
 *     never ELMS.
 * `series` selects the number-plate subtree inside the PSD; `label` is the suffix
 * shown to the user (null = no suffix).
 */
export const TEMPLATES = [
  // ---- LMP2 -----------------------------------------------------------------
  {
    id: 'oreca_07_lmp2_wec',
    name: 'Oreca 07 LMP2 (WEC)',
    class: 'LMP2',
    series: 'WEC',
    psd: 'Template_LMP2_Oreca07_2025.psd',
    asset: 'Oreca07LMP2_2025_WEC',
  },
  {
    id: 'oreca_07_lmp2_elms',
    name: 'Oreca 07 LMP2 (ELMS)',
    class: 'LMP2',
    series: 'ELMS',
    psd: 'Template_LMP2_Oreca07_ELMS_2025.psd',
    asset: 'Oreca07LMP2_2025_ELMS',
  },

  // ---- LMP3 (ELMS / Le Mans Cup only) ---------------------------------------
  {
    id: 'ligier_jsp325_lmp3',
    name: 'Ligier JS P325 LMP3',
    class: 'LMP3',
    series: 'ELMS',
    psd: 'Template_LMP3_Ligier_JSP325.psd',
    asset: 'LigierJSP325LMP3',
    // No mask plate here either. The body outline is the *painted shape* of a fill
    // layer tucked inside the number-plate group, whose own mask hides all but a small
    // plate region - so the extractor reads its raster alpha rather than its mask.
    // ("Fill layer 3" is the same shape in a different colour.)
    silhouette: 'Numplate > Fill layer 1',
  },
  {
    id: 'duqueine_d09_lmp3',
    name: 'Duqueine D09 LMP3',
    class: 'LMP3',
    series: 'ELMS',
    psd: 'Template_LMP3_Duqueine_D09.psd',
    asset: 'DuqueineD09LMP3',
  },
  {
    id: 'ginetta_g61evo_lmp3',
    name: 'Ginetta G61 Evo LMP3',
    class: 'LMP3',
    series: 'ELMS',
    psd: 'Template_LMP3_Ginetta_G61Evo.psd',
    asset: 'GinettaG61EvoLMP3',
  },
  {
    id: 'adess_ad25_lmp3',
    name: 'ADESS AD25 LMP3',
    class: 'LMP3',
    series: 'ELMS',
    psd: 'Template_LMP3_ADESS_AD25.psd',
    asset: 'AdessAD25LMP3',
  },

  // ---- Hypercar (WEC) -------------------------------------------------------
  {
    id: 'ferrari_499p_hypercar',
    name: 'Ferrari 499P',
    class: 'Hypercar',
    series: 'WEC',
    psd: 'Template_HYPER_Ferrari499P_2025.psd',
    asset: 'Ferrari499P_2025',
    // This file keeps its red base paint in a bottom group called "Car" rather than a
    // "Base" layer; without dropping it the red floods the transparent sticker sheet.
    exclude: ['Car'],
  },
  {
    id: 'toyota_gr010_hypercar',
    name: 'Toyota GR010 Hybrid',
    class: 'Hypercar',
    series: 'WEC',
    psd: 'Template_HYPER_ToyotaGR010_2025.psd',
    asset: 'ToyotaGR010_2025',
  },
  {
    id: 'porsche_963_hypercar',
    name: 'Porsche 963',
    class: 'Hypercar',
    series: 'WEC',
    psd: 'Template_HYPER_Porsche963_2025.psd',
    asset: 'Porsche963_2025',
  },
  {
    id: 'cadillac_vseries_hypercar',
    name: 'Cadillac V-Series.R',
    class: 'Hypercar',
    series: 'WEC',
    psd: 'Template_HYPER_CadillacVSeries_2026.psd',
    asset: 'CadillacVSeries_2026',
  },
  {
    id: 'peugeot_9x8_hypercar',
    name: 'Peugeot 9X8',
    class: 'Hypercar',
    series: 'WEC',
    psd: 'Template_HYPER_Peugeot9x8_2026.psd',
    asset: 'Peugeot9X8_2026',
  },
  {
    id: 'bmw_m_hybrid_hypercar',
    name: 'BMW M Hybrid V8',
    class: 'Hypercar',
    series: 'WEC',
    psd: 'Template_HYPER_BMWMHybrid_EVO.psd',
    asset: 'BMWMHybridV8_EVO',
  },
  {
    id: 'alpine_a424_hypercar',
    name: 'Alpine A424',
    class: 'Hypercar',
    series: 'WEC',
    psd: 'Template_HYPER_AlpineA424_2026.psd',
    asset: 'AlpineA424_2026',
  },
  {
    id: 'lamborghini_sc63_hypercar',
    name: 'Lamborghini SC63',
    class: 'Hypercar',
    series: 'WEC',
    psd: 'Template_HYPER_LamborghiniSC63.psd',
    asset: 'LamborghiniSC63',
    // A near-full-canvas "Class Stickers copy" plate sits at top level in this file
    // and floods the transparent sticker sheet; the real decals are in the group of
    // the same name below it.
    exclude: ['Class Stickers copy'],
  },
  {
    id: 'aston_valkyrie_hypercar',
    name: 'Aston Martin Valkyrie',
    class: 'Hypercar',
    series: 'WEC',
    psd: 'Template_HYPER_AstonMartinValkyrie.psd',
    asset: 'AstonMartinValkyrie',
    // No "Mask(Disable for export)" plate in this file; the body outline lives on a
    // Region layer instead (42% coverage, verified visually).
    silhouette: 'region > Region 1',
  },
  {
    id: 'genesis_gmr001_hypercar',
    name: 'Genesis GMR-001',
    class: 'Hypercar',
    series: 'WEC',
    psd: 'Template_HYPER_GenesisGMR001.psd',
    asset: 'GenesisGMR001',
    // Same situation as the Valkyrie, but the body outline is buried on a misleadingly
    // named layer inside the sticker tree (55% coverage, verified visually).
    silhouette: 'Car Stickers > Michelin > Michelin',
  },
  {
    id: 'isotta_tipo6_hypercar',
    name: 'Isotta Fraschini Tipo 6',
    class: 'Hypercar',
    series: 'WEC',
    psd: 'Template_HYPER_IsottaFraschiniTipo6.psd',
    asset: 'IsottaFraschiniTipo6',
  },
  {
    id: 'vanwall_680_hypercar',
    name: 'Vanwall Vandervell 680',
    class: 'Hypercar',
    series: 'WEC',
    psd: 'Template_HYPER_Vanwall680.psd',
    asset: 'Vanwall680',
  },
  {
    id: 'glickenhaus_scg007_hypercar',
    name: 'Glickenhaus SCG 007',
    class: 'Hypercar',
    series: 'WEC',
    psd: 'Template_HYPER_GlickenhausSCG007.psd',
    asset: 'GlickenhausSCG007',
  },
];
