import { Team, Match, SetScore, TeamLevel, QuarterFinalsMode } from './types';

// 15 Default Demo Teams for Volleyball Tournament with sample rosters
export const DEMO_TEAMS: Omit<Team, 'wins' | 'losses' | 'setsWon' | 'setsLost' | 'pointsWon' | 'pointsLost' | 'points'>[] = [
  {
    id: 't1',
    name: 'Volley Spike Titans',
    level: 'Avanzato',
    registeredAt: '2026-08-21 19:00',
    createdAt: 1724266800000,
    players: [
      { id: 'p1_1', name: 'Marco Rossi', level: 'Nazionale' },
      { id: 'p1_2', name: 'Luca Bianchi', level: 'Nazionale' },
      { id: 'p1_3', name: 'Davide Conti', level: 'Regionale' },
      { id: 'p1_4', name: 'Alessandro Ferri', level: 'Regionale' },
    ],
  },
  {
    id: 't2',
    name: 'I Muri Insuperabili',
    level: 'Avanzato',
    registeredAt: '2026-08-21 19:05',
    createdAt: 1724267100000,
    players: [
      { id: 'p2_1', name: 'Giuseppe Moretti', level: 'Nazionale' },
      { id: 'p2_2', name: 'Matteo Gatti', level: 'Regionale' },
      { id: 'p2_3', name: 'Simone Galli', level: 'Regionale' },
      { id: 'p2_4', name: 'Andrea Ricci', level: 'Provinciale' },
    ],
  },
  {
    id: 't3',
    name: 'Ace Attackers',
    level: 'Avanzato',
    registeredAt: '2026-08-21 19:10',
    createdAt: 1724267400000,
    players: [
      { id: 'p3_1', name: 'Lorenzo Russo', level: 'Nazionale' },
      { id: 'p3_2', name: 'Federico Villa', level: 'Regionale' },
      { id: 'p3_3', name: 'Gabriele Leone', level: 'Regionale' },
    ],
  },
  {
    id: 't4',
    name: 'Sky Jumpers',
    level: 'Avanzato',
    registeredAt: '2026-08-21 19:15',
    createdAt: 1724267700000,
    players: [
      { id: 'p4_1', name: 'Christian Rinaldi', level: 'Regionale' },
      { id: 'p4_2', name: 'Paolo Fontana', level: 'Regionale' },
      { id: 'p4_3', name: 'Emanuele Greco', level: 'Provinciale' },
    ],
  },
  {
    id: 't5',
    name: 'Thunder Volley',
    level: 'Avanzato',
    registeredAt: '2026-08-21 19:20',
    createdAt: 1724268000000,
    players: [
      { id: 'p5_1', name: 'Tommaso Barbieri', level: 'Regionale' },
      { id: 'p5_2', name: 'Stefano Marini', level: 'Regionale' },
      { id: 'p5_3', name: 'Filippo De Luca', level: 'Provinciale' },
    ],
  },
  {
    id: 't6',
    name: 'Monster Blockers',
    level: 'Intermedio',
    registeredAt: '2026-08-21 19:25',
    createdAt: 1724268300000,
    players: [
      { id: 'p6_1', name: 'Daniele Costa', level: 'Regionale' },
      { id: 'p6_2', name: 'Michele Serra', level: 'Provinciale' },
      { id: 'p6_3', name: 'Roberto Romano', level: 'CSI' },
    ],
  },
  {
    id: 't7',
    name: 'Sideout Kings',
    level: 'Intermedio',
    registeredAt: '2026-08-21 19:30',
    createdAt: 1724268600000,
    players: [
      { id: 'p7_1', name: 'Fabio Monti', level: 'Provinciale' },
      { id: 'p7_2', name: 'Nicola Vitale', level: 'Provinciale' },
      { id: 'p7_3', name: 'Claudio Lombardi', level: 'CSI' },
    ],
  },
  {
    id: 't8',
    name: "Bagher d'Acciaio",
    level: 'Intermedio',
    registeredAt: '2026-08-21 19:35',
    createdAt: 1724268900000,
    players: [
      { id: 'p8_1', name: 'Giovanni Carbone', level: 'Regionale' },
      { id: 'p8_2', name: 'Vincenzo Riva', level: 'Provinciale' },
      { id: 'p8_3', name: 'Pietro Mariani', level: 'CSI' },
    ],
  },
  {
    id: 't9',
    name: 'Schiacciatori Notturni',
    level: 'Intermedio',
    registeredAt: '2026-08-21 19:40',
    createdAt: 1724269200000,
    players: [
      { id: 'p9_1', name: 'Enrico Parisi', level: 'Provinciale' },
      { id: 'p9_2', name: 'Valerio Grassi', level: 'Provinciale' },
      { id: 'p9_3', name: 'Manuel Pellegrini', level: 'CSI' },
    ],
  },
  {
    id: 't10',
    name: 'Volley Smashers',
    level: 'Intermedio',
    registeredAt: '2026-08-21 19:45',
    createdAt: 1724269500000,
    players: [
      { id: 'p10_1', name: 'Giacomo Ferretti', level: 'Provinciale' },
      { id: 'p10_2', name: 'Alessio Valentini', level: 'CSI' },
      { id: 'p10_3', name: 'Samuele Palumbo', level: 'CSI' },
    ],
  },
  {
    id: 't11',
    name: 'Fast Setters',
    level: 'Base',
    registeredAt: '2026-08-21 19:50',
    createdAt: 1724269800000,
    players: [
      { id: 'p11_1', name: 'Edoardo Mazza', level: 'Provinciale' },
      { id: 'p11_2', name: 'Jacopo Basile', level: 'CSI' },
      { id: 'p11_3', name: 'Riccardo Neri', level: 'CSI' },
    ],
  },
  {
    id: 't12',
    name: 'Palleggiatori Selvaggi',
    level: 'Base',
    registeredAt: '2026-08-21 19:55',
    createdAt: 1724270100000,
    players: [
      { id: 'p12_1', name: 'Leonardo Silvestri', level: 'CSI' },
      { id: 'p12_2', name: 'Massimo Testa', level: 'CSI' },
      { id: 'p12_3', name: 'Fabrizio Grasso', level: 'CSI' },
    ],
  },
  {
    id: 't13',
    name: 'Difesa Totale',
    level: 'Base',
    registeredAt: '2026-08-21 20:00',
    createdAt: 1724270400000,
    players: [
      { id: 'p13_1', name: 'Alberto D’Amico', level: 'CSI' },
      { id: 'p13_2', name: 'Giorgio Coppola', level: 'CSI' },
      { id: 'p13_3', name: 'Bruno Marchetti', level: 'CSI' },
    ],
  },
  {
    id: 't14',
    name: 'Night Volley Express',
    level: 'Base',
    registeredAt: '2026-08-21 20:05',
    createdAt: 1724270700000,
    players: [
      { id: 'p14_1', name: 'Diego Santoro', level: 'CSI' },
      { id: 'p14_2', name: 'Vito Rizzo', level: 'CSI' },
      { id: 'p14_3', name: 'Saverio Fiore', level: 'CSI' },
    ],
  },
  {
    id: 't15',
    name: 'Pallavolo Forever',
    level: 'Base',
    registeredAt: '2026-08-21 20:10',
    createdAt: 1724271000000,
    players: [
      { id: 'p15_1', name: 'Carmelo Barone', level: 'CSI' },
      { id: 'p15_2', name: 'Angelo Greco', level: 'CSI' },
      { id: 'p15_3', name: 'Raffaele Gentile', level: 'CSI' },
    ],
  },
];

