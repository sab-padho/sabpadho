-- Create content, learner, and admin portal tables in Supabase,
-- seeded with initial SabPadho data so both Learner App and Admin Portal
-- operate against real database tables instead of browser-only dummy data.

begin;

create extension if not exists pgcrypto with schema extensions;

-- Ensure a default staff account exists for local/dev admin testing if none is present
insert into public.admin_users (username, password, permissionid)
values ('admin', extensions.crypt('admin123', extensions.gen_salt('bf')), 1)
on conflict (username) do nothing;

-- ============================================================================
-- 1. SUBJECTS
-- ============================================================================
create table if not exists public.subjects (
    id text primary key,
    slug text not null unique,
    name_en text not null,
    name_hi text not null default '',
    short text not null,
    code text not null,
    tint text not null default 'violet',
    tagline text not null default '',
    description text not null default '',
    paper_section text not null default '',
    exams text[] not null default array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways', 'Banking'],
    status text not null default 'Published' check (status in ('Published', 'Draft', 'Archived')),
    learners integer not null default 0,
    accuracy integer not null default 70,
    sort_order integer not null default 0,
    updated_at timestamptz not null default now()
);

-- ============================================================================
-- 2. CHAPTERS (includes free-tier flag + notes / primer outline)
-- ============================================================================
create table if not exists public.chapters (
    id text primary key,
    subject_id text not null references public.subjects (id) on delete cascade,
    slug text not null,
    title_en text not null,
    title_hi text not null default '',
    blurb text not null default '',
    outline jsonb not null default '[]'::jsonb,
    notes_markdown text not null default '',
    difficulty text not null default 'Medium' check (difficulty in ('Easy', 'Medium', 'Hard')),
    status text not null default 'Published' check (status in ('Published', 'Draft', 'Archived')),
    is_free boolean not null default false,
    exams text[] not null default array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways', 'Banking'],
    minutes integer not null default 10,
    attempts integer,
    accuracy integer,
    sort_order integer not null default 0,
    updated_at timestamptz not null default now(),
    unique (subject_id, slug)
);

