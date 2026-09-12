# Photoreal habitat scenes — 12 September 2026

## Design and asset provenance

Created using the built-in image generation tool (not the CLI). These are synthesized photoreal illustrations of plausible habitats, not documentary photographs or an ecological time simulation. Mature scenes were generated first; early, young and renewal views were edited from each mature reference. Only format compression was performed afterward (WebP quality 90, 1672 × 941).

Each habitat uses one complete landscape per phase, with vegetation rooted into soil, consistent perspective, occlusion and light. Old trees, stream/terrain, rocks and distant landmarks remain across phases. The meadow and savanna stay open at maturity. No standalone plant sprites are placed over the landscape.

Phases begin at 0 (early), 144 (young), species maturity (currently 600), and maturity + 480 (currently 1080). Individual species ages, unlocks, favourite selection, rewards and stored progress are unchanged. The field guide remains separate from the landscape. Previews do not save progress.

The 16:9 card and full-screen viewer use contain sizing. The viewer also offers 2× magnification with horizontal and vertical scrolling for close inspection, and a whole-landscape reset. Landscape previews and biome selectors use the same image family. Text in Bulgarian and English distinguishes new growth within existing nature from newly discovered species.

## Verification

- TypeScript check and ecosystem lint passed.
- All 27 ecosystem tests passed: progression/service behavior, phase boundaries for all biomes, one complete scene, favourite selection independence, preview labeling and zero progress, full-screen open/close/back and navigation.
- Browser inspection used the actual application components with isolated local fixtures, not a production authentication bypass. All 24 combinations (3 biomes × 4 phases × 390/1440 px) loaded their landscape without broken images or horizontal overflow.
- Browser interactions confirmed that looking ahead to mature/renewal scenes restores the original 37 growth on return, full-screen open/close, 2× magnification and horizontal panning work, and the field guide opens.
- Screenshots: [rainforest desktop](images/habitats-v2/rainforest-desktop.png), [rainforest mobile](images/habitats-v2/rainforest-mobile.png), [forest and meadow mobile](images/habitats-v2/forest_meadow-mobile.png), [savanna mobile](images/habitats-v2/savanna-mobile.png), [expanded landscape](images/habitats-v2/viewer-1440.png).

## Saved assets and exact prompts

### rainforest / early

Saved asset: [assets/images/ecosystem/habitats-v2/rainforest-early.webp](../../assets/images/ecosystem/habitats-v2/rainforest-early.webp).

Mode: built-in edit, referencing `rainforest-mature` before WebP compression.

```text
Use case: precise-object-edit. Edit the reference landscape into another stage of the SAME ecosystem. Preserve exactly the camera position, lens, framing, stream or drainage channel, rocks, hills, lighting direction and colours. Preserve the large established trees at the edges and in the background: they are the existing surrounding ecosystem. Change the vegetation in the near and middle-ground regeneration area organically, with believable perspective, occlusion, plant bases hidden in real soil/litter and coherent shadows. Full bleed photorealistic nature photograph, same dimensions. No cutouts, isolated soil mounds, floating plants, garden planting rows, diorama, oversaturated colours, illustration, labels or text. EARLY natural regeneration in a small forest gap along the stream. The large buttressed trunk at left and mature distant trunks remain identical. Make the near stream banks visibly more open and recently regenerating: low scattered seedlings, a few tiny ferns and short palm seedlings emerging among abundant damp leaf litter, moss and small twigs. Reduce thick tall middle-ground understory shrubs and palm fronds substantially; a small patch of daylight reaches exposed decomposing leaves. The soil is never an empty blank stage; retain small natural ground plants at irregular densities. No huge solitary plant. Preserve the mossy log on the right and the exact stream curve.
```

### rainforest / young

Saved asset: [assets/images/ecosystem/habitats-v2/rainforest-young.webp](../../assets/images/ecosystem/habitats-v2/rainforest-young.webp).

Mode: built-in edit, referencing `rainforest-mature` before WebP compression.