export const LEVEL_WEIGHTS: Record<TeamLevel, number> = {
  'Avanzato': 3,
  'Intermedio': 2,
  'Base': 1,
};

/**
 * Sorts teams by:
 * 1. Level of play (Avanzato > Intermedio > Base)
 * 2. Order of insertion (chronological: createdAt or registeredAt or id)
 */
export function sortTeamsByRanking(teams: Team[]): Team[] {
  return [...teams].sort((a, b) => {
    const wA = LEVEL_WEIGHTS[a.level] || 1;
    const wB = LEVEL_WEIGHTS[b.level] || 1;
    if (wB !== wA) {
      return wB - wA; // Highest level first
    }
    // 2. Order of insertion (first inserted first)
    if (a.createdAt !== undefined && b.createdAt !== undefined) {
      return a.createdAt - b.createdAt;
    }
    if (a.registeredAt && b.registeredAt && a.registeredAt !== b.registeredAt) {
      return a.registeredAt.localeCompare(b.registeredAt);
    }
    return a.id.localeCompare(b.id);
  });
}

export function getInitialTeamStats(team: Omit<Team, 'wins' | 'losses' | 'setsWon' | 'setsLost' | 'pointsWon' | 'pointsLost' | 'points'>): Team {
  return {
    ...team,
    createdAt: team.createdAt ?? Date.now(),
    wins: 0,
    losses: 0,
    setsWon: 0,
    setsLost: 0,
    pointsWon: 0,
    pointsLost: 0,
    points: 0,
  };
}

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 20 * 60 + 30; // default 20:30
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function formatMinutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Split 15 teams into 5 groups of 3 (Girone A, B, C, D, E)
// Criterio FIPAV a scorrimento per Round Robin 3:
// Girone A - 1a nella lista ingresso
// Girone B - 2a nella lista ingresso
// Girone C - 3a nella lista ingresso
// Girone D - 4a nella lista ingresso
// Girone E - 5a nella lista ingresso
// Girone E - 6a nella lista ingresso
// Girone D - 7a nella lista ingresso
// Girone C - 8a nella lista ingresso
// Girone B - 9a nella lista ingresso
// Girone A - 10a nella lista ingresso
// Le restanti 5 squadre (pos. 11-15) vengono sorteggiate nei 5 gironi (1 per girone)
export function splitTeamsIntoGroups(teams: Team[]): Record<string, Team[]> {
  const sorted = sortTeamsByRanking(teams);

  const groups: Record<string, Team[]> = {
    'Girone A': [],
    'Girone B': [],
    'Girone C': [],
    'Girone D': [],
    'Girone E': [],
  };

  // Top 10 serpentine assignment
  if (sorted[0]) groups['Girone A'].push({ ...sorted[0], group: 'Girone A' }); // 1a -> A
  if (sorted[1]) groups['Girone B'].push({ ...sorted[1], group: 'Girone B' }); // 2a -> B
  if (sorted[2]) groups['Girone C'].push({ ...sorted[2], group: 'Girone C' }); // 3a -> C
  if (sorted[3]) groups['Girone D'].push({ ...sorted[3], group: 'Girone D' }); // 4a -> D
  if (sorted[4]) groups['Girone E'].push({ ...sorted[4], group: 'Girone E' }); // 5a -> E
  if (sorted[5]) groups['Girone E'].push({ ...sorted[5], group: 'Girone E' }); // 6a -> E
  if (sorted[6]) groups['Girone D'].push({ ...sorted[6], group: 'Girone D' }); // 7a -> D
  if (sorted[7]) groups['Girone C'].push({ ...sorted[7], group: 'Girone C' }); // 8a -> C
  if (sorted[8]) groups['Girone B'].push({ ...sorted[8], group: 'Girone B' }); // 9a -> B
  if (sorted[9]) groups['Girone A'].push({ ...sorted[9], group: 'Girone A' }); // 10a -> A

  // Remaining 5 teams (index 10..14) randomly drawn 1 to each group
  const remainingTeams = sorted.slice(10, 15);
  const shuffled = [...remainingTeams].sort(() => Math.random() - 0.5);
  const groupNames = ['Girone A', 'Girone B', 'Girone C', 'Girone D', 'Girone E'];

  groupNames.forEach((gName, idx) => {
    if (shuffled[idx]) {
      groups[gName].push({ ...shuffled[idx], group: gName });
    }
  });

  return groups;
}

