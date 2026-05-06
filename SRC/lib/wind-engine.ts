export const VECTOR_LENGTH = 30;
const SECRET_KEY = 7.5;

export const AI_PROMPT = `You are a "Psychological Vector Engine" operator.

Core Logic:
- Zero-Flattery Mandate: No socially desirable results.
- Abstract Neutrality: Correct for "perfect" personas.
- Antagonistic Scaling: High in one extreme suppresses the opposite.
- Definitive Mapping: Avoid center (0.0). Take a stand.
- Multiply each value by 7.5.
- Create a raw JSON array of 30 numbers.
- Encode to Base64.
- Output ONLY Base64. No text.

The 30 Dimensions (Order Critical):
1.Logical Thinking(+) vs Intuitive Feeling(-)
2.Methodological Skepticism(+) vs Blind Faith(-)
3.Intellectual Precision(+) vs Generalization(-)
4.Existential Reflection(+) vs Materialistic Focus(-)
5.Philosophical Depth(+) vs Superficiality(-)
6.Search for Meaning(+) vs Pursuit of Utility(-)
7.Non-Conformity(+) vs Social Compliance(-)
8.Intellectual Audacity(+) vs Intellectual Caution(-)
9.Breaking Patterns(+) vs Adhering to Norms(-)
10.Empathy(+) vs Emotional Detachment(-)
11.Kindness(+) vs Harshness(-)
12.Emotional Understanding(+) vs Emotional Blindness(-)
13.Lust for Knowledge(+) vs Contentment with Ignorance(-)
14.Humility(+) vs Arrogance/Ego(-)
15.Emotional Purity(+) vs Narcissism/Selfishness(-)
16.Artistic Creativity(+) vs Literal Thinking(-)
17.Symbolic Imagination(+) vs Concrete Realism(-)
18.Aesthetic Sensitivity(+) vs Aesthetic Indifference(-)
19.Self-Monitoring(+) vs Lack of Self-Awareness(-)
20.Emotional Intelligence(+) vs Reactive Impulsivity(-)
21.Internal Honesty(+) vs Self-Deception(-)
22.Grit/Willpower(+) vs Fragility(-)
23.Self-Discipline(+) vs Self-Indulgence(-)
24.Long-term Vision(+) vs Short-term Gratification(-)
25.Social Openness(+) vs Social Reclusiveness(-)
26.Collective Loyalty(+) vs Individualistic Isolation(-)
27.Communicative Simplicity(+) vs Communicative Complexity(-)
28.Creative Chaos(+) vs Rigid Order(-)
29.Spontaneity(+) vs Calculated Reserve(-)
30.Mood Stability(+) vs High Volatility(-)`;

function sanitizeDecodedJson(raw: string): string {
  let s = raw.replace(/(\r\n|\n|\r)/g, "");
  s = s.replace(/[^\x00-\x7F]+/g, "");
  return s;
}

export function processUserVector(encodedBase64: string): number[] | null {
  try {
    const decodedString = atob(encodedBase64.trim());
    const sanitized = sanitizeDecodedJson(decodedString);
    const encryptedArray = JSON.parse(sanitized);

    if (!Array.isArray(encryptedArray) || encryptedArray.length !== VECTOR_LENGTH) {
      return null;
    }

    return encryptedArray.map((num: number) => {
      if (num === null || num === undefined) return 0;
      const decoded = num / SECRET_KEY;
      if (!isFinite(decoded) || decoded < -50 || decoded > 50) return 0;
      return Math.round(decoded * 10000) / 10000;
    });
  } catch {
    return null;
  }
}

export function calculateMatchPercentage(
  vectorA: number[],
  vectorB: number[],
  priorities?: Record<string, number>
): number {
  const len = Math.min(vectorA.length, vectorB.length);
  if (len === 0) return 0;

  let weightedDistance = 0;
  let totalWeight = 0;
  let knownPairs = 0;
  const RANGE = 10;

  for (let i = 0; i < len; i++) {
    const a = vectorA[i];
    const b = vectorB[i];
    if (a === undefined || b === undefined) continue;

    const w = priorities ? (priorities[String(i)] ?? 1) : 1;
    const diff = Math.abs(a - b) / RANGE;
    const clipped = Math.min(1, diff);
    weightedDistance += clipped * w;
    totalWeight += w;
    knownPairs++;
  }

  if (totalWeight === 0 || knownPairs < 6) {
    return knownPairs === 0 ? 0 : Math.max(15, knownPairs * 5);
  }

  const avgDist = weightedDistance / totalWeight;
  const logistic = 1 / (1 + Math.exp(12 * (avgDist - 0.3)));
  const percentage = Math.round(logistic * 10000) / 100;
  return Math.min(100, Math.max(0, percentage));
}