```text
Use case: precise-object-edit. Edit the reference landscape into another stage of the SAME ecosystem. Preserve exactly the camera position, lens, framing, stream or drainage channel, rocks, hills, lighting direction and colours. Preserve the large established trees at the edges and in the background: they are the existing surrounding ecosystem. Change the vegetation in the near and middle-ground regeneration area organically, with believable perspective, occlusion, plant bases hidden in real soil/litter and coherent shadows. Full bleed photorealistic nature photograph, same dimensions. No cutouts, isolated soil mounds, floating plants, garden planting rows, diorama, oversaturated colours, illustration, labels or text. YOUNG natural regeneration, midway between sparse seedlings and the mature reference. Preserve the left old buttressed tree, distant forest and precise stream/log landmarks. Along the banks, show established young saplings about knee to waist height, small fan/feather palms, patches of ferns and broad leaves growing in irregular overlapping groups. Taller adult understory palms in the right midground are replaced by younger, smaller palms at those same sites. More visible leaf litter and light reaches the ground than in the mature reference. Vegetation occupies believable forest layers, not a set of catalog specimens. The banks show clear living growth but still have gaps.
```

### rainforest / mature

Saved asset: [assets/images/ecosystem/habitats-v2/rainforest-mature.webp](../../assets/images/ecosystem/habitats-v2/rainforest-mature.webp).

Mode: built-in generation.

```text
Use case: photorealistic-natural. Asset type: complete ecosystem landscape for a nature learning app, mature stage, 16:9 landscape composition, ideally 2048x1152 or larger.
Create an exceptionally clear, genuinely photographic view INSIDE a lowland South American tropical rainforest. Camera at adult waist height, 28mm documentary nature photography, looking into a small natural canopy gap. The whole image is one physically coherent place: large buttressed kapok-like trunk on the left middle distance, other canopy trunks at irregular depths, small understory trees and palms, climbing lianas attached to actual trunks, ferns, wet broad leaves, moss, scattered fallen branches and decomposing leaves. A narrow shallow stream curves from the right foreground toward the centre distance, modest and natural. Visible rooted ground vegetation at all depths, partially occluded plant bases, coherent contact shadows and real forest litter. Some clear space remains along the stream so depth and ecological structure are legible at phone size. Forest canopy is overhead; no distant postcard horizon. Soft neutral daylight filtered through canopy with gentle patches of sunlight, rich but natural greens, realistic bark texture, fine leaf veins, clear midground, no heavy mist, no excessive god rays, no oversaturated HDR.
This is the mature environment in a fixed-camera sequence: compose lasting landmarks of stream, buttressed trunk, and low moss-covered fallen log at right edge that can remain in younger stages. No isolated specimen pasted onto a background, no cutout edges, no floating soil, no artificial garden, no giant foreground ornamental plant, no terrarium, no toy diorama, no illustration, no people or buildings, no text or logos. Every plant must be naturally rooted and in scale. Full bleed coherent nature photograph, not a collage.
```

### rainforest / renewal

Saved asset: [assets/images/ecosystem/habitats-v2/rainforest-renewal.webp](../../assets/images/ecosystem/habitats-v2/rainforest-renewal.webp).

Mode: built-in edit, referencing `rainforest-mature` before WebP compression.

```text
Use case: precise-object-edit. Edit the reference landscape into another stage of the SAME ecosystem. Preserve exactly the camera position, lens, framing, stream or drainage channel, rocks, hills, lighting direction and colours. Preserve the large established trees at the edges and in the background: they are the existing surrounding ecosystem. Change the vegetation in the near and middle-ground regeneration area organically, with believable perspective, occlusion, plant bases hidden in real soil/litter and coherent shadows. Full bleed photorealistic nature photograph, same dimensions. No cutouts, isolated soil mounds, floating plants, garden planting rows, diorama, oversaturated colours, illustration, labels or text. NATURAL RENEWAL after the mature stage. Keep ALL mature trunks, palms, tall understory plants and landmarks of the reference in place, unchanged in size. Add visible irregular groups of new small fern fronds and young broadleaf seedlings on the stream banks and emerging from decomposing leaf litter near the existing moss-covered fallen log. Subtle new leaves on existing shrubs. The old fallen log is a little more moss covered, still in the same position and recognizable. Show different ages coexisting and natural ground cover, never crowded identical copies or a radically different forest.
```