// Generate the 15 round-robin matches for the 5 groups
// Each match is 1 single set to 25 points, scheduled consecutively on a single court
export function generateGroupMatches(
  groups: Record<string, Team[]>,
  startTime: string = '20:30',
  courtCount: number = 1,
  durationMinutes: number = 25,
  courtName: string = 'Campo Palamelina'
): Match[] {
  const groupNames = ['Girone A', 'Girone B', 'Girone C', 'Girone D', 'Girone E'];
  const allMatches: Match[] = [];
  let matchCounter = 1;

  // In each group of 3 teams (T1, T2, T3):
  // Gara 1: T1 vs T3
  // Gara 2: T2 vs T3
  // Gara 3: T1 vs T2
  const groupPairings = [
    [0, 2], // Gara 1: 1st seed vs 3rd seed
    [1, 2], // Gara 2: 2nd seed vs 3rd seed
    [0, 1], // Gara 3: 1st seed vs 2nd seed
  ];

  const roundGroupMatches: Match[][] = [[], [], []];

  groupPairings.forEach((pairing, roundIdx) => {
    groupNames.forEach((groupName) => {
      const gTeams = groups[groupName] || [];
      const t1 = gTeams[pairing[0]] || null;
      const t2 = gTeams[pairing[1]] || null;

      if (t1 && t2) {
        const match: Match = {
          id: `m-g-${matchCounter}`,
          round: 1,
          roundLabel: `${groupName} (Gara ${roundIdx + 1})`,
          position: matchCounter,
          team1: t1,
          team2: t2,
          team1Score: 0,
          team2Score: 0,
          sets: [],
          status: 'scheduled',
          court: courtName,
          time: '',
          phase: 'gironi',
          groupName: groupName,
          pointsPerSet: 25,
          maxSets: 1,
          tieBreakPoints: 25,
        };
        matchCounter++;
        roundGroupMatches[roundIdx].push(match);
      }
    });
  });

  // Schedule sequentially on the single court (or interleaved if multiple)
  let currentMinutes = parseTimeToMinutes(startTime);

  roundGroupMatches.forEach((roundList) => {
    roundList.forEach((m) => {
      m.court = courtCount === 1 ? courtName : `Campo ${(m.position % courtCount) + 1}`;
      m.time = formatMinutesToTime(currentMinutes);
      currentMinutes += durationMinutes;
      allMatches.push(m);
    });
  });

  return allMatches;
}

// Compute dynamic team stats from completed group matches
export function computeTeamStats(teams: Team[], matches: Match[]): Team[] {
  const groupMatches = matches.filter(
    (m) => m.phase === 'gironi' || (m.groupName && m.groupName.startsWith('Girone'))
  );
  const teamMap = new Map<string, Team>();

  teams.forEach((t) => {
    // If t does not have a group assigned, look up if they appear in any group match
    const matchWithGroup = groupMatches.find(
      (m) => m.team1?.id === t.id || m.team2?.id === t.id
    );
    const assignedGroup = t.group || matchWithGroup?.groupName || '';

    teamMap.set(t.id, {
      ...t,
      group: assignedGroup,
      wins: 0,
      losses: 0,
      setsWon: 0,
      setsLost: 0,
      pointsWon: 0,
      pointsLost: 0,
      points: 0,
    });
  });

  groupMatches.forEach((m) => {
    if (m.status !== 'completed' || !m.team1 || !m.team2) return;
    const t1 = teamMap.get(m.team1.id);
    const t2 = teamMap.get(m.team2.id);
    if (!t1 || !t2) return;

    // Determine winner reliably
    let isT1Winner = false;
    if (m.winnerId) {
      isT1Winner = m.winnerId === m.team1.id;
    } else if (m.team1Score !== m.team2Score) {
      isT1Winner = m.team1Score > m.team2Score;
    } else if (m.sets && m.sets.length > 0) {
      const s1 = m.sets.filter((s) => (s.team1 || 0) > (s.team2 || 0)).length;
      const s2 = m.sets.filter((s) => (s.team2 || 0) > (s.team1 || 0)).length;
      if (s1 !== s2) {
        isT1Winner = s1 > s2;
      } else {
        const sum1 = m.sets.reduce((acc, s) => acc + (s.team1 || 0), 0);
        const sum2 = m.sets.reduce((acc, s) => acc + (s.team2 || 0), 0);
        isT1Winner = sum1 > sum2;
      }
    }

    if (isT1Winner) {
      t1.wins += 1;
      t1.points += 3; // 3 points for win
      t2.losses += 1;
    } else {
      t2.wins += 1;
      t2.points += 3; // 3 points for win
      t1.losses += 1;
    }

    if (m.sets && m.sets.length > 0) {
      let t1Sets = 0;
      let t2Sets = 0;
      m.sets.forEach((s) => {
        const p1 = Number(s.team1) || 0;
        const p2 = Number(s.team2) || 0;
        t1.pointsWon += p1;
        t1.pointsLost += p2;
        t2.pointsWon += p2;
        t2.pointsLost += p1;
        if (p1 > p2) t1Sets++;
        else if (p2 > p1) t2Sets++;
      });
      t1.setsWon += t1Sets || (isT1Winner ? 1 : 0);
      t1.setsLost += t2Sets || (isT1Winner ? 0 : 1);
      t2.setsWon += t2Sets || (isT1Winner ? 0 : 1);
      t2.setsLost += t1Sets || (isT1Winner ? 1 : 0);
    } else {
      t1.setsWon += m.team1Score || (isT1Winner ? 1 : 0);
      t1.setsLost += m.team2Score || (isT1Winner ? 0 : 1);
      t2.setsWon += m.team2Score || (isT1Winner ? 0 : 1);
      t2.setsLost += m.team1Score || (isT1Winner ? 1 : 0);
    }
  });

  return Array.from(teamMap.values());
}

