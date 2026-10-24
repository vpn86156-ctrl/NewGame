# Game data, localization and sprite attribution

The complete item, recipe, drop, shop and acquisition dataset and the four sprite sheets are adapted from
[Doeschi/Terraria-Progress-Tracker](https://github.com/Doeschi/Terraria-Progress-Tracker),
which builds them from the [Official Terraria Wiki](https://terraria.wiki.gg/).

- Source snapshot: Terraria 1.4.5, data version 2026-10-08.
- Source recipes: 3,655; source items: 6,186; every included item has its original sprite.
- Acquisition data: 488 enemy/container sources, NPC shops, conditions, biomes and obtain methods.
- Data and icon sheets license: [Creative Commons Attribution–NonCommercial–ShareAlike 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
- The compact catalog in `full-catalog.json` is distributed under the same CC BY-NC-SA 4.0 terms.
- Terraria and its original game sprites/text are © Re-Logic. This is an unofficial, non-commercial fan project.

The upstream project's code is MIT licensed; that license does not replace the wiki data and icon license.

## Russian localization

Russian item names and available item tooltips come from the Terraria game localization mirrors at
[dsafxP/terrariamuzz](https://github.com/dsafxP/terrariamuzz) and
[AWUTERRUS/Terraria_RU](https://github.com/AWUTERRUS/Terraria_RU). The primary mirror contains
5,425 matching Russian names for this catalog; untranslated items retain their real English names rather
than invented translations. Search accepts both languages and normalizes `ё`/`е` and punctuation.

Russian town-slime names and spawn descriptions were checked against the
[official Russian Terraria Wiki](https://terraria.wiki.gg/ru/wiki/%D0%93%D0%BE%D1%80%D0%BE%D0%B4%D1%81%D0%BA%D0%B8%D0%B5_%D1%81%D0%BB%D0%B8%D0%B7%D0%BD%D0%B8).

## NPCs and happiness

NPC preference data is based on the
[official NPC preferences table](https://terraria.wiki.gg/wiki/NPCs/preferences) and
[NPC happiness rules](https://terraria.wiki.gg/wiki/NPCs#Happiness), with a machine-readable cross-check from
[synchromic/terraria-npc-happiness](https://github.com/synchromic/terraria-npc-happiness).
The Guide and every NPC portrait use the original attributed sprite atlas, not substitute artwork.

The Enchanted Sword Shrine screenshot in `public/images/acquisition/` comes from the
[official Enchanted Sword Shrine page](https://terraria.wiki.gg/wiki/Enchanted_Sword_Shrine)
and is used under the same wiki attribution terms.

## Boss animations

The GIF animations in `public/images/bosses/` come from the corresponding boss pages on the Official Terraria Wiki: King Slime, Eye of Cthulhu, Brain of Cthulhu, Wall of Flesh, The Twins, Plantera, Golem, and Moon Lord. The static Skeletron and Lunatic Cultist frames are losslessly cropped from the same attributed sprite atlas. No fan-made or substitute boss artwork is used.
