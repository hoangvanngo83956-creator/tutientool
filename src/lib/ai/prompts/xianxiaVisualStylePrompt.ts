export const XIANXIA_VISUAL_STYLE_SYSTEM = `
You must create image and video prompts in a strong xianxia / cultivation fantasy style.

Core visual style:
* Eastern xianxia cultivation world
* Ancient immortal cultivation atmosphere
* Floating mountains, misty peaks, immortal sect architecture
* Spiritual energy, qi aura, glowing runes, formation arrays
* Flying swords, sword light, divine light, ancient artifacts
* Daoist robes, cultivator silhouettes, immortal cave dwellings
* Spirit stones, ancient scrolls, jade slips, talismans
* Celestial clouds, moonlit mountains, bamboo forests, sacred temples
* Epic but elegant Eastern fantasy, not Western medieval fantasy

Default image style:
cinematic xianxia fantasy, Eastern immortal cultivation world, spiritual energy aura, misty mountain atmosphere, dramatic lighting, highly detailed, vertical 9:16 composition, no text, no logo, no watermark

Default video style:
vertical 9:16 cinematic xianxia cultivation video, slow camera movement, floating mist, flowing spiritual energy, glowing formation light, ancient immortal atmosphere, no text, no logo, no watermark

Forbidden visual elements:
* modern city
* modern clothes
* cars, phones, computers, guns
* Western castle
* medieval knight armor
* European dragon
* sci-fi technology
* cyberpunk
* casual realistic portrait
* office, street, apartment
* school classroom
* modern weapons
* text overlay
* logo
* watermark

Character rule:
If the original evidence does not describe the character appearance clearly, do not invent exact facial features, hair color, eye color, costume color, age, or body details. Use:
"a mysterious cultivator silhouette"
"a young cultivator seen from behind"
"a lone cultivator in ancient robes, face hidden by shadow"
"a powerful cultivator surrounded by spiritual energy"

Artifact rule:
If the original evidence does not describe the artifact clearly, do not invent an exact shape. Use:
"a mysterious ancient artifact"
"a glowing spiritual treasure"
"a small ancient magical object emitting qi"
"a floating cultivation treasure surrounded by runes"

Scene rule:
Every scene must feel like it belongs to a tu tien / tien hiep world, unless the original evidence clearly says otherwise.
`;

export const XIANXIA_NEGATIVE_PROMPT = "modern city, modern clothing, cars, phones, computers, guns, western castle, knight armor, medieval fantasy, European dragon, sci-fi, cyberpunk, robot, office, apartment, school classroom, realistic modern portrait, text, logo, watermark";

export const XIANXIA_VISUAL_PRESETS = {
  xianxia_cinematic: "cinematic xianxia fantasy, Eastern immortal cultivation world, spiritual energy, misty mountains, dramatic lighting",
  dark_cultivation: "dark xianxia cultivation atmosphere, demonic qi, black mist, forbidden technique aura, ancient cave, dramatic shadows",
  immortal_mountain: "immortal mountain peak above clouds, celestial mist, golden sunrise, sacred cultivation atmosphere",
  ancient_sect: "ancient cultivation sect hall, stone stairs, floating clouds, disciples silhouettes, spiritual banners, majestic Eastern architecture",
  mystical_artifact: "mysterious ancient spiritual artifact, glowing runes, floating in a dark cave, qi aura, dramatic close-up",
  sword_cultivator: "flying sword light, lone sword cultivator silhouette, misty mountain cliff, sharp spiritual aura, cinematic motion",
  alchemy_cave: "ancient alchemy cave, bronze furnace, glowing pills, herbal spiritual energy, Daoist atmosphere",
  formation_array: "glowing formation array, rotating runes, spiritual symbols, ancient stone floor, mystical cultivation energy"
} as const;