// Sort teams within a single group (Girone) according to Art. 42 Regolamento Gare FIPAV:
// 1. Punti in classifica (Points)
// 2. Gare vinte (Wins - Maggior numero di partite vinte)
// 3. Quoziente set (Set vinti / Set persi)
// 4. Quoziente punti (Punti fatti / Punti subiti)
// 5. Scontri diretti (Esito gare tra le squadre in parità)
// 6. Differenza punti / Punti fatti / Ranking di ingresso
export function sortGroupStandings(teamsInGroup: Team[], groupMatches: Match[]): Team[] {
  return [...teamsInGroup].sort((a, b) => {
    // 1. Punti in classifica descending
    if (b.points !== a.points) return b.points - a.points;

    // 2. Gare vinte: il maggior numero di partite vinte nell'arco del girone
    if (b.wins !== a.wins) return b.wins - a.wins;

    // 3. Quoziente set: rapporto tra set vinti e set persi (set vinti / set persi)
    const qSetsA = a.setsLost === 0 ? (a.setsWon > 0 ? 999999 : 0) : a.setsWon / a.setsLost;
    const qSetsB = b.setsLost === 0 ? (b.setsWon > 0 ? 999999 : 0) : b.setsWon / b.setsLost;
    if (Math.abs(qSetsB - qSetsA) > 0.000001) return qSetsB - qSetsA;

    // 4. Quoziente punti: rapporto tra i punti totali realizzati e i punti subiti (punti fatti / punti subiti)
    const qPtsA = a.pointsLost === 0 ? (a.pointsWon > 0 ? 999999 : 0) : a.pointsWon / a.pointsLost;
    const qPtsB = b.pointsLost === 0 ? (b.pointsWon > 0 ? 999999 : 0) : b.pointsWon / b.pointsLost;
    if (Math.abs(qPtsB - qPtsA) > 0.000001) return qPtsB - qPtsA;

    // 5. Scontri diretti: esito delle gare giocate tra le squadre in parità
    const h2h = groupMatches.find(
      (m) =>
        m.status === 'completed' &&
        ((m.team1?.id === a.id && m.team2?.id === b.id) || (m.team1?.id === b.id && m.team2?.id === a.id))
    );
    if (h2h) {
      if (h2h.winnerId) {
        return h2h.winnerId === a.id ? -1 : 1;
      }
      if (h2h.team1Score !== h2h.team2Score) {
        const t1Won = h2h.team1Score > h2h.team2Score;
        const winnerId = t1Won ? h2h.team1?.id : h2h.team2?.id;
        if (winnerId) return winnerId === a.id ? -1 : 1;
      }
    }

    // 6. Differenza punti (punti fatti - punti subiti)
    const diffA = a.pointsWon - a.pointsLost;
    const diffB = b.pointsWon - b.pointsLost;
    if (diffB !== diffA) return diffB - diffA;

    // 7. Punti totali realizzati
    if (b.pointsWon !== a.pointsWon) return b.pointsWon - a.pointsWon;

    // 8. Livello iniziale & Ordine iscrizione
    const wA = LEVEL_WEIGHTS[a.level] || 1;
    const wB = LEVEL_WEIGHTS[b.level] || 1;
    if (wB !== wA) return wB - wA;
    return (a.registeredAt || '').localeCompare(b.registeredAt || '');
  });
}

