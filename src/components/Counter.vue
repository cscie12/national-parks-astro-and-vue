<script setup>
import { ref, onMounted } from 'vue'

// Props = inputs from the parent: <Counter label="..." />
defineProps({ label: { type: String, required: true } })

// ref() makes a reactive value: change count.value and the template re-renders.
const count = ref(0)
const hydrated = ref(false)

// onMounted only runs in the browser, after Vue "hydrates" the component.
// If this never runs, the component is just static HTML.
onMounted(() => {
  hydrated.value = true
})
</script>

<template>
  <!-- :class="{ hydrated }" adds the class "hydrated" only while hydrated is true.
       In the template we write `count`, not `count.value`; Vue unwraps refs for us. -->
  <div class="counter" :class="{ hydrated }">
    <code>{{ label }}</code>
    <button @click="count++">Clicked {{ count }} times</button>
    <span class="status">{{ hydrated ? '✅ interactive (hydrated)' : '⛔ static HTML only' }}</span>
  </div>
</template>

<!-- scoped: these rules only apply to this component's own elements -->
<style scoped>
.counter {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  margin: 1rem 0;
  border: 2px dashed var(--border);
  border-radius: 8px;
  background: var(--card);
}
.counter.hydrated { border-style: solid; border-color: var(--accent); }
code { min-width: 11rem; font-weight: 600; }
.status { color: var(--muted); }
</style>
