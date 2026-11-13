/**
 * The browser's geolocation API uses callbacks.
 * Wrapping it in a Promise lets us use async/await.
 * Browser-only: `navigator` doesn't exist on the server, so only call this
 * from event handlers or onMounted, never while a component first renders.
 */
export function getPosition() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by this browser.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(err),
      { timeout: 10000 }
    )
  })
}

/**
 * Haversine formula: straight-line ("as the crow flies") distance in miles
 * between two { latitude, longitude } points.
 */
export function distanceMiles(a, b) {
  const R = 3958.8 // Earth's radius in miles
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Handy fallbacks for demos (or when someone says "no" to location access) */
export const SAMPLE_LOCATIONS = [
  { name: 'Harvard Yard', latitude: 42.3744665, longitude: -71.1172096 },
  { name: 'Manchester, NH', latitude: 42.9957, longitude: -71.4537},
  { name: 'Knoxville, TN', latitude: 35.9606, longitude: -83.9207 },
  { name: 'Lawrence, KS', latitude: 38.9717, longitude: -95.2353 },
  { name: 'Denver, CO', latitude: 39.7392, longitude: -104.9903 },
  { name: 'Santa Fe, NM', latitude: 35.6870, longitude: -105.9378 },
  { name: 'Boise, ID', latitude: 43.6150, longitude: -116.2023 },
  { name: 'San Francisco, CA', latitude: 37.7749, longitude: -122.4194 }
]
