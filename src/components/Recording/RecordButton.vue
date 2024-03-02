<template>
  <div class="q-mt-lg container">
    <MicroPhone />
    <button :class="'btn'" @click="onClick" :disabled="loading">
      <img :src="isRecording ? StopIcon : BtnIcon" alt="btn" />
    </button>
    <q-btn
      @click="handleFinalize"
      v-if="!isRecording && transcript"
      text-color="white"
      size="md"
      style="background-color: #f57927; margin-top: 10px"
    >
      Finalize
    </q-btn>
    <SiriWave :averageVolume="averageVolume" :isRecording="isRecording" />
    <p style="font-size: 18px">
      {{ formatMillisecondsToMinutesSeconds(timer) }}
    </p>

    <div style="padding: 30px; font-size: 18px">
      <p>{{ transcript }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, defineProps } from "vue";
import BtnIcon from "../../assets/record-icon.png";
import StopIcon from "../../assets/icons8-stop-64.png";
import SiriWave from "./SiriWave.vue";
import { NOTE_LENGTH } from "../../utils/constants";
import axiosApiInstance from "../../services/axios";
import { SERVER_URL } from "../../utils/constants";
import { useQuasar } from "quasar";
import { auth } from "../../services/firebase";
import { useRoute } from "vue-router";
import MicroPhone from "./MicroPhone.vue";

// Expose 'loading' as a reactive variable
const loading = ref(__props.loading);
const isRecording = ref(false);
const transcript = ref("");
const averageVolume = ref(null); // To store the average volume
const $q = useQuasar();
const route = useRoute();
const props = defineProps(["handleFinalize"]);

let mediaRecorder; // Move the mediaRecorder variable to a higher scope

let timer = ref(0); // Initialize timer variable in milliseconds
let timerInterval;

const startTimer = () => {
  timerInterval = setInterval(() => {
    timer.value += 1000; // Increase timer by 1 second (1000 milliseconds)
  }, 1000); // Update the timer every 1 second
};

const pauseTimer = () => {
  clearInterval(timerInterval); // Pause the timer
};

function formatMillisecondsToMinutesSeconds(milliseconds) {
  if (milliseconds < 0) {
    return ""; // Handle negative input if needed
  }

  const minutes = Math.floor(milliseconds / 60000); // 1 minute = 60000 milliseconds
  milliseconds %= 60000;
  const seconds = Math.floor(milliseconds / 1000); // 1 second = 1000 milliseconds

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

const startRecording = () => {
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    if (MediaRecorder.isTypeSupported("video/webm; codecs=vp9")) {
      var options = { mimeType: "video/webm; codecs=vp9" };
    } else if (MediaRecorder.isTypeSupported("video/webm")) {
      var options = { mimeType: "video/webm" };
    } else if (MediaRecorder.isTypeSupported("video/mp4")) {
      var options = { mimeType: "video/mp4", videoBitsPerSecond: 100000 };
    } else {
      console.error("no suitable mimetype found for this device");
    }

    mediaRecorder = new MediaRecorder(stream, options); // Assign value to the mediaRecorder variable here

    let socket = new WebSocket(import.meta.env.VITE_STAGE_DEEPGRAM_URL, [
      "Token",
      import.meta.env.VITE_STAGE_DEEPGRAM_TOKEN,
    ]);

    // Set up the Web Audio API for audio processing
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const mediaSource = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    mediaSource.connect(analyser);

    // Set up the analyser parameters (adjust as needed)
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Function to calculate the average volume level from the audio data
    function getAverageVolume() {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      dataArray.forEach((value) => {
        sum += value;
      });
      const averageVolume = sum / dataArray.length;
      return averageVolume;
    }

    socket.onopen = () => {
      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (socket.readyState === WebSocket.OPEN) {
          const audioTracks = stream.getAudioTracks();

          // Get the average volume level from the audio data
          averageVolume.value = getAverageVolume();
          socket.send(event.data);
        } else {
          stopRecording();
        }
      });
      mediaRecorder.start(250);
      isRecording.value = true;
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.channel?.alternatives[0].transcript) {
        transcript.value =
          transcript.value + " " + data.channel?.alternatives[0].transcript;
      }
    };

    socket.onerror = () => {
      stopRecording();
    };
  });
};

const stopRecording = () => {
  mediaRecorder.stop();
  isRecording.value = false;
  averageVolume.value = null;
  updateTranscriptOnPause();
};

const handleFinalize = () => {
  props.handleFinalize(transcript.value);
};

const updateTranscriptOnPause = async () => {
  if (!transcript.value && transcript.value.replace(/ /g, "").length <= 0)
    return;
  try {
    const response = await axiosApiInstance.put(
      `${SERVER_URL}/private/notes/${route.params.patientId}`,
      {
        transcription: transcript.value,
        finalized: false,
        recordingLength: timer.value,
      }
    );
    // console.log(response);
  } catch (e) {
    $q.notify({
      color: "negative",
      message: "Unable to save the note transcription.",
      icon: "report_problem",
      position: "top",
    });
  }
};
const onClick = () => {
  if (isRecording.value) {
    stopRecording();
    pauseTimer(); // Pause the timer when recording stops
  } else {
    startRecording();
    startTimer(); // Start the timer when recording starts
  }
};
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.btn {
  background: #f57927;
  border: none;
  height: 100px;
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
  margin-top: 100px;
}
.btn-recording {
  border-width: 10px;
  border-color: #f57927;
}
</style>
