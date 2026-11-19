import type { Difficulty, Question } from './question-types'
import type { SubjectId } from './subjects'
import { generatedQuestions } from './generated'

type Draft = {
  id: string
  subjectId: SubjectId
  chapterId: string
  difficulty?: Difficulty
  prompt: [string, string]
  options: [string[], string[]]
  correct: number
  explanation: [string, string]
}

function q(draft: Draft): Question {
  return {
    id: draft.id,
    subjectId: draft.subjectId,
    chapterId: draft.chapterId,
    difficulty: draft.difficulty ?? 'Medium',
    prompt: { en: draft.prompt[0], hi: draft.prompt[1] },
    options: { en: draft.options[0], hi: draft.options[1] },
    correct: draft.correct,
    explanation: { en: draft.explanation[0], hi: draft.explanation[1] },
  }
}

const maths: Question[] = [
  q({
    id: 'qa-ratio-1',
    subjectId: 'maths',
    chapterId: 'maths-ratio-proportion',
    difficulty: 'Easy',
    prompt: ['The ratio of two numbers is 3 : 5 and their sum is 96. What is the larger number?', 'दो संख्याओं का अनुपात 3 : 5 है और उनका योग 96 है। बड़ी संख्या क्या है?'],
    options: [
      ['36', '48', '60', '64'],
      ['36', '48', '60', '64'],
    ],
    correct: 2,
    explanation: [
      'The ratio has 3 + 5 = 8 equal parts. One part is 96 ÷ 8 = 12, so the larger number is 5 × 12 = 60.',
      'अनुपात में 3 + 5 = 8 बराबर भाग हैं। एक भाग = 96 ÷ 8 = 12, इसलिए बड़ी संख्या = 5 × 12 = 60.',
    ],
  }),
  q({
    id: 'qa-ratio-2',
    subjectId: 'maths',
    chapterId: 'maths-ratio-proportion',
    difficulty: 'Easy',
    prompt: ['If 12 pens cost ₹180, what do 20 pens cost at the same rate?', 'यदि 12 पेन की कीमत ₹180 है, तो उसी दर पर 20 पेन की कीमत कितनी होगी?'],
    options: [
      ['₹240', '₹280', '₹300', '₹320'],
      ['₹240', '₹280', '₹300', '₹320'],
    ],
    correct: 2,
    explanation: [
      'One pen costs 180 ÷ 12 = ₹15. Twenty pens cost 20 × 15 = ₹300.',
      'एक पेन की कीमत = 180 ÷ 12 = ₹15. बीस पेन की कीमत = 20 × 15 = ₹300.',
    ],
  }),
  q({
    id: 'qa-avg-1',
    subjectId: 'maths',
    chapterId: 'maths-averages',
    difficulty: 'Medium',
    prompt: [
      'The average of five numbers is 28. When one number is removed, the average of the remaining four becomes 30. Which number was removed?',
      'पाँच संख्याओं का औसत 28 है। एक संख्या हटाने पर शेष चार का औसत 30 हो जाता है। हटाई गई संख्या कौन-सी है?',
    ],
    options: [
      ['18', '20', '24', '26'],
      ['18', '20', '24', '26'],
    ],
    correct: 1,
    explanation: [
      'The five numbers total 5 × 28 = 140. The four remaining total 4 × 30 = 120. The removed number is 140 − 120 = 20.',
      'पाँच संख्याओं का कुल = 5 × 28 = 140. शेष चार का कुल = 4 × 30 = 120. हटाई गई संख्या = 140 − 120 = 20.',
    ],
  }),
  q({
    id: 'qa-avg-2',
    subjectId: 'maths',
    chapterId: 'maths-averages',
    difficulty: 'Medium',
    prompt: [
      'A batsman averages 42 runs in 10 innings. How many runs must he score in the next innings to raise his average to 45?',
      'एक बल्लेबाज़ का 10 पारियों में औसत 42 रन है। अगली पारी में कितने रन बनाएँ कि औसत 45 हो जाए?',
    ],
    options: [
      ['60', '70', '75', '80'],
      ['60', '70', '75', '80'],
    ],
    correct: 2,
    explanation: [
      'He has 420 runs in 10 innings. After 11 innings at an average of 45 he needs 495 runs. The next innings must bring 495 − 420 = 75 runs.',
      '10 पारियों में 420 रन हैं। 45 के औसत से 11 पारियों में 495 रन चाहिए। अगली पारी में 495 − 420 = 75 रन बनाने होंगे।',
    ],
  }),
]

