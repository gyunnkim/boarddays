import type { Locale } from "./config";

export interface Dictionary {
  header: {
    settings: string;
    logout: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    newMatch: string;
    record: string;
    /** placeholders: {total}, {wins}, {losses}, {rate} */
    overallSummaryTemplate: string;
    recordFilteredHint: string;
    perGameTitle: string;
    perGameHint: string;
    noMatchesForGame: string;
    /** placeholders: {count}, {rate} */
    playedSummaryTemplate: string;
    historyTitle: string;
    showAll: string;
    mapFilterLabel: string;
    factionFilterLabel: string;
    filterAll: string;
    win: string;
    lose: string;
    /** placeholder: {n} */
    rankTemplate: string;
    /** placeholder: {n} */
    scoreTemplate: string;
    historyEmpty: string;
    historyEmptyFiltered: string;
    comingSoon: string;
    you: string;
    loadMore: string;
    guestNewMatchHint: string;
    guestSignupCta: string;
  };
  login: {
    heading: string;
    subheading: string;
    email: string;
    password: string;
    submitting: string;
    submit: string;
    noAccount: string;
    signupLink: string;
    or: string;
  };
  signup: {
    heading: string;
    subheading: string;
    email: string;
    name: string;
    namePlaceholder: string;
    nameHint: string;
    password: string;
    passwordHint: string;
    submitting: string;
    submit: string;
    hasAccount: string;
    loginLink: string;
  };
  guest: {
    name: string;
    namePlaceholder: string;
    submitting: string;
    submit: string;
  };
  settings: {
    title: string;
    description: string;
    myNameTitle: string;
    noNameSet: string;
    readonlyHint: string;
  };
  newMatch: {
    title: string;
    subtitle: string;
    fillHint: string;
  };
  guestGate: {
    title: string;
    description: string;
    cta: string;
    back: string;
  };
  matchForm: {
    expansionsUsed: string;
    map: string;
    selectMap: string;
    randomSelect: string;
    colonies: string;
    /** placeholder: {count} */
    drawColoniesTemplate: string;
    noColoniesCatalog: string;
    players: string;
    addPlayer: string;
    randomizeOrder: string;
    remove: string;
    name: string;
    namePlaceholder: string;
    color: string;
    selectColor: string;
    colorRequired: string;
    score: string;
    total: string;
    saving: string;
    save: string;
  };
}

const ko: Dictionary = {
  header: {
    settings: "설정",
    logout: "로그아웃",
  },
  dashboard: {
    title: "대시보드",
    subtitle: "지금까지 기록한 전적을 한눈에 확인하세요.",
    newMatch: "새 매치 기록",
    record: "전적",
    overallSummaryTemplate: "{total}전 {wins}승 {losses}패 {rate}",
    recordFilteredHint: "선택한 필터 기준",
    perGameTitle: "게임별 기록",
    perGameHint:
      "게임을 클릭하면 아래 전적 기록을 해당 게임만 필터링해서 볼 수 있어요. 다시 클릭하면 필터가 해제됩니다.",
    noMatchesForGame: "아직 기록한 매치가 없습니다.",
    playedSummaryTemplate: "플레이 {count}회 · 승률 {rate}",
    historyTitle: "전적 기록",
    showAll: "전체 보기",
    mapFilterLabel: "맵",
    factionFilterLabel: "진영",
    filterAll: "전체",
    win: "승",
    lose: "패",
    rankTemplate: "{n}위",
    scoreTemplate: "{n}점",
    historyEmpty: "아직 기록한 매치가 없습니다.",
    historyEmptyFiltered: "이 게임으로 기록한 매치가 없습니다.",
    comingSoon: "준비 중",
    you: "나",
    loadMore: "더보기",
    guestNewMatchHint:
      "게스트는 전적을 기록할 수 없어요. 회원가입하면 저장할 수 있습니다.",
    guestSignupCta: "회원가입하고 기록하기",
  },
  login: {
    heading: "로그인",
    subheading: "boarddays에 로그인하세요.",
    email: "이메일",
    password: "비밀번호",
    submitting: "로그인 중...",
    submit: "로그인",
    noAccount: "계정이 없으신가요?",
    signupLink: "회원가입",
    or: "또는",
  },
  signup: {
    heading: "회원가입",
    subheading: "boarddays 계정을 만드세요.",
    email: "이메일",
    name: "이름",
    namePlaceholder: "예: 김보드",
    nameHint:
      '매치 입력 화면에서 "나"를 식별하는 데 쓰이는 이름입니다. boarddays 서비스 전체에서 유일해야 하며, 가입 후에는 변경할 수 없습니다.',
    password: "비밀번호",
    passwordHint: "6자 이상 입력해 주세요.",
    submitting: "가입 중...",
    submit: "회원가입",
    hasAccount: "이미 계정이 있으신가요?",
    loginLink: "로그인",
  },
  guest: {
    name: "이름",
    namePlaceholder: "예: 김보드",
    submitting: "입장 중...",
    submit: "게스트로 시작하기",
  },
  settings: {
    title: "설정",
    description:
      '매치 입력 화면에서 "나"를 식별하는 데 쓰이는 이름입니다. 이 이름은 가입/게스트 입장 시점에 한 번만 정할 수 있고, 이후에는 변경할 수 없습니다.',
    myNameTitle: "내 이름",
    noNameSet: "설정된 이름이 없습니다.",
    readonlyHint:
      '이름은 가입할 때 한 번만 정할 수 있으며, 이후에는 이 화면에서 수정할 수 없습니다.',
  },
  newMatch: {
    title: "새 매치 기록",
    subtitle: "먼저 플레이한 게임을 선택하세요.",
    fillHint: "사용한 확장팩과 플레이어별 결과를 입력하세요.",
  },
  guestGate: {
    title: "회원가입이 필요해요",
    description:
      "게스트 계정은 전적을 기록할 수 없습니다. 회원가입하면 매치를 저장하고 계속 확인할 수 있어요.",
    cta: "회원가입하기",
    back: "대시보드로 돌아가기",
  },
  matchForm: {
    expansionsUsed: "사용한 확장팩",
    map: "맵 추가",
    selectMap: "맵 선택",
    randomSelect: "랜덤 선택",
    colonies: "개척기지",
    drawColoniesTemplate: "개척기지 뽑기 ({count}개)",
    noColoniesCatalog: "등록된 개척기지 카탈로그가 아직 없습니다.",
    players: "플레이어",
    addPlayer: "+ 플레이어 추가",
    randomizeOrder: "🎲 순서 정하기",
    remove: "삭제",
    name: "이름",
    namePlaceholder: "이름을 선택하거나 입력하세요",
    color: "색상",
    selectColor: "색상 선택",
    colorRequired: "색상을 선택해 주세요.",
    score: "점수",
    total: "총점",
    saving: "저장 중...",
    save: "매치 저장",
  },
};

