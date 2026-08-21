/* ────────────────────────────────────────────────────────────
   PROJECT DATA — single source of truth
   ────────────────────────────────────────────────────────────
   Bilder liegen unter public/images/projects/<id>/.
   Reihenfolge in diesem Array = Reihenfolge auf der Seite.

   w/h sind die echten Pixelmasse des Bildes. Sie verhindern
   Layout-Sprünge beim Laden und steuern, ob ein Bild als
   Hoch- oder Querformat gesetzt wird.
   ──────────────────────────────────────────────────────────── */

export interface ProjectShot {
  /** Pfad relativ zu /public */
  src: string;
  /** Bildunterschrift */
  caption?: string;
  /** echte Bildbreite in px */
  w: number;
  /** echte Bildhöhe in px */
  h: number;
  /** Video statt Bild */
  video?: boolean;
  /** Standbild fuer Videos (erstes Bild, waehrend es laedt) */
  poster?: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  filterCategory: string;
  role?: string;
  year?: string;
  featured?: boolean;
  /** Software / Pipeline — wird als Badges angezeigt */
  tools: string[];
  description: string;
  longDescription?: string;
  /** Alle Screenshots. Der erste ist das Cover. */
  shots: ProjectShot[];
  /** Optional: Quellmaterial einer Montage (ausklappbare Leiste) */
  sources?: ProjectShot[];
  /** Optional: ziehbarer Vergleich zweier Ansichten.
      ACHTUNG: Beide Bilder muessen aus derselben Kamera stammen,
      sonst springt das Bild beim Ziehen. */
  compare?: {
    before: ProjectShot;
    after: ProjectShot;
    beforeLabel?: string;
    afterLabel?: string;
    /** Erklaerung unter dem Regler, wenn der Unterschied subtil ist */
    note?: string;
  };
  /** Polygonzahlen aus dem Maya-HUD — werden hochgezaehlt */
  stats?: { verts: number; tris: number };
  /** Kehrt die Sektion auf hellen Grund um (Kontrastbruch) */
  invert?: boolean;
  /** Optional: scrollgesteuerte Bildfolge (Drehung) */
  sequence?: { frames: string[]; ratio: number; caption?: string };
  /** "stack" (Standard) = grosse Bilder untereinander.
      "grid" = kompaktes Raster — passend fuer App-Screenshots,
      die sonst neben den grossen Renders unruhig wirken. */
  layout?: "stack" | "grid";
}

export const coverOf = (p: Project): string | null => p.shots[0]?.src ?? null;

