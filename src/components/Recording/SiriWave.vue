<template>
  <div ref="siriContainer" class="container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineProps, watch } from "vue";
import SiriWave from "siriwave";

const props = defineProps(["averageVolume", "isRecording"]);

const siriContainer = ref(null);
let siriWaveInstance;

onMounted(() => {
  siriWaveInstance = new SiriWave({
    style: "ios9",
    container: siriContainer.value,
    height: 200,
    cover: true,
    autostart: true, // Start the animation on boot
    amplitude: 0.1, // Initial amplitude value (you can adjust this as needed)
  });

  // Watch for changes in averageVolume and update the SiriWave amplitude accordingly
  watch(
    () => props.averageVolume,
    (newValue) => {
      if (siriWaveInstance && props.isRecording) {
        // Normalize the averageVolume value to a suitable amplitude range (adjust as needed)
        const normalizedAmplitude = props.averageVolume / 20;
        siriWaveInstance.setAmplitude(normalizedAmplitude);
      }
    }
  );

  watch(
    () => props.isRecording,
    (newValue) => {
      if (siriWaveInstance) {
        // console.log("ammar 123", newValue);
        // Normalize the averageVolume value to a suitable amplitude range (adjust as needed)
        if (!newValue) {
          siriWaveInstance.setAmplitude(0.1);
        }
      }
    }
  );
});

onUnmounted(() => {
  if (siriWaveInstance) {
    siriWaveInstance.dispose();
  }
});
</script>

<style lang="scss" scoped>
.container {
  position: relative;
}
/* You can style the SiriWave container if needed */
</style>