const reasoning: Question[] = [
  q({
    id: 'gi-syl-1',
    subjectId: 'reasoning',
    chapterId: 'reasoning-syllogisms',
    difficulty: 'Easy',
    prompt: [
      'Statements: All roses are flowers. All flowers are plants.\nConclusions: I. All roses are plants. II. Some plants are roses.',
      'कथन: सभी गुलाब फूल हैं। सभी फूल पौधे हैं।\nनिष्कर्ष: I. सभी गुलाब पौधे हैं। II. कुछ पौधे गुलाब हैं।',
    ],
    options: [
      ['Only I follows', 'Only II follows', 'Both I and II follow', 'Neither I nor II follows'],
      ['केवल I सही है', 'केवल II सही है', 'I और II दोनों सही हैं', 'न I न II सही है'],
    ],
    correct: 2,
    explanation: [
      'Roses sit inside flowers, and flowers sit inside plants, so all roses are plants. Because roses exist, some plants are roses as well.',
      'गुलाब फूलों के भीतर और फूल पौधों के भीतर आते हैं, इसलिए सभी गुलाब पौधे हैं। गुलाब होने के कारण कुछ पौधे गुलाब भी हैं।',
    ],
  }),
  q({
    id: 'gi-syl-2',
    subjectId: 'reasoning',
    chapterId: 'reasoning-syllogisms',
    difficulty: 'Medium',
    prompt: [
      'Statements: Some pens are books. No book is a bag.\nConclusions: I. Some pens are not bags. II. No pen is a bag.',
      'कथन: कुछ कलम किताबें हैं। कोई भी किताब थैला नहीं है।\nनिष्कर्ष: I. कुछ कलम थैले नहीं हैं। II. कोई भी कलम थैला नहीं है।',
    ],
    options: [
      ['Only I follows', 'Only II follows', 'Both I and II follow', 'Neither I nor II follows'],
      ['केवल I सही है', 'केवल II सही है', 'I और II दोनों सही हैं', 'न I न II सही है'],
    ],
    correct: 0,
    explanation: [
      'The pens that are books cannot be bags, so some pens are definitely not bags. We know nothing about the pens that are not books, so II does not follow.',
      'जो कलम किताबें हैं वे थैले नहीं हो सकतीं, इसलिए कुछ कलम थैले नहीं हैं। बाकी कलमों के बारे में कुछ नहीं कहा गया, इसलिए II सही नहीं है।',
    ],
  }),
  q({
    id: 'gi-syl-3',
    subjectId: 'reasoning',
    chapterId: 'reasoning-syllogisms',
    difficulty: 'Medium',
    prompt: [
      'Statements: All engineers are graduates. Some graduates are managers.\nConclusions: I. Some engineers are managers. II. Some managers are graduates.',
      'कथन: सभी इंजीनियर स्नातक हैं। कुछ स्नातक प्रबंधक हैं।\nनिष्कर्ष: I. कुछ इंजीनियर प्रबंधक हैं। II. कुछ प्रबंधक स्नातक हैं।',
    ],
    options: [
      ['Only I follows', 'Only II follows', 'Both I and II follow', 'Neither I nor II follows'],
      ['केवल I सही है', 'केवल II सही है', 'I और II दोनों सही हैं', 'न I न II सही है'],
    ],
    correct: 1,
    explanation: [
      'The managers who are graduates may sit entirely outside the engineer group, so I is not certain. The second conclusion simply restates the second statement.',
      'जो प्रबंधक स्नातक हैं वे इंजीनियर समूह से पूरी तरह बाहर हो सकते हैं, इसलिए I निश्चित नहीं है। II कथन दो को ही दोहराता है।',
    ],
  }),
  q({
    id: 'gi-code-1',
    subjectId: 'reasoning',
    chapterId: 'reasoning-coding-decoding',
    difficulty: 'Easy',
    prompt: [
      'In a certain code, ROAD is written as TQCF. How is PATH written in the same code?',
      'एक निश्चित कूट में ROAD को TQCF लिखा जाता है। उसी कूट में PATH कैसे लिखा जाएगा?',
    ],
    options: [
      ['RCVJ', 'RCUJ', 'QCVJ', 'RDVJ'],
      ['RCVJ', 'RCUJ', 'QCVJ', 'RDVJ'],
    ],
    correct: 0,
    explanation: [
      'Every letter moves two places forward: R→T, O→Q, A→C, D→F. Applying the same rule, P→R, A→C, T→V, H→J gives RCVJ.',
      'हर अक्षर दो स्थान आगे बढ़ता है: R→T, O→Q, A→C, D→F. इसी नियम से P→R, A→C, T→V, H→J, अर्थात RCVJ.',
    ],
  }),
  q({
    id: 'gi-code-2',
    subjectId: 'reasoning',
    chapterId: 'reasoning-coding-decoding',
    difficulty: 'Easy',
    prompt: ['If MOBILE is coded as NPCJMF, how is PHONE coded in the same language?', 'यदि MOBILE को NPCJMF लिखा जाता है, तो उसी भाषा में PHONE कैसे लिखा जाएगा?'],
    options: [
      ['QIPOF', 'QIPNF', 'QJPOF', 'QHPMF'],
      ['QIPOF', 'QIPNF', 'QJPOF', 'QHPMF'],
    ],
    correct: 0,
    explanation: [
      'Each letter is replaced by the next letter in the alphabet: M→N, O→P, B→C, I→J, L→M, E→F. So PHONE becomes QIPOF.',
      'हर अक्षर के बाद वाला अक्षर लिखा गया है: M→N, O→P, B→C, I→J, L→M, E→F. इसलिए PHONE का कूट QIPOF है।',
    ],
  }),
  q({
    id: 'gi-series-1',
    subjectId: 'reasoning',
    chapterId: 'reasoning-number-series',
    difficulty: 'Easy',
    prompt: ['Find the next term: 3, 6, 12, 24, 48, ?', 'अगला पद ज्ञात कीजिए: 3, 6, 12, 24, 48, ?'],
    options: [
      ['72', '96', '108', '120'],
      ['72', '96', '108', '120'],
    ],
    correct: 1,
    explanation: ['Every term is double the one before it: 48 × 2 = 96.', 'हर पद अपने पिछले पद का दोगुना है: 48 × 2 = 96.'],
  }),
  q({
    id: 'gi-series-2',
    subjectId: 'reasoning',
    chapterId: 'reasoning-number-series',
    difficulty: 'Medium',
    prompt: ['Find the missing term: 7, 12, 19, 28, 39, ?', 'लुप्त पद ज्ञात कीजिए: 7, 12, 19, 28, 39, ?'],
    options: [
      ['50', '51', '52', '54'],
      ['50', '51', '52', '54'],
    ],
    correct: 2,
    explanation: [
      'The differences are 5, 7, 9, 11, odd numbers increasing by 2. The next difference is 13, so 39 + 13 = 52.',
      'अंतर 5, 7, 9, 11 हैं, विषम संख्याएँ जो 2 से बढ़ती हैं। अगला अंतर 13 है, इसलिए 39 + 13 = 52.',
    ],
  }),
  q({
    id: 'gi-blood-1',
    subjectId: 'reasoning',
    chapterId: 'reasoning-blood-relations',
    difficulty: 'Medium',
    prompt: [
      'Pointing to a photograph, Ravi says, “She is the daughter of my grandfather’s only son.” How is the girl related to Ravi?',
      'एक तस्वीर की ओर इशारा करते हुए रवि कहता है, “यह मेरे दादा के इकलौते बेटे की बेटी है।” वह लड़की रवि से कैसे संबंधित है?',
    ],
    options: [
      ['Sister', 'Cousin', 'Niece', 'Aunt'],
      ['बहन', 'चचेरी बहन', 'भतीजी', 'बुआ'],
    ],
    correct: 0,
    explanation: [
      'Grandfather’s only son is Ravi’s father. His daughter is therefore Ravi’s sister.',
      'दादा का इकलौता बेटा रवि के पिता हैं। उनकी बेटी रवि की बहन है।',
    ],
  }),
  q({
    id: 'gi-dir-1',
    subjectId: 'reasoning',
    chapterId: 'reasoning-direction-sense',
    difficulty: 'Easy',
    prompt: [
      'A man walks 5 km north, turns right and walks 3 km, then turns right again and walks 5 km. How far is he from his starting point?',
      'एक व्यक्ति 5 किमी उत्तर चलता है, दाएँ मुड़कर 3 किमी चलता है, फिर दाएँ मुड़कर 5 किमी चलता है। वह प्रारंभिक स्थान से कितनी दूर है?',
    ],
    options: [
      ['3 km', '5 km', '8 km', '√34 km'],
      ['3 किमी', '5 किमी', '8 किमी', '√34 किमी'],
    ],
    correct: 0,
    explanation: [
      'The 5 km north and 5 km south legs cancel out, leaving only the 3 km eastward leg. He is 3 km from the start.',
      '5 किमी उत्तर और 5 किमी दक्षिण की दूरी कट जाती है, केवल 3 किमी पूर्व की दूरी बचती है। वह प्रारंभ से 3 किमी दूर है।',
    ],
  }),
]

