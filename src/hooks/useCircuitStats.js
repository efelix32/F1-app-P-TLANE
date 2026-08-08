import { useState, useEffect } from 'react';

const BASE = 'https://api.jolpi.ca/ergast/f1';

/**
 * Fetches most wins at a circuit by aggregating P1 finishes
 */
export function useCircuitStats(circuitId) {
  const [wins, setWins]     = useState([]);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!circuitId) return;
    setLoading(true);

    // Parallel: total races + all P1 results (to count most wins)
    Promise.all([
      fetch(`${BASE}/circuits/${circuitId}/results.json?limit=1`).then(r => r.json()),
      fetch(`${BASE}/circuits/${circuitId}/results/1.json?limit=1000`).then(r => r.json()),
    ]).then(([totalData, winsData]) => {
      const totalRaces = parseInt(totalData?.MRData?.total || 0);
      setTotal(totalRaces);

      // Aggregate wins by driver
      const races = winsData?.MRData?.RaceTable?.Races || [];
      const winMap = {};
      races.forEach(race => {
        const res = race.Results?.[0];
        if (!res) return;
        const drv = res.Driver;
        const key = drv?.driverId;
        if (!winMap[key]) {
          winMap[key] = {
            driverId: key,
            name: `${drv?.givenName} ${drv?.familyName}`,
            nationality: drv?.nationality,
            wins: 0,
          };
        }
        winMap[key].wins++;
      });

      const sorted = Object.values(winMap).sort((a, b) => b.wins - a.wins);
      setWins(sorted.slice(0, 5)); // Top 5 winners
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [circuitId]);

  return { wins, total, loading };
}