-- ============================================================================
-- 3. QUESTIONS (shared between Admin Portal & Learner App, supports LLM imports)
-- ============================================================================
create table if not exists public.questions (
    id text primary key,
    subject_id text not null references public.subjects (id) on delete cascade,
    chapter_id text not null references public.chapters (id) on delete cascade,
    exams text[] not null default array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways', 'Banking'],
    difficulty text not null default 'Medium' check (difficulty in ('Easy', 'Medium', 'Hard')),
    question_type text not null default 'MCQ' check (question_type in ('MCQ', 'Numeric')),
    prompt_en text not null,
    prompt_hi text not null default '',
    options_en jsonb not null default '[]'::jsonb,
    options_hi jsonb not null default '[]'::jsonb,
    correct_index integer not null default 0,
    explanation_en text not null default '',
    explanation_hi text not null default '',
    status text not null default 'Published' check (status in ('Published', 'Draft', 'Archived')),
    accuracy integer not null default 70,
    source_file text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists questions_chapter_idx on public.questions (chapter_id);
create index if not exists questions_subject_idx on public.questions (subject_id);
create index if not exists questions_exams_gin_idx on public.questions using gin (exams);

-- ============================================================================
-- 4. CHAPTER NOTES (uploaded or LLM-generated study notes per chapter/exam)
-- ============================================================================
create table if not exists public.chapter_notes (
    id uuid primary key default gen_random_uuid(),
    subject_id text not null references public.subjects (id) on delete cascade,
    chapter_id text not null references public.chapters (id) on delete cascade,
    exams text[] not null default array['SSC CGL'],
    title text not null,
    summary text not null default '',
    key_points jsonb not null default '[]'::jsonb,
    source_file text,
    status text not null default 'Published' check (status in ('Published', 'Draft', 'Archived')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ============================================================================
-- 5. MOCK TESTS
-- ============================================================================
create table if not exists public.mock_tests (
    id text primary key,
    title text not null,
    exam text not null default 'SSC CGL',
    kind text not null default 'Full length' check (kind in ('Full length', 'Sectional', 'Mini')),
    learner_status text not null default 'available' check (learner_status in ('available', 'scheduled', 'completed')),
    status text not null default 'Published' check (status in ('Published', 'Draft', 'Archived')),
    duration_minutes integer not null default 60,
    total_questions integer not null default 100,
    total_marks integer not null default 200,
    sections jsonb not null default '[]'::jsonb,
    description_en text not null default '',
    description_hi text not null default '',
    opens_on text,
    submitted_on text,
    score_label text,
    attempts integer not null default 0,
    avg_score numeric(6, 2) not null default 0,
    updated_at timestamptz not null default now()
);

-- ============================================================================
-- 6. LEARNERS (stores signup profiles + exam preference)
-- ============================================================================
create table if not exists public.learners (
    id text primary key,
    user_id uuid unique references auth.users (id) on delete set null,
    name text not null,
    email text not null unique,
    password_hash text,
    preferred_exam text not null default 'SSC CGL'
        check (preferred_exam in ('SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways', 'Banking')),
    status text not null default 'Active' check (status in ('Active', 'Invited', 'Suspended')),
    plan text not null default 'Free plan',
    attempts integer not null default 0,
    accuracy integer not null default 0,
    streak integer not null default 0,
    saved integer not null default 0,
    joined_at timestamptz not null default now(),
    last_active_at timestamptz not null default now()
);

create index if not exists learners_preferred_exam_idx on public.learners (preferred_exam);

-- ============================================================================
-- 7. PLANS, COUPONS, ANNOUNCEMENTS, ACTIVITY LOG, DAILY STATS
-- ============================================================================
create table if not exists public.plans (
    id text primary key check (id in ('free', 'pro')),
    name text not null,
    price integer not null default 0,
    period text not null default 'forever' check (period in ('forever', 'year')),
    tagline text not null default '',
    learners integer not null default 0,
    status text not null default 'Published' check (status in ('Published', 'Draft', 'Archived')),
    featured boolean not null default false,
    features jsonb not null default '[]'::jsonb,
    updated_at timestamptz not null default now()
);

create table if not exists public.coupons (
    id text primary key,
    code text not null unique,
    discount integer not null,
    kind text not null default 'percent' check (kind in ('percent', 'flat')),
    plan text not null default 'Pro',
    redemptions integer not null default 0,
    redemption_limit integer not null default 100,
    expires_at timestamptz not null,
    status text not null default 'Active' check (status in ('Active', 'Paused', 'Expired')),
    created_at timestamptz not null default now()
);

create table if not exists public.announcements (
    id text primary key,
    title text not null,
    body text not null,
    audience text not null default 'All learners',
    status text not null default 'Sent' check (status in ('Sent', 'Draft')),
    sent_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
    id text primary key,
    actor text not null,
    action text not null,
    target text not null,
    created_at timestamptz not null default now()
);

create table if not exists public.daily_metrics (
    metric_date date primary key,
    attempts integer not null default 0,
    learners integer not null default 0
);

-- ============================================================================
-- 8. LEARNER SIGNUP / SIGNIN / EXAM PREFERENCE RPCS
-- ============================================================================
create or replace function public.learner_signup(
    p_name text,
    p_email text,
    p_password text,
    p_preferred_exam text default 'SSC CGL'
)
returns table (
    id text,
    name text,
    email text,
    preferred_exam text,
    plan text,
    status text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_email text := lower(btrim(p_email));
    v_id text := 'L-' || floor(1000 + random() * 9000)::int::text || '-' || substr(md5(random()::text), 1, 4);
    v_exam text := coalesce(nullif(btrim(p_preferred_exam), ''), 'SSC CGL');
begin
    if exists (select 1 from public.learners l where lower(l.email) = v_email) then
        raise exception 'An account with this email already exists.' using errcode = '23505';
    end if;

    insert into public.learners (
        id, name, email, password_hash, preferred_exam, status, plan, joined_at, last_active_at
    )
    values (
        v_id,
        btrim(p_name),
        v_email,
        extensions.crypt(p_password, extensions.gen_salt('bf')),
        v_exam,
        'Active',
        'Free plan',
        now(),
        now()
    );

    return query
    select l.id, l.name, l.email, l.preferred_exam, l.plan, l.status
    from public.learners l
    where l.id = v_id;
end;
$$;

create or replace function public.learner_signin(
    p_email text,
    p_password text
)
returns table (
    id text,
    name text,
    email text,
    preferred_exam text,
    plan text,
    status text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_email text := lower(btrim(p_email));
begin
    update public.learners l
       set last_active_at = now()
     where lower(l.email) = v_email
       and l.password_hash is not null
       and (
           case
               when l.password_hash like '$2%' then l.password_hash = extensions.crypt(p_password, l.password_hash)
               else l.password_hash = p_password
           end
       );

    return query
    select l.id, l.name, l.email, l.preferred_exam, l.plan, l.status
    from public.learners l
    where lower(l.email) = v_email
      and l.status <> 'Suspended'
      and l.password_hash is not null
      and (
          case
              when l.password_hash like '$2%' then l.password_hash = extensions.crypt(p_password, l.password_hash)
              else l.password_hash = p_password
          end
      )
    limit 1;
end;
$$;

create or replace function public.update_learner_exam(
    p_email text,
    p_preferred_exam text
)
returns void
language sql
security definer
set search_path = ''
as $$
    update public.learners
       set preferred_exam = p_preferred_exam,
           last_active_at = now()
     where lower(email) = lower(btrim(p_email));
$$;

-- ============================================================================
-- 9. ROW-LEVEL SECURITY & PERMISSIONS
-- ============================================================================
alter table public.subjects enable row level security;
alter table public.chapters enable row level security;
alter table public.questions enable row level security;
alter table public.chapter_notes enable row level security;
alter table public.mock_tests enable row level security;
alter table public.learners enable row level security;
alter table public.plans enable row level security;
alter table public.coupons enable row level security;
alter table public.announcements enable row level security;
alter table public.activity_logs enable row level security;
alter table public.daily_metrics enable row level security;

-- Grant table access for client & admin portal queries
grant select, insert, update, delete on table
    public.subjects,
    public.chapters,
    public.questions,
    public.chapter_notes,
    public.mock_tests,
    public.plans,
    public.coupons,
    public.announcements,
    public.activity_logs,
    public.daily_metrics
to anon, authenticated;

grant select, update on table public.learners to anon, authenticated;
grant execute on function public.learner_signup(text, text, text, text) to anon, authenticated;
grant execute on function public.learner_signin(text, text) to anon, authenticated;
grant execute on function public.update_learner_exam(text, text) to anon, authenticated;

drop policy if exists "Public and staff access subjects" on public.subjects;
create policy "Public and staff access subjects" on public.subjects for all to anon, authenticated using (true) with check (true);

drop policy if exists "Public and staff access chapters" on public.chapters;
create policy "Public and staff access chapters" on public.chapters for all to anon, authenticated using (true) with check (true);

drop policy if exists "Public and staff access questions" on public.questions;
create policy "Public and staff access questions" on public.questions for all to anon, authenticated using (true) with check (true);

drop policy if exists "Public and staff access chapter_notes" on public.chapter_notes;
create policy "Public and staff access chapter_notes" on public.chapter_notes for all to anon, authenticated using (true) with check (true);

drop policy if exists "Public and staff access mock_tests" on public.mock_tests;
create policy "Public and staff access mock_tests" on public.mock_tests for all to anon, authenticated using (true) with check (true);

drop policy if exists "Read and update learners" on public.learners;
create policy "Read and update learners" on public.learners for select to anon, authenticated using (true);

drop policy if exists "Update learner status" on public.learners;
create policy "Update learner status" on public.learners for update to anon, authenticated using (true) with check (true);

drop policy if exists "Public and staff access plans" on public.plans;
create policy "Public and staff access plans" on public.plans for all to anon, authenticated using (true) with check (true);

drop policy if exists "Public and staff access coupons" on public.coupons;
create policy "Public and staff access coupons" on public.coupons for all to anon, authenticated using (true) with check (true);

drop policy if exists "Public and staff access announcements" on public.announcements;
create policy "Public and staff access announcements" on public.announcements for all to anon, authenticated using (true) with check (true);

drop policy if exists "Public and staff access activity_logs" on public.activity_logs;
create policy "Public and staff access activity_logs" on public.activity_logs for all to anon, authenticated using (true) with check (true);

drop policy if exists "Public and staff access daily_metrics" on public.daily_metrics;
create policy "Public and staff access daily_metrics" on public.daily_metrics for all to anon, authenticated using (true) with check (true);

-- ============================================================================
-- 10. SEED SUBJECTS, CHAPTERS, MOCKS, LEARNERS, PLANS, COUPONS, ANNOUNCEMENTS
-- ============================================================================
insert into public.subjects (id, slug, name_en, name_hi, short, code, tint, tagline, description, paper_section, exams, status, learners, accuracy, sort_order)
values
    ('maths', 'maths', 'Quantitative Aptitude', 'गणित', 'Maths', 'QA', 'violet', 'Percentages, profit & loss, time & work', 'Short-cut methods for the topics that repeat in every paper. Each solution shows the working, not just the final option.', 'Quantitative Aptitude', array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways', 'Banking'], 'Published', 1240, 72, 1),
    ('reasoning', 'reasoning', 'General Intelligence & Reasoning', 'तर्कशक्ति', 'Reasoning', 'GI', 'plum', 'Syllogisms, coding, series and relations', 'Draw the diagram, test every conclusion, and stop guessing between two options that look similar.', 'General Intelligence & Reasoning', array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways', 'Banking'], 'Published', 1188, 69, 2),
    ('english', 'english', 'English Language', 'अंग्रेज़ी', 'English', 'EN', 'teal', 'Vocabulary, idioms, error spotting', 'A small daily vocabulary habit, plus the grammar checks that decide most Tier-I English questions.', 'English Comprehension', array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Banking'], 'Published', 1092, 66, 3),
    ('gk', 'general-awareness', 'General Awareness', 'सामान्य जागरूकता', 'GK', 'GA', 'amber', 'Polity, geography, history, science', 'Static topics that reward regular small doses. Every answer links to the chapter it came from.', 'General Awareness', array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways', 'Banking'], 'Published', 986, 61, 4),
    ('hindi', 'hindi', 'Hindi Language', 'हिंदी भाषा', 'Hindi', 'HI', 'rose', 'व्याकरण, मुहावरे और वाक्य शुद्धि', 'हिंदी की तैयारी के लिए छोटे-छोटे अभ्यास, व्याकरण के नियम, मुहावरे और शब्द भंडार।', 'Hindi Language', array['SSC CHSL', 'SSC GD'], 'Published', 431, 74, 5)
on conflict (id) do nothing;

insert into public.chapters (id, subject_id, slug, title_en, title_hi, blurb, outline, difficulty, status, is_free, exams, minutes, attempts, accuracy, sort_order)
values
    ('maths-percentages', 'maths', 'percentages', 'Percentages', 'प्रतिशत', 'Fraction conversion, successive change and the base-value trap.', '["Percentage as a fraction of 100, and the fractions worth memorising","Increase, decrease and successive changes","Discounts, marked price and effective change","Finding the base value when the percentage is known"]'::jsonb, 'Easy', 'Published', true, array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways', 'Banking'], 12, 5, 62, 1),
    ('maths-profit-loss', 'maths', 'profit-loss', 'Profit & loss', 'लाभ और हानि', 'Cost price, marked price, discount and effective profit.', '["Cost price, selling price and the profit percentage formula","Marked price and discount as separate steps","Successive discounts and a single equivalent discount","Loss percentage and finding the cost price"]'::jsonb, 'Medium', 'Published', false, array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways', 'Banking'], 14, 3, 70, 2),
    ('maths-time-work', 'maths', 'time-work', 'Time & work', 'समय और कार्य', 'Work rates, combined effort and the remaining-work question.', '["One day’s work as a fraction of the total","Two workers together, and finding one worker’s rate","Work left after a few days of combined effort","Men, days and the inverse relationship"]'::jsonb, 'Hard', 'Published', false, array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways'], 15, 1, null, 3),
    ('maths-ratio-proportion', 'maths', 'ratio-proportion', 'Ratio & proportion', 'अनुपात और समानुपात', 'Share an amount without setting up heavy equations.', '["Parts of a whole and the value of one part","Direct proportion in rate and price questions","Dividing an amount in a given ratio","Ratio chains and combining two ratios"]'::jsonb, 'Medium', 'Published', false, array['SSC CGL', 'SSC CHSL', 'Railways', 'Banking'], 10, 8, 81, 4),
    ('maths-averages', 'maths', 'averages', 'Averages', 'औसत', 'Average changes, replaced values and the run-rate question.', '["Average × count = total, and why totals are easier","What happens to an average when a value is added","Finding a removed or replaced value","Weighted averages in mixture questions"]'::jsonb, 'Easy', 'Published', false, array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Banking'], 10, 2, null, 5),

    ('reasoning-syllogisms', 'reasoning', 'syllogisms', 'Syllogisms', 'न्यायवाक्य', 'Venn diagrams that settle “some” and “no” conclusions.', '["Reading “all”, “some” and “no” statements precisely","Drawing the minimum-possibility Venn diagram","Testing each conclusion against the diagram","The “either–or” case, with an example"]'::jsonb, 'Medium', 'Published', true, array['SSC CGL', 'SSC CHSL', 'Banking', 'Railways'], 13, 6, 83, 1),
    ('reasoning-coding-decoding', 'reasoning', 'coding-decoding', 'Coding–decoding', 'कूट-भाषा', 'Letter shifts, positional codes and the pattern-first habit.', '["Letter and number shifts between word and code","Positional values of A–Z and reverse pairs","Mixed rules: first letter forward, last letter back","Checking the pattern on every letter before answering"]'::jsonb, 'Medium', 'Published', false, array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways', 'Banking'], 10, 4, 75, 2),
    ('reasoning-number-series', 'reasoning', 'number-series', 'Number series', 'संख्या श्रेणी', 'Differences, squares and mixed patterns in one minute.', '["First differences and where they point","Square, cube and prime-based series","Alternating and mixed-operation series","Missing term in the middle of a series"]'::jsonb, 'Medium', 'Published', false, array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways', 'Banking'], 9, 3, 67, 3),
    ('reasoning-blood-relations', 'reasoning', 'blood-relations', 'Blood relations', 'रक्त संबंध', 'Draw the family tree before you look at the options.', '["Notation for father, mother, brother and sister","Reading “only son of my grandfather” type clues","Gendered words that change the answer","Checking the question from the speaker’s side"]'::jsonb, 'Easy', 'Published', false, array['SSC CGL', 'SSC CHSL', 'Banking', 'Railways'], 10, 2, null, 4),
    ('reasoning-direction-sense', 'reasoning', 'direction-sense', 'Direction & distance', 'दिशा ज्ञान', 'Sketch the path and use one right triangle.', '["The eight compass directions and left/right turns","Sketching the path from the starting point","Finding the shortest distance with Pythagoras","Handling multiple turns without losing direction"]'::jsonb, 'Easy', 'Published', false, array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways'], 9, 2, null, 5),

    ('english-synonyms', 'english', 'synonyms', 'Synonyms & antonyms', 'पर्यायवाची व विलोम', 'Words that appear again and again in Tier-I papers.', '["Synonyms with context, not just a thesaurus match","Antonyms and the prefix that flips meaning","Words borrowed from Latin and Greek roots","A short revision list for the week"]'::jsonb, 'Medium', 'Published', true, array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Banking'], 8, 7, 74, 1),
    ('english-idioms', 'english', 'idioms', 'Idioms & phrases', 'मुहावरे', 'The idioms SSC keeps rotating through its papers.', '["Everyday idioms and their plain-English meaning","Idioms with body parts and animals","Once a month revision to keep them active","Telling a literal phrase from an idiom"]'::jsonb, 'Medium', 'Published', false, array['SSC CGL', 'SSC CHSL', 'SSC GD'], 8, 4, 69, 2),
    ('english-spotting-errors', 'english', 'spotting-errors', 'Spotting errors', 'वाक्य में त्रुटि', 'Subject–verb agreement, prepositions and tricky plurals.', '["Singular and plural agreement in long subjects","“One of my friends” and other fixed patterns","Preposition pairs that go with a verb","Articles before countable nouns"]'::jsonb, 'Hard', 'Published', false, array['SSC CGL', 'SSC CHSL', 'Banking'], 12, 5, 66, 3),
    ('english-fill-blanks', 'english', 'fill-blanks', 'Fill in the blanks', 'रिक्त स्थान', 'Tense and preposition clues inside the sentence.', '["Time markers that reveal the tense","Since and for with a point in time","Conditional sentences with “had”","Collocations that fix the right option"]'::jsonb, 'Easy', 'Published', false, array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Banking'], 10, 3, 71, 4),
    ('english-one-word', 'english', 'one-word', 'One-word substitution', 'एक शब्द प्रतिस्थापन', 'Compact substitutions worth one mark each.', '["People and professions in one word","Places and collectives","Words with a negative sense","Choosing between two near-identical options"]'::jsonb, 'Medium', 'Draft', false, array['SSC CGL', 'SSC CHSL'], 9, 1, null, 5),

    ('gk-indian-polity', 'gk', 'indian-polity', 'Indian polity', 'भारतीय राजव्यवस्था', 'Articles, schedules and who does what.', '["Articles that appear most often in SSC papers","Union, state and concurrent lists","Constitutional bodies and their powers","Fundamental rights in plain language"]'::jsonb, 'Medium', 'Published', true, array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways'], 11, 6, 78, 1),
    ('gk-geography', 'gk', 'geography', 'Geography', 'भूगोल', 'Rivers, latitude lines and Indian states.', '["Rivers and their tributaries","The Tropic of Cancer and the states it crosses","Soils, crops and the monsoon","National parks and biosphere reserves"]'::jsonb, 'Medium', 'Published', false, array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways'], 11, 4, 71, 2),
    ('gk-modern-history', 'gk', 'modern-history', 'Modern history', 'आधुनिक भारत', 'Acts, movements and the years that matter.', '["Acts passed under British rule","Freedom movement milestones","Founders of key institutions","Reform movements and their leaders"]'::jsonb, 'Hard', 'Published', false, array['SSC CGL', 'SSC CHSL', 'Railways'], 12, 2, null, 3),
    ('gk-general-science', 'gk', 'general-science', 'General science', 'सामान्य विज्ञान', 'Class 8–10 science, asked directly.', '["Human body systems and vitamins","Units and measurement","Everyday physics and chemistry","Inventions and their inventors"]'::jsonb, 'Hard', 'Published', false, array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways'], 10, 3, 75, 4),
    ('gk-static-gk', 'gk', 'static-gk', 'Static GK', 'स्थिर सामान्य ज्ञान', 'Capitals, currencies, awards and days.', '["Capitals and currencies of neighbouring countries","National awards and their fields","Important dates and their themes","First in India and world records"]'::jsonb, 'Easy', 'Published', false, array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways', 'Banking'], 9, 1, null, 5),

    ('hindi-muhavare', 'hindi', 'muhavare', 'Idioms (Hindi)', 'मुहावरे', 'अर्थ, प्रयोग और अंतर पहचानने वाले प्रश्न।', '["मुहावरे का अर्थ और वाक्य में प्रयोग","एक जैसे दिखने वाले मुहावरों का अंतर","परीक्षा में दोहराए जाने वाले मुहावरे","लोकोक्तियाँ और मुहावरे में अंतर"]'::jsonb, 'Medium', 'Published', true, array['SSC CHSL', 'SSC GD'], 8, 4, 79, 1),
    ('hindi-paryayvachi', 'hindi', 'paryayvachi', 'Synonyms (Hindi)', 'पर्यायवाची शब्द', 'एक शब्द के कई रूप, और “नहीं है” वाले प्रश्न।', '["सामान्य शब्दों के पर्यायवाची","“कौन-सा पर्यायवाची नहीं है” पैटर्न","विलोम शब्द के साथ अंतर","रोज़ दो शब्द याद करने की आदत"]'::jsonb, 'Easy', 'Published', false, array['SSC CHSL', 'SSC GD'], 8, 5, 84, 2),
    ('hindi-vakya-shuddhi', 'hindi', 'vakya-shuddhi', 'Sentence correction', 'वाक्य शुद्धि', 'वाक्य में गलत शब्द, कारक और पुनरुक्ति।', '["कारक चिह्नों का अनावश्यक प्रयोग","पुनरुक्ति दोष","वचन और लिंग की अशुद्धियाँ","शुद्ध वाक्य पहचानने की विधि"]'::jsonb, 'Medium', 'Published', false, array['SSC CHSL', 'SSC GD'], 10, 3, 76, 3),
    ('hindi-sandhi', 'hindi', 'sandhi', 'Sandhi', 'संधि', 'स्वर संधि, व्यंजन संधि और विच्छेद।', '["स्वर संधि के प्रकार","व्यंजन और विसर्ग संधि","संधि विच्छेद करने का क्रम","अपवाद वाले शब्द"]'::jsonb, 'Medium', 'Published', false, array['SSC CHSL', 'SSC GD'], 9, 2, null, 4),
    ('hindi-samas', 'hindi', 'samas', 'Compound words', 'समास', 'समास के भेद और उदाहरण।', '["समास किसे कहते हैं","तत्पुरुष और द्वंद्व समास","बहुव्रीहि और अव्ययीभाव","समास विग्रह के अभ्यास प्रश्न"]'::jsonb, 'Medium', 'Published', false, array['SSC CHSL', 'SSC GD'], 9, 1, null, 5)
on conflict (id) do nothing;

-- Seed core questions in public.questions
insert into public.questions (id, subject_id, chapter_id, exams, difficulty, question_type, prompt_en, prompt_hi, options_en, options_hi, correct_index, explanation_en, explanation_hi, status, accuracy)
values
    ('qa-pct-1', 'maths', 'maths-percentages', array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways', 'Banking'], 'Easy', 'MCQ',
     'A number is increased by 20% and then decreased by 10%. What is the net change?',
     'एक संख्या को पहले 20% बढ़ाया जाता है और फिर 10% घटाया जाता है। शुद्ध परिवर्तन क्या है?',
     '["+8%", "+10%", "−2%", "+12%"]'::jsonb, '["+8%", "+10%", "−2%", "+12%"]'::jsonb, 0,
     'Start with 100. A 20% rise takes it to 120; a 10% fall on 120 gives 108. The net change is +8%, not +10%.',
     '100 से शुरू करें। 20% वृद्धि से 120 बनता है; 120 पर 10% कमी से 108 बनता है। शुद्ध परिवर्तन +8% है, +10% नहीं।',
     'Published', 82),
    ('qa-pct-2', 'maths', 'maths-percentages', array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways', 'Banking'], 'Easy', 'MCQ',
     'Sugar costs ₹40 per kg in January and ₹46 per kg in March. What is the percentage increase?',
     'जनवरी में चीनी ₹40 प्रति किग्रा और मार्च में ₹46 प्रति किग्रा है। प्रतिशत वृद्धि कितनी है?',
     '["12%", "15%", "18%", "20%"]'::jsonb, '["12%", "15%", "18%", "20%"]'::jsonb, 1,
     'The rise is 46 − 40 = ₹6. Divide by the original value: 6 ÷ 40 × 100 = 15%.',
     'वृद्धि = 46 − 40 = ₹6. मूल मान से भाग दें: 6 ÷ 40 × 100 = 15%.',
     'Published', 79),
    ('qa-pl-2', 'maths', 'maths-profit-loss', array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways', 'Banking'], 'Medium', 'MCQ',
     'A shopkeeper marks an article 20% above its cost price and then allows a 10% discount. What is his profit percentage?',
     'एक दुकानदार किसी वस्तु का अंकित मूल्य क्रय मूल्य से 20% अधिक रखता है और फिर 10% छूट देता है। उसका लाभ प्रतिशत क्या है?',
     '["8%", "10%", "12%", "15%"]'::jsonb, '["8%", "10%", "12%", "15%"]'::jsonb, 0,
     'Take the cost price as 100. The marked price is 120. After a 10% discount the selling price is 108, so the profit is 8%.',
     'क्रय मूल्य 100 लें। अंकित मूल्य 120 है। 10% छूट के बाद विक्रय मूल्य 108 है, इसलिए लाभ 8% है।',
     'Published', 68),
    ('qa-tw-1', 'maths', 'maths-time-work', array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways'], 'Easy', 'MCQ',
     'A can finish a task in 12 days and B in 18 days. Working together, how long will they take?',
     'A किसी काम को 12 दिनों में और B 18 दिनों में पूरा कर सकता है। साथ मिलकर कितने दिन लगेंगे?',
     '["7 days", "7.2 days", "7.5 days", "8 days"]'::jsonb, '["7 दिन", "7.2 दिन", "7.5 दिन", "8 दिन"]'::jsonb, 1,
     'Combined work per day = 1/12 + 1/18 = 5/36. Time = 36/5 = 7.2 days.',
     'एक दिन का संयुत कार्य = 1/12 + 1/18 = 5/36. समय = 36/5 = 7.2 दिन.',
     'Published', 74),
    ('qa-ratio-1', 'maths', 'maths-ratio-proportion', array['SSC CGL', 'SSC CHSL', 'Railways', 'Banking'], 'Easy', 'MCQ',
     'The ratio of two numbers is 3 : 5 and their sum is 96. What is the larger number?',
     'दो संख्याओं का अनुपात 3 : 5 है और उनका योग 96 है। बड़ी संख्या क्या है?',
     '["36", "48", "60", "64"]'::jsonb, '["36", "48", "60", "64"]'::jsonb, 2,
     'The ratio has 3 + 5 = 8 equal parts. One part is 96 ÷ 8 = 12, so the larger number is 5 × 12 = 60.',
     'अनुपात में 3 + 5 = 8 बराबर भाग हैं। एक भाग = 96 ÷ 8 = 12, इसलिए बड़ी संख्या = 5 × 12 = 60.',
     'Published', 81),
    ('gi-syl-1', 'reasoning', 'reasoning-syllogisms', array['SSC CGL', 'SSC CHSL', 'Banking', 'Railways'], 'Easy', 'MCQ',
     E'Statements: All roses are flowers. All flowers are plants.\nConclusions: I. All roses are plants. II. Some plants are roses.',
     E'कथन: सभी गुलाब फूल हैं। सभी फूल पौधे हैं।\nनिष्कर्ष: I. सभी गुलाब पौधे हैं। II. कुछ पौधे गुलाब हैं।',
     '["Only I follows", "Only II follows", "Both I and II follow", "Neither I nor II follows"]'::jsonb,
     '["केवल I सही है", "केवल II सही है", "I और II दोनों सही हैं", "न I न II सही है"]'::jsonb, 2,
     'Roses sit inside flowers, and flowers sit inside plants, so all roses are plants. Because roses exist, some plants are roses as well.',
     'गुलाब फूलों के भीतर और फूल पौधों के भीतर आते हैं, इसलिए सभी गुलाब पौधे हैं। गुलाब होने के कारण कुछ पौधे गुलाब भी हैं।',
     'Published', 83),
    ('gi-code-1', 'reasoning', 'reasoning-coding-decoding', array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways', 'Banking'], 'Easy', 'MCQ',
     'In a certain code, ROAD is written as TQCF. How is PATH written in the same code?',
     'एक निश्चित कूट में ROAD को TQCF लिखा जाता है। उसी कूट में PATH कैसे लिखा जाएगा?',
     '["RCVJ", "RCUJ", "QCVJ", "RDVJ"]'::jsonb, '["RCVJ", "RCUJ", "QCVJ", "RDVJ"]'::jsonb, 0,
     'Every letter moves two places forward: R→T, O→Q, A→C, D→F. Applying the same rule, P→R, A→C, T→V, H→J gives RCVJ.',
     'हर अक्षर दो स्थान आगे बढ़ता है: R→T, O→Q, A→C, D→F. इसी नियम से P→R, A→C, T→V, H→J, अर्थात RCVJ.',
     'Published', 77),
    ('gi-series-1', 'reasoning', 'reasoning-number-series', array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways', 'Banking'], 'Easy', 'MCQ',
     'Find the next term: 3, 6, 12, 24, 48, ?',
     'अगला पद ज्ञात कीजिए: 3, 6, 12, 24, 48, ?',
     '["72", "96", "108", "120"]'::jsonb, '["72", "96", "108", "120"]'::jsonb, 1,
     'Every term is double the one before it: 48 × 2 = 96.',
     'हर पद अपने पिछले पद का दोगुना है: 48 × 2 = 96.',
     'Published', 86),
    ('en-syn-1', 'english', 'english-synonyms', array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Banking'], 'Easy', 'MCQ',
     'Choose the word most similar in meaning to “abundant”.',
     '“Abundant” के सबसे निकट अर्थ वाला शब्द चुनिए।',
     '["Scarce", "Plentiful", "Narrow", "Fragile"]'::jsonb, '["Scarce", "Plentiful", "Narrow", "Fragile"]'::jsonb, 1,
     'Abundant means existing in large quantities, so plentiful is the closest match. Scarce is its opposite.',
     'Abundant का अर्थ है भरपूर मात्रा में, इसलिए plentiful सबसे निकट है। Scarce इसका विलोम है।',
     'Published', 78),
    ('en-idiom-1', 'english', 'english-idioms', array['SSC CGL', 'SSC CHSL', 'SSC GD'], 'Easy', 'MCQ',
     'What does the idiom “to bite the bullet” mean?',
     'मुहावरे “to bite the bullet” का अर्थ क्या है?',
     '["To face a difficult situation bravely", "To speak without thinking", "To avoid a task quietly", "To accept defeat"]'::jsonb,
     '["कठिन परिस्थिति का साहस से सामना करना", "बिना सोचे बोलना", "चुपचाप काम टालना", "हार स्वीकार करना"]'::jsonb, 0,
     'It means to endure something painful or difficult because it cannot be avoided.',
     'इसका अर्थ है किसी कठिन या पीड़ादायक काम को सहना, क्योंकि उससे बचा नहीं जा सकता।',
     'Published', 75),
    ('en-error-1', 'english', 'english-spotting-errors', array['SSC CGL', 'SSC CHSL', 'Banking'], 'Medium', 'MCQ',
     E'Choose the part of the sentence that contains an error:\n(A) The number of applicants / (B) have increased / (C) since last year. / (D) No error',
     E'वाक्य का वह भाग चुनिए जिसमें त्रुटि है:\n(A) The number of applicants / (B) have increased / (C) since last year. / (D) No error',
     '["(A)", "(B)", "(C)", "(D)"]'::jsonb, '["(A)", "(B)", "(C)", "(D)"]'::jsonb, 1,
     '“The number of” takes a singular verb, so “have increased” should be “has increased”.',
     '“The number of” के साथ एकवचन क्रिया आती है, इसलिए “have increased” की जगह “has increased” होगा।',
     'Published', 62),
    ('ga-polity-1', 'gk', 'gk-indian-polity', array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways'], 'Easy', 'MCQ',
     'Which article of the Constitution deals with the Election Commission of India?',
     'संविधान का कौन-सा अनुच्छेद भारत निर्वाचन आयोग से संबंधित है?',
     '["Article 314", "Article 315", "Article 324", "Article 356"]'::jsonb,
     '["अनुच्छेद 314", "अनुच्छेद 315", "अनुच्छेद 324", "अनुच्छेद 356"]'::jsonb, 2,
     'Article 324 provides for the superintendence, direction and control of elections by the Election Commission.',
     'अनुच्छेद 324 निर्वाचन आयोग को चुनावों के अधीक्षण, निर्देशन और नियंत्रण की शक्ति देता है।',
     'Published', 79),
    ('ga-geo-2', 'gk', 'gk-geography', array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways'], 'Medium', 'MCQ',
     'The Tropic of Cancer passes through how many Indian states?',
     'कर्क रेखा भारत के कितने राज्यों से गुजरती है?',
     '["6", "7", "8", "9"]'::jsonb, '["6", "7", "8", "9"]'::jsonb, 2,
     'It crosses eight states, from Gujarat in the west to Mizoram in the east.',
     'यह आठ राज्यों से गुजरती है, पश्चिम में गुजरात से पूर्व में मिज़ोरम तक।',
     'Published', 68),
    ('ga-science-1', 'gk', 'gk-general-science', array['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways'], 'Easy', 'MCQ',
     'Which vitamin is produced in human skin in the presence of sunlight?',
     'सूर्य के प्रकाश में मानव त्वचा में कौन-सा विटामिन बनता है?',
     '["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"]'::jsonb,
     '["विटामिन A", "विटामिन B12", "विटामिन C", "विटामिन D"]'::jsonb, 3,
     'Ultraviolet B rays help the skin synthesise vitamin D, which supports calcium absorption.',
     'पराबैंगनी B किरणें त्वचा में विटामिन D बनाने में मदद करती हैं, जो कैल्शियम के अवशोषण के लिए आवश्यक है।',
     'Published', 84),
    ('hi-muh-1', 'hindi', 'hindi-muhavare', array['SSC CHSL', 'SSC GD'], 'Easy', 'MCQ',
     '“अंधे की लाठी” मुहावरे का अर्थ क्या है?',
     '“अंधे की लाठी” मुहावरे का अर्थ क्या है?',
     '["बहुत भोला व्यक्ति", "एकमात्र सहारा", "क्रोधित होना", "व्यर्थ प्रयास"]'::jsonb,
     '["बहुत भोला व्यक्ति", "एकमात्र सहारा", "क्रोधित होना", "व्यर्थ प्रयास"]'::jsonb, 1,
     '“अंधे की लाठी” का अर्थ है एकमात्र सहारा, जैसे अंधे को केवल लाठी का सहारा होता है।',
     '“अंधे की लाठी” का अर्थ है एकमात्र सहारा, जैसे अंधे को केवल लाठी का सहारा होता है।',
     'Published', 85)
on conflict (id) do nothing;

-- Seed mock_tests across all 5 exams
insert into public.mock_tests (id, title, exam, kind, learner_status, status, duration_minutes, total_questions, total_marks, sections, description_en, description_hi, opens_on, submitted_on, score_label, attempts, avg_score)
values
    ('mock-03', 'CGL Tier I · Mock 03', 'SSC CGL', 'Full length', 'completed', 'Published', 60, 100, 200,
     '[{"id":"reasoning","name":"General Intelligence & Reasoning","subjectIds":["reasoning"],"questionIds":[],"patternQuestions":25},{"id":"quant","name":"Quantitative Aptitude","subjectIds":["maths"],"questionIds":[],"patternQuestions":25},{"id":"english","name":"English Comprehension","subjectIds":["english"],"questionIds":[],"patternQuestions":25},{"id":"gk","name":"General Awareness","subjectIds":["gk"],"questionIds":[],"patternQuestions":25}]'::jsonb,
     'The full Tier-I pattern: 100 questions across four sections, with 2 marks for a correct answer and 0.5 deducted for a wrong one.',
     'पूरा Tier-I पैटर्न: चार सेक्शनों में 100 प्रश्न, सही उत्तर पर 2 अंक और गलत पर 0.5 कटौती।',
     null, '15 Nov 2026', '133.5 / 200', 842, 126.4),
    ('mini-06', 'CGL Tier I · Mini mock 06', 'SSC CGL', 'Mini', 'available', 'Published', 15, 12, 24,
     '[{"id":"reasoning","name":"General Intelligence & Reasoning","subjectIds":["reasoning"],"questionIds":["gi-syl-1","gi-code-1","gi-series-1"]},{"id":"quant","name":"Quantitative Aptitude","subjectIds":["maths"],"questionIds":["qa-pct-2","qa-pl-2","qa-tw-1"]},{"id":"english","name":"English Comprehension","subjectIds":["english"],"questionIds":["en-syn-1","en-idiom-1","en-error-1"]},{"id":"gk","name":"General Awareness","subjectIds":["gk"],"questionIds":["ga-polity-1","ga-geo-2","ga-science-1"]}]'::jsonb,
     'Twelve questions in the same four-section order as the real paper. A good pacing check when you have fifteen minutes.',
     'असली पेपर जैसे चार-सेक्शन क्रम में बारह प्रश्न। पंद्रह मिनट में गति जाँचने का अच्छा तरीका।',
     null, null, null, 611, 16.8),
    ('chsl-mini-01', 'CHSL Tier I · Mini mock 01', 'SSC CHSL', 'Mini', 'available', 'Published', 15, 10, 20,
     '[{"id":"reasoning","name":"General Intelligence & Reasoning","subjectIds":["reasoning"],"questionIds":["gi-syl-1","gi-code-1"]},{"id":"quant","name":"Quantitative Aptitude","subjectIds":["maths"],"questionIds":["qa-pct-1","qa-ratio-1"]},{"id":"hindi","name":"Hindi / Language","subjectIds":["hindi","english"],"questionIds":["hi-muh-1","en-syn-1"]},{"id":"gk","name":"General Awareness","subjectIds":["gk"],"questionIds":["ga-polity-1","ga-science-1"]}]'::jsonb,
     'CHSL Tier-I pacing check covering Reasoning, Quant, Language (Hindi/English) and General Awareness.',
     'CHSL Tier-I अभ्यास सेट: रीज़निंग, गणित, भाषा और सामान्य जागरूकता।',
     null, null, null, 392, 14.6),
    ('gd-mini-01', 'SSC GD Constable · Speed Set 01', 'SSC GD', 'Mini', 'available', 'Published', 12, 8, 16,
     '[{"id":"reasoning","name":"Elementary Reasoning","subjectIds":["reasoning"],"questionIds":["gi-code-1","gi-series-1"]},{"id":"quant","name":"Elementary Mathematics","subjectIds":["maths"],"questionIds":["qa-pct-1","qa-tw-1"]},{"id":"hindi","name":"Hindi / English","subjectIds":["hindi"],"questionIds":["hi-muh-1"]},{"id":"gk","name":"General Knowledge","subjectIds":["gk"],"questionIds":["ga-polity-1","ga-geo-2","ga-science-1"]}]'::jsonb,
     'Modelled on the SSC GD Constable CBT pattern with elementary maths, general knowledge and Hindi.',
     'SSC GD कांस्टेबल पैटर्न पर आधारित तेज़ अभ्यास सेट।',
     null, null, null, 518, 12.4),
    ('rrb-ntpc-01', 'Railways RRB NTPC · CBT-1 Mini 01', 'Railways', 'Mini', 'available', 'Published', 15, 9, 18,
     '[{"id":"maths","name":"Mathematics","subjectIds":["maths"],"questionIds":["qa-pct-1","qa-tw-1","qa-ratio-1"]},{"id":"reasoning","name":"General Intelligence & Reasoning","subjectIds":["reasoning"],"questionIds":["gi-syl-1","gi-series-1","gi-code-1"]},{"id":"ga","name":"General Awareness & Science","subjectIds":["gk"],"questionIds":["ga-polity-1","ga-geo-2","ga-science-1"]}]'::jsonb,
     'RRB NTPC Stage-I pattern focusing heavily on General Awareness, General Science, Maths and Reasoning.',
     'रेलवे RRB NTPC CBT-1 पैटर्न: सामान्य विज्ञान, जागरूकता, गणित और तर्कशक्ति।',
     null, null, null, 447, 13.9),
    ('ibps-po-01', 'Banking IBPS PO · Prelims Mini 01', 'Banking', 'Mini', 'available', 'Published', 12, 9, 18,
     '[{"id":"english","name":"English Language","subjectIds":["english"],"questionIds":["en-syn-1","en-error-1","en-idiom-1"]},{"id":"quant","name":"Quantitative Aptitude","subjectIds":["maths"],"questionIds":["qa-pct-1","qa-pl-2","qa-ratio-1"]},{"id":"reasoning","name":"Reasoning Ability","subjectIds":["reasoning"],"questionIds":["gi-syl-1","gi-code-1","gi-series-1"]}]'::jsonb,
     'IBPS PO Prelims three-section speed test: English, Quantitative Aptitude and Reasoning Ability.',
     'बैंकिंग IBPS PO प्रारंभिक परीक्षा पैटर्न पर तीन-सेक्शन स्पीड टेस्ट।',
     null, null, null, 365, 13.2)
on conflict (id) do nothing;

-- Seed sample learners (including the preview test@gmail.com learner)
insert into public.learners (id, name, email, password_hash, preferred_exam, status, plan, attempts, accuracy, streak, saved, joined_at, last_active_at)
values
    ('L-1040', 'Aarav Deshmukh', 'test@gmail.com', extensions.crypt('test@123', extensions.gen_salt('bf')), 'SSC CGL', 'Active', 'Free plan', 157, 72, 9, 8, now() - interval '88 days', now()),
    ('L-1041', 'Aarav Sharma', 'aarav.sharma@example.com', extensions.crypt('pass1234', extensions.gen_salt('bf')), 'SSC CGL', 'Active', 'Pro', 1842, 78, 12, 34, now() - interval '96 days', now() - interval '2 hours'),
    ('L-1042', 'Meera Patil', 'meera.patil@example.com', extensions.crypt('pass1234', extensions.gen_salt('bf')), 'SSC CHSL', 'Active', 'Free plan', 1210, 71, 6, 21, now() - interval '74 days', now() - interval '5 hours'),
    ('L-1043', 'Riya Shah', 'riya.shah@example.com', extensions.crypt('pass1234', extensions.gen_salt('bf')), 'Banking', 'Active', 'Pro', 640, 76, 8, 19, now() - interval '45 days', now() - interval '1 day'),
    ('L-1044', 'Kabir Nair', 'kabir.nair@example.com', extensions.crypt('pass1234', extensions.gen_salt('bf')), 'Railways', 'Active', 'Free plan', 964, 64, 3, 12, now() - interval '58 days', now() - interval '2 days'),
    ('L-1045', 'Ananya Deshmukh', 'ananya.deshmukh@example.com', extensions.crypt('pass1234', extensions.gen_salt('bf')), 'SSC CHSL', 'Active', 'Pro', 745, 83, 21, 27, now() - interval '41 days', now() - interval '3 hours'),
    ('L-1046', 'Vihaan Iyer', 'vihaan.iyer@example.com', extensions.crypt('pass1234', extensions.gen_salt('bf')), 'SSC GD', 'Suspended', 'Free plan', 330, 48, 0, 4, now() - interval '122 days', now() - interval '19 days')
on conflict (email) do nothing;

insert into public.plans (id, name, price, period, tagline, learners, status, featured, features)
values
    ('free', 'Free', 0, 'forever', 'Limited chapter primers before signup; preferred exam workspace after free signup.', 198, 'Published', false,
     '["Selected free chapter primers","Exam-focused study workspace on signup","5-question topic sprints","Recall calendar and revision queue"]'::jsonb),
    ('pro', 'Pro', 51, 'year', 'Unlimited practice, full-length mocks and analytics — one payment a year.', 43, 'Published', true,
     '["Everything in Free","Unlimited sprints, 10 and 15 question sets","All full-length mock papers with section analytics","Bilingual explanations for every question","Saved question shelf and exports"]'::jsonb)
on conflict (id) do nothing;

insert into public.coupons (id, code, discount, kind, plan, redemptions, redemption_limit, expires_at, status)
values
    ('C-01', 'WELCOME50', 50, 'percent', 'Pro', 62, 200, now() + interval '24 days', 'Active'),
    ('C-02', 'PROLAUNCH', 25, 'percent', 'Pro', 12, 100, now() + interval '40 days', 'Active'),
    ('C-03', 'EXAMPREP40', 40, 'percent', 'Pro', 88, 100, now() + interval '9 days', 'Active')
on conflict (id) do nothing;

insert into public.announcements (id, title, body, audience, status, sent_at)
values
    ('A-11', 'Multi-exam tracks now live', 'Choose SSC CGL, SSC CHSL, SSC GD, Railways or Banking at signup — your workspace focuses on your exam while keeping other exams tucked neatly under Others.', 'All learners', 'Sent', now() - interval '2 days'),
    ('A-10', 'CGL & Railways mock schedule', 'New mini and full-length mock papers are live across SSC and RRB NTPC tracks.', 'SSC CGL', 'Sent', now() - interval '6 days')
on conflict (id) do nothing;

insert into public.activity_logs (id, actor, action, target, created_at)
values
    ('E-1', 'admin', 'published', 'Quantitative Aptitude · Percentages (Free primer)', now() - interval '1 day'),
    ('E-2', 'admin', 'published', 'Railways RRB NTPC · CBT-1 Mini 01', now() - interval '2 days'),
    ('E-3', 'admin', 'sent announcement', 'Multi-exam tracks now live', now() - interval '2 days')
on conflict (id) do nothing;

insert into public.daily_metrics (metric_date, attempts, learners)
select (current_date - offs), 340 + (offs * 17) % 160, 12 + (offs * 3) % 9
from generate_series(0, 13) as offs
on conflict (metric_date) do nothing;

commit;