const english: Question[] = [
  q({
    id: 'en-syn-1',
    subjectId: 'english',
    chapterId: 'english-synonyms',
    difficulty: 'Easy',
    prompt: ['Choose the word most similar in meaning to “abundant”.', '“Abundant” के सबसे निकट अर्थ वाला शब्द चुनिए।'],
    options: [
      ['Scarce', 'Plentiful', 'Narrow', 'Fragile'],
      ['Scarce', 'Plentiful', 'Narrow', 'Fragile'],
    ],
    correct: 1,
    explanation: ['Abundant means existing in large quantities, so plentiful is the closest match. Scarce is its opposite.', 'Abundant का अर्थ है भरपूर मात्रा में, इसलिए plentiful सबसे निकट है। Scarce इसका विलोम है।'],
  }),
  q({
    id: 'en-syn-2',
    subjectId: 'english',
    chapterId: 'english-synonyms',
    difficulty: 'Easy',
    prompt: ['Choose the word most opposite in meaning to “candid”.', '“Candid” के विलोम अर्थ वाला शब्द चुनिए।'],
    options: [
      ['Frank', 'Guarded', 'Honest', 'Open'],
      ['Frank', 'Guarded', 'Honest', 'Open'],
    ],
    correct: 1,
    explanation: ['Candid means open and direct; guarded means careful about revealing thoughts. The other three are close synonyms of candid.', 'Candid का अर्थ है स्पष्ट और सीधा; guarded का अर्थ है सोच छिपाकर रखने वाला। बाकी तीन Candid के पर्यायवाची हैं।'],
  }),
  q({
    id: 'en-syn-3',
    subjectId: 'english',
    chapterId: 'english-synonyms',
    difficulty: 'Medium',
    prompt: ['Choose the word most similar in meaning to “meticulous”.', '“Meticulous” के सबसे निकट अर्थ वाला शब्द चुनिए।'],
    options: [
      ['Careless', 'Thorough', 'Hasty', 'Vague'],
      ['Careless', 'Thorough', 'Hasty', 'Vague'],
    ],
    correct: 1,
    explanation: ['Meticulous describes someone who gives great attention to detail, thorough is the closest option.', 'Meticulous उस व्यक्ति के लिए है जो बारीकी पर ध्यान देता है, thorough सबसे निकट विकल्प है।'],
  }),
  q({
    id: 'en-idiom-1',
    subjectId: 'english',
    chapterId: 'english-idioms',
    difficulty: 'Easy',
    prompt: ['What does the idiom “to bite the bullet” mean?', 'मुहावरे “to bite the bullet” का अर्थ क्या है?'],
    options: [
      [
        'To face a difficult situation bravely',
        'To speak without thinking',
        'To avoid a task quietly',
        'To accept defeat',
      ],
      [
        'कठिन परिस्थिति का साहस से सामना करना',
        'बिना सोचे बोलना',
        'चुपचाप काम टालना',
        'हार स्वीकार करना',
      ],
    ],
    correct: 0,
    explanation: ['It means to endure something painful or difficult because it cannot be avoided.', 'इसका अर्थ है किसी कठिन या पीड़ादायक काम को सहना, क्योंकि उससे बचा नहीं जा सकता।'],
  }),
  q({
    id: 'en-idiom-2',
    subjectId: 'english',
    chapterId: 'english-idioms',
    difficulty: 'Easy',
    prompt: ['What does “a blessing in disguise” mean?', '“A blessing in disguise” का अर्थ क्या है?'],
    options: [
      [
        'Something good that seems bad at first',
        'A gift given secretly',
        'A plan that fails',
        'A lucky escape from danger',
      ],
      [
        'ऐसी अच्छी बात जो पहले बुरी लगे',
        'चुपचाप दिया गया उपहार',
        'असफल होने वाली योजना',
        'खतरे से बच निकलना',
      ],
    ],
    correct: 0,
    explanation: ['An apparent misfortune that later turns out to be fortunate is called a blessing in disguise.', 'जो घटना पहले दुर्भाग्य लगे पर बाद में लाभदायक सिद्ध हो, उसे blessing in disguise कहते हैं।'],
  }),
  q({
    id: 'en-error-1',
    subjectId: 'english',
    chapterId: 'english-spotting-errors',
    difficulty: 'Medium',
    prompt: [
      'Choose the part of the sentence that contains an error:\n(A) The number of applicants / (B) have increased / (C) since last year. / (D) No error',
      'वाक्य का वह भाग चुनिए जिसमें त्रुटि है:\n(A) The number of applicants / (B) have increased / (C) since last year. / (D) No error',
    ],
    options: [
      ['(A)', '(B)', '(C)', '(D)'],
      ['(A)', '(B)', '(C)', '(D)'],
    ],
    correct: 1,
    explanation: ['“The number of” takes a singular verb, so “have increased” should be “has increased”.', '“The number of” के साथ एकवचन क्रिया आती है, इसलिए “have increased” की जगह “has increased” होगा।'],
  }),
  q({
    id: 'en-error-2',
    subjectId: 'english',
    chapterId: 'english-spotting-errors',
    difficulty: 'Medium',
    prompt: [
      'Choose the part of the sentence that contains an error:\n(A) One of my friend / (B) lives in Pune / (C) near the river. / (D) No error',
      'वाक्य का वह भाग चुनिए जिसमें त्रुटि है:\n(A) One of my friend / (B) lives in Pune / (C) near the river. / (D) No error',
    ],
    options: [
      ['(A)', '(B)', '(C)', '(D)'],
      ['(A)', '(B)', '(C)', '(D)'],
    ],
    correct: 0,
    explanation: ['After “one of” the noun is plural: “one of my friends”.', '“One of” के बाद संज्ञा बहुवचन होती है: “one of my friends”.'],
  }),
  q({
    id: 'en-fill-1',
    subjectId: 'english',
    chapterId: 'english-fill-blanks',
    difficulty: 'Easy',
    prompt: ['She has been working here ______ 2019.', 'She has been working here ______ 2019.'],
    options: [
      ['for', 'since', 'from', 'by'],
      ['for', 'since', 'from', 'by'],
    ],
    correct: 1,
    explanation: ['“Since” is used with a point in time (2019); “for” is used with a duration (six years).', '“Since” किसी निश्चित समय-बिंदु (2019) के साथ आता है; “for” अवधि (छह वर्ष) के साथ।'],
  }),
  q({
    id: 'en-fill-2',
    subjectId: 'english',
    chapterId: 'english-fill-blanks',
    difficulty: 'Medium',
    prompt: ['If I ______ known you were coming, I would have waited.', 'If I ______ known you were coming, I would have waited.'],
    options: [
      ['have', 'had', 'has', 'would'],
      ['have', 'had', 'has', 'would'],
    ],
    correct: 1,
    explanation: ['This is the third conditional: “If I had known … I would have waited.”', 'यह third conditional है: “If I had known … I would have waited.”'],
  }),
]