// Compute Classifica Avulsa (Overall Standings 1° to 15°) across all 5 groups
export function computeClassificaAvulsa(teams: Team[], matches: Match[]): Team[] {
  const groupMatches = matches.filter((m) => m.phase === 'gironi' || m.groupName);
  const computedTeams = computeTeamStats(teams, groupMatches);

  const groupNames = ['Girone A', 'Girone B', 'Girone C', 'Girone D', 'Girone E'];
  const sortedGroups: Record<string, Team[]> = {};
  const teamGroupRank = new Map<string, number>();

  groupNames.forEach((gName) => {
    const teamsInG = computedTeams.filter((t) => t.group === gName);
    const gMatches = groupMatches.filter((m) => m.groupName === gName);
    const sorted = sortGroupStandings(teamsInG, gMatches);
    sortedGroups[gName] = sorted;

    sorted.forEach((team, idx) => {
      teamGroupRank.set(team.id, idx + 1); // 1 = 1st in group, 2 = 2nd in group, 3 = 3rd in group
    });
  });

  // Classifica Avulsa ordering (Art. 43 Regolamento Gare FIPAV):
  // 1. Miglior posizione nel girone (le prime con le prime, le seconde con le seconde, le terze con le terze)
  // 2. Miglior quoziente punti/gare (punti classifica / partite giocate)
  // 3. Miglior quoziente set (set vinti / set persi)
  // 4. Miglior quoziente punti (punti fatti / punti subiti)
  // 5. Sorteggio / Livello & Ordine iscrizione
  const overallSorted = [...computedTeams].sort((a, b) => {
    const rankA = teamGroupRank.get(a.id) || 99;
    const rankB = teamGroupRank.get(b.id) || 99;

    // 1. Miglior posizione nel rispettivo girone (1ᵉ classificate 1-5, 2ᵉ classificate 6-10, 3ᵉ classificate 11-15)
    if (rankA !== rankB) return rankA - rankB;

    // 2. Miglior quoziente punti/gare: rapporto tra punti classifica e partite giocate
    const matchesA = a.wins + a.losses;
    const matchesB = b.wins + b.losses;
    const qPtsGareA = matchesA === 0 ? 0 : a.points / matchesA;
    const qPtsGareB = matchesB === 0 ? 0 : b.points / matchesB;
    if (Math.abs(qPtsGareB - qPtsGareA) > 0.000001) return qPtsGareB - qPtsGareA;

    // If points/matches is identical, check absolute points as well
    if (b.points !== a.points) return b.points - a.points;

    // 3. Miglior quoziente set: rapporto matematico tra totalità dei set vinti e set persi
    const qSetsA = a.setsLost === 0 ? (a.setsWon > 0 ? 999999 : 0) : a.setsWon / a.setsLost;
    const qSetsB = b.setsLost === 0 ? (b.setsWon > 0 ? 999999 : 0) : b.setsWon / b.setsLost;
    if (Math.abs(qSetsB - qSetsA) > 0.000001) return qSetsB - qSetsA;

    // 4. Miglior quoziente punti: rapporto matematico tra tutti i punti fatti e i punti subiti durante i set
    const qPtsA = a.pointsLost === 0 ? (a.pointsWon > 0 ? 999999 : 0) : a.pointsWon / a.pointsLost;
    const qPtsB = b.pointsLost === 0 ? (b.pointsWon > 0 ? 999999 : 0) : b.pointsWon / b.pointsLost;
    if (Math.abs(qPtsB - qPtsA) > 0.000001) return qPtsB - qPtsA;

    // Differenza punti come ulteriore fattore di discriminazione
    const diffA = a.pointsWon - a.pointsLost;
    const diffB = b.pointsWon - b.pointsLost;
    if (diffB !== diffA) return diffB - diffA;

    // Punti totali realizzati
    if (b.pointsWon !== a.pointsWon) return b.pointsWon - a.pointsWon;

    // 5. Sorteggio / Extrema Ratio: Livello & data d'ingresso
    const wA = LEVEL_WEIGHTS[a.level] || 1;
    const wB = LEVEL_WEIGHTS[b.level] || 1;
    if (wB !== wA) return wB - wA;
    return (a.registeredAt || '').localeCompare(b.registeredAt || '');
  });

  return overallSorted.map((t, idx) => ({
    ...t,
    rankInGroup: teamGroupRank.get(t.id) || 1,
    overallRank: idx + 1, // 1 to 15
  }));
}

