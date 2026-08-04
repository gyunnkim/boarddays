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
    perGameTitle: string;
    perGameHint: string;
    noMatchesForGame: string;
    /** placeholders: {count}, {rate} */
    playedSummaryTemplate: string;
    historyTitle: string;
    showAll: string;
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
    password: string;
    passwordHint: string;
    submitting: string;
    submit: string;
    hasAccount: string;
    loginLink: string;
  };
  guest: {
    submitting: string;
    submit: string;
  };
  settings: {
    title: string;
    description: string;
    myNameTitle: string;
    noNameSet: string;
    namePlaceholder: string;
    saving: string;
    save: string;
    saved: string;
  };
  newMatch: {
    title: string;
    subtitle: string;
    fillHint: string;
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
    perGameTitle: "게임별 기록",
    perGameHint:
      "게임을 클릭하면 아래 전적 기록을 해당 게임만 필터링해서 볼 수 있어요. 다시 클릭하면 필터가 해제됩니다.",
    noMatchesForGame: "아직 기록한 매치가 없습니다.",
    playedSummaryTemplate: "플레이 {count}회 · 승률 {rate}",
    historyTitle: "전적 기록",
    showAll: "전체 보기",
    win: "승",
    lose: "패",
    rankTemplate: "{n}위",
    scoreTemplate: "{n}점",
    historyEmpty: "아직 기록한 매치가 없습니다.",
    historyEmptyFiltered: "이 게임으로 기록한 매치가 없습니다.",
    comingSoon: "준비 중",
    you: "나",
    loadMore: "더보기",
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
    password: "비밀번호",
    passwordHint: "6자 이상 입력해 주세요.",
    submitting: "가입 중...",
    submit: "회원가입",
    hasAccount: "이미 계정이 있으신가요?",
    loginLink: "로그인",
  },
  guest: {
    submitting: "입장 중...",
    submit: "게스트로 시작하기",
  },
  settings: {
    title: "설정",
    description:
      '매치 입력 화면에서 "나"를 식별하는 데 쓰이는 이름을 설정하세요. 이 이름은 한 명당 하나만 가질 수 있고, boarddays 서비스 전체에서 유일해야 합니다.',
    myNameTitle: "내 이름",
    noNameSet:
      '아직 이름을 설정하지 않았습니다. 이름을 설정하기 전에는 매치 입력 화면에서 "나"가 자동으로 표시되지 않습니다.',
    namePlaceholder: "예: 김보드",
    saving: "저장 중...",
    save: "저장",
    saved: "이름을 저장했습니다.",
  },
  newMatch: {
    title: "새 매치 기록",
    subtitle: "먼저 플레이한 게임을 선택하세요.",
    fillHint: "사용한 확장팩과 플레이어별 결과를 입력하세요.",
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
    overallSummaryTemplate: "{total} games · {wins}W {losses}L · {rate} win rate",
    perGameTitle: "By game",
    perGameHint:
      "Click a game to filter the match history below to just that game. Click again to clear the filter.",
    noMatchesForGame: "No matches recorded yet.",
    playedSummaryTemplate: "{count} played · {rate} win rate",
    historyTitle: "Match history",
    showAll: "Show all",
    win: "Win",
    lose: "Loss",
    rankTemplate: "#{n}",
    scoreTemplate: "{n} pts",
    historyEmpty: "No matches recorded yet.",
    historyEmptyFiltered: "No matches recorded for this game yet.",
    comingSoon: "Coming soon",
    you: "You",
    loadMore: "Load more",
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
    password: "Password",
    passwordHint: "Use at least 6 characters.",
    submitting: "Signing up...",
    submit: "Sign up",
    hasAccount: "Already have an account?",
    loginLink: "Log in",
  },
  guest: {
    submitting: "Entering...",
    submit: "Continue as guest",
  },
  settings: {
    title: "Settings",
    description:
      'Set the name used to identify "me" in the match entry screen. Each person may only have one name, and it must be unique across boarddays.',
    myNameTitle: "My name",
    noNameSet:
      'You haven\'t set a name yet. Until you do, "me" won\'t be auto-filled in the match entry screen.',
    namePlaceholder: "e.g. Alex",
    saving: "Saving...",
    save: "Save",
    saved: "Name saved.",
  },
  newMatch: {
    title: "Log new match",
    subtitle: "First, choose the game you played.",
    fillHint: "Enter the expansions used and each player's result.",
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
