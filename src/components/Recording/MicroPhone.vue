<template>
  <div class="mic">
    <div class="mic--inner-container">
      <q-select
        rounded
        outlined
        v-model="selectedMicrophone"
        :options="audioDevices"
        label="Select audio device"
        color="orange-14"
      >
      </q-select>
    </div>
    <div class="mic--inner-container">
      <label>Sound Level</label>
      <AVMedia
        :media="stream"
        type="vbar"
        :canv-width="120"
        :canv-height="32"
        vbar-bg-color="#fff"
        vbar-fill-color="#f57927"
        vbar-width="5"
        :vbar-caps="false"
        vbar-space="5"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { AVMedia } from "vue-audio-visual";

const isMicrophoneEnabled = ref(false);
const stream = ref(null);
const audioDevices = ref([]);
const selectedMicrophone = ref(null);

const updateMicrophoneList = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    audioDevices.value = devices.filter(
      (device) => device.kind === "audioinput"
    );
    audioDevices.value = audioDevices.value.map((d) => ({
      label: d.label,
      value: d.deviceId,
      groupId: d.label,
    }));
    if (audioDevices.value.length > 0) {
      const { groupId, deviceId, label } = audioDevices.value[0];
      selectedMicrophone.value = {
        label: label,
        value: deviceId,
        groupId: groupId,
      };
    }
  } catch (error) {
    console.error("Error enumerating devices:", error);
  }
};

const toggleMicrophone = async () => {
  try {
    const constraints = {
      audio: { deviceId: { exact: selectedMicrophone.value.value } },
    };
    stream.value = await navigator.mediaDevices.getUserMedia(constraints);
    // You can now use stream.value as the microphone input
    isMicrophoneEnabled.value = true;
  } catch (error) {
    console.error("Error accessing microphone:", error);
  }
};

onMounted(async () => {
  await updateMicrophoneList();
  await toggleMicrophone();
});

watch(selectedMicrophone, () => {
  toggleMicrophone();
});
</script>

<style scoped lang="scss">
/* Add your component styles here */
.mic {
  margin-bottom: 20px;

  &--inner-container {
    display: flex;
    align-items: center;
    margin-top: 10px;
    justify-content: center;

    & > label {
      margin-right: 10px;
      font-weight: 500;
    }
  }
}
</style>
