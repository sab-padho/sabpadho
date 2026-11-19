import type { Difficulty } from './question-types'
import type { Question } from './question-types'
import type { SubjectId } from './subjects'

type Draft = {
  id: string
  subjectId: SubjectId
  chapterId: string
  difficulty: Difficulty
  promptEn: string
  promptHi: string
  optionsEn: string[]
  optionsHi: string[]
  correct: number
  explEn: string
  explHi: string
}

function build(draft: Draft): Question {
  return {
    id: draft.id,
    subjectId: draft.subjectId,
    chapterId: draft.chapterId,
    difficulty: draft.difficulty,
    prompt: { en: draft.promptEn, hi: draft.promptHi },
    options: { en: draft.optionsEn, hi: draft.optionsHi },
    correct: draft.correct,
    explanation: { en: draft.explEn, hi: draft.explHi },
  }
}

/**
 * Arithmetic questions are generated from fixed templates so the worked
 * solutions are always in step with the numbers in the prompt.
 */
const percentageDrafts: Draft[] = [
  {
    id: 'qa-pct-1',
    subjectId: 'maths',
    chapterId: 'maths-percentages',
    difficulty: 'Easy',
    promptEn: 'A number is increased by 20% and then decreased by 10%. What is the net change?',
    promptHi: 'एक संख्या को पहले 20% बढ़ाया जाता है और फिर 10% घटाया जाता है। शुद्ध परिवर्तन क्या है?',
    optionsEn: ['+8%', '+10%', '−2%', '+12%'],
    optionsHi: ['+8%', '+10%', '−2%', '+12%'],
    correct: 0,
    explEn:
      'Start with 100. A 20% rise takes it to 120; a 10% fall on 120 gives 108. The net change is +8%, not +10%.',
    explHi:
      '100 से शुरू करें। 20% वृद्धि से 120 बनता है; 120 पर 10% कमी से 108 बनता है। शुद्ध परिवर्तन +8% है, +10% नहीं।',
  },
  {
    id: 'qa-pct-2',
    subjectId: 'maths',
    chapterId: 'maths-percentages',
    difficulty: 'Easy',
    promptEn: 'Sugar costs ₹40 per kg in January and ₹46 per kg in March. What is the percentage increase?',
    promptHi: 'जनवरी में चीनी ₹40 प्रति किग्रा और मार्च में ₹46 प्रति किग्रा है। प्रतिशत वृद्धि कितनी है?',
    optionsEn: ['12%', '15%', '18%', '20%'],
    optionsHi: ['12%', '15%', '18%', '20%'],
    correct: 1,
    explEn: 'The rise is 46 − 40 = ₹6. Divide by the original value: 6 ÷ 40 × 100 = 15%.',
    explHi: 'वृद्धि = 46 − 40 = ₹6. मूल मान से भाग दें: 6 ÷ 40 × 100 = 15%.',
  },
  {
    id: 'qa-pct-3',
    subjectId: 'maths',
    chapterId: 'maths-percentages',
    difficulty: 'Easy',
    promptEn: 'In a school of 800 students, 35% passed the scholarship exam. How many students did not pass?',
    promptHi: '800 विद्यार्थियों के एक विद्यालय में 35% छात्रवृत्ति परीक्षा में उत्तीर्ण हुए। कितने विद्यार्थी अनुत्तीर्ण रहे?',
    optionsEn: ['480', '500', '520', '540'],
    optionsHi: ['480', '500', '520', '540'],
    correct: 2,
    explEn: 'If 35% passed, 65% did not. 65% of 800 = 0.65 × 800 = 520.',
    explHi: '35% उत्तीर्ण हुए, इसलिए 65% अनुत्तीर्ण रहे। 800 का 65% = 0.65 × 800 = 520.',
  },
  {
    id: 'qa-pct-4',
    subjectId: 'maths',
    chapterId: 'maths-percentages',
    difficulty: 'Easy',
    promptEn: 'A candidate scored 456 marks out of 600. What percentage of marks did the candidate score?',
    promptHi: 'एक अभ्यर्थी ने 600 में से 456 अंक प्राप्त किए। अभ्यर्थी को कितने प्रतिशत अंक मिले?',
    optionsEn: ['72%', '74%', '76%', '78%'],
    optionsHi: ['72%', '74%', '76%', '78%'],
    correct: 2,
    explEn: '456 ÷ 600 = 0.76, which is 76%.',
    explHi: '456 ÷ 600 = 0.76, अर्थात 76%.',
  },
  {
    id: 'qa-pct-5',
    subjectId: 'maths',
    chapterId: 'maths-percentages',
    difficulty: 'Medium',
    promptEn: '60% of a number is 144. What is the number?',
    promptHi: 'किसी संख्या का 60% = 144 है। संख्या क्या है?',
    optionsEn: ['216', '240', '252', '260'],
    optionsHi: ['216', '240', '252', '260'],
    correct: 1,
    explEn: 'If 60% equals 144, then 1% equals 2.4, and 100% equals 2.4 × 100 = 240.',
    explHi: 'यदि 60% = 144, तो 1% = 2.4 और 100% = 2.4 × 100 = 240.',
  },
  {
    id: 'qa-pct-6',
    subjectId: 'maths',
    chapterId: 'maths-percentages',
    difficulty: 'Medium',
    promptEn:
      'The population of a town is 22,000. It grows by 10% every year. What will the population be after two years?',
    promptHi: 'एक नगर की जनसंख्या 22,000 है। यह हर वर्ष 10% बढ़ती है। दो वर्ष बाद जनसंख्या कितनी होगी?',
    optionsEn: ['26,400', '26,620', '26,800', '27,000'],
    optionsHi: ['26,400', '26,620', '26,800', '27,000'],
    correct: 1,
    explEn:
      'Each year multiplies the population by 1.1. So 22,000 × 1.1 × 1.1 = 22,000 × 1.21 = 26,620.',
    explHi:
      'हर वर्ष जनसंख्या 1.1 से गुणा होती है। इसलिए 22,000 × 1.1 × 1.1 = 22,000 × 1.21 = 26,620.',
  },
  {
    id: 'qa-pct-7',
    subjectId: 'maths',
    chapterId: 'maths-percentages',
    difficulty: 'Hard',
    promptEn:
      'A candidate secured 42% marks and failed by 32 marks. If the passing mark is 50%, what are the maximum marks?',
    promptHi:
      'एक अभ्यर्थी ने 42% अंक प्राप्त किए और 32 अंकों से अनुत्तीर्ण रहा। यदि उत्तीर्णांक 50% है, तो अधिकतम अंक कितने हैं?',
    optionsEn: ['320', '360', '400', '480'],
    optionsHi: ['320', '360', '400', '480'],
    correct: 2,
    explEn:
      'The gap between 42% and 50% is 8%, and that gap equals 32 marks. So 1% is 4 marks and 100% is 400.',
    explHi:
      '42% और 50% का अंतर 8% है, जो 32 अंकों के बराबर है। इसलिए 1% = 4 अंक और 100% = 400.',
  },
  {
    id: 'qa-pct-8',
    subjectId: 'maths',
    chapterId: 'maths-percentages',
    difficulty: 'Hard',
    promptEn:
      'A shop gives two successive discounts of 20% and 15%. What single discount is equivalent to both?',
    promptHi: 'एक दुकान 20% और 15% की दो क्रमिक छूट देती है। इन दोनों के बराबर एकल छूट कितनी है?',
    optionsEn: ['30%', '32%', '35%', '36%'],
    optionsHi: ['30%', '32%', '35%', '36%'],
    correct: 1,
    explEn:
      'Take the marked price as 100. After 20% off it is 80; after another 15% off it is 80 × 0.85 = 68. The total discount is 32%.',
    explHi:
      'अंकित मूल्य 100 लें। 20% छूट के बाद 80; फिर 15% छूट के बाद 80 × 0.85 = 68. कुल छूट 32% है।',
  },
]

