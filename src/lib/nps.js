// Runs ONLY in Astro frontmatter / getStaticPaths, i.e. at build time
// (or on the dev server). Never in the browser, so the key stays secret.
const API = 'https://developer.nps.gov/api/v1';
// import.meta.env reads variables from .env. Without a PUBLIC_ prefix,
// Astro only makes them available to server/build-time code.
const KEY = import.meta.env.NPS_API_KEY;

// Cache: several pages may call getAllParks() during one build. Storing the
// PROMISE (not the result) means they all share a single fetch, even if
// they call at the same moment before the first request has finished.
let parksPromise = null;

/** Every site in the National Park System that has coordinates (full NPS records). */
export function getAllParks() {
  // ??= assigns only if parksPromise is still null/undefined, so the fetch runs once.
  parksPromise ??= (async () => {
    if (!KEY) throw new Error('Missing NPS_API_KEY. Copy .env.example to .env.');
    const url = `${API}/parks?limit=500&api_key=${KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NPS API error: ${res.status} ${res.statusText}`);
    const { data } = await res.json(); // the API wraps its results in { total, data: [...] }
    return data
      .filter((p) => p.latitude && p.longitude) // a few sites have no coordinates
      // The API sends coordinates as strings ("44.59"); convert them so we can do math.
      .map((p) => ({ ...p, latitude: Number(p.latitude), longitude: Number(p.longitude) }));
  })();
  return parksPromise;
}

/** All parks, sorted alphabetically by name. */
export async function getNationalParks() {
  const all = await getAllParks();
  // localeCompare sorts strings alphabetically (handles accents, unlike < and >).
  return all.sort((a, b) => a.name.localeCompare(b.name));
}