### forest_meadow / early

Saved asset: [assets/images/ecosystem/habitats-v2/forest_meadow-early.webp](../../assets/images/ecosystem/habitats-v2/forest_meadow-early.webp).

Mode: built-in edit, referencing `forest_meadow-mature` before WebP compression.

```text
Use case: precise-object-edit. Edit the reference landscape into another stage of the SAME ecosystem. Preserve exactly the camera position, lens, framing, stream or drainage channel, rocks, hills, lighting direction and colours. Preserve the large established trees at the edges and in the background: they are the existing surrounding ecosystem. Change the vegetation in the near and middle-ground regeneration area organically, with believable perspective, occlusion, plant bases hidden in real soil/litter and coherent shadows. Full bleed photorealistic nature photograph, same dimensions. No cutouts, isolated soil mounds, floating plants, garden planting rows, diorama, oversaturated colours, illustration, labels or text. EARLY natural regeneration at the edge of an existing oak woodland. Preserve the great mature oak at left, far trees, hills, foreground branch and right pale rock. Make the near and middle meadow much simpler: mostly short mixed grasses, small patches of exposed earth and leaf litter near the old tree, just a handful of tiny oak and shrub seedlings partially hidden in the grasses. Remove the prominent flowering rose shrub and most flower heads; no mass flower meadow yet. Some dry grass and green low sprouts naturally mingle; still a real ecosystem, never an empty lawn. Do not change the large parent oak into a small tree: focus on the next generation taking root in the gap.
```

### forest_meadow / young

Saved asset: [assets/images/ecosystem/habitats-v2/forest_meadow-young.webp](../../assets/images/ecosystem/habitats-v2/forest_meadow-young.webp).

Mode: built-in edit, referencing `forest_meadow-mature` before WebP compression.

```text
Use case: precise-object-edit. Edit the reference landscape into another stage of the SAME ecosystem. Preserve exactly the camera position, lens, framing, stream or drainage channel, rocks, hills, lighting direction and colours. Preserve the large established trees at the edges and in the background: they are the existing surrounding ecosystem. Change the vegetation in the near and middle-ground regeneration area organically, with believable perspective, occlusion, plant bases hidden in real soil/litter and coherent shadows. Full bleed photorealistic nature photograph, same dimensions. No cutouts, isolated soil mounds, floating plants, garden planting rows, diorama, oversaturated colours, illustration, labels or text. YOUNG natural regeneration stage. Preserve the great old oak, hills, rock and fallen branch exactly. At the woodland edge in front of and beside the old tree, young oak/lime saplings and low developing wild rose/cornelian cherry shrubs now stand around knee to waist height, rooted within patchy mixed grasses, never isolated on soil circles. Meadow grasses become taller than early regrowth with modest scattered clover and white wildflowers but noticeably fewer flowers and smaller shrubs than in the mature reference. Keep the meadow centre/right open and the old oak dominant.
```

### forest_meadow / mature

Saved asset: [assets/images/ecosystem/habitats-v2/forest_meadow-mature.webp](../../assets/images/ecosystem/habitats-v2/forest_meadow-mature.webp).

Mode: built-in generation.