const profitDrafts: Draft[] = [
  {
    id: 'qa-pl-1',
    subjectId: 'maths',
    chapterId: 'maths-profit-loss',
    difficulty: 'Easy',
    promptEn: 'An article bought for ₹400 is sold for ₹460. What is the profit percentage?',
    promptHi: '₹400 में खरीदा गया एक सामान ₹460 में बेचा जाता है। लाभ प्रतिशत कितना है?',
    optionsEn: ['12%', '15%', '18%', '20%'],
    optionsHi: ['12%', '15%', '18%', '20%'],
    correct: 1,
    explEn: 'Profit = 460 − 400 = ₹60. Profit % = 60 ÷ 400 × 100 = 15%.',
    explHi: 'लाभ = 460 − 400 = ₹60. लाभ % = 60 ÷ 400 × 100 = 15%.',
  },
  {
    id: 'qa-pl-2',
    subjectId: 'maths',
    chapterId: 'maths-profit-loss',
    difficulty: 'Medium',
    promptEn:
      'A shopkeeper marks an article 20% above its cost price and then allows a 10% discount. What is his profit percentage?',
    promptHi:
      'एक दुकानदार किसी वस्तु का अंकित मूल्य क्रय मूल्य से 20% अधिक रखता है और फिर 10% छूट देता है। उसका लाभ प्रतिशत क्या है?',
    optionsEn: ['8%', '10%', '12%', '15%'],
    optionsHi: ['8%', '10%', '12%', '15%'],
    correct: 0,
    explEn:
      'Take the cost price as 100. The marked price is 120. After a 10% discount the selling price is 108, so the profit is 8%.',
    explHi:
      'क्रय मूल्य 100 लें। अंकित मूल्य 120 है। 10% छूट के बाद विक्रय मूल्य 108 है, इसलिए लाभ 8% है।',
  },
  {
    id: 'qa-pl-3',
    subjectId: 'maths',
    chapterId: 'maths-profit-loss',
    difficulty: 'Easy',
    promptEn: 'An article sold for ₹720 gives a loss of 10%. What was the cost price?',
    promptHi: '₹720 में बेची गई वस्तु पर 10% हानि हुई। क्रय मूल्य कितना था?',
    optionsEn: ['₹780', '₹792', '₹800', '₹810'],
    optionsHi: ['₹780', '₹792', '₹800', '₹810'],
    correct: 2,
    explEn: 'A 10% loss means 90% of the cost equals 720. Cost = 720 ÷ 0.9 = ₹800.',
    explHi: '10% हानि का अर्थ है कि क्रय मूल्य का 90% = 720. क्रय मूल्य = 720 ÷ 0.9 = ₹800.',
  },
  {
    id: 'qa-pl-4',
    subjectId: 'maths',
    chapterId: 'maths-profit-loss',
    difficulty: 'Medium',
    promptEn: 'Selling an article for ₹1,050 gives a profit of 5%. What is the cost price?',
    promptHi: '₹1,050 में वस्तु बेचने पर 5% लाभ होता है। क्रय मूल्य कितना है?',
    optionsEn: ['₹950', '₹997.50', '₹1,000', '₹1,025'],
    optionsHi: ['₹950', '₹997.50', '₹1,000', '₹1,025'],
    correct: 2,
    explEn: '105% of the cost is 1,050, so the cost is 1,050 ÷ 1.05 = ₹1,000.',
    explHi: 'क्रय मूल्य का 105% = 1,050, इसलिए क्रय मूल्य = 1,050 ÷ 1.05 = ₹1,000.',
  },
  {
    id: 'qa-pl-5',
    subjectId: 'maths',
    chapterId: 'maths-profit-loss',
    difficulty: 'Easy',
    promptEn: 'An article bought for ₹1,200 is sold for ₹1,020. What is the loss percentage?',
    promptHi: '₹1,200 में खरीदी गई वस्तु ₹1,020 में बेची जाती है। हानि प्रतिशत कितना है?',
    optionsEn: ['12%', '15%', '18%', '20%'],
    optionsHi: ['12%', '15%', '18%', '20%'],
    correct: 1,
    explEn: 'Loss = 1,200 − 1,020 = ₹180. Loss % = 180 ÷ 1,200 × 100 = 15%.',
    explHi: 'हानि = 1,200 − 1,020 = ₹180. हानि % = 180 ÷ 1,200 × 100 = 15%.',
  },
  {
    id: 'qa-pl-6',
    subjectId: 'maths',
    chapterId: 'maths-profit-loss',
    difficulty: 'Hard',
    promptEn:
      'A trader marks an article 40% above cost price and offers a 25% discount. What is the profit percentage?',
    promptHi: 'एक व्यापारी वस्तु का मूल्य क्रय मूल्य से 40% अधिक अंकित करता है और 25% छूट देता है। लाभ प्रतिशत क्या है?',
    optionsEn: ['5%', '10%', '12%', '15%'],
    optionsHi: ['5%', '10%', '12%', '15%'],
    correct: 0,
    explEn:
      'Cost 100 → marked 140 → after 25% off, selling price 105. Profit = 5%, even though the discount looks large.',
    explHi:
      'क्रय 100 → अंकित 140 → 25% छूट के बाद विक्रय 105. लाभ 5% है, भले ही छूट बड़ी लगे।',
  },
]