// Generate the complete Knockout Phase (Ottavi, Quarti, Semifinali, Finali)
// According to exact specifications:
// - 1° has BYE (advances directly to Quarti)
// - 2° to 15° play Ottavi: 8 vs 9, 4 vs 13, 5 vs 12, 2 vs 15, 7 vs 10, 3 vs 14, 6 vs 11
// - Quarti: 1 vs (8 vs 9), (4 vs 13) vs (5 vs 12), (2 vs 15) vs (7 vs 10), (3 vs 14) vs (6 vs 11)
// - Quarti mode: single_set_25 OR best_of_3_tb15
// - Semifinali: best 2 of 3 to 25, TB to 25
// - Finale 3°/4°: single set to 25
// - Finale 1°/2°: best 2 of 3 to 25, TB to 25
export function generateKnockoutMatches(
  rankedTeams: Team[],
  quarterFinalsMode: QuarterFinalsMode = 'single_set_25',
  startTime: string = '20:30',
  courtCount: number = 1,
  durationSingleSetMinutes: number = 25,
  durationBestOf3Minutes: number = 50,
  courtName: string = 'Campo Palamelina'
): Match[] {
  // rankedTeams is sorted 1° to 15°
  const getSeed = (rank: number): Team | null => {
    return rankedTeams[rank - 1] || null;
  };

  const matches: Match[] = [];

  // OTTAVI DI FINALE (7 matches - Round 2)
  const ottaviDefinitions = [
    { id: 'm-ott-1', seed1: 8, seed2: 9, nextMatchId: 'm-qf-1', nextMatchSlot: 'team2' as const, label: 'Ottavi (8° vs 9°)' },
    { id: 'm-ott-2', seed1: 4, seed2: 13, nextMatchId: 'm-qf-2', nextMatchSlot: 'team1' as const, label: 'Ottavi (4° vs 13°)' },
    { id: 'm-ott-3', seed1: 5, seed2: 12, nextMatchId: 'm-qf-2', nextMatchSlot: 'team2' as const, label: 'Ottavi (5° vs 12°)' },
    { id: 'm-ott-4', seed1: 2, seed2: 15, nextMatchId: 'm-qf-3', nextMatchSlot: 'team1' as const, label: 'Ottavi (2° vs 15°)' },
    { id: 'm-ott-5', seed1: 7, seed2: 10, nextMatchId: 'm-qf-3', nextMatchSlot: 'team2' as const, label: 'Ottavi (7° vs 10°)' },
    { id: 'm-ott-6', seed1: 3, seed2: 14, nextMatchId: 'm-qf-4', nextMatchSlot: 'team1' as const, label: 'Ottavi (3° vs 14°)' },
    { id: 'm-ott-7', seed1: 6, seed2: 11, nextMatchId: 'm-qf-4', nextMatchSlot: 'team2' as const, label: 'Ottavi (6° vs 11°)' },
  ];

  let currentMinutes = parseTimeToMinutes(startTime);

  ottaviDefinitions.forEach((def, idx) => {
    matches.push({
      id: def.id,
      round: 2,
      roundLabel: def.label,
      position: idx + 1,
      team1: getSeed(def.seed1),
      team2: getSeed(def.seed2),
      team1Score: 0,
      team2Score: 0,
      sets: [],
      status: 'scheduled',
      court: courtName,
      time: formatMinutesToTime(currentMinutes),
      phase: 'eliminazione',
      pointsPerSet: 25,
      maxSets: 1,
      tieBreakPoints: 25,
      nextMatchId: def.nextMatchId,
      nextMatchSlot: def.nextMatchSlot,
      matchSeedLabel: `${def.seed1}° vs ${def.seed2}°`,
    });
    currentMinutes += durationSingleSetMinutes;
  });

  // QUARTI DI FINALE (4 matches - Round 3)
  const isQfBestOf3 = quarterFinalsMode === 'best_of_3_tb15';
  const qfMaxSets = isQfBestOf3 ? 3 : 1;
  const qfTieBreak = isQfBestOf3 ? 15 : 25;
  const qfDuration = isQfBestOf3 ? durationBestOf3Minutes : durationSingleSetMinutes;

  const quartiDefinitions = [
    {
      id: 'm-qf-1',
      team1: getSeed(1), // 1° BYE seeded directly!
      team2: null, // Will come from winner of Ottavo 1 (8 vs 9)
      nextMatchId: 'm-sf-1',
      nextMatchSlot: 'team1' as const,
      label: 'Quarto 1 (1° vs Vinc. 8°-9°)',
      seedLabel: '1° (BYE) vs Vinc. 8°-9°',
    },
    {
      id: 'm-qf-2',
      team1: null, // Winner Ottavo 2 (4 vs 13)
      team2: null, // Winner Ottavo 3 (5 vs 12)
      nextMatchId: 'm-sf-1',
      nextMatchSlot: 'team2' as const,
      label: 'Quarto 2 (Vinc. 4°-13° vs Vinc. 5°-12°)',
      seedLabel: 'Vinc. 4°-13° vs Vinc. 5°-12°',
    },
    {
      id: 'm-qf-3',
      team1: null, // Winner Ottavo 4 (2 vs 15)
      team2: null, // Winner Ottavo 5 (7 vs 10)
      nextMatchId: 'm-sf-2',
      nextMatchSlot: 'team1' as const,
      label: 'Quarto 3 (Vinc. 2°-15° vs Vinc. 7°-10°)',
      seedLabel: 'Vinc. 2°-15° vs Vinc. 7°-10°',
    },
    {
      id: 'm-qf-4',
      team1: null, // Winner Ottavo 6 (3 vs 14)
      team2: null, // Winner Ottavo 7 (6 vs 11)
      nextMatchId: 'm-sf-2',
      nextMatchSlot: 'team2' as const,
      label: 'Quarto 4 (Vinc. 3°-14° vs Vinc. 6°-11°)',
      seedLabel: 'Vinc. 3°-14° vs Vinc. 6°-11°',
    },
  ];

  quartiDefinitions.forEach((def, idx) => {
    matches.push({
      id: def.id,
      round: 3,
      roundLabel: def.label,
      position: idx + 1,
      team1: def.team1,
      team2: def.team2,
      team1Score: 0,
      team2Score: 0,
      sets: [],
      status: 'scheduled',
      court: courtName,
      time: formatMinutesToTime(currentMinutes),
      phase: 'eliminazione',
      pointsPerSet: 25,
      maxSets: qfMaxSets,
      tieBreakPoints: qfTieBreak,
      nextMatchId: def.nextMatchId,
      nextMatchSlot: def.nextMatchSlot,
      matchSeedLabel: def.seedLabel,
    });
    currentMinutes += qfDuration;
  });

  // SEMIFINALI (2 matches - Round 4)
  // Formato: 2 set su 3 a 25 con Tie-Break a 25 punti!
  const semifinaliDefinitions = [
    {
      id: 'm-sf-1',
      nextMatchId: 'm-fin-1-2',
      nextMatchSlot: 'team1' as const,
      loserMatchId: 'm-fin-3-4',
      loserMatchSlot: 'team1' as const,
      label: 'Semifinale 1 (Vinc. Q1 vs Vinc. Q2)',
      seedLabel: 'Vinc. Q1 vs Vinc. Q2',
    },
    {
      id: 'm-sf-2',
      nextMatchId: 'm-fin-1-2',
      nextMatchSlot: 'team2' as const,
      loserMatchId: 'm-fin-3-4',
      loserMatchSlot: 'team2' as const,
      label: 'Semifinale 2 (Vinc. Q3 vs Vinc. Q4)',
      seedLabel: 'Vinc. Q3 vs Vinc. Q4',
    },
  ];

  semifinaliDefinitions.forEach((def, idx) => {
    matches.push({
      id: def.id,
      round: 4,
      roundLabel: def.label,
      position: idx + 1,
      team1: null,
      team2: null,
      team1Score: 0,
      team2Score: 0,
      sets: [],
      status: 'scheduled',
      court: courtName,
      time: formatMinutesToTime(currentMinutes),
      phase: 'eliminazione',
      pointsPerSet: 25,
      maxSets: 3, // 2 su 3
      tieBreakPoints: 25, // Tie-break a 25 come richiesto
      nextMatchId: def.nextMatchId,
      nextMatchSlot: def.nextMatchSlot,
      loserMatchId: def.loserMatchId,
      loserMatchSlot: def.loserMatchSlot,
      matchSeedLabel: def.seedLabel,
    });
    currentMinutes += durationBestOf3Minutes;
  });

  // FINALI (2 matches - Round 5)
  // Finale 3°/4° Posto
  matches.push({
    id: 'm-fin-3-4',
    round: 5,
    roundLabel: 'Finale 3° e 4° Posto 🥉',
    position: 1,
    team1: null,
    team2: null,
    team1Score: 0,
    team2Score: 0,
    sets: [],
    status: 'scheduled',
    court: courtName,
    time: formatMinutesToTime(currentMinutes),
    phase: 'eliminazione',
    pointsPerSet: 25,
    maxSets: 1,
    tieBreakPoints: 25,
    matchSeedLabel: 'Perdente SF1 vs Perdente SF2',
  });
  currentMinutes += durationSingleSetMinutes;

  // Finale 1°/2° Posto (2 su 3 con Tie-Break a 25)
  matches.push({
    id: 'm-fin-1-2',
    round: 5,
    roundLabel: 'Grand Finale 1° e 2° Posto 🏆',
    position: 2,
    team1: null,
    team2: null,
    team1Score: 0,
    team2Score: 0,
    sets: [],
    status: 'scheduled',
    court: courtName,
    time: formatMinutesToTime(currentMinutes),
    phase: 'eliminazione',
    pointsPerSet: 25,
    maxSets: 3, // 2 su 3
    tieBreakPoints: 25, // Tie-break a 25
    matchSeedLabel: 'Vincente SF1 vs Vincente SF2',
  });

  return autoResolveAndPropagate(matches);
}