```text
Use case: photorealistic-natural. Asset type: complete ecosystem landscape for a nature learning app, mature stage, 16:9 landscape composition, ideally 2048x1152 or larger.
Create a clear documentary nature photograph of a mature temperate oak-and-lime woodland edge adjoining a biodiverse meadow in the Bulgarian foothills. One coherent real location, camera waist height, 28mm lens, detailed foreground and clear middle ground. An irregular mature oak stands left of centre with visible bark and roots disappearing into grass, mixed deciduous woodland continues on the left and in middle distance, a smaller lime and dog rose/cornelian cherry scrub blend into the edge. Open meadow occupies centre and right, gently rolling toward low wooded hills. Natural tufted grasses interspersed with modest patches of white yarrow, daisies and red clover; a few poppies only on sunny disturbed verge, flowers correctly small relative to trees. An old fallen branch partly hidden in the left foreground and a small pale rock at right foreground act as permanent landmarks. Asymmetric, naturally varied plant ages, clusters, gaps, foliage overlapping and hiding bases. Soft late-morning daylight from upper right, natural greens, soil contact shadows, leaf litter under trees, some dry grasses. Fine texture without exaggerated HDR, photographic realism, no heavy fog. Must look like an actual unmanaged woodland edge, not a manicured park or a lawn with isolated decorative trees.
Fixed-camera sequence composition: preserve enough open meadow at maturity, not a forest filling the entire image. No detached plants, cutouts, isolated soil mounds, floating roots, bonsai, toy diorama, cartoon, people, buildings, signs, text or logos. Full bleed photograph.
```

### forest_meadow / renewal

Saved asset: [assets/images/ecosystem/habitats-v2/forest_meadow-renewal.webp](../../assets/images/ecosystem/habitats-v2/forest_meadow-renewal.webp).

Mode: built-in edit, referencing `forest_meadow-mature` before WebP compression.

```text
Use case: precise-object-edit. Edit the reference landscape into another stage of the SAME ecosystem. Preserve exactly the camera position, lens, framing, stream or drainage channel, rocks, hills, lighting direction and colours. Preserve the large established trees at the edges and in the background: they are the existing surrounding ecosystem. Change the vegetation in the near and middle-ground regeneration area organically, with believable perspective, occlusion, plant bases hidden in real soil/litter and coherent shadows. Full bleed photorealistic nature photograph, same dimensions. No cutouts, isolated soil mounds, floating plants, garden planting rows, diorama, oversaturated colours, illustration, labels or text. NATURAL RENEWAL after maturity. Retain the old oak and mature shrub edge and all landmarks, camera and light. Show several new small irregular groups of oak seedlings and young shrubs growing beside the old fallen branch in the left foreground and along the woodland edge, partially concealed by grasses and leaf litter. Vary ages and leaf textures naturally. The right meadow remains open with mixed wildflowers and a few dry seed heads. Do not plant trees across all of the meadow, do not replace or shrink the old trees, do not turn it into an orchard.
```

### savanna / early

Saved asset: [assets/images/ecosystem/habitats-v2/savanna-early.webp](../../assets/images/ecosystem/habitats-v2/savanna-early.webp).

Mode: built-in edit, referencing `savanna-mature` before WebP compression.

```text
Use case: precise-object-edit. Edit the reference landscape into another stage of the SAME ecosystem. Preserve exactly the camera position, lens, framing, stream or drainage channel, rocks, hills, lighting direction and colours. Preserve the large established trees at the edges and in the background: they are the existing surrounding ecosystem. Change the vegetation in the near and middle-ground regeneration area organically, with believable perspective, occlusion, plant bases hidden in real soil/litter and coherent shadows. Full bleed photorealistic nature photograph, same dimensions. No cutouts, isolated soil mounds, floating plants, garden planting rows, diorama, oversaturated colours, illustration, labels or text. EARLY regeneration of the grassland patch. Keep the large established umbrella acacia left, distant baobab and all horizon/rock/branch/channel landmarks exactly the same. The foreground and middle-ground patch has much shorter, patchier grasses, a little more red soil and scattered tiny shrub and acacia seedlings, naturally spaced and barely above the grass. Remove the medium-size shrub in the centre and simplify dense tussocks while preserving plenty of real ground texture. Not a desert and not a barren platform; mix a few green shoots with dry grass stubble. Open spaces remain dominant.
```

### savanna / young

Saved asset: [assets/images/ecosystem/habitats-v2/savanna-young.webp](../../assets/images/ecosystem/habitats-v2/savanna-young.webp).

Mode: built-in edit, referencing `savanna-mature` before WebP compression.

