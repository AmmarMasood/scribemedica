<template>
  <div class="q-mt-lg container">
    <MicroPhone />
    <p
      style="
        color: gray;
        margin-top: 20px;
        text-align: center;
        text-transform: capitalize;
      "
    >
      Patient Name: {{ patientName }}
    </p>
    <button :class="'btn'" @click="onClick" :disabled="loading">
      <span>{{ isRecording ? "STOP/PAUSE" : "RESUME" }}</span>
    </button>

    <q-btn
      @click="handleFinalize"
      v-if="!isRecording && transcript"
      text-color="white"
      size="md"
      style="background-color: #f57927; margin-top: 20px"
    >
      Finalize
    </q-btn>

    <SiriWave :averageVolume="averageVolume" :isRecording="isRecording" />
    <p style="font-size: 18px">
      {{ formatMillisecondsToMinutesSeconds(timer) }}
    </p>
    <p
      style="
        color: gray;
        margin-top: 20px;
        text-align: center;
        margin: 20px 10px 10px 10px;
      "
    >
      Keep this screen open while capturing the conversation.
    </p>

    <div style="padding: 30px; font-size: 18px">
      <!-- <p>{{ transcript }}</p> -->
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, defineProps, watch } from "vue";
import BtnIcon from "../../assets/record-icon.png";
import StopIcon from "../../assets/icons8-stop-64.png";
import SiriWave from "./SiriWave.vue";
import { NOTE_LENGTH } from "../../utils/constants";
import axiosApiInstance from "../../services/axios";
import { SERVER_URL } from "../../utils/constants";
import { useQuasar } from "quasar";
import { auth } from "../../services/firebase";
import { useRoute, useRouter } from "vue-router";
import MicroPhone from "./MicroPhone.vue";
import RecordRTC from "recordrtc";

// Expose 'loading' as a reactive variable
const loading = ref(__props.loading);
const isRecording = ref(false);
const transcript = ref("");
const averageVolume = ref(null); // To store the average volume
const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const props = defineProps(["handleFinalize"]);
const isWakeLockSupported = "wakeLock" in navigator;
const wakeLock = ref(null);
const patientName = ref("");

let recorder; // Use RecordRTC recorder
let stream;
let timer = ref(0); // Initialize timer variable in milliseconds
let timerInterval;
let socket; // WebSocket for Deepgram
let audioContext;
let analyser;
let dataArray;
let volumeInterval;

const requestWakeLock = async () => {
  if (isWakeLockSupported) {
    try {
      wakeLock.value = await navigator.wakeLock.request("screen");
      console.log("Wake Lock is active");
    } catch (err) {
      console.error(`${err.name}, ${err.message}`);
    }
  }
};

const releaseWakeLock = () => {
  if (wakeLock.value) {
    wakeLock.value.release().then(() => {
      wakeLock.value = null;
      console.log("Wake Lock has been released");
    });
  }
};

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
  requestWakeLock();
  navigator.mediaDevices.getUserMedia({ audio: true }).then((mediaStream) => {
    stream = mediaStream;
    recorder = new RecordRTC(stream, {
      type: "audio",
      mimeType: "audio/webm",
      recorderType: RecordRTC.MediaStreamRecorder,
      timeSlice: 250, // Send blobs every 250ms
      ondataavailable: (blob) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(event.target.result);
          } else {
            stopRecording();
          }
        };
        reader.readAsArrayBuffer(blob);
      },
    });

    // Set up the WebSocket connection to Deepgram
    socket = new WebSocket(import.meta.env.VITE_STAGE_DEEPGRAM_URL, [
      "Token",
      import.meta.env.VITE_STAGE_DEEPGRAM_TOKEN,
    ]);

    socket.onopen = () => {
      // Start recording once the WebSocket is open
      recorder.startRecording();
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

    socket.onclose = (event) => {
      console.log("WebSocket closed", event);
    };

    // Set up the Web Audio API for audio processing
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const mediaSource = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    mediaSource.connect(analyser);

    // Set up the analyser parameters (adjust as needed)
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    // Start a regular interval to update average volume
    volumeInterval = setInterval(() => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      dataArray.forEach((value) => {
        sum += value;
      });
      averageVolume.value = sum / dataArray.length;
    }, 100);

    isRecording.value = true;
  });
};
const stopRecording = () => {
  releaseWakeLock();
  if (recorder) {
    recorder.stopRecording(() => {
      const blob = recorder.getBlob();
      // You can handle the recorded audio blob here
    });
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    isRecording.value = false;
    averageVolume.value = null;
    updateTranscriptOnPause();
    if (socket) {
      socket.close();
    }
    if (volumeInterval) {
      clearInterval(volumeInterval);
    }
  }
};

const handleFinalize = () => {
  props.handleFinalize(transcript.value);
};

const getNoteDetails = async () => {
  try {
    const response = await axiosApiInstance.get(
      `${SERVER_URL}/private/notes/${route.params.patientId}`
    );
    console.log("damn", response);
    if (response.data.note) {
      patientName.value = response.data.note.patientName;
      if (response.data.note.transcription) {
        transcript.value = response.data.note.transcription;
        timer.value = response.data.note.recordingLength;
      }
    }
  } catch (e) {
    $q.notify({
      color: "negative",
      message: "Unable to fetch note details.",
      icon: "report_problem",
      position: "top",
    });
  }
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
const onClick = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    if (isRecording.value) {
      // stopRecording();
      // pauseTimer(); // Pause the timer when recording stops
      updateQueryParam("pause");
    } else {
      // startRecording();
      // startTimer(); // Start the timer when recording starts
      updateQueryParam("start");
    }
  } catch (error) {
    $q.notify({
      color: "negative",
      message: "Please enable microphone access to start recording.",
      icon: "report_problem",
      position: "top",
    });
    return;
  }
};

const updateQueryParam = (status) => {
  router.replace({ query: { ...route.query, status } });
};

const checkQueryParam = () => {
  const status = route.query.status;
  if (status === "start") {
    startRecording();
    startTimer();
  } else if (status === "pause") {
    stopRecording();
    pauseTimer();
  } else {
    // Default to pause if no status is provided
    updateQueryParam("pause");
    stopRecording();
    pauseTimer();
  }
};

onMounted(() => {
  getNoteDetails();
  checkQueryParam();
});

watch(
  () => route.query.status,
  () => {
    checkQueryParam();
  }
);
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
  height: fit-content;
  width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  margin-top: 100px;

  img {
    width: 40px;
    height: 40px;
    margin-right: 10px;
  }
  span {
    color: #fff;
    font-size: 16px;
    text-align: center;
  }
}
.btn-recording {
  border-width: 2px;
  border-style: solid;
  border-color: red;
}
</style>