// Recalculates start times for all tournament matches sequentially on the single court
export function recalculateTournamentMatchTimes(
  matches: Match[],
  startTime: string = '20:30',
  durationSingleSetMinutes: number = 25,
  durationBestOf3Minutes: number = 50,
  courtName: string = 'Campo Palamelina',
  quarterFinalsMode: QuarterFinalsMode = 'single_set_25'
): Match[] {
  const groupMatches = matches
    .filter((m) => m.phase === 'gironi' || m.round === 1)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  const ottaviMatches = matches
    .filter((m) => m.round === 2)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  const isQfBestOf3 = quarterFinalsMode === 'best_of_3_tb15';
  const qfDuration = isQfBestOf3 ? durationBestOf3Minutes : durationSingleSetMinutes;

  const quartiMatches = matches
    .filter((m) => m.round === 3)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  const semifinaliMatches = matches
    .filter((m) => m.round === 4)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  const finale34 = matches.find((m) => m.id === 'm-fin-3-4' || (m.round === 5 && m.position === 1));
  const finale12 = matches.find((m) => m.id === 'm-fin-1-2' || (m.round === 5 && m.position === 2));

  let currentMinutes = parseTimeToMinutes(startTime);
  const updatedMap = new Map<string, Partial<Match>>();

  // 1. Group matches
  groupMatches.forEach((m) => {
    updatedMap.set(m.id, {
      court: courtName,
      time: formatMinutesToTime(currentMinutes),
    });
    currentMinutes += durationSingleSetMinutes;
  });

  // 2. Ottavi matches
  ottaviMatches.forEach((m) => {
    updatedMap.set(m.id, {
      court: courtName,
      time: formatMinutesToTime(currentMinutes),
    });
    currentMinutes += durationSingleSetMinutes;
  });

  // 3. Quarti matches
  quartiMatches.forEach((m) => {
    updatedMap.set(m.id, {
      court: courtName,
      time: formatMinutesToTime(currentMinutes),
      maxSets: isQfBestOf3 ? 3 : 1,
      tieBreakPoints: isQfBestOf3 ? 15 : 25,
    });
    currentMinutes += qfDuration;
  });

  // 4. Semifinali matches (2 su 3)
  semifinaliMatches.forEach((m) => {
    updatedMap.set(m.id, {
      court: courtName,
      time: formatMinutesToTime(currentMinutes),
      maxSets: 3,
      tieBreakPoints: 25,
    });
    currentMinutes += durationBestOf3Minutes;
  });

  // 5. Finale 3°-4° (single set 25)
  if (finale34) {
    updatedMap.set(finale34.id, {
      court: courtName,
      time: formatMinutesToTime(currentMinutes),
    });
    currentMinutes += durationSingleSetMinutes;
  }

  // 6. Finale 1°-2° (2 su 3)
  if (finale12) {
    updatedMap.set(finale12.id, {
      court: courtName,
      time: formatMinutesToTime(currentMinutes),
    });
    currentMinutes += durationBestOf3Minutes;
  }

  return matches.map((m) => {
    const patch = updatedMap.get(m.id);
    return patch ? { ...m, ...patch } : m;
  });
}

// Auto-propagate winners & losers to downstream matches
export function autoResolveAndPropagate(matches: Match[]): Match[] {
  let updated = [...matches];
  let changed = true;
  let iterations = 0;

  while (changed && iterations < 50) {
    changed = false;
    iterations++;

    for (let i = 0; i < updated.length; i++) {
      const m = updated[i];
      if (m.status === 'completed' && m.winnerId) {
        const winnerTeam = m.winnerId === m.team1?.id ? m.team1 : m.team2;
        const loserTeam = m.winnerId === m.team1?.id ? m.team2 : m.team1;

        // Propagate Winner
        if (winnerTeam && m.nextMatchId) {
          const nextIdx = updated.findIndex(nm => nm.id === m.nextMatchId);
          if (nextIdx !== -1) {
            const nextMatch = { ...updated[nextIdx] };
            if (m.nextMatchSlot === 'team1' && nextMatch.team1?.id !== winnerTeam.id) {
              nextMatch.team1 = winnerTeam;
              updated[nextIdx] = nextMatch;
              changed = true;
            } else if (m.nextMatchSlot === 'team2' && nextMatch.team2?.id !== winnerTeam.id) {
              nextMatch.team2 = winnerTeam;
              updated[nextIdx] = nextMatch;
              changed = true;
            }
          }
        }

        // Propagate Loser
        if (loserTeam && m.loserMatchId) {
          const loserIdx = updated.findIndex(lm => lm.id === m.loserMatchId);
          if (loserIdx !== -1) {
            const loserMatch = { ...updated[loserIdx] };
            if (m.loserMatchSlot === 'team1' && loserMatch.team1?.id !== loserTeam.id) {
              loserMatch.team1 = loserTeam;
              updated[loserIdx] = loserMatch;
              changed = true;
            } else if (m.loserMatchSlot === 'team2' && loserMatch.team2?.id !== loserTeam.id) {
              loserMatch.team2 = loserTeam;
              updated[loserIdx] = loserMatch;
              changed = true;
            }
          }
        }
      }
    }
  }

  return updated;
}