```text
Use case: precise-object-edit. Edit the reference landscape into another stage of the SAME ecosystem. Preserve exactly the camera position, lens, framing, stream or drainage channel, rocks, hills, lighting direction and colours. Preserve the large established trees at the edges and in the background: they are the existing surrounding ecosystem. Change the vegetation in the near and middle-ground regeneration area organically, with believable perspective, occlusion, plant bases hidden in real soil/litter and coherent shadows. Full bleed photorealistic nature photograph, same dimensions. No cutouts, isolated soil mounds, floating plants, garden planting rows, diorama, oversaturated colours, illustration, labels or text. YOUNG natural regeneration stage. Keep the parent acacia, distant baobab, hills, dry swale, rocks and foreground branch unchanged. Add a modest number of established small acacia saplings and low bushes in the centre and along the drainage margin, naturally spaced, accompanied by recovering taller bunch grasses, a mix of green and straw colours. Young plants overlap grasses so all roots feel anchored. Smaller and less dense than the mature reference. The savanna stays mostly open grassland, with no wall of trees.
```

### savanna / mature

Saved asset: [assets/images/ecosystem/habitats-v2/savanna-mature.webp](../../assets/images/ecosystem/habitats-v2/savanna-mature.webp).

Mode: built-in generation.

```text
Use case: photorealistic-natural. Asset type: complete ecosystem landscape for a nature learning app, established stage, 16:9 landscape composition, ideally 2048x1152 or larger.
Create a highly clear documentary wildlife-landscape photograph of an established open East African savanna woodland and grassland. Camera waist height, 35mm lens, neutral daylight, natural colours. A mature umbrella thorn acacia left of centre with its roots naturally hidden in dry grasses; widely spaced thorn trees and a single baobab in the far midground right, all believable scale, never a row of specimens. Open grassland and low distant hills dominate with broad spaces between crowns. Mixture of straw coloured perennial tussocks, some green regrowth near a shallow dry drainage swale curving from foreground centre toward the right distance, red-brown soil visible between grasses, small scattered shrubs, fallen twigs, termite mound off to the far left. An angular low rock cluster in the right foreground and a bare weathered branch on the left are permanent landmarks for a fixed-camera growth sequence. Some grass tufts overlap trunks and contact shadows attach everything to ground. Mature savanna must STAY OPEN, not turn into a dense forest. Crisp authentic textures, no overprocessed saturation, no romantic orange filter or dramatic fog. No animals needed, no water river, no people, no buildings, no roads or fences, no text, no isolated pasted-in plant, no cutouts, no artificial soil islands, no bonsai, no toy diorama, no illustration. One coherent real-looking ecosystem photograph with depth and irregular natural distribution.
```

### savanna / renewal

Saved asset: [assets/images/ecosystem/habitats-v2/savanna-renewal.webp](../../assets/images/ecosystem/habitats-v2/savanna-renewal.webp).

Mode: built-in edit, referencing `savanna-mature` before WebP compression.

```text
Use case: precise-object-edit. Edit the reference landscape into another stage of the SAME ecosystem. Preserve exactly the camera position, lens, framing, stream or drainage channel, rocks, hills, lighting direction and colours. Preserve the large established trees at the edges and in the background: they are the existing surrounding ecosystem. Change the vegetation in the near and middle-ground regeneration area organically, with believable perspective, occlusion, plant bases hidden in real soil/litter and coherent shadows. Full bleed photorealistic nature photograph, same dimensions. No cutouts, isolated soil mounds, floating plants, garden planting rows, diorama, oversaturated colours, illustration, labels or text. NATURAL RENEWAL after maturity. Keep every established large tree and all camera/landscape landmarks. Add only a FEW small saplings, new grass shoots and low shrubs in the shelter of the parent tree and near the dry drainage line, naturally rooted and partially hidden by grasses. Different plant ages coexist with substantial open grassland and some bare soil. Do not increase tree density dramatically and never turn the savanna into a closed forest. The old acacia and baobab remain exactly as before.
```
