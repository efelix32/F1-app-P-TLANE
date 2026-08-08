import { useQuery } from '@tanstack/react-query';

const BASE_URL = 'https://api.openf1.org/v1';

async function fetchOpenF1(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`OpenF1 ${res.status}`);
  return res.json();
}

export function useLatestSession() {
  const query = useQuery({
    queryKey: ['latestSession'],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      let data = await fetchOpenF1('/sessions', { year: currentYear });
      let list = Array.isArray(data) ? data : [];
      
      if (list.length === 0) {
        data = await fetchOpenF1('/sessions', { year: currentYear - 1 });
        list = Array.isArray(data) ? data : [];
      }
      
      list.sort((a, b) => new Date(b.date_start) - new Date(a.date_start));
      return list;
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    session: query.data?.[0] || null,
    sessions: query.data || [],
    loading: query.isLoading,
    error: query.error?.message,
  };
}

export function useSessionDrivers(sessionKey) {
  const query = useQuery({
    queryKey: ['sessionDrivers', sessionKey],
    queryFn: () => fetchOpenF1('/drivers', { session_key: sessionKey }),
    enabled: !!sessionKey,
    staleTime: 1000 * 60 * 60,
  });

  const drivers = Array.isArray(query.data) ? query.data : [];
  const driverMap = {};
  drivers.forEach(d => { driverMap[d.driver_number] = d; });

  return { drivers, driverMap, loading: query.isLoading };
}

export function useSessionPositions(sessionKey, isLive = false) {
  const query = useQuery({
    queryKey: ['sessionPositions', sessionKey],
    queryFn: async () => {
      const data = await fetchOpenF1('/position', { session_key: sessionKey });
      if (!Array.isArray(data)) return [];
      const map = {};
      data.forEach(p => {
        if (!map[p.driver_number] || new Date(p.date) > new Date(map[p.driver_number].date)) {
          map[p.driver_number] = p;
        }
      });
      return Object.values(map).sort((a, b) => a.position - b.position);
    },
    enabled: !!sessionKey,
    refetchInterval: isLive ? 5000 : false,
  });

  return { positions: query.data || [], loading: query.isLoading, refetch: query.refetch };
}

export function useSessionIntervals(sessionKey, isLive = false) {
  const query = useQuery({
    queryKey: ['sessionIntervals', sessionKey],
    queryFn: async () => {
      const data = await fetchOpenF1('/intervals', { session_key: sessionKey });
      if (!Array.isArray(data)) return [];
      const map = {};
      data.forEach(i => {
        if (!map[i.driver_number] || new Date(i.date) > new Date(map[i.driver_number].date)) {
          map[i.driver_number] = i;
        }
      });
      return Object.values(map);
    },
    enabled: !!sessionKey,
    refetchInterval: isLive ? 5000 : false,
  });

  return { intervals: query.data || [] };
}

export function useRaceControl(sessionKey, isLive = false) {
  const query = useQuery({
    queryKey: ['raceControl', sessionKey],
    queryFn: async () => {
      const data = await fetchOpenF1('/race_control', { session_key: sessionKey });
      if (!Array.isArray(data)) return [];
      const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
      return sorted.slice(0, 30);
    },
    enabled: !!sessionKey,
    refetchInterval: isLive ? 5000 : false,
  });

  const messages = query.data || [];
  const latestFlag = messages.find(m => m.flag);
  const currentFlag = latestFlag?.flag || 'GREEN';

  return { messages, currentFlag };
}

export function useSessionPitStops(sessionKey) {
  const query = useQuery({
    queryKey: ['sessionPitStops', sessionKey],
    queryFn: () => fetchOpenF1('/pit', { session_key: sessionKey }),
    enabled: !!sessionKey,
    staleTime: 1000 * 60,
  });

  const pitStops = Array.isArray(query.data) ? query.data : [];
  return { pitStops, loading: query.isLoading };
}

export function useSessionLaps(sessionKey, driverNumber) {
  const query = useQuery({
    queryKey: ['sessionLaps', sessionKey, driverNumber],
    queryFn: () => {
      const params = { session_key: sessionKey };
      if (driverNumber) params.driver_number = driverNumber;
      return fetchOpenF1('/laps', params);
    },
    enabled: !!sessionKey,
    staleTime: 1000 * 60,
  });

  const laps = Array.isArray(query.data) ? query.data : [];
  return { laps, loading: query.isLoading };
}

export function useRecentSessions(year = 2026) {
  const query = useQuery({
    queryKey: ['recentSessions', year],
    queryFn: async () => {
      const data = await fetchOpenF1('/sessions', { year });
      const list = Array.isArray(data) ? data : [];
      list.sort((a, b) => new Date(b.date_start) - new Date(a.date_start));
      return list;
    },
    staleTime: 1000 * 60 * 60,
  });

  return { sessions: query.data || [], loading: query.isLoading };
}
