import { Team, Match, SetScore, TeamLevel, QuarterFinalsMode } from './types';

// 15 Official Teams for Volleyball Tournament with full rosters from official sheet
export const DEMO_TEAMS: Omit<Team, 'wins' | 'losses' | 'setsWon' | 'setsLost' | 'pointsWon' | 'pointsLost' | 'points'>[] = [
  {
    id: 't1',
    name: 'SMELBURN',
    level: 'Base',
    registeredAt: '2026-08-21 19:00',
    createdAt: 1724266800000,
    players: [
      { id: 'p1_1', name: 'Alessandro Martorana', level: 'Provinciale' },
      { id: 'p1_2', name: 'Elisa Indoviglia', level: 'Provinciale' },
      { id: 'p1_3', name: 'Matteo Augusta', level: 'Provinciale' },
      { id: 'p1_4', name: 'Giovanni Giaconia', level: 'Provinciale' },
      { id: 'p1_5', name: 'Riccardo Danneo', level: 'Provinciale' },
      { id: 'p1_6', name: 'Ambra Di Maria', level: 'Provinciale' },
      { id: 'p1_7', name: 'David Rotolo', level: 'Provinciale' },
      { id: 'p1_8', name: 'Sara Renda', level: 'Provinciale' },
    ],
  },
  {
    id: 't2',
    name: 'FACILONI',
    level: 'Intermedio',
    registeredAt: '2026-08-21 19:05',
    createdAt: 1724267100000,
    players: [
      { id: 'p2_1', name: 'Alberto Cutugno', level: 'Regionale' },
      { id: 'p2_2', name: 'Samuel Cusimano', level: 'Regionale' },
      { id: 'p2_3', name: 'Carlotta Polizzi', level: 'Regionale' },
      { id: 'p2_4', name: 'Federico Mazzola', level: 'Provinciale' },
      { id: 'p2_5', name: 'Marta Mucera', level: 'Regionale' },
      { id: 'p2_6', name: 'Alessio Felli', level: 'Regionale' },
      { id: 'p2_7', name: 'Giorgio Mancuso', level: 'Provinciale' },
    ],
  },
  {
    id: 't3',
    name: 'VIS COPPIAMO',
    level: 'Base',
    registeredAt: '2026-08-21 19:10',
    createdAt: 1724267400000,
    players: [
      { id: 'p3_1', name: 'Sofia Segreto', level: 'Regionale' },
      { id: 'p3_2', name: 'Salvo Badagliacca', level: 'Provinciale' },
      { id: 'p3_3', name: 'Edoardo Munda', level: 'Regionale' },
      { id: 'p3_4', name: 'Veronica Cracolici', level: 'Regionale' },
      { id: 'p3_5', name: 'Emanuele Franchina', level: 'Regionale' },
      { id: 'p3_6', name: 'Adriano Matteoli', level: 'Regionale' },
      { id: 'p3_7', name: 'Marta Leone', level: 'Regionale' },
    ],
  },
  {
    id: 't4',
    name: 'I NOTTAMBULI',
    level: 'Avanzato',
    registeredAt: '2026-08-21 19:15',
    createdAt: 1724267700000,
    players: [
      { id: 'p4_1', name: 'Antonio Domino', level: 'Regionale' },
      { id: 'p4_2', name: 'Davide Filippone', level: 'Regionale' },
      { id: 'p4_3', name: 'Dafne Cangemi', level: 'Regionale' },
      { id: 'p4_4', name: 'Francesco Rizzello', level: 'Regionale' },
      { id: 'p4_5', name: 'Alex Mazzucco', level: 'Regionale' },
      { id: 'p4_6', name: 'Matteo Tusa', level: 'Regionale' },
      { id: 'p4_7', name: 'Irene Lupo', level: 'Provinciale' },
    ],
  },
  {
    id: 't5',
    name: 'VOLANO MA...DONNE',
    level: 'Avanzato',
    registeredAt: '2026-08-21 19:20',
    createdAt: 1724268000000,
    players: [
      { id: 'p5_1', name: 'Francesco Sutera', level: 'CSI' },
      { id: 'p5_2', name: 'Gabriele Pizzurro', level: 'CSI' },
      { id: 'p5_3', name: 'Leonardo Inghilleri', level: 'CSI' },
      { id: 'p5_4', name: 'Andrea Filloramo', level: 'Nazionale' },
      { id: 'p5_5', name: 'Valentina Tutone', level: 'Nazionale' },
      { id: 'p5_6', name: 'Giorgia Vizzini', level: 'CSI' },
      { id: 'p5_7', name: 'Fabiola Esposito', level: 'CSI' },
    ],
  },
  {
    id: 't6',
    name: 'GLI ALANI',
    level: 'Avanzato',
    registeredAt: '2026-08-21 19:25',
    createdAt: 1724268300000,
    players: [
      { id: 'p6_1', name: 'Mario Puleo', level: 'Regionale' },
      { id: 'p6_2', name: 'Margherita Scarpinato', level: 'Regionale' },
      { id: 'p6_3', name: 'Giorgio Piraino', level: 'Regionale' },
      { id: 'p6_4', name: 'Antonino Frascati', level: 'Regionale' },
      { id: 'p6_5', name: 'Federica Martorana', level: 'Regionale' },
      { id: 'p6_6', name: 'Giuseppe Grotte', level: 'Regionale' },
      { id: 'p6_7', name: 'Simona Incandela', level: 'Regionale' },
    ],
  },
  {
    id: 't7',
    name: 'AURA DI SONNO',
    level: 'Intermedio',
    registeredAt: '2026-08-21 19:30',
    createdAt: 1724268600000,
    players: [
      { id: 'p7_1', name: 'Gaspare Portuesi', level: 'Regionale' },
      { id: 'p7_2', name: 'Federita Giambona', level: 'Nazionale' },
      { id: 'p7_3', name: 'Michela Mulia', level: 'Nazionale' },
      { id: 'p7_4', name: 'Gabriele Mirabella', level: 'Nazionale' },
      { id: 'p7_5', name: 'Noemi Romano', level: 'Regionale' },
      { id: 'p7_6', name: 'Salvatore Giuliano', level: 'Regionale' },
      { id: 'p7_7', name: 'Federica Bruno', level: 'Nazionale' },
    ],
  },
  {
    id: 't8',
    name: 'TEAM POLPETTO',
    level: 'Base',
    registeredAt: '2026-08-21 19:35',
    createdAt: 1724268900000,
    players: [
      { id: 'p8_1', name: 'Carlo Scalici', level: 'Regionale' },
      { id: 'p8_2', name: 'Giuseppe Scalici', level: 'Regionale' },
      { id: 'p8_3', name: 'Eleonora Caruso', level: 'Regionale' },
      { id: 'p8_4', name: 'Miriam Lo Piccolo', level: 'Regionale' },
      { id: 'p8_5', name: 'Silvia Muratore', level: 'Regionale' },
      { id: 'p8_6', name: 'Andrea Fumoso', level: 'Regionale' },
      { id: 'p8_7', name: 'Salvo Geraci', level: 'Regionale' },
    ],
  },
  {
    id: 't9',
    name: "CREPI L'AVARIZIA",
    level: 'Intermedio',
    registeredAt: '2026-08-21 19:40',
    createdAt: 1724269200000,
    players: [
      { id: 'p9_1', name: 'Marta Pedalino', level: 'Regionale' },
      { id: 'p9_2', name: 'Marco Provenza', level: 'Regionale' },
      { id: 'p9_3', name: 'Carlo Di Stefano', level: 'Regionale' },
      { id: 'p9_4', name: 'Cristian Bonetti', level: 'Non Tesserato' },
      { id: 'p9_5', name: 'Marco Lequaglie', level: 'Regionale' },
      { id: 'p9_6', name: 'Giada Gambino', level: 'Provinciale' },
      { id: 'p9_7', name: 'Marilena Schiattone', level: 'Regionale' },
    ],
  },
  {
    id: 't10',
    name: 'I PALLALCOLISTI',
    level: 'Avanzato',
    registeredAt: '2026-08-21 19:45',
    createdAt: 1724269500000,
    players: [
      { id: 'p10_1', name: 'Giuseppe Carrabino', level: 'Regionale' },
      { id: 'p10_2', name: 'Andrea Sicilia', level: 'Nazionale' },
      { id: 'p10_3', name: 'Riccardo Smeraldo', level: 'Nazionale' },
      { id: 'p10_4', name: 'Dario Valenza', level: 'Regionale' },
      { id: 'p10_5', name: 'Mirco Morana', level: 'Regionale' },
      { id: 'p10_6', name: 'Alessia Morreale', level: 'Non Tesserato' },
      { id: 'p10_7', name: 'Sofia Senapa', level: 'Non Tesserato' },
    ],
  },
  {
    id: 't11',
    name: 'INNANZITUTTO BUONASERA',
    level: 'Intermedio',
    registeredAt: '2026-08-21 19:50',
    createdAt: 1724269800000,
    players: [
      { id: 'p11_1', name: 'Giorgio Longo', level: 'Provinciale' },
      { id: 'p11_2', name: 'Ettore Giangreco', level: 'Regionale' },
      { id: 'p11_3', name: 'Giorgia Catalano', level: 'Non Tesserato' },
      { id: 'p11_4', name: 'Giuseppe Badalamenti', level: 'Non Tesserato' },
      { id: 'p11_5', name: 'Elisa Curcio', level: 'Regionale' },
      { id: 'p11_6', name: 'Leonardo Ferrera', level: 'Provinciale' },
      { id: 'p11_7', name: 'Giada Cosentino', level: 'Regionale' },
    ],
  },
  {
    id: 't12',
    name: 'MUGIWARA VOLLEY',
    level: 'Base',
    registeredAt: '2026-08-21 19:55',
    createdAt: 1724270100000,
    players: [
      { id: 'p12_1', name: 'Alessio Cacioppo', level: 'CSI' },
      { id: 'p12_2', name: 'Marta Magnolia', level: 'Provinciale' },
      { id: 'p12_3', name: 'Giovanni Matranga', level: 'Provinciale' },
      { id: 'p12_4', name: 'Emanuele Ciampallari', level: 'CSI' },
      { id: 'p12_5', name: 'Davide Perdichizzi', level: 'Provinciale' },
      { id: 'p12_6', name: 'Giulia Merulla', level: 'CSI' },
      { id: 'p12_7', name: 'Davide Biscardi', level: 'Provinciale' },
    ],
  },
  {
    id: 't13',
    name: 'FRITTURINA MISTA',
    level: 'Avanzato',
    registeredAt: '2026-08-21 20:00',
    createdAt: 1724270400000,
    players: [
      { id: 'p13_1', name: 'Francesco La Malfa', level: 'Regionale' },
      { id: 'p13_2', name: 'Davide Di Maria', level: 'Regionale' },
      { id: 'p13_3', name: 'Angelica Di Maria', level: 'Regionale' },
      { id: 'p13_4', name: 'Giulia Maddalena', level: 'Regionale' },
      { id: 'p13_5', name: 'Gloria Senapa', level: 'Nazionale' },
      { id: 'p13_6', name: 'Ettore Di Maria', level: 'Regionale' },
      { id: 'p13_7', name: 'Matteo Rivas', level: 'Regionale' },
    ],
  },
  {
    id: 't14',
    name: 'GLI IMPROVVISATI',
    level: 'Base',
    registeredAt: '2026-08-21 20:05',
    createdAt: 1724270700000,
    players: [
      { id: 'p14_1', name: 'Salvo Contrera', level: 'Regionale' },
      { id: 'p14_2', name: 'Marco Guccione', level: 'CSI' },
      { id: 'p14_3', name: 'Emanuele Perinto', level: 'CSI' },
      { id: 'p14_4', name: 'Karol De Lisi', level: 'Provinciale' },
      { id: 'p14_5', name: 'Marilina Sclafani', level: 'CSI' },
    ],
  },
  {
    id: 't15',
    name: 'PER CASO',
    level: 'Intermedio',
    registeredAt: '2026-08-21 20:10',
    createdAt: 1724271000000,
    players: [
      { id: 'p15_1', name: 'Francesco Bonafede', level: 'Regionale' },
      { id: 'p15_2', name: 'Ambra Zagarella', level: 'Regionale' },
      { id: 'p15_3', name: 'Chiara Pavone', level: 'Regionale' },
      { id: 'p15_4', name: 'Francesco Rosolino', level: 'CSI' },
      { id: 'p15_5', name: 'Giovanna Lo Cicero', level: 'Regionale' },
      { id: 'p15_6', name: 'Giulio Cammarata', level: 'Regionale' },
      { id: 'p15_7', name: 'Aurora Filloramo', level: 'Regionale' },
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
  // Overnight tournament range: hours before 12:00 belong to the next morning (after midnight)
  const adjustedHours = h < 12 ? h + 24 : h;
  return adjustedHours * 60 + m;
}

export function formatMinutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function normalizeCourtName(court?: string | null): string {
  if (!court) return 'Campo Palamelina';
  const trimmed = court.trim();
  if (
    /^campo\s*unico$/i.test(trimmed) ||
    /^campo\s*1$/i.test(trimmed) ||
    trimmed.toLowerCase() === 'campo' ||
    trimmed.toLowerCase() === 'campo unico' ||
    trimmed.toLowerCase() === 'campounico'
  ) {
    return 'Campo Palamelina';
  }
  return trimmed;
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

export function getQfParameters(
  quarterFinalsMode: QuarterFinalsMode = 'single_set_25',
  durationSingleSetMinutes: number = 25,
  durationBestOf3Minutes: number = 50,
  durationBestOf3_15Minutes: number = 35
): { maxSets: number; pointsPerSet: number; tieBreakPoints: number; durationMinutes: number; label: string } {
  if (quarterFinalsMode === 'best_of_3_25_tb15' || quarterFinalsMode === 'best_of_3_tb15') {
    return {
      maxSets: 3,
      pointsPerSet: 25,
      tieBreakPoints: 15,
      durationMinutes: durationBestOf3Minutes,
      label: '2 Set su 3 a 25 con TB a 15',
    };
  }
  if (quarterFinalsMode === 'best_of_3_15') {
    return {
      maxSets: 3,
      pointsPerSet: 15,
      tieBreakPoints: 15,
      durationMinutes: durationBestOf3_15Minutes,
      label: '2 Set su 3 a 15',
    };
  }
  return {
    maxSets: 1,
    pointsPerSet: 25,
    tieBreakPoints: 25,
    durationMinutes: durationSingleSetMinutes,
    label: 'Set Singolo a 25',
  };
}

// Generate the complete Knockout Phase (Ottavi, Quarti, Semifinali, Finali)
// According to exact specifications:
// - 1° has BYE (advances directly to Quarti)
// - 2° to 15° play Ottavi: 8 vs 9, 4 vs 13, 5 vs 12, 2 vs 15, 7 vs 10, 3 vs 14, 6 vs 11
// - Quarti: 1 vs (8 vs 9), (4 vs 13) vs (5 vs 12), (2 vs 15) vs (7 vs 10), (3 vs 14) vs (6 vs 11)
// - Quarti mode: single_set_25 | best_of_3_25_tb15 | best_of_3_15
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
  courtName: string = 'Campo Palamelina',
  durationBestOf3_15Minutes: number = 35,
  quarterFinalsStartTime?: string
): Match[] {
  // rankedTeams is sorted 1° to 15°
  const getSeed = (rank: number): Team | null => {
    return rankedTeams[rank - 1] || null;
  };

  const matches: Match[] = [];

  // OTTAVI DI FINALE (7 matches - Round 2)
  const ottaviDefinitions = [
    { id: 'm-ott-1', seed1: 8, seed2: 9, nextMatchId: 'm-qf-1', nextMatchSlot: 'team2' as const, label: '1°Ottavo' },
    { id: 'm-ott-2', seed1: 4, seed2: 13, nextMatchId: 'm-qf-2', nextMatchSlot: 'team1' as const, label: '2°Ottavo' },
    { id: 'm-ott-3', seed1: 5, seed2: 12, nextMatchId: 'm-qf-2', nextMatchSlot: 'team2' as const, label: '3°Ottavo' },
    { id: 'm-ott-4', seed1: 2, seed2: 15, nextMatchId: 'm-qf-3', nextMatchSlot: 'team1' as const, label: '4°Ottavo' },
    { id: 'm-ott-5', seed1: 7, seed2: 10, nextMatchId: 'm-qf-3', nextMatchSlot: 'team2' as const, label: '5°Ottavo' },
    { id: 'm-ott-6', seed1: 3, seed2: 14, nextMatchId: 'm-qf-4', nextMatchSlot: 'team1' as const, label: '6°Ottavo' },
    { id: 'm-ott-7', seed1: 6, seed2: 11, nextMatchId: 'm-qf-4', nextMatchSlot: 'team2' as const, label: '7°Ottavo' },
  ];

  let currentMinutes = parseTimeToMinutes(startTime) + (15 * durationSingleSetMinutes);

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
    });
    currentMinutes += durationSingleSetMinutes;
  });

  if (quarterFinalsStartTime && quarterFinalsStartTime.trim() !== '') {
    currentMinutes = parseTimeToMinutes(quarterFinalsStartTime);
  }

  // QUARTI DI FINALE (4 matches - Round 3)
  const qfParams = getQfParameters(quarterFinalsMode, durationSingleSetMinutes, durationBestOf3Minutes, durationBestOf3_15Minutes);

  const quartiDefinitions = [
    {
      id: 'm-qf-1',
      team1: getSeed(1), // 1° BYE seeded directly!
      team2: null, // Will come from winner of Ottavo 1 (8 vs 9)
      nextMatchId: 'm-sf-1',
      nextMatchSlot: 'team1' as const,
      label: '1°Quarto',
    },
    {
      id: 'm-qf-2',
      team1: null, // Winner Ottavo 2 (4 vs 13)
      team2: null, // Winner Ottavo 3 (5 vs 12)
      nextMatchId: 'm-sf-1',
      nextMatchSlot: 'team2' as const,
      label: '2°Quarto',
    },
    {
      id: 'm-qf-3',
      team1: null, // Winner Ottavo 4 (2 vs 15)
      team2: null, // Winner Ottavo 5 (7 vs 10)
      nextMatchId: 'm-sf-2',
      nextMatchSlot: 'team1' as const,
      label: '3°Quarto',
    },
    {
      id: 'm-qf-4',
      team1: null, // Winner Ottavo 6 (3 vs 14)
      team2: null, // Winner Ottavo 7 (6 vs 11)
      nextMatchId: 'm-sf-2',
      nextMatchSlot: 'team2' as const,
      label: '4°Quarto',
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
      pointsPerSet: qfParams.pointsPerSet,
      maxSets: qfParams.maxSets,
      tieBreakPoints: qfParams.tieBreakPoints,
      nextMatchId: def.nextMatchId,
      nextMatchSlot: def.nextMatchSlot,
    });
    currentMinutes += qfParams.durationMinutes;
  });

  // SEMIFINALI (2 matches - Round 4)
  // Formato: 2 set su 3 a 25 con Tie-Break a 15 punti
  const semifinaliDefinitions = [
    {
      id: 'm-sf-1',
      nextMatchId: 'm-fin-1-2',
      nextMatchSlot: 'team1' as const,
      label: '1°Semifinale',
    },
    {
      id: 'm-sf-2',
      nextMatchId: 'm-fin-1-2',
      nextMatchSlot: 'team2' as const,
      label: '2°Semifinale',
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
      tieBreakPoints: 15, // Tie-break sempre a 15 punti
      nextMatchId: def.nextMatchId,
      nextMatchSlot: def.nextMatchSlot,
    });
    currentMinutes += durationBestOf3Minutes;
  });

  // GRAND FINALE 1°/2° Posto (Round 5 - Solo Finale 1° e 2° Posto, no 3°-4°)
  matches.push({
    id: 'm-fin-1-2',
    round: 5,
    roundLabel: 'Grand Finale 1° e 2° Posto 🏆',
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
    maxSets: 3, // 2 su 3
    tieBreakPoints: 15, // Tie-break sempre a 15 punti
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
  quarterFinalsMode: QuarterFinalsMode = 'single_set_25',
  durationBestOf3_15Minutes: number = 35,
  quarterFinalsStartTime?: string
): Match[] {
  // Exclude deleted 3°-4° final match
  const filteredMatches = matches.filter((m) => m.id !== 'm-fin-3-4');

  const groupMatches = filteredMatches
    .filter((m) => m.phase === 'gironi' || m.round === 1)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  const ottaviMatches = filteredMatches
    .filter((m) => m.round === 2)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  const qfParams = getQfParameters(
    quarterFinalsMode,
    durationSingleSetMinutes,
    durationBestOf3Minutes,
    durationBestOf3_15Minutes
  );

  const quartiMatches = filteredMatches
    .filter((m) => m.round === 3)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  const semifinaliMatches = filteredMatches
    .filter((m) => m.round === 4)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  const finale12 = filteredMatches.find((m) => m.id === 'm-fin-1-2' || m.round === 5);

  let currentMinutes = 0;
  if (quarterFinalsStartTime && quarterFinalsStartTime.trim() !== '') {
    currentMinutes = parseTimeToMinutes(quarterFinalsStartTime);
  } else {
    // If not provided, fallback to standard offset (15 gironi + 7 ottavi)
    currentMinutes = parseTimeToMinutes(startTime) + (15 * durationSingleSetMinutes) + (7 * durationSingleSetMinutes);
  }
  const updatedMap = new Map<string, Partial<Match>>();

  // 3. Quarti matches (Configured QF formula)
  quartiMatches.forEach((m) => {
    updatedMap.set(m.id, {
      court: courtName,
      time: formatMinutesToTime(currentMinutes),
      maxSets: qfParams.maxSets,
      pointsPerSet: qfParams.pointsPerSet,
      tieBreakPoints: qfParams.tieBreakPoints,
    });
    currentMinutes += qfParams.durationMinutes;
  });

  // 4. Semifinali matches (2 su 3 a 25 con TB a 15)
  semifinaliMatches.forEach((m) => {
    updatedMap.set(m.id, {
      court: courtName,
      time: formatMinutesToTime(currentMinutes),
      maxSets: 3,
      pointsPerSet: 25,
      tieBreakPoints: 15,
    });
    currentMinutes += durationBestOf3Minutes;
  });

  // 5. Finale 1°-2° (2 su 3 a 25 con TB a 15)
  if (finale12) {
    updatedMap.set(finale12.id, {
      court: courtName,
      time: formatMinutesToTime(currentMinutes),
      maxSets: 3,
      pointsPerSet: 25,
      tieBreakPoints: 15,
    });
    currentMinutes += durationBestOf3Minutes;
  }

  return filteredMatches.map((m) => {
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

// Validation result interface for set scores
export interface SetScoreValidation {
  isValid: boolean;
  isComplete: boolean;
  error?: string;
  winner?: 'team1' | 'team2';
}

/**
 * Validates a set score according to official rules:
 * - One team must reach at least the target points (e.g. 25 or 15).
 * - If the winning score equals targetPoints (25 or 15), difference must be >= 2 (e.g. 25-23, 25-20, 15-13, 15-10).
 * - If the winning score exceeds targetPoints (>25 or >15), the difference MUST be EXACTLY 2 points (e.g. 26-24, 27-25, 16-14, 17-15).
 * - Results like 26-21 or 17-12 are INVALID.
 */
export function validateSetScore(
  p1: number,
  p2: number,
  targetPoints: number = 25
): SetScoreValidation {
  if (isNaN(p1) || isNaN(p2) || p1 < 0 || p2 < 0) {
    return { isValid: false, isComplete: false, error: 'I punti devono essere numeri positivi.' };
  }

  // Not played yet
  if (p1 === 0 && p2 === 0) {
    return { isValid: true, isComplete: false };
  }

  const maxP = Math.max(p1, p2);
  const minP = Math.min(p1, p2);
  const diff = maxP - minP;
  const winner: 'team1' | 'team2' = p1 > p2 ? 'team1' : 'team2';

  // 1. One team must reach at least targetPoints
  if (maxP < targetPoints) {
    return {
      isValid: false,
      isComplete: false,
      error: `Punteggio incompleto: una delle due squadre deve raggiungere almeno ${targetPoints} punti (attualmente: ${p1} - ${p2}).`,
    };
  }

  // 2. Minimum advantage of 2 points
  if (diff < 2) {
    return {
      isValid: false,
      isComplete: false,
      error: `Scarto insufficiente: occorrono almeno 2 punti di vantaggio per chiudere il set (attualmente: ${p1} - ${p2}, scarto di ${diff}).`,
    };
  }

  // 3. Exact 2-point difference when exceeding target (> 25 or > 15)
  if (maxP > targetPoints && diff !== 2) {
    return {
      isValid: false,
      isComplete: false,
      error: `Risultato non ammesso (${p1} - ${p2}): superati i ${targetPoints} punti il set deve concludersi con uno scarto di soli 2 punti (es. ${maxP} - ${maxP - 2} oppure ${targetPoints} - ${minP}).`,
    };
  }

  // Score is completely valid and finished
  return {
    isValid: true,
    isComplete: true,
    winner,
  };
}

// Check if a single set score is complete and won strictly by the rules
export function isSetFinished(p1: number, p2: number, targetPoints: number = 25): boolean {
  return validateSetScore(p1, p2, targetPoints).isComplete;
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
  const tieBreakTarget = match.tieBreakPoints || 15;

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

// Swap times between two matches (ONLY if BOTH are not completed)
export function swapMatchTimes(matches: Match[], matchId1: string, matchId2: string): Match[] {
  const m1 = matches.find((m) => m.id === matchId1);
  const m2 = matches.find((m) => m.id === matchId2);
  if (!m1 || !m2) return matches;
  if (m1.status === 'completed' || m2.status === 'completed') {
    return matches;
  }

  const t1 = m1.time;
  const t2 = m2.time;
  const c1 = m1.court;
  const c2 = m2.court;
  const p1 = m1.position;
  const p2 = m2.position;

  return matches.map((m) => {
    if (m.id === matchId1) return { ...m, time: t2, court: c2, position: p2 };
    if (m.id === matchId2) return { ...m, time: t1, court: c1, position: p1 };
    return m;
  });
}

// Reorder matches using Shift (slittamento): ONLY pending matches are reordered and their times shifted
export function reorderMatchesByShift(
  matches: Match[],
  sourceId: string,
  targetId: string
): { updated: Match[]; success: boolean; error?: string } {
  if (sourceId === targetId) return { updated: matches, success: false };

  const sourceMatch = matches.find((m) => m.id === sourceId);
  const targetMatch = matches.find((m) => m.id === targetId);

  if (!sourceMatch || !targetMatch) {
    return { updated: matches, success: false, error: 'Gare non trovate.' };
  }

  if (sourceMatch.status === 'completed' || targetMatch.status === 'completed') {
    return {
      updated: matches,
      success: false,
      error: 'Non è possibile spostare o scambiare gare già disputate.',
    };
  }

  // Get only pending/scheduled matches sorted chronologically
  const pendingMatches = matches
    .filter((m) => m.status !== 'completed')
    .sort((a, b) => {
      const tA = parseTimeToMinutes(a.time);
      const tB = parseTimeToMinutes(b.time);
      if (tA !== tB) return tA - tB;
      return (a.position || 0) - (b.position || 0);
    });

  const sourceIndexInPending = pendingMatches.findIndex((m) => m.id === sourceId);
  const targetIndexInPending = pendingMatches.findIndex((m) => m.id === targetId);

  if (sourceIndexInPending === -1 || targetIndexInPending === -1) {
    return { updated: matches, success: false, error: 'Gare non trovate tra quelle da disputare.' };
  }

  // Extract original sorted time slots and positions from pending matches
  const timeSlots = pendingMatches.map((m) => m.time);
  const positions = pendingMatches.map((m) => m.position);
  const courts = pendingMatches.map((m) => m.court);

  // Shift the array of pending matches
  const reorderedPending = [...pendingMatches];
  const [movedItem] = reorderedPending.splice(sourceIndexInPending, 1);
  reorderedPending.splice(targetIndexInPending, 0, movedItem);

  // Re-assign the slots to the new sequence of pending matches
  const updatedPendingMap = new Map<string, Match>();
  reorderedPending.forEach((m, idx) => {
    updatedPendingMap.set(m.id, {
      ...m,
      time: timeSlots[idx] || m.time,
      position: positions[idx] !== undefined ? positions[idx] : m.position,
      court: courts[idx] || m.court,
    });
  });

  // Rebuild the full matches array preserving completed matches
  const fullyUpdated = matches.map((m) => {
    if (updatedPendingMap.has(m.id)) {
      return updatedPendingMap.get(m.id)!;
    }
    return m;
  });

  return { updated: fullyUpdated, success: true };
}

// Reorder matches using Swap (inversione): ONLY pending matches can be swapped
export function reorderMatchesBySwap(
  matches: Match[],
  sourceId: string,
  targetId: string
): { updated: Match[]; success: boolean; error?: string } {
  if (sourceId === targetId) return { updated: matches, success: false };

  const sourceMatch = matches.find((m) => m.id === sourceId);
  const targetMatch = matches.find((m) => m.id === targetId);

  if (!sourceMatch || !targetMatch) {
    return { updated: matches, success: false, error: 'Gare non trovate.' };
  }

  if (sourceMatch.status === 'completed' || targetMatch.status === 'completed') {
    return {
      updated: matches,
      success: false,
      error: 'Non è possibile scambiare orari con una gara già disputata.',
    };
  }

  const t1 = sourceMatch.time;
  const t2 = targetMatch.time;
  const c1 = sourceMatch.court;
  const c2 = targetMatch.court;
  const p1 = sourceMatch.position;
  const p2 = targetMatch.position;

  const fullyUpdated = matches.map((m) => {
    if (m.id === sourceId) return { ...m, time: t2, court: c2, position: p2 };
    if (m.id === targetId) return { ...m, time: t1, court: c1, position: p1 };
    return m;
  });

  return { updated: fullyUpdated, success: true };
}

// Ripple shift: shift starting time of target match and all subsequent matches on the same court (pending only)
export function shiftMatchesOnCourt(
  matches: Match[],
  targetMatchId: string,
  newTime: string,
  court: string,
  shiftMinutes: number = 25
): Match[] {
  const targetMatch = matches.find((m) => m.id === targetMatchId);
  if (!targetMatch) return matches;
  if (targetMatch.status === 'completed') return matches;

  const newTimeMinutes = parseTimeToMinutes(newTime);

  // Find all pending matches on the same court that have a scheduled time >= newTimeMinutes
  return matches.map((m) => {
    if (m.id === targetMatchId) {
      return { ...m, time: newTime, court };
    }
    if (m.status !== 'completed' && m.court.trim().toLowerCase() === court.trim().toLowerCase()) {
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
