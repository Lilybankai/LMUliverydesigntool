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
    // No "Mask(Disable for export)" plate in this file, and no substitute for one:
    // `region > Region 1` was used as the outline here and is not one - it is a single
    // material selector, so it covered 42% of the islands and the guide baked black
    // over every panel outside it (41% of the car's own decals landed on that black).
    // With no override the outline is reconstructed from the wireframe instead.
  },
  {
    id: 'genesis_gmr001_hypercar',
    name: 'Genesis GMR-001',
    class: 'Hypercar',
    series: 'WEC',
    psd: 'Template_HYPER_GenesisGMR001.psd',
    asset: 'GenesisGMR001',
    // No mask plate here either; this file's body outline is buried on a misleadingly
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
  // ---- 2026 season updates --------------------------------------------------
  // Cars whose 2025 template got no 2026 file are unchanged for 2026 (confirmed
  // by the LMU dev team), so only the cars below gained a template. Each is a NEW
  // entry alongside its 2025 counterpart, never a replacement - existing saved
  // designs keep rendering against the guide they were designed on.
  {
    id: 'toyota_gr010_2026_hypercar',
    name: 'Toyota GR010 Hybrid (2026)',
    class: 'Hypercar',
    series: 'WEC',
    // "TR010" is Studio 397's typo, not ours - the car is still the GR010.
    psd: 'Template_HYPER_ToyotaTR010_2026.psd',
    asset: 'ToyotaGR010_2026',
  },
  {
    id: 'cadillac_vseries_evo_hypercar',
    name: 'Cadillac V-Series.R EVO (2026)',
    class: 'Hypercar',
    series: 'WEC',
    // Its top-level "Numplate Position" layer draws two small checkerboards at the
    // side-plate spots - same convention as the GT3 display-panel markers, so it is
    // deliberately left in both outputs rather than excluded.
    psd: 'Template_HYPER_CadillacVSeries_EVO_2026.psd',
    asset: 'CadillacVSeries_EVO_2026',
  },

  // ---- LMGT3 (2026) ---------------------------------------------------------
  // The 10-car 2025 GT3 roster predates this pipeline (hand-made assets, see
  // psd-masks.mjs); these 2026 files are the first GT3s extracted from source.
  // GT3 vehicles carry no `series` badge in the picker, but the plate subtree
  // selection still needs WEC (the files also ship a hidden LM set).
  {
    id: 'ferrari_296_evo_lmgt3',
    name: 'Ferrari 296 LMGT3 EVO (2026)',
    class: 'LMGT3',
    series: 'WEC',
    psd: 'Template_GT3_Ferrari296LMGT3_EVO_2026.psd',
    asset: 'Ferrari296LMGT3_EVO_2026',
  },
  {
    id: 'ford_mustang_evo_lmgt3',
    name: 'Ford Mustang LMGT3 EVO (2026)',
    class: 'LMGT3',
    series: 'WEC',
    psd: 'Template_GT3_FordMustang_EVO_LMGT3.psd',
    asset: 'FordMustangLMGT3_EVO_2026',
  },
  {
    id: 'porsche_911_lmgt3_2026',
    name: 'Porsche 911 GT3 R (2026)',
    class: 'LMGT3',
    series: 'WEC',
    psd: 'Template_GT3_Porsche911LMGT3R_2026.psd',
    asset: 'Porsche911LMGT3R_2026',
  },

  // ---- LMGTE ----------------------------------------------------------------
  // The four GTE cars are legacy LMU content: a closed, four-car class with no
  // season variants at all (no _2025/_2026 files, no ELMS split), so unlike every
  // other class there is exactly one template per car. Their plate groups do carry
  // a hidden LM set alongside WEC, so `series` is still needed for subtree
  // selection even though - as with the GT3s - no series badge is shown.
  {
    id: 'aston_martin_vantage_gte',
    name: 'Aston Martin Vantage GTE',
    class: 'GTE',
    series: 'WEC',
    psd: 'Template_GTE_AstonMartinVantage.psd',
    asset: 'AstonMartinVantageGTE',
    // Matte-black trim and exhaust shading, as top-level layers rather than in a
    // group SHADING_RE already knows about. Same category as "Carbon"/"Plastic":
    // decorative material, not a marking, and baking them in would drop solid black
    // blobs onto the user's livery in the exported .tga.
    exclude: ['Black', 'EXHAUST'],
  },
  {
    id: 'corvette_c8r_gte',
    name: 'Corvette C8.R GTE',
    class: 'GTE',
    series: 'WEC',
    psd: 'Template_GTE_CorvetteC8R.psd',
    asset: 'CorvetteC8RGTE',
  },
  {
    id: 'ferrari_488_gte',
    name: 'Ferrari 488 GTE',
    class: 'GTE',
    series: 'WEC',
    psd: 'Template_GTE_Ferrari488.psd',
    asset: 'Ferrari488GTE',
    // No "Mask(Disable for export)" plate in this file. Its "Color Fill 1" looks like a
    // stand-in at 43% coverage but is the surround, not the body - read as an outline it
    // puts the islands exactly where the car is not. No override: the wireframe
    // reconstruction recovers it (63%), the same route the Valkyrie now takes.
    // "Car Stickers copy" is a flattened duplicate of the whole sticker set, plates
    // included - the same trap as the SC63's "Class Stickers copy", and it would both
    // double-draw the decals and bake in the WEC plates the series selection is meant
    // to choose. "DETAILS" (kevlar weave + mirrors) and "Skirt" are material shading.
    exclude: ['Car Stickers copy', 'DETAILS', 'Skirt'],
  },
  {
    id: 'porsche_911_rsr_gte',
    name: 'Porsche 911 RSR GTE',
    class: 'GTE',
    series: 'WEC',
    psd: 'Template_GTE_PorscheRSR.psd',
    asset: 'Porsche911RSRGTE',
    // "Group 2" is this file's unnamed materials group - a solid black matte-plastic
    // block plus two swooshes. Excluded for the same reason as the Aston's "Black".
    exclude: ['Group 2'],
  },
];
