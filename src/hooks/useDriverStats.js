import { useState, useEffect } from 'react';

const BASE = 'https://api.jolpi.ca/ergast/f1';

async function fetchTotal(path) {
  try {
    const r = await fetch(`${BASE}${path}?limit=1`);
    if (!r.ok) return 0;
    const j = await r.json();
    return parseInt(j?.MRData?.total || 0);
  } catch { return 0; }
}

async function fetchSeasonRaces(driverId, season = '2026') {
  try {
    const r = await fetch(`${BASE}/${season}/drivers/${driverId}/results.json?limit=30`);
    if (!r.ok) return [];
    const j = await r.json();
    return j?.MRData?.RaceTable?.Races || [];
  } catch { return []; }
}

/**
 * Fetches full career + current season stats for a driver
 * Career: wins, podiums (P1+P2+P3), poles, race starts
 * Season: race-by-race results for chart
 */
export function useDriverCareerStats(driverId) {
  const [stats, setStats] = useState(null);
  const [seasonRaces, setSeasonRaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!driverId) return;
    setLoading(true);
    setStats(null);
    setSeasonRaces([]);

    Promise.all([
      fetchTotal(`/drivers/${driverId}/results/1.json`),     // career wins
      fetchTotal(`/drivers/${driverId}/results/2.json`),     // P2 finishes
      fetchTotal(`/drivers/${driverId}/results/3.json`),     // P3 finishes
      fetchTotal(`/drivers/${driverId}/qualifying/1.json`),  // career poles
      fetchTotal(`/drivers/${driverId}/results.json`),       // career starts
      fetchSeasonRaces(driverId, '2026'),                    // 2026 race-by-race
    ]).then(([wins, p2, p3, poles, starts, races]) => {
      setStats({
        wins,
        p2,
        p3,
        podiums: wins + p2 + p3,
        poles,
        starts,
      });
      setSeasonRaces(races);
      setLoading(false);
    }).catch(e => {
      setError(e.message);
      setLoading(false);
    });
  }, [driverId]);

  return { stats, seasonRaces, loading, error };
}
