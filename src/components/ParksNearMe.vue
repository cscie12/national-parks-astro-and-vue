<script setup>
import { ref, computed } from 'vue'
import { getPosition, distanceMiles, SAMPLE_LOCATIONS } from '../lib/geo.js'

// This component does NOT fetch parks itself. It is handed a list.
// That makes it reusable: here, Astro fetches the list at build time and
// passes it in as a prop, but any parent could supply the list however it likes.
const props = defineProps({
  parks: { type: Array, required: true }, // [{ parkCode, fullName, states, latitude, longitude }]
})

// --- state ---
// In <script>, read/write a ref with .value (here.value = ...).
// In <template>, just write `here`; Vue unwraps it automatically.
const here = ref(null) // { name, latitude, longitude }
const locating = ref(false)
const error = ref('')
const count = ref(10)

// --- derived state: recomputes when parks, here, or count change ---
const nearest = computed(() => {
  if (!here.value) return []
  return props.parks
    .map((park) => ({ ...park, distance: distanceMiles(here.value, park) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count.value)
})

// --- actions ---
// getPosition() uses `navigator`, which only exists in the browser. That's safe
// here because it runs on a button click, never during Astro's build-time render.
async function useMyLocation() {
  locating.value = true
  error.value = ''
  try {
    const pos = await getPosition()
    here.value = { name: 'your location', ...pos }
  } catch (err) {
    error.value = err.message || 'Could not get your location.'
  } finally {
    locating.value = false
  }
}

function useSample(place) {
  error.value = ''
  here.value = place
}
</script>

<template>
  <div class="parks-near-me">
    <div class="controls">
      <!-- @click = event listener; :disabled = bind an attribute to a JS expression -->
      <button @click="useMyLocation" :disabled="locating">
        {{ locating ? 'Locating…' : '📍 Use my location' }}
      </button>
      <span class="or">or try:</span>
      <!-- v-for repeats this element once per item; :key gives each a unique id
           so Vue can track which is which when the list changes -->
      <button
        v-for="place in SAMPLE_LOCATIONS"
        :key="place.name"
        class="secondary"
        @click="useSample(place)"
      >{{ place.name }}</button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <!-- <template> groups elements under one v-if without adding an extra element to the page -->
    <template v-if="here">
      <label class="count">
        Show {{ count }} closest parks to {{ here.name }}
        <!-- v-model = two-way binding: the slider updates count, and count updates the slider.
             .number converts the input's string value to a number. -->
        <input type="range" min="1" max="50" v-model.number="count" />
      </label>

      <ol class="park-list">
        <li v-for="park in nearest" :key="park.parkCode">
          <a :href="park.url">{{ park.fullName }}</a>
          <span class="meta">{{ park.states }} · {{ Math.round(park.distance) }} mi</span>
        </li>
      </ol>
    </template>

    <!-- v-else-if must come right after the element with v-if -->
    <p v-else-if="!locating" class="hint">Choose a location to find the closest parks.</p>
  </div>
</template>

<style scoped>
.controls { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
.or { color: var(--muted); }
.error { color: var(--error); }
.hint { color: var(--muted); }
.count { display: block; margin: 1rem 0 0.5rem; font-weight: 600; }
.count input { display: block; width: 100%; max-width: 20rem; }
.park-list { padding-left: 1.5rem; }
.park-list li { margin: 0.4rem 0; }
.meta { color: var(--muted); margin-left: 0.5rem; font-size: 0.9em; }
</style>
