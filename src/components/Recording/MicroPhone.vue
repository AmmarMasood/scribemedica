<template>
  <div class="mic">
    <div class="mic--inner-container">
      <q-select
        rounded
        outlined
        v-model="selectedMicrophone"
        :options="audioDevices"
        label="Input device"
        color="orange-14"
      >
      </q-select>
    </div>
    <div class="mic--inner-container">
      <label>Microphone Gain</label>
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
    // Check if the mediaDevices API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      throw new Error("MediaDevices API is not supported on this browser.");
    }

    let stream;
    try {
      // Request permissions if not already granted
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      console.error("Error accessing user media:", error);
      alert(
        "Microphone access is required to enumerate devices. Please allow microphone access."
      );
      return;
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    audioDevices.value = devices.filter(
      (device) => device.kind === "audioinput"
    );

    audioDevices.value = audioDevices.value.map((d) => ({
      label: d.label || "Unknown Microphone",
      value: d.deviceId,
      groupId: d.groupId || "Unknown Group",
    }));

    if (audioDevices.value.length > 0) {
      const { groupId, deviceId, label } = audioDevices.value[0];
      selectedMicrophone.value = {
        label: label,
        value: deviceId,
        groupId: groupId,
      };
    }

    // Stop the stream to avoid using the microphone unnecessarily
    stream.getTracks().forEach((track) => track.stop());
  } catch (error) {
    console.error("Error enumerating devices:", error);
    if (error.name === "NotAllowedError") {
      alert(
        "Microphone access is required to enumerate devices. Please allow microphone access."
      );
    } else if (error.name === "NotFoundError") {
      alert(
        "No audio input devices found. Please ensure your microphone is connected."
      );
    } else if (error.name === "OverconstrainedError") {
      alert(
        "The constraints specified for accessing the microphone cannot be satisfied by any available device."
      );
    } else if (error.name === "AbortError") {
      alert("The request was aborted due to an unspecified reason.");
    } else {
      alert(`Error accessing microphone: ${error.message}`);
    }
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

const checkMicPermission = async () => {
  try {
    const permissionStatus = await navigator.permissions.query({
      name: "microphone",
    });

    // Log when permission is granted
    permissionStatus.onchange = () => {
      if (permissionStatus.state === "granted") {
        handleBrowserDevices();
      } else if (permissionStatus.state === "denied") {
        console.log("Microphone permission denied");
      } else if (permissionStatus.state === "prompt") {
        console.log("Microphone permission prompt");
      }
    };
  } catch (err) {
    console.error(
      "An error occurred while checking microphone permission",
      err
    );
  }
};

const handleBrowserDevices = async () => {
  await updateMicrophoneList();
  await toggleMicrophone();
};

onMounted(async () => {
  checkMicPermission();
  handleBrowserDevices();
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
