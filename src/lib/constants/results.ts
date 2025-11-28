// Constantes pour la page des résultats

export const RESULT_MESSAGES = {
  NO_ELECTION: "Aucune élection n'a été créée pour le moment.",
  NO_VOTES: "Aucun vote n'a été enregistré pour cette élection.",
  MULTI_ELECTED:
    "Élection à {count} élus. Les {count} candidats arrivés en tête seront élus.",
  TIE_DETECTED:
    "Égalité détectée ! {count} candidats sont éligibles pour {positions} poste(s). Une procédure de départage pourrait être nécessaire.",
  TIE_SINGLE_ELECTION:
    "Égalité détectée ! {count} candidats sont à égalité avec {votes} voix chacun. Une procédure de départage pourrait être nécessaire.",
  RUNOFF_NEEDED: "Second tour nécessaire ! {reason}.",
  ABSOLUTE_MAJORITY:
    "Victoire au premier tour ! {candidate} a obtenu la majorité absolue avec {percentage}% des voix.",
  RUNOFF_TWO_CANDIDATES:
    "Un second tour peut être organisé entre les deux candidats arrivés en tête.",
  RUNOFF_MULTI_CANDIDATES:
    "Un second tour doit être organisé entre les {count} candidats à égalité.",
} as const;

export const ELECTION_STATUS = {
  ABSOLUTE_MAJORITY: "Majorité absolue",
  RUNOFF_REQUIRED: "Second tour requis",
  TIE: "Égalité",
  RELATIVE_MAJORITY: "Majorité relative",
} as const;

export const CANDIDATE_BADGES = {
  ELECTED: "Élu(e)",
  LEADING: "En tête",
  TIED: "Égalité",
  QUALIFIED_RUNOFF: "Qualifié(e) 2e tour",
} as const;