export const projectsData: Project[] = [
  {
    id: "futuristic-bunker",
    stats: { verts: 742687, tris: 1447482 },
    title: "Futuristic Bunker",
    category: "Sci-Fi Environment",
    filterCategory: "3D Modeling",
    role: "3D Environment Artist",
    year: "2026",
    featured: true,
    tools: ["Autodesk Maya", "Substance Painter", "Arnold"],
    description:
      "A sci-fi control bay built from scratch — stasis capsules, console banks and emissive panel work.",
    longDescription:
      "A complete sci-fi interior modelled and textured from scratch. The scene centres on a bank of stasis capsules with emissive interiors, surrounded by control consoles and hard surface panelling. Materials were authored in Substance Painter with a focus on layered wear, brushed metal and the cyan and magenta emissives that carry the lighting. Shown here as the final Arnold render alongside the untextured viewport and the full wireframe.",
    shots: [
      { src: "/images/projects/futuristic-bunker/01.jpg", caption: "Final render", w: 1920, h: 1080 },
      { src: "/images/projects/futuristic-bunker/02.jpg", caption: "Stasis capsules — detail", w: 1920, h: 1080 },
      { src: "/images/projects/futuristic-bunker/03.jpg", caption: "Console bank — detail", w: 1920, h: 1080 },
      { src: "/images/projects/futuristic-bunker/04.jpg", caption: "Maya viewport", w: 1272, h: 685 },
      { src: "/images/projects/futuristic-bunker/05.jpg", caption: "Wireframe", w: 1270, h: 679 },
    ],
  },
  {
    id: "robot-study",
    stats: { verts: 7852, tris: 15029 },
    title: "Robot Study",
    category: "Character Art / Fan Study",
    filterCategory: "Character Art",
    role: "3D Character Artist",
    year: "2026",
    featured: true,
    tools: ["Autodesk Maya", "Substance Painter", "Arnold"],
    description:
      "A stylised robot character built as a personal fan study — modelled, textured and kept game-ready.",
    longDescription:
      "A personal fan study of a stylised robot character, inspired by the anthology series Love, Death & Robots. Modelled from scratch in Maya — helmet, articulated limbs and the small mechanical joints that let a chunky silhouette still read as posable. The mesh lands at roughly 7,900 vertices and 15,000 triangles, kept deliberately light so it stays game-ready. Drag the slider to see the topology underneath.",
    shots: [],
    /* Scrollgesteuerte Drehung — siehe scroll-sequence.tsx */
    sequence: {
      frames: [
        "/images/projects/robot-study/seq/f001.jpg",
        "/images/projects/robot-study/seq/f002.jpg",
        "/images/projects/robot-study/seq/f003.jpg",
        "/images/projects/robot-study/seq/f004.jpg",
        "/images/projects/robot-study/seq/f005.jpg",
        "/images/projects/robot-study/seq/f006.jpg",
        "/images/projects/robot-study/seq/f007.jpg",
        "/images/projects/robot-study/seq/f008.jpg",
        "/images/projects/robot-study/seq/f009.jpg",
        "/images/projects/robot-study/seq/f010.jpg",
        "/images/projects/robot-study/seq/f011.jpg",
        "/images/projects/robot-study/seq/f012.jpg",
        "/images/projects/robot-study/seq/f013.jpg",
        "/images/projects/robot-study/seq/f014.jpg",
        "/images/projects/robot-study/seq/f015.jpg",
        "/images/projects/robot-study/seq/f016.jpg",
        "/images/projects/robot-study/seq/f017.jpg",
        "/images/projects/robot-study/seq/f018.jpg",
        "/images/projects/robot-study/seq/f019.jpg",
        "/images/projects/robot-study/seq/f020.jpg",
        "/images/projects/robot-study/seq/f021.jpg",
        "/images/projects/robot-study/seq/f022.jpg",
        "/images/projects/robot-study/seq/f023.jpg",
        "/images/projects/robot-study/seq/f024.jpg",
        "/images/projects/robot-study/seq/f025.jpg",
        "/images/projects/robot-study/seq/f026.jpg",
        "/images/projects/robot-study/seq/f027.jpg",
        "/images/projects/robot-study/seq/f028.jpg",
        "/images/projects/robot-study/seq/f029.jpg",
        "/images/projects/robot-study/seq/f030.jpg",
        "/images/projects/robot-study/seq/f031.jpg",
        "/images/projects/robot-study/seq/f032.jpg",
        "/images/projects/robot-study/seq/f033.jpg",
      ],
      ratio: 560 / 629,
      caption: "Shaded — scroll to rotate",
    },
    compare: {
      before: { src: "/images/projects/robot-study/01.jpg", caption: "Shaded", w: 1094, h: 681 },
      after: { src: "/images/projects/robot-study/02.jpg", caption: "Wireframe", w: 1096, h: 680 },
      beforeLabel: "Shaded",
      afterLabel: "Wireframe",
      note: "7,852 verts · 12,235 faces · 15,029 tris. The wireframe shows where that budget went: dense enough around the joints and helmet curve to deform and catch light cleanly, sparse everywhere it would not be noticed.",
    },
  },
  {
    id: "apocalypse",
    stats: { verts: 5118889, tris: 6799929 },
    title: "Apocalypse",
    category: "Environment Art",
    filterCategory: "3D Modeling",
    role: "3D Environment Artist",
    year: "2025",
    featured: true,
    tools: ["Autodesk Maya", "Substance Painter", "Arnold"],
    description:
      "A post-apocalyptic homestead — weathered corrugated metal, overgrown grass and a wrecked car.",
    longDescription:
      "A post-apocalyptic exterior scene built around a decaying homestead. The focus was on believable material decay: rusted corrugated sheeting, sun-bleached timber and peeling paint, all authored in Substance Painter. Vegetation was scattered to reclaim the structure and a wrecked car anchors the story. A second shelter structure was modelled as a companion asset, shown here in viewport and wireframe.",
    shots: [
      { src: "/images/projects/apocalypse/01.jpg", caption: "Final render", w: 1280, h: 720 },
      { src: "/images/projects/apocalypse/02.jpg", caption: "Maya viewport", w: 1270, h: 681 },
      { src: "/images/projects/apocalypse/03.jpg", caption: "Wireframe", w: 1270, h: 681 },
      { src: "/images/projects/apocalypse/04.jpg", caption: "Shelter — viewport", w: 1267, h: 680 },
      { src: "/images/projects/apocalypse/05.jpg", caption: "Shelter — wireframe", w: 1269, h: 684 },
    ],
  },
  {
    id: "character-studies",
    stats: { verts: 236039, tris: 467765 },
    title: "Character Studies",
    category: "Character Modeling & Grooming",
    filterCategory: "Character Art",
    role: "3D Character Artist",
    year: "2025",
    tools: ["Autodesk Maya", "Substance Painter", "XGen", "Arnold"],
    description:
      "Full-body character modelling plus an XGen grooming study and facial topology breakdown.",
    longDescription:
      "Two character studies side by side. The male character was modelled, UV'd and textured as a complete figure, shown from final render through to the underlying wireframe. The second study focuses on hair: a full XGen groom built with guide curves and density maps, rendered in Arnold. The final breakdown shows facial topology including the interior mouth, teeth and tongue — the parts that decide whether a face deforms cleanly.",
    shots: [
      { src: "/images/projects/character-studies/01.jpg", caption: "Male character — final render", w: 960, h: 540 },
      { src: "/images/projects/character-studies/02.jpg", caption: "Male character — viewport", w: 1276, h: 679 },
      { src: "/images/projects/character-studies/03.jpg", caption: "Male character — wireframe", w: 1266, h: 673 },
      { src: "/images/projects/character-studies/04.jpg", caption: "XGen groom — final render", w: 1059, h: 653 },
      { src: "/images/projects/character-studies/05.jpg", caption: "XGen groom — viewport", w: 938, h: 699 },
      { src: "/images/projects/character-studies/06.jpg", caption: "Facial topology & mouth interior", w: 1920, h: 1016 },
    ],
  },
  {
    id: "isometric-room",
    stats: { verts: 186633, tris: 261318 },
    title: "Isometric Room",
    category: "Interior / Prop Set",
    filterCategory: "3D Modeling",
    role: "3D Artist",
    year: "2024",
    tools: ["Autodesk Maya", "Substance Painter", "Arnold"],
    description:
      "A warm isometric interior — every prop hand-modelled, from the fireplace to the bookshelf.",
    longDescription:
      "A cutaway isometric interior built as a single cohesive prop set. Every object in the room was modelled by hand: fireplace, seating, shelving, plants and the small dressing that makes a space feel lived in. The fixed isometric camera meant composition had to be resolved in the layout stage rather than in post — object placement, silhouette separation and colour blocking all had to read from one angle.",
    shots: [
      { src: "/images/projects/isometric-room/01.jpg", caption: "Final render", w: 960, h: 540 },
    ],
    compare: {
      before: { src: "/images/projects/isometric-room/02.jpg", caption: "Maya viewport", w: 1272, h: 683 },
      after: { src: "/images/projects/isometric-room/03.jpg", caption: "Wireframe", w: 1272, h: 685 },
      beforeLabel: "Shaded",
      afterLabel: "Wireframe",
    },
  },
  {
    id: "asset-studies",
    stats: { verts: 10145, tris: 20000 },
    title: "Asset & Texturing Studies",
    category: "Hard Surface / UV & PBR",
    filterCategory: "Texturing",
    role: "3D Asset & Texture Artist",
    year: "2024",
    tools: ["Autodesk Maya", "Substance Painter", "Arnold"],
    description:
      "A set of standalone props taken through the full pipeline — modelling, UV layout and PBR texturing.",
    longDescription:
      "A collection of individual assets used to drill the full pipeline end to end. Each prop was modelled clean, unwrapped with an eye on texel density and packing efficiency, then textured in Substance Painter. The UV layouts are included deliberately — packing quality is invisible in a beauty render but it's what decides whether an asset is production-ready or not.",
    shots: [
      { src: "/images/projects/asset-studies/03.jpg", caption: "Fireplace — Substance Painter", w: 954, h: 632 },
      { src: "/images/projects/asset-studies/04.jpg", caption: "Tool set — shaded", w: 1272, h: 683 },
      { src: "/images/projects/asset-studies/05.jpg", caption: "Tool set — wireframe", w: 1263, h: 680 },
      { src: "/images/projects/asset-studies/06.jpg", caption: "UV layout — pickaxe", w: 1467, h: 604 },
      { src: "/images/projects/asset-studies/07.jpg", caption: "UV layout — hard surface", w: 1416, h: 680 },
    ],
    compare: {
      before: { src: "/images/projects/asset-studies/01.jpg", caption: "Security camera — shaded", w: 1269, h: 680 },
      after: { src: "/images/projects/asset-studies/02.jpg", caption: "Security camera — wireframe", w: 1267, h: 680 },
      beforeLabel: "Shaded",
      afterLabel: "Wireframe",
    },
  },
  {
    id: "i-need-space",
    invert: true,
    title: "I Need Space",
    category: "Film Poster / Compositing",
    filterCategory: "Graphic Design",
    role: "Design & Compositing",
    year: "2025",
    featured: true,
    tools: ["Adobe Photoshop"],
    description:
      "A film poster built to carry a single emotion — lostness — through composition, colour and type.",
    longDescription:
      "A course project at Hochschule Emden/Leer with one brief: trigger a specific emotion using a single static image. The chosen emotion was lostness, and the poster answers it with a lone astronaut adrift against the curve of Earth. The composite layers a desaturated, blue-shifted Milky Way base, a masked and colour-graded Earth, an astronaut extracted with luminance masks, and debris pulled from an explosion plate using a lighten blend. The title plays on both readings of the phrase — physical space, and the need for distance.",
    shots: [],
    compare: {
      before: { src: "/images/projects/i-need-space/01.jpg", caption: "RGB", w: 1559, h: 2200 },
      after: { src: "/images/projects/i-need-space/02.jpg", caption: "CMYK", w: 1559, h: 2200 },
      beforeLabel: "RGB — screen",
      afterLabel: "CMYK — print",
      note: "Same artwork, two colour spaces. RGB is made of light and reaches a wider gamut — that is what a screen shows you. CMYK is made of ink and cannot get there, so the deep blues and the glow around the Earth sit back a little and the blacks warm up. Converting and correcting before print is what stops a poster from arriving duller than it was designed to be.",
    },
    sources: [
      { src: "/images/projects/i-need-space/source/01.jpg", caption: "Milky Way — base plate", w: 624, h: 416 },
      { src: "/images/projects/i-need-space/source/02.jpg", caption: "Earth", w: 624, h: 352 },
      { src: "/images/projects/i-need-space/source/03.jpg", caption: "Astronaut", w: 624, h: 416 },
      { src: "/images/projects/i-need-space/source/04.jpg", caption: "Satellite", w: 624, h: 468 },
      { src: "/images/projects/i-need-space/source/05.jpg", caption: "Explosion / debris", w: 624, h: 416 },
    ],
  },
  {
    id: "bloomest",
    title: "Bloomest",
    category: "Corporate Design / Print",
    filterCategory: "Graphic Design",
    role: "Graphic Designer",
    year: "2026",
    tools: ["Adobe InDesign", "Adobe Illustrator", "Adobe Photoshop"],
    description:
      "A print campaign for a smart laundry brand — window posters, A2 sheets and an in-store info series.",
    longDescription:
      "A campaign system for Bloomest, a self-service smart laundry. The work runs across three formats: large A1 window posters that have to land from the pavement, A2 posters for closer reading, and a landscape A5 in-store series carrying practical information. The system holds together through a strict typographic hierarchy, a restrained red accent against light and dark variants, and an outline icon language that keeps the tone friendly without going decorative.",
    shots: [
      { src: "/images/projects/bloomest/01.jpg", caption: "A1 window — 48 Minuten", w: 1554, h: 2200 },
      { src: "/images/projects/bloomest/02.jpg", caption: "A1 window — Beste Bewertung", w: 1554, h: 2200 },
      { src: "/images/projects/bloomest/03.jpg", caption: "A2 poster — Hygiene", w: 1556, h: 2200 },
    ],
  },

  {
    id: "web-products",
    title: "Web Products",
    category: "Full-Stack / Front-End",
    filterCategory: "Development",
    role: "Solo Designer & Developer",
    year: "2026",
    layout: "grid",
    tools: [
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Express.js",
      "HTML",
      "CSS",
      "JavaScript",
    ],
    description:
      "Two products designed, built and shipped solo — a language-learning app and a marketplace site.",
    longDescription:
      "Two self-built products. KI Lesebuch is a full-stack language-learning web app: short stories where every sentence opens its translation, a grammar panel breaks down word function and tense, and individual words reveal synonyms and examples — generated across several languages and CEFR levels. Qrib is a Tunisian services marketplace; I built its nineteen-page public site in plain HTML, CSS and JavaScript, in French, English and Arabic, responsive down to phone width. Design, front-end and back-end on both.",
    shots: [
      { src: "/images/projects/ki-lesebuch/04.jpg", caption: "KI Lesebuch — story reader", w: 808, h: 864 },
      { src: "/images/projects/ki-lesebuch/06.jpg", caption: "KI Lesebuch — grammar breakdown", w: 929, h: 855 },
      { src: "/images/projects/ki-lesebuch/07.jpg", caption: "KI Lesebuch — word detail", w: 878, h: 851 },
      { src: "/images/projects/ki-lesebuch/03.jpg", caption: "KI Lesebuch — language & level", w: 603, h: 645 },
      { src: "/images/projects/qrib-web/01.jpg", caption: "Qrib — landing", w: 2000, h: 1250 },
      { src: "/images/projects/qrib-web/02.jpg", caption: "Qrib — the profile as product", w: 2000, h: 1250 },
      { src: "/images/projects/qrib-web/04.jpg", caption: "Qrib — trust model", w: 2000, h: 1250 },
    ],
  },
];