const workDrafts: Draft[] = [
  {
    id: 'qa-tw-1',
    subjectId: 'maths',
    chapterId: 'maths-time-work',
    difficulty: 'Easy',
    promptEn: 'A can finish a task in 12 days and B in 18 days. Working together, how long will they take?',
    promptHi: 'A किसी काम को 12 दिनों में और B 18 दिनों में पूरा कर सकता है। साथ मिलकर कितने दिन लगेंगे?',
    optionsEn: ['7 days', '7.2 days', '7.5 days', '8 days'],
    optionsHi: ['7 दिन', '7.2 दिन', '7.5 दिन', '8 दिन'],
    correct: 1,
    explEn: 'Combined work per day = 1/12 + 1/18 = 5/36. Time = 36/5 = 7.2 days.',
    explHi: 'एक दिन का संयुत कार्य = 1/12 + 1/18 = 5/36. समय = 36/5 = 7.2 दिन.',
  },
  {
    id: 'qa-tw-2',
    subjectId: 'maths',
    chapterId: 'maths-time-work',
    difficulty: 'Medium',
    promptEn: 'A and B together finish a task in 6 days. A alone takes 10 days. How long would B take alone?',
    promptHi: 'A और B साथ मिलकर 6 दिनों में काम पूरा करते हैं। A अकेला 10 दिन लेता है। B अकेला कितने दिन लेगा?',
    optionsEn: ['12 days', '14 days', '15 days', '18 days'],
    optionsHi: ['12 दिन', '14 दिन', '15 दिन', '18 दिन'],
    correct: 2,
    explEn: 'B’s one-day work = 1/6 − 1/10 = (5 − 3)/30 = 2/30 = 1/15. So B needs 15 days.',
    explHi: 'B का एक दिन का कार्य = 1/6 − 1/10 = (5 − 3)/30 = 2/30 = 1/15. अर्थात B को 15 दिन लगेंगे.',
  },
  {
    id: 'qa-tw-3',
    subjectId: 'maths',
    chapterId: 'maths-time-work',
    difficulty: 'Easy',
    promptEn: 'Eight men can complete a job in 12 days. How long will six men take for the same job?',
    promptHi: 'आठ व्यक्ति एक काम 12 दिनों में पूरा करते हैं। छह व्यक्ति उसी काम को कितने दिनों में पूरा करेंगे?',
    optionsEn: ['14 days', '15 days', '16 days', '18 days'],
    optionsHi: ['14 दिन', '15 दिन', '16 दिन', '18 दिन'],
    correct: 2,
    explEn: 'Work = 8 × 12 = 96 man-days. With 6 men, time = 96 ÷ 6 = 16 days.',
    explHi: 'काम = 8 × 12 = 96 व्यक्ति-दिन. 6 व्यक्तियों के साथ समय = 96 ÷ 6 = 16 दिन.',
  },
  {
    id: 'qa-tw-4',
    subjectId: 'maths',
    chapterId: 'maths-time-work',
    difficulty: 'Hard',
    promptEn:
      'A and B can do a task in 10 and 15 days. They work together for 3 days, then A works alone. How many more days will A need?',
    promptHi:
      'A और B एक काम 10 और 15 दिनों में कर सकते हैं। वे 3 दिन साथ काम करते हैं, फिर A अकेला काम करता है। A को और कितने दिन लगेंगे?',
    optionsEn: ['4 days', '5 days', '6 days', '8 days'],
    optionsHi: ['4 दिन', '5 दिन', '6 दिन', '8 दिन'],
    correct: 1,
    explEn:
      'Together they finish 3 × (1/10 + 1/15) = 3 × 1/6 = 1/2 the work. Half remains, and A does half in 5 days.',
    explHi:
      'साथ मिलकर 3 × (1/10 + 1/15) = 3 × 1/6 = 1/2 काम पूरा होता है। आधा बचता है, जिसे A 5 दिनों में करेगा।',
  },
  {
    id: 'qa-tw-5',
    subjectId: 'maths',
    chapterId: 'maths-time-work',
    difficulty: 'Medium',
    promptEn: 'A completes a job in 20 days and B in 30 days. How long will they take together?',
    promptHi: 'A एक काम 20 दिनों में और B 30 दिनों में पूरा करता है। साथ में कितने दिन लगेंगे?',
    optionsEn: ['10 days', '12 days', '15 days', '18 days'],
    optionsHi: ['10 दिन', '12 दिन', '15 दिन', '18 दिन'],
    correct: 1,
    explEn: 'One day together = 1/20 + 1/30 = 5/60 = 1/12. So the job takes 12 days.',
    explHi: 'एक दिन में साथ = 1/20 + 1/30 = 5/60 = 1/12. इसलिए काम 12 दिनों में पूरा होगा.',
  },
]

export const generatedQuestions: Question[] = [...percentageDrafts, ...profitDrafts, ...workDrafts].map(
  build,
)