const gk: Question[] = [
  q({
    id: 'ga-polity-1',
    subjectId: 'gk',
    chapterId: 'gk-indian-polity',
    difficulty: 'Easy',
    prompt: ['Which article of the Constitution deals with the Election Commission of India?', 'संविधान का कौन-सा अनुच्छेद भारत निर्वाचन आयोग से संबंधित है?'],
    options: [
      ['Article 314', 'Article 315', 'Article 324', 'Article 356'],
      ['अनुच्छेद 314', 'अनुच्छेद 315', 'अनुच्छेद 324', 'अनुच्छेद 356'],
    ],
    correct: 2,
    explanation: ['Article 324 provides for the superintendence, direction and control of elections by the Election Commission.', 'अनुच्छेद 324 निर्वाचन आयोग को चुनावों के अधीक्षण, निर्देशन और नियंत्रण की शक्ति देता है।'],
  }),
  q({
    id: 'ga-polity-2',
    subjectId: 'gk',
    chapterId: 'gk-indian-polity',
    difficulty: 'Easy',
    prompt: ['Who administers the oath of office to the President of India?', 'भारत के राष्ट्रपति को पद की शपथ कौन दिलाता है?'],
    options: [
      ['Prime Minister', 'Chief Justice of India', 'Speaker of the Lok Sabha', 'Vice-President'],
      ['प्रधानमंत्री', 'भारत के मुख्य न्यायाधीश', 'लोकसभा अध्यक्ष', 'उपराष्ट्रपति'],
    ],
    correct: 1,
    explanation: ['The Chief Justice of India administers the oath, and in the Chief Justice’s absence the senior-most Supreme Court judge does.', 'भारत के मुख्य न्यायाधीश शपथ दिलाते हैं; उनकी अनुपस्थिति में सर्वोच्च न्यायालय के वरिष्ठतम न्यायाधीश।'],
  }),
  q({
    id: 'ga-polity-3',
    subjectId: 'gk',
    chapterId: 'gk-indian-polity',
    difficulty: 'Medium',
    prompt: ['The Directive Principles of State Policy were borrowed from the Constitution of which country?', 'राज्य के नीति निदेशक तत्व किस देश के संविधान से लिए गए हैं?'],
    options: [
      ['United States', 'Ireland', 'Australia', 'Canada'],
      ['संयुक्त राज्य अमेरिका', 'आयरलैंड', 'ऑस्ट्रेलिया', 'कनाडा'],
    ],
    correct: 1,
    explanation: ['The Directive Principles were inspired by the Constitution of Ireland, which had similar social policy directives.', 'नीति निदेशक तत्व आयरलैंड के संविधान से प्रेरित हैं, जिसमें ऐसे ही सामाजिक नीति निर्देश थे।'],
  }),
  q({
    id: 'ga-geo-1',
    subjectId: 'gk',
    chapterId: 'gk-geography',
    difficulty: 'Easy',
    prompt: ['Which river is known as the “Dakshin Ganga”?', 'कौन-सी नदी “दक्षिण गंगा” कहलाती है?'],
    options: [
      ['Godavari', 'Krishna', 'Narmada', 'Kaveri'],
      ['गोदावरी', 'कृष्णा', 'नर्मदा', 'कावेरी'],
    ],
    correct: 0,
    explanation: ['The Godavari, the longest river of peninsular India, is called the Dakshin Ganga.', 'प्रायद्वीपीय भारत की सबसे लंबी नदी गोदावरी को दक्षिण गंगा कहा जाता है।'],
  }),
  q({
    id: 'ga-geo-2',
    subjectId: 'gk',
    chapterId: 'gk-geography',
    difficulty: 'Medium',
    prompt: ['The Tropic of Cancer passes through how many Indian states?', 'कर्क रेखा भारत के कितने राज्यों से गुजरती है?'],
    options: [
      ['6', '7', '8', '9'],
      ['6', '7', '8', '9'],
    ],
    correct: 2,
    explanation: ['It crosses eight states, from Gujarat in the west to Mizoram in the east.', 'यह आठ राज्यों से गुजरती है, पश्चिम में गुजरात से पूर्व में मिज़ोरम तक।'],
  }),
  q({
    id: 'ga-history-1',
    subjectId: 'gk',
    chapterId: 'gk-modern-history',
    difficulty: 'Easy',
    prompt: ['The Rowlatt Act was passed in which year?', 'रौलेट एक्ट किस वर्ष पारित हुआ था?'],
    options: [
      ['1909', '1919', '1929', '1935'],
      ['1909', '1919', '1929', '1935'],
    ],
    correct: 1,
    explanation: ['The Rowlatt Act was passed in 1919; it allowed detention without trial and triggered nationwide protests.', 'रौलेट एक्ट 1919 में पारित हुआ; यह बिना मुकदमे के नज़रबंदी की अनुमति देता था और इसके विरुद्ध देशव्यापी विरोध हुआ।'],
  }),
  q({
    id: 'ga-science-1',
    subjectId: 'gk',
    chapterId: 'gk-general-science',
    difficulty: 'Easy',
    prompt: ['Which vitamin is produced in human skin in the presence of sunlight?', 'सूर्य के प्रकाश में मानव त्वचा में कौन-सा विटामिन बनता है?'],
    options: [
      ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'],
      ['विटामिन A', 'विटामिन B12', 'विटामिन C', 'विटामिन D'],
    ],
    correct: 3,
    explanation: ['Ultraviolet B rays help the skin synthesise vitamin D, which supports calcium absorption.', 'पराबैंगनी B किरणें त्वचा में विटामिन D बनाने में मदद करती हैं, जो कैल्शियम के अवशोषण के लिए आवश्यक है।'],
  }),
  q({
    id: 'ga-science-2',
    subjectId: 'gk',
    chapterId: 'gk-general-science',
    difficulty: 'Easy',
    prompt: ['What is the SI unit of electric current?', 'विद्युत धारा का SI मात्रक क्या है?'],
    options: [
      ['Volt', 'Ampere', 'Ohm', 'Watt'],
      ['वोल्ट', 'एम्पीयर', 'ओम', 'वाट'],
    ],
    correct: 1,
    explanation: ['Electric current is measured in amperes; volt measures potential difference and ohm measures resistance.', 'विद्युत धारा एम्पीयर में मापी जाती है; वोल्ट विभवांतर और ओम प्रतिरोध का मात्रक है।'],
  }),
]

