/**
 * csv-loader.js
 * =============
 * Data loading layer — currently loads from sample_players.json
 * (already populated from ipl_player_data_2021.csv).
 *
 * To switch to live CSV loading, uncomment the CSV path below and
 * place your CSV at data/players.csv.
 *
 * CSV column → card field mapping (2021 dataset):
 *   Name          → name
 *   Team          → team
 *   Batting_Hand  → battingHand
 *   Role          → role
 *   Matches       → matches
 *   Innings       → innings
 *   Runs          → runs
 *   Highest       → highestScore
 *   Average       → average
 *   SR            → strikeRate
 *   100s          → hundreds
 *   50s           → fifties
 *   4s            → fours
 *   6s            → sixes
 *   Wickets       → wickets
 *   Economy       → economy       ← LOWER IS BETTER
 *   B_Average     → bowlingAverage ← LOWER IS BETTER
 *   Image_url     → image
 */

const TEAM_COLORS = {
  'Chennai Super Kings':        '#FDB913',
  'Mumbai Indians':             '#004BA0',
  'Royal Challengers Bangalore':'#EC1C24',
  'Kolkata Knight Riders':      '#3A225D',
  'Delhi Capitals':             '#17479E',
  'Rajasthan Royals':           '#254AA5',
  'Punjab Kings':               '#ED1B24',
  'Sunrisers Hyderabad':        '#F7A721',
  'Lucknow Super Giants':       '#A72056',
  'Gujarat Titans':             '#1D4776',
};

const TEAM_SHORTS = {
  'Chennai Super Kings':        'CSK',
  'Mumbai Indians':             'MI',
  'Royal Challengers Bangalore':'RCB',
  'Kolkata Knight Riders':      'KKR',
  'Delhi Capitals':             'DC',
  'Rajasthan Royals':           'RR',
  'Punjab Kings':               'PBKS',
  'Sunrisers Hyderabad':        'SRH',
  'Lucknow Super Giants':       'LSG',
  'Gujarat Titans':             'GT',
};

export async function loadPlayers() {
  // ── JSON path (active) ────────────────────────────────────────────────────
  const response = await fetch('data/sample_players.json');
  if (!response.ok) throw new Error(`Failed to load player data: ${response.status}`);
  return await response.json(); // Already normalised by the build script

  // ── CSV path (uncomment to switch) ────────────────────────────────────────
  // const response = await fetch('data/players.csv');
  // if (!response.ok) throw new Error(`Failed to load CSV: ${response.status}`);
  // return parseCSV(await response.text());
}

export function parseCSV(csv) {
  const lines   = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  return lines.slice(1)
    .filter(l => l.trim())
    .map((line, i) => {
      const vals = splitCSVLine(line);
      const raw  = {};
      headers.forEach((h, j) => { raw[h] = (vals[j] || '').trim().replace(/^"|"$/g, ''); });
      return normalizePlayer(raw, i);
    });
}

function normalizePlayer(raw, index = 0) {
  const team = String(raw['Team'] || raw['team'] || '').trim();
  const eco  = parseFloat(raw['Economy']   || raw['economy'])   || 0;
  const bavg = parseFloat(raw['B_Average'] || raw['bowlingAverage']) || 0;

  return {
    id:             raw['id'] || `p${String(index + 1).padStart(3, '0')}`,
    name:           String(raw['Name'] || raw['name'] || 'Unknown'),
    team,
    teamShort:      TEAM_SHORTS[team] || team.slice(0, 3).toUpperCase(),
    role:           String(raw['Role'] || raw['role'] || 'Unknown').trim()
                      .replace(/\w\S*/g, t => t[0].toUpperCase() + t.slice(1).toLowerCase()),
    battingHand:    String(raw['Batting_Hand'] || raw['battingHand'] || 'Right'),
    matches:        parseInt(raw['Matches']  || raw['matches'])  || 0,
    innings:        parseInt(raw['Innings']  || raw['innings'])  || 0,
    runs:           parseInt(raw['Runs']     || raw['runs'])     || 0,
    highestScore:   parseInt(raw['Highest']  || raw['highestScore']) || 0,
    average:        parseFloat(raw['Average'] || raw['average']) || 0,
    strikeRate:     parseFloat(raw['SR']     || raw['strikeRate']) || 0,
    hundreds:       parseInt(raw['100s']     || raw['hundreds']) || 0,
    fifties:        parseInt(raw['50s']      || raw['fifties'])  || 0,
    fours:          parseInt(raw['4s']       || raw['fours'])    || 0,
    sixes:          parseInt(raw['6s']       || raw['sixes'])    || 0,
    wickets:        parseInt(raw['Wickets']  || raw['wickets'])  || 0,
    economy:        eco,
    bowlingAverage: bavg,
    image:          String(raw['Image_url'] || raw['image'] || 'assets/images/players/placeholder.svg'),
    teamColor:      TEAM_COLORS[team] || '#4a90e2',
  };
}

function splitCSVLine(line) {
  const result = [];
  let cur = '', inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === ',' && !inQ) { result.push(cur); cur = ''; continue; }
    cur += ch;
  }
  result.push(cur);
  return result;
}