const en: Dictionary = {
  header: {
    settings: "Settings",
    logout: "Log out",
  },
  dashboard: {
    title: "Dashboard",
    subtitle: "See all of your recorded matches at a glance.",
    newMatch: "Log new match",
    record: "Record",
    overallSummaryTemplate:
      "{total} games · {wins}W {losses}L · {rate} win rate",
    recordFilteredHint: "Based on selected filters",
    perGameTitle: "By game",
    perGameHint:
      "Click a game to filter the match history below to just that game. Click again to clear the filter.",
    noMatchesForGame: "No matches recorded yet.",
    playedSummaryTemplate: "{count} played · {rate} win rate",
    historyTitle: "Match history",
    showAll: "Show all",
    mapFilterLabel: "Map",
    factionFilterLabel: "Faction",
    filterAll: "All",
    win: "Win",
    lose: "Loss",
    rankTemplate: "#{n}",
    scoreTemplate: "{n} pts",
    historyEmpty: "No matches recorded yet.",
    historyEmptyFiltered: "No matches recorded for this game yet.",
    comingSoon: "Coming soon",
    you: "You",
    loadMore: "Load more",
    guestNewMatchHint:
      "Guests can't record matches. Sign up to save your results.",
    guestSignupCta: "Sign up to record",
  },
  login: {
    heading: "Log in",
    subheading: "Log in to boarddays.",
    email: "Email",
    password: "Password",
    submitting: "Logging in...",
    submit: "Log in",
    noAccount: "Don't have an account?",
    signupLink: "Sign up",
    or: "or",
  },
  signup: {
    heading: "Sign up",
    subheading: "Create your boarddays account.",
    email: "Email",
    name: "Name",
    namePlaceholder: "e.g. Alex",
    nameHint:
      'Used to identify "me" in the match entry screen. It must be unique across boarddays and can\'t be changed after sign up.',
    password: "Password",
    passwordHint: "Use at least 6 characters.",
    submitting: "Signing up...",
    submit: "Sign up",
    hasAccount: "Already have an account?",
    loginLink: "Log in",
  },
  guest: {
    name: "Name",
    namePlaceholder: "e.g. Alex",
    submitting: "Entering...",
    submit: "Continue as guest",
  },
  settings: {
    title: "Settings",
    description:
      'The name used to identify "me" in the match entry screen. It\'s set once when you sign up or enter as a guest, and can\'t be changed afterward.',
    myNameTitle: "My name",
    noNameSet: "No name set.",
    readonlyHint:
      "Your name is set once at sign up and can't be edited from this screen.",
  },
  newMatch: {
    title: "Log new match",
    subtitle: "First, choose the game you played.",
    fillHint: "Enter the expansions used and each player's result.",
  },
  guestGate: {
    title: "Sign up required",
    description:
      "Guest accounts can't record matches. Sign up to save and keep track of your matches.",
    cta: "Sign up",
    back: "Back to dashboard",
  },
  matchForm: {
    expansionsUsed: "Expansions used",
    map: "Add maps",
    selectMap: "Select a map",
    randomSelect: "Random",
    colonies: "Colonies",
    drawColoniesTemplate: "Draw colonies ({count})",
    noColoniesCatalog: "No colony catalog registered yet.",
    players: "Players",
    addPlayer: "+ Add player",
    randomizeOrder: "🎲 Randomize order",
    remove: "Remove",
    name: "Name",
    namePlaceholder: "Choose or enter a name",
    color: "Color",
    selectColor: "Select a color",
    colorRequired: "Please select a color.",
    score: "Score",
    total: "Total",
    saving: "Saving...",
    save: "Save match",
  },
};

const dictionaries: Record<Locale, Dictionary> = { ko, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