const hindi: Question[] = [
  q({
    id: 'hi-muh-1',
    subjectId: 'hindi',
    chapterId: 'hindi-muhavare',
    difficulty: 'Easy',
    prompt: ['“अंधे की लाठी” मुहावरे का अर्थ क्या है?', '“अंधे की लाठी” मुहावरे का अर्थ क्या है?'],
    options: [
      ['बहुत भोला व्यक्ति', 'एकमात्र सहारा', 'क्रोधित होना', 'व्यर्थ प्रयास'],
      ['बहुत भोला व्यक्ति', 'एकमात्र सहारा', 'क्रोधित होना', 'व्यर्थ प्रयास'],
    ],
    correct: 1,
    explanation: [
      '“अंधे की लाठी” का अर्थ है एकमात्र सहारा, जैसे अंधे को केवल लाठी का सहारा होता है।',
      '“अंधे की लाठी” का अर्थ है एकमात्र सहारा, जैसे अंधे को केवल लाठी का सहारा होता है।',
    ],
  }),
  q({
    id: 'hi-paryay-1',
    subjectId: 'hindi',
    chapterId: 'hindi-paryayvachi',
    difficulty: 'Easy',
    prompt: ['“सूर्य” का पर्यायवाची शब्द नहीं है…', '“सूर्य” का पर्यायवाची शब्द नहीं है…'],
    options: [
      ['दिनकर', 'रवि', 'भास्कर', 'निशाकर'],
      ['दिनकर', 'रवि', 'भास्कर', 'निशाकर'],
    ],
    correct: 3,
    explanation: ['निशाकर का अर्थ चंद्रमा है; दिनकर, रवि और भास्कर सूर्य के पर्यायवाची हैं।', 'निशाकर का अर्थ चंद्रमा है; दिनकर, रवि और भास्कर सूर्य के पर्यायवाची हैं।'],
  }),
  q({
    id: 'hi-vakya-1',
    subjectId: 'hindi',
    chapterId: 'hindi-vakya-shuddhi',
    difficulty: 'Easy',
    prompt: ['शुद्ध वाक्य चुनिए…', 'शुद्ध वाक्य चुनिए…'],
    options: [
      [
        'वह अपने घर को जा रहा है।',
        'वह अपने घर जा रहा है।',
        'वह अपने घर में जा रहा है।',
        'वह अपने घर पर जा रहा है।',
      ],
      [
        'वह अपने घर को जा रहा है।',
        'वह अपने घर जा रहा है।',
        'वह अपने घर में जा रहा है।',
        'वह अपने घर पर जा रहा है।',
      ],
    ],
    correct: 1,
    explanation: ['“जाना” क्रिया के साथ कारक चिह्न “को/में/पर” की आवश्यकता नहीं होती, इसलिए “वह अपने घर जा रहा है।” शुद्ध है।', '“जाना” क्रिया के साथ कारक चिह्न “को/में/पर” की आवश्यकता नहीं होती, इसलिए “वह अपने घर जा रहा है।” शुद्ध है।'],
  }),
  q({
    id: 'hi-sandhi-1',
    subjectId: 'hindi',
    chapterId: 'hindi-sandhi',
    difficulty: 'Medium',
    prompt: ['“महोत्सव” में कौन-सी संधि है?', '“महोत्सव” में कौन-सी संधि है?'],
    options: [
      ['दीर्घ संधि', 'गुण संधि', 'वृद्धि संधि', 'यण संधि'],
      ['दीर्घ संधि', 'गुण संधि', 'वृद्धि संधि', 'यण संधि'],
    ],
    correct: 1,
    explanation: ['महा + उत्सव = महोत्सव। अ + उ मिलकर “ओ” बनते हैं, जो गुण संधि है।', 'महा + उत्सव = महोत्सव। अ + उ मिलकर “ओ” बनते हैं, जो गुण संधि है।'],
  }),
  q({
    id: 'hi-samas-1',
    subjectId: 'hindi',
    chapterId: 'hindi-samas',
    difficulty: 'Medium',
    prompt: ['“चतुर्भुज” में कौन-सा समास है?', '“चतुर्भुज” में कौन-सा समास है?'],
    options: [
      ['द्वंद्व समास', 'बहुव्रीहि समास', 'तत्पुरुष समास', 'अव्ययीभाव समास'],
      ['द्वंद्व समास', 'बहुव्रीहि समास', 'तत्पुरुष समास', 'अव्ययीभाव समास'],
    ],
    correct: 1,
    explanation: ['चतुर्भुज का विग्रह है “चार भुजाओं वाला”, जिसमें कोई भी पद प्रधान नहीं, इसलिए यह बहुव्रीहि समास है।', 'चतुर्भुज का विग्रह है “चार भुजाओं वाला”, जिसमें कोई भी पद प्रधान नहीं, इसलिए यह बहुव्रीहि समास है।'],
  }),
]

export const questions: Question[] = [
  ...maths,
  ...generatedQuestions,
  ...reasoning,
  ...english,
  ...gk,
  ...hindi,
]

/** Include only questions whose chapter and subject exist in the syllabus. */
export const questionBank = questions.filter((item) => item.chapterId.startsWith(item.subjectId))

export function questionsForChapter(chapterId: string) {
  return questionBank.filter((item) => item.chapterId === chapterId)
}

export function questionsForSubject(subjectId: SubjectId) {
  return questionBank.filter((item) => item.subjectId === subjectId)
}

export function questionById(id: string) {
  return questionBank.find((item) => item.id === id)
}

export const chapterQuestionCounts = questionBank.reduce<Record<string, number>>((acc, item) => {
  acc[item.chapterId] = (acc[item.chapterId] ?? 0) + 1
  return acc
}, {})
