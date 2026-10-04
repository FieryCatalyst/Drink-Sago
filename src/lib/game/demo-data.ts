export type Venue = {
  id: string;
  name: string;
  city: string;
  country: string;
};

export type GameSymbol = {
  name: string;
  image: string;
  subtitle: string;
};

export type RewardTier = {
  tier: "HIGH" | "MID+" | "MID" | "LOW+" | "LOW";
  probabilityTarget: number;
  outcomeCount: number;
  actualProbability: number;
  rewardReveal: string;
  bottleDiscount: number;
  shotDiscount: number;
  notes: string;
};

export const SAGO_REWARD_HIERARCHY: RewardTier[] = [
  {
    tier: "HIGH",
    probabilityTarget: 2,
    outcomeCount: 2,
    actualProbability: 1.6,
    rewardReveal: "PREMIUM",
    bottleDiscount: 25,
    shotDiscount: 50,
    notes: "Premium jackpot tier",
  },
  {
    tier: "MID+",
    probabilityTarget: 8,
    outcomeCount: 10,
    actualProbability: 8.0,
    rewardReveal: "20% discount",
    bottleDiscount: 20,
    shotDiscount: 25,
    notes: "Near-jackpot reward; shot treatment not specified",
  },
  {
    tier: "MID",
    probabilityTarget: 15,
    outcomeCount: 19,
    actualProbability: 15.2,
    rewardReveal: "15% discount",
    bottleDiscount: 15,
    shotDiscount: 20,
    notes: "Stronger fortune / stronger combination",
  },
  {
    tier: "LOW+",
    probabilityTarget: 30,
    outcomeCount: 38,
    actualProbability: 30.4,
    rewardReveal: "10% discount",
    bottleDiscount: 10,
    shotDiscount: 15,
    notes: "Bridge reward; shot treatment not specified in brief",
  },
  {
    tier: "LOW",
    probabilityTarget: 45,
    outcomeCount: 56,
    actualProbability: 44.8,
    rewardReveal: "5% discount",
    bottleDiscount: 5,
    shotDiscount: 10,
    notes: "Most common reward",
  },
];

export const DEMO_VENUES: Venue[] = [
  { id: "venue-jhb-01", name: "The Onyx Lounge", city: "Johannesburg", country: "South Africa" },
  { id: "venue-cpt-02", name: "The Grand Safari Bar", city: "Cape Town", country: "South Africa" },
  { id: "venue-lua-03", name: "Club Cabo Lounge", city: "Luanda", country: "Angola" },
  { id: "venue-nbi-04", name: "Skyline Botanical", city: "Nairobi", country: "Kenya" },
  { id: "venue-hre-05", name: "The Copper Terrace", city: "Harare", country: "Zimbabwe" },
  { id: "venue-wdh-06", name: "Le Mirage Velvet Bar", city: "Windhoek", country: "Namibia" },
  { id: "venue-mpm-07", name: "Breeze Lounge", city: "Maputo", country: "Mozambique" },
];

export const BIG_5_SYMBOLS: GameSymbol[] = [
  { name: "Lion", image: "/assets/LION.svg", subtitle: "King of the Pour" },
  { name: "Leopard", image: "/assets/LEOPARD.svg", subtitle: "Grace & Mystery" },
  { name: "Elephant", image: "/assets/ELEPHANT.svg", subtitle: "Majestic Power" },
  { name: "Rhino", image: "/assets/Rhinoceros.svg", subtitle: "Unstoppable Force" },
  { name: "Cape buffalo", image: "/assets/Cape buffalo.svg", subtitle: "Untamed Spirit" },
];

export const ANIMAL_WEIGHTS: Record<string, number> = {
  Lion: 5,
  Leopard: 4,
  Elephant: 3,
  Rhino: 2,
  "Cape buffalo": 1,
};

export type ClassifiedOutcome = {
  combo: [string, string, string];
  patternClass: "triple_match" | "pair_match" | "three_unique";
  score: number;
  tierInfo: RewardTier;
};

// Pre-compute all 125 outcomes (5^3) ranked strictly by hierarchy rule:
// triple_match > pair_match > three_unique, sorted by animal weights.
function buildAllRankedOutcomes(): ClassifiedOutcome[] {
  const names = BIG_5_SYMBOLS.map((s) => s.name);
  type RawOutcome = {
    combo: [string, string, string];
    classRank: number; // 3: triple, 2: pair, 1: unique
    patternClass: "triple_match" | "pair_match" | "three_unique";
    score: number;
  };

  const all: RawOutcome[] = [];

  for (const s1 of names) {
    for (const s2 of names) {
      for (const s3 of names) {
        const unique = new Set([s1, s2, s3]);
        if (unique.size === 1) {
          all.push({
            combo: [s1, s2, s3],
            classRank: 3,
            patternClass: "triple_match",
            score: 1000 + (ANIMAL_WEIGHTS[s1] || 0) * 10,
          });
        } else if (unique.size === 2) {
          const paired = s1 === s2 || s1 === s3 ? s1 : s2;
          const kicker = s1 === s2 ? s3 : s1 === s3 ? s2 : s1;
          all.push({
            combo: [s1, s2, s3],
            classRank: 2,
            patternClass: "pair_match",
            score: 100 + (ANIMAL_WEIGHTS[paired] || 0) * 10 + (ANIMAL_WEIGHTS[kicker] || 0),
          });
        } else {
          all.push({
            combo: [s1, s2, s3],
            classRank: 1,
            patternClass: "three_unique",
            score: (ANIMAL_WEIGHTS[s1] || 0) + (ANIMAL_WEIGHTS[s2] || 0) + (ANIMAL_WEIGHTS[s3] || 0),
          });
        }
      }
    }
  }

  // Sort descending: highest class first, then highest score within class
  all.sort((a, b) => {
    if (a.classRank !== b.classRank) return b.classRank - a.classRank;
    return b.score - a.score;
  });

  // Assign tiers according to the 125 outcomes partition:
  // HIGH: 2 outcomes (indices 0..1) -> 1.60%
  // MID+: 10 outcomes (indices 2..11) -> 8.00%
  // MID:  19 outcomes (indices 12..30) -> 15.20%
  // LOW+: 38 outcomes (indices 31..68) -> 30.40%
  // LOW:  56 outcomes (indices 69..124) -> 44.80%
  return all.map((item, index) => {
    let tierInfo: RewardTier;
    if (index < 2) {
      tierInfo = SAGO_REWARD_HIERARCHY[0]; // HIGH
    } else if (index < 12) {
      tierInfo = SAGO_REWARD_HIERARCHY[1]; // MID+
    } else if (index < 31) {
      tierInfo = SAGO_REWARD_HIERARCHY[2]; // MID
    } else if (index < 69) {
      tierInfo = SAGO_REWARD_HIERARCHY[3]; // LOW+
    } else {
      tierInfo = SAGO_REWARD_HIERARCHY[4]; // LOW
    }
    return {
      combo: item.combo,
      patternClass: item.patternClass,
      score: item.score,
      tierInfo,
    };
  });
}

export const ALL_125_RANKED_OUTCOMES: ClassifiedOutcome[] = buildAllRankedOutcomes();

export function drawOutcomeFromHierarchy(): ClassifiedOutcome {
  const randomIndex = Math.floor(Math.random() * ALL_125_RANKED_OUTCOMES.length);
  return ALL_125_RANKED_OUTCOMES[randomIndex];
}

export function generateCouponCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `SAGO-${part(4)}-${part(4)}`;
}
