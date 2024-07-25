<template>
  <div class="q-mt-lg container">
    <MicroPhone />
    <button :class="'btn'" @click="onClick" :disabled="loading">
      <img :src="isRecording ? StopIcon : BtnIcon" alt="btn" />
      <span>Capture Conversation</span>
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
      <!-- <p>{{ transcript }}</p> -->
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
const isWakeLockSupported = "wakeLock" in navigator;
const wakeLock = ref(null);

let mediaRecorder; // Move the mediaRecorder variable to a higher scope

let timer = ref(0); // Initialize timer variable in milliseconds
let timerInterval;

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
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    if (MediaRecorder.isTypeSupported("video/webm; codecs=vp9")) {
      var options = { mimeType: "video/webm; codecs=vp9" };
    } else if (MediaRecorder.isTypeSupported("video/webm")) {
      var options = { mimeType: "video/webm" };
    } else if (MediaRecorder.isTypeSupported("video/mp4")) {
      var options = { mimeType: "video/mp4", videoBitsPerSecond: 100000 };
    } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
      var options = { mimeType: "audio/mp4" };
    } else {
      console.error("no suitable mimetype found for this device");
    }
    // const mimeTypes = [
    //   "audio/webm", // WebM audio format
    //   "audio/webm; codecs=opus", // WebM audio with Opus codec
    //   "video/webm", // WebM video format
    //   "video/webm; codecs=vp8", // WebM video with VP8 codec
    //   "video/webm; codecs=vp9", // WebM video with VP9 codec
    //   "video/mp4", // MP4 video format
    //   "audio/mp4", // MP4 audio format
    //   "video/ogg", // Ogg video format
    //   "audio/ogg", // Ogg audio format
    // ];
    // mimeTypes.forEach((type) => {
    //   if (MediaRecorder.isTypeSupported(type)) {
    //     console.log(`Supported MIME type: ${type}`);
    //   } else {
    //     console.log(`Unsupported MIME type: ${type}`);
    //   }
    // });
    // console.log("awesome", options, MediaRecorder);

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

    socket.onclose = (event) => {
      console.log("on close", event);
    };
  });
};

const stopRecording = () => {
  releaseWakeLock();
  mediaRecorder.stop();
  isRecording.value = false;
  averageVolume.value = null;
  updateTranscriptOnPause();
};

const handleFinalize = () => {
  props.handleFinalize(transcript.value);
};

const getNoteDetails = async () => {
  try {
    const response = await axiosApiInstance.get(
      `${SERVER_URL}/private/notes/${route.params.patientId}`
    );
    if (response.data.note) {
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
      stopRecording();
      pauseTimer(); // Pause the timer when recording stops
    } else {
      startRecording();
      startTimer(); // Start the timer when recording starts
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

onMounted(() => {
  getNoteDetails();
});
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
  border-width: 10px;
  border-color: #f57927;
}
</style>
