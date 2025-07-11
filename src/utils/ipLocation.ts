// Utility to fetch approximate location via IP (web only)
// Uses ipinfo.io (no API key needed for basic info)

export interface IpLocation {
  lat: number;
  lng: number;
  city?: string;
  region?: string;
  country?: string;
}

export async function getIpApproxLocation(): Promise<IpLocation | null> {
  try {
    const res = await fetch('https://ipinfo.io/json?token='); // Optionally add your token for higher limits
    if (!res.ok) return null;
    const data = await res.json();
    if (typeof data.loc === 'string') {
      const [lat, lng] = data.loc.split(',').map(Number);
      return {
        lat,
        lng,
        city: data.city,
        region: data.region,
        country: data.country
      };
    }
    return null;
  } catch {
    return null;
  }
}
