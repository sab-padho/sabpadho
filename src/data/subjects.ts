import type { Bilingual } from '../lib/lang'

export type SubjectId = 'maths' | 'reasoning' | 'english' | 'gk' | 'hindi'

export type Chapter = {
  id: string
  subjectId: SubjectId
  slug: string
  title: Bilingual
  blurb: string
  outline: string[]
  attempts: number | null
  accuracy: number | null
  minutes: number
}

export type Subject = {
  id: SubjectId
  slug: string
  name: Bilingual
  short: string
  code: string
  tint: 'violet' | 'plum' | 'teal' | 'amber' | 'rose'
  tagline: string
  description: string
  chapters: Chapter[]
  accuracy: number
  paperSection: string
}

const chapter = (
  subjectId: SubjectId,
  slug: string,
  title: Bilingual,
  blurb: string,
  outline: string[],
  attempts: number | null,
  accuracy: number | null,
  minutes = 12,
): Chapter => ({
  id: `${subjectId}-${slug}`,
  subjectId,
  slug,
  title,
  blurb,
  outline,
  attempts,
  accuracy,
  minutes,
})

export const subjects: Subject[] = [
  {
    id: 'maths',
    slug: 'maths',
    name: { en: 'Quantitative Aptitude', hi: 'गणित' },
    short: 'Maths',
    code: 'QA',
    tint: 'violet',
    tagline: 'Percentages, profit & loss, time & work',
    description:
      'Short-cut methods for the topics that repeat in every paper. Each solution shows the working, not just the final option.',
    accuracy: 68,
    paperSection: 'Quantitative Aptitude',
    chapters: [
      chapter(
        'maths',
        'percentages',
        { en: 'Percentages', hi: 'प्रतिशत' },
        'Fraction conversion, successive change and the base-value trap.',
        [
          'Percentage as a fraction of 100, and the fractions worth memorising',
          'Increase, decrease and successive changes',
          'Discounts, marked price and effective change',
          'Finding the base value when the percentage is known',
        ],
        5,
        62,
        12,
      ),
      chapter(
        'maths',
        'profit-loss',
        { en: 'Profit & loss', hi: 'लाभ और हानि' },
        'Cost price, marked price, discount and effective profit.',
        [
          'Cost price, selling price and the profit percentage formula',
          'Marked price and discount as separate steps',
          'Successive discounts and a single equivalent discount',
          'Loss percentage and finding the cost price',
        ],
        3,
        70,
        14,
      ),
      chapter(
        'maths',
        'time-work',
        { en: 'Time & work', hi: 'समय और कार्य' },
        'Work rates, combined effort and the remaining-work question.',
        [
          'One day’s work as a fraction of the total',
          'Two workers together, and finding one worker’s rate',
          'Work left after a few days of combined effort',
          'Men, days and the inverse relationship',
        ],
        1,
        null,
        15,
      ),
      chapter(
        'maths',
        'ratio-proportion',
        { en: 'Ratio & proportion', hi: 'अनुपात और समानुपात' },
        'Share an amount without setting up heavy equations.',
        [
          'Parts of a whole and the value of one part',
          'Direct proportion in rate and price questions',
          'Dividing an amount in a given ratio',
          'Ratio chains and combining two ratios',
        ],
        8,
        81,
        10,
      ),
      chapter(
        'maths',
        'averages',
        { en: 'Averages', hi: 'औसत' },
        'Average changes, replaced values and the run-rate question.',
        [
          'Average × count = total, and why totals are easier',
          'What happens to an average when a value is added',
          'Finding a removed or replaced value',
          'Weighted averages in mixture questions',
        ],
        2,
        null,
        10,
      ),
    ],
  },
  {
    id: 'reasoning',
    slug: 'reasoning',
    name: { en: 'General Intelligence & Reasoning', hi: 'तर्कशक्ति' },
    short: 'Reasoning',
    code: 'GI',
    tint: 'plum',
    tagline: 'Syllogisms, coding, series and relations',
    description:
      'Draw the diagram, test every conclusion, and stop guessing between two options that look similar.',
    accuracy: 64,
    paperSection: 'General Intelligence & Reasoning',
    chapters: [
      chapter(
        'reasoning',
        'syllogisms',
        { en: 'Syllogisms', hi: 'न्यायवाक्य' },
        'Venn diagrams that settle “some” and “no” conclusions.',
        [
          'Reading “all”, “some” and “no” statements precisely',
          'Drawing the minimum-possibility Venn diagram',
          'Testing each conclusion against the diagram',
          'The “either–or” case, with an example',
        ],
        6,
        83,
        13,
      ),
      chapter(
        'reasoning',
        'coding-decoding',
        { en: 'Coding–decoding', hi: 'कूट-भाषा' },
        'Letter shifts, positional codes and the pattern-first habit.',
        [
          'Letter and number shifts between word and code',
          'Positional values of A–Z and reverse pairs',
          'Mixed rules: first letter forward, last letter back',
          'Checking the pattern on every letter before answering',
        ],
        4,
        75,
        10,
      ),
      chapter(
        'reasoning',
        'number-series',
        { en: 'Number series', hi: 'संख्या श्रेणी' },
        'Differences, squares and mixed patterns in one minute.',
        [
          'First differences and where they point',
          'Square, cube and prime-based series',
          'Alternating and mixed-operation series',
          'Missing term in the middle of a series',
        ],
        3,
        67,
        9,
      ),
      chapter(
        'reasoning',
        'blood-relations',
        { en: 'Blood relations', hi: 'रक्त संबंध' },
        'Draw the family tree before you look at the options.',
        [
          'Notation for father, mother, brother and sister',
          'Reading “only son of my grandfather” type clues',
          'Gendered words that change the answer',
          'Checking the question from the speaker’s side',
        ],
        2,
        null,
        10,
      ),
      chapter(
        'reasoning',
        'direction-sense',
        { en: 'Direction & distance', hi: 'दिशा ज्ञान' },
        'Sketch the path and use one right triangle.',
        [
          'The eight compass directions and left/right turns',
          'Sketching the path from the starting point',
          'Finding the shortest distance with Pythagoras',
          'Handling multiple turns without losing direction',
        ],
        2,
        null,
        9,
      ),
    ],
  },
  {
    id: 'english',
    slug: 'english',
    name: { en: 'English Language', hi: 'अंग्रेज़ी' },
    short: 'English',
    code: 'EN',
    tint: 'teal',
    tagline: 'Vocabulary, idioms, error spotting',
    description:
      'A small daily vocabulary habit, plus the grammar checks that decide most Tier-I English questions.',
    accuracy: 70,
    paperSection: 'English Comprehension',
    chapters: [
      chapter(
        'english',
        'synonyms',
        { en: 'Synonyms & antonyms', hi: 'पर्यायवाची व विलोम' },
        'Words that appear again and again in Tier-I papers.',
        [
          'Synonyms with context, not just a thesaurus match',
          'Antonyms and the prefix that flips meaning',
          'Words borrowed from Latin and Greek roots',
          'A short revision list for the week',
        ],
        7,
        74,
        8,
      ),
      chapter(
        'english',
        'idioms',
        { en: 'Idioms & phrases', hi: 'मुहावरे' },
        'The idioms SSC keeps rotating through its papers.',
        [
          'Everyday idioms and their plain-English meaning',
          'Idioms with body parts and animals',
          'Once a month revision to keep them active',
          'Telling a literal phrase from an idiom',
        ],
        4,
        69,
        8,
      ),
      chapter(
        'english',
        'spotting-errors',
        { en: 'Spotting errors', hi: 'वाक्य में त्रुटि' },
        'Subject–verb agreement, prepositions and tricky plurals.',
        [
          'Singular and plural agreement in long subjects',
          '“One of my friends” and other fixed patterns',
          'Preposition pairs that go with a verb',
          'Articles before countable nouns',
        ],
        5,
        66,
        12,
      ),
      chapter(
        'english',
        'fill-blanks',
        { en: 'Fill in the blanks', hi: 'रिक्त स्थान' },
        'Tense and preposition clues inside the sentence.',
        [
          'Time markers that reveal the tense',
          'Since and for with a point in time',
          'Conditional sentences with “had”',
          'Collocations that fix the right option',
        ],
        3,
        71,
        10,
      ),
      chapter(
        'english',
        'one-word',
        { en: 'One-word substitution', hi: 'एक शब्द प्रतिस्थापन' },
        'Compact substitutions worth one mark each.',
        [
          'People and professions in one word',
          'Places and collectives',
          'Words with a negative sense',
          'Choosing between two near-identical options',
        ],
        1,
        null,
        9,
      ),
    ],
  },
  {
    id: 'gk',
    slug: 'general-awareness',
    name: { en: 'General Awareness', hi: 'सामान्य जागरूकता' },
    short: 'GK',
    code: 'GA',
    tint: 'amber',
    tagline: 'Polity, geography, history, science',
    description:
      'Static topics that reward regular small doses. Every answer links to the chapter it came from.',
    accuracy: 74,
    paperSection: 'General Awareness',
    chapters: [
      chapter(
        'gk',
        'indian-polity',
        { en: 'Indian polity', hi: 'भारतीय राजव्यवस्था' },
        'Articles, schedules and who does what.',
        [
          'Articles that appear most often in SSC papers',
          'Union, state and concurrent lists',
          'Constitutional bodies and their powers',
          'Fundamental rights in plain language',
        ],
        6,
        78,
        11,
      ),
      chapter(
        'gk',
        'geography',
        { en: 'Geography', hi: 'भूगोल' },
        'Rivers, latitude lines and Indian states.',
        [
          'Rivers and their tributaries',
          'The Tropic of Cancer and the states it crosses',
          'Soils, crops and the monsoon',
          'National parks and biosphere reserves',
        ],
        4,
        71,
        11,
      ),
      chapter(
        'gk',
        'modern-history',
        { en: 'Modern history', hi: 'आधुनिक भारत' },
        'Acts, movements and the years that matter.',
        [
          'Acts passed under British rule',
          'Freedom movement milestones',
          'Founders of key institutions',
          'Reform movements and their leaders',
        ],
        2,
        null,
        12,
      ),
      chapter(
        'gk',
        'general-science',
        { en: 'General science', hi: 'सामान्य विज्ञान' },
        'Class 8–10 science, asked directly.',
        [
          'Human body systems and vitamins',
          'Units and measurement',
          'Everyday physics and chemistry',
          'Inventions and their inventors',
        ],
        3,
        75,
        10,
      ),
      chapter(
        'gk',
        'static-gk',
        { en: 'Static GK', hi: 'स्थिर सामान्य ज्ञान' },
        'Capitals, currencies, awards and days.',
        [
          'Capitals and currencies of neighbouring countries',
          'National awards and their fields',
          'Important dates and their themes',
          'First in India and world records',
        ],
        1,
        null,
        9,
      ),
    ],
  },
  {
    id: 'hindi',
    slug: 'hindi',
    name: { en: 'Hindi Language', hi: 'हिंदी भाषा' },
    short: 'Hindi',
    code: 'HI',
    tint: 'rose',
    tagline: 'व्याकरण, मुहावरे और वाक्य शुद्धि',
    description:
      'हिंदी की तैयारी के लिए छोटे-छोटे अभ्यास, व्याकरण के नियम, मुहावरे और शब्द भंडार।',
    accuracy: 81,
    paperSection: 'Hindi Language (CHSL)',
    chapters: [
      chapter(
        'hindi',
        'muhavare',
        { en: 'Idioms (Hindi)', hi: 'मुहावरे' },
        'अर्थ, प्रयोग और अंतर पहचानने वाले प्रश्न।',
        [
          'मुहावरे का अर्थ और वाक्य में प्रयोग',
          'एक जैसे दिखने वाले मुहावरों का अंतर',
          'परीक्षा में दोहराए जाने वाले मुहावरे',
          'लोकोक्तियाँ और मुहावरे में अंतर',
        ],
        4,
        79,
        8,
      ),
      chapter(
        'hindi',
        'paryayvachi',
        { en: 'Synonyms (Hindi)', hi: 'पर्यायवाची शब्द' },
        'एक शब्द के कई रूप, और “नहीं है” वाले प्रश्न।',
        [
          'सामान्य शब्दों के पर्यायवाची',
          '“कौन-सा पर्यायवाची नहीं है” पैटर्न',
          'विलोम शब्द के साथ अंतर',
          'रोज़ दो शब्द याद करने की आदत',
        ],
        5,
        84,
        8,
      ),
      chapter(
        'hindi',
        'vakya-shuddhi',
        { en: 'Sentence correction', hi: 'वाक्य शुद्धि' },
        'वाक्य में गलत शब्द, कारक और पुनरुक्ति।',
        [
          'कारक चिह्नों का अनावश्यक प्रयोग',
          'पुनरुक्ति दोष',
          'वचन और लिंग की अशुद्धियाँ',
          'शुद्ध वाक्य पहचानने की विधि',
        ],
        3,
        76,
        10,
      ),
      chapter(
        'hindi',
        'sandhi',
        { en: 'Sandhi', hi: 'संधि' },
        'स्वर संधि, व्यंजन संधि और विच्छेद।',
        [
          'स्वर संधि के प्रकार',
          'व्यंजन और विसर्ग संधि',
          'संधि विच्छेद करने का क्रम',
          'अपवाद वाले शब्द',
        ],
        2,
        null,
        9,
      ),
      chapter(
        'hindi',
        'samas',
        { en: 'Compound words', hi: 'समास' },
        'समास के भेद और उदाहरण।',
        [
          'समास किसे कहते हैं',
          'तत्पुरुष और द्वंद्व समास',
          'बहुव्रीहि और अव्ययीभाव',
          'समास विग्रह के अभ्यास प्रश्न',
        ],
        1,
        null,
        9,
      ),
    ],
  },
]

export const subjectById = Object.fromEntries(subjects.map((s) => [s.id, s])) as Record<
  SubjectId,
  Subject
>

export const allChapters: Chapter[] = subjects.flatMap((s) => s.chapters)

export function findSubject(slug: string) {
  return subjects.find((s) => s.slug === slug)
}

export function findChapter(subjectSlug: string, chapterSlug: string) {
  const subject = findSubject(subjectSlug)
  const found = subject?.chapters.find((c) => c.slug === chapterSlug)
  return subject && found ? { subject, chapter: found } : undefined
}

export function chapterById(id: string) {
  return allChapters.find((c) => c.id === id)
}

export function chapterPath(subjectSlug: string, chapterSlug: string) {
  return `/subjects/${subjectSlug}/${chapterSlug}`
}

export const examProfile = {
  exam: 'SSC CGL 2026',
  tier: 'Tier I',
  sections: 4,
  questions: 100,
  minutes: 60,
  marksPerQuestion: 2,
  negativeMark: 0.5,
}