// Check if a single set score is complete and won by 2 points
export function isSetFinished(p1: number, p2: number, targetPoints: number = 25): boolean {
  if (p1 < targetPoints && p2 < targetPoints) return false;
  return Math.abs(p1 - p2) >= 2;
}

// Generate realistic simulated scores for testing
// Single set or Best of 3
export function simulateSingleSet(targetPoints: number = 25): { p1: number; p2: number; winner: 't1' | 't2' } {
  const isT1Winner = Math.random() >= 0.5;
  // Loser gets between 15 and 23 points, or extended deuce 24-26, 25-27
  const scenario = Math.random();
  let loserScore = 18;
  let winnerScore = targetPoints;

  if (scenario < 0.25) {
    loserScore = Math.floor(Math.random() * 5) + 15; // 15-19
  } else if (scenario < 0.7) {
    loserScore = Math.floor(Math.random() * 4) + 20; // 20-23
  } else if (scenario < 0.9) {
    // 25-23 or 25-22
    loserScore = targetPoints - 2;
  } else {
    // Extended deuce
    winnerScore = targetPoints + Math.floor(Math.random() * 3) + 1; // 26-28
    loserScore = winnerScore - 2;
  }

  return {
    p1: isT1Winner ? winnerScore : loserScore,
    p2: isT1Winner ? loserScore : winnerScore,
    winner: isT1Winner ? 't1' : 't2',
  };
}

export function simulateMatch(match: Match): Match {
  if (!match.team1 || !match.team2) return match;
  if (match.status === 'completed' && match.winnerId) return match;

  const isBestOf3 = match.maxSets === 3;
  const targetPoints = match.pointsPerSet || 25;
  const tieBreakTarget = match.tieBreakPoints || (match.round === 3 ? 15 : 25);

  if (!isBestOf3) {
    const s1 = simulateSingleSet(targetPoints);
    const sets = [{ team1: s1.p1, team2: s1.p2 }];
    const winnerId = s1.winner === 't1' ? match.team1.id : match.team2.id;
    return {
      ...match,
      sets,
      team1Score: s1.winner === 't1' ? 1 : 0,
      team2Score: s1.winner === 't2' ? 1 : 0,
      winnerId,
      status: 'completed',
    };
  } else {
    // Best of 3
    const s1 = simulateSingleSet(targetPoints);
    const s2 = simulateSingleSet(targetPoints);
    let sets = [
      { team1: s1.p1, team2: s1.p2 },
      { team1: s2.p1, team2: s2.p2 },
    ];
    let t1Wins = (s1.winner === 't1' ? 1 : 0) + (s2.winner === 't1' ? 1 : 0);
    let t2Wins = (s1.winner === 't2' ? 1 : 0) + (s2.winner === 't2' ? 1 : 0);

    if (t1Wins === 1 && t2Wins === 1) {
      // 3rd set / Tie-Break
      const s3 = simulateSingleSet(tieBreakTarget);
      sets.push({ team1: s3.p1, team2: s3.p2 });
      if (s3.winner === 't1') t1Wins++;
      else t2Wins++;
    }

    const winnerId = t1Wins > t2Wins ? match.team1.id : match.team2.id;
    return {
      ...match,
      sets,
      team1Score: t1Wins,
      team2Score: t2Wins,
      winnerId,
      status: 'completed',
    };
  }
}

// Simulates all pending group matches
export function simulateAllGroupMatches(matches: Match[]): Match[] {
  return matches.map((m) => {
    if (m.phase === 'gironi' || m.round === 1) {
      return simulateMatch(m);
    }
    return m;
  });
}

// Simulates playable matches in the current knockout round
export function simulateKnockoutRound(matches: Match[]): Match[] {
  let updated = matches.map((m) => {
    if ((m.phase === 'eliminazione' || m.round >= 2) && m.team1 && m.team2 && m.status !== 'completed') {
      return simulateMatch(m);
    }
    return m;
  });
  return autoResolveAndPropagate(updated);
}

// Swap times between two matches
export function swapMatchTimes(matches: Match[], matchId1: string, matchId2: string): Match[] {
  const m1 = matches.find((m) => m.id === matchId1);
  const m2 = matches.find((m) => m.id === matchId2);
  if (!m1 || !m2) return matches;

  const t1 = m1.time;
  const t2 = m2.time;

  return matches.map((m) => {
    if (m.id === matchId1) return { ...m, time: t2 };
    if (m.id === matchId2) return { ...m, time: t1 };
    return m;
  });
}

// Ripple shift: shift starting time of target match and all subsequent matches on the same court
export function shiftMatchesOnCourt(
  matches: Match[],
  targetMatchId: string,
  newTime: string,
  court: string,
  shiftMinutes: number = 25
): Match[] {
  const targetMatch = matches.find((m) => m.id === targetMatchId);
  if (!targetMatch) return matches;

  const newTimeMinutes = parseTimeToMinutes(newTime);

  // Find all other matches on the same court that have an scheduled time >= newTimeMinutes
  // and are not the target match
  return matches.map((m) => {
    if (m.id === targetMatchId) {
      return { ...m, time: newTime, court };
    }
    if (m.court.trim().toLowerCase() === court.trim().toLowerCase()) {
      const mTimeMin = parseTimeToMinutes(m.time);
      if (mTimeMin >= newTimeMinutes) {
        return {
          ...m,
          time: formatMinutesToTime(mTimeMin + shiftMinutes),
        };
      }
    }
    return m;
  });
}
