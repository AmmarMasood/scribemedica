<template>
  <q-page id="recordingSessionPage">
    <div v-if="loading" style="z-index: 2000000" class="loader">
      <q-spinner-gears size="100px" color="orange" style="z-index: 2000000" />
      <p>Generating note...</p>
    </div>
    <AudioButton :handleFinalize="handleFinalize" />
    <DiagnosisDialog
      :show="show"
      :chiefComplaint="chiefComplaintR"
      :assessment="assessmentR"
      :plan="planR"
    />
    <FinalizeDialog
      :show="finalizeDialog"
      :closeFianlizeDialog="closeFianlizeDialog"
      :generateNoteDetail="generateNoteDetail"
    />
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import AudioButton from "../../components/Recording/RecordButton.vue";
import DiagnosisDialog from "../../components/Recording/DiagnosisDialog.vue";
import FinalizeDialog from "src/components/Recording/FinalizeDialog.vue";
import { useQuasar } from "quasar";
import { SERVER_URL } from "../../utils/constants";
import { auth } from "../../services/firebase";
import { useRoute, useRouter } from "vue-router";
import axiosApiInstance from "src/services/axios";
const route = useRoute();
const router = useRouter();

const show = ref(false);
const finalizeDialog = ref(false);
const $q = useQuasar();
const myTranscript = ref("");

const closeFianlizeDialog = () => {
  finalizeDialog.value = false;
};

const loading = ref(false);
async function handleFinalize(transcript) {
  if (transcript.length < 500) {
    $q.notify({
      color: "negative",
      message: "Transcript must have more than 500 characters",
      icon: "report_problem",
      position: "top",
    });
    return;
  }
  finalizeDialog.value = true;
  myTranscript.value = transcript;
}

const generateNoteDetail = async (noteType, patientGender) => {
  loading.value = true;
  try {
    const res = await axiosApiInstance.post(
      `${SERVER_URL}/private/notes/${route.params.patientId}/finalize`,
      {
        transcript: myTranscript.value,
        noteType: noteType,
        patientGender: patientGender,
      }
    );
    if (res.data) {
      router.push(`/recordings/details/${route.params.patientId}`);
    }
  } catch (err) {
    // console.log(err);
    $q.notify({
      color: "negative",
      message: "Unable to generate note details.",
      icon: "report_problem",
      position: "top",
    });
  }
  loading.value = false;
};
</script>

<style lang="scss" scoped>
#recordingSessionPage {
  min-height: 600px !important;
  position: relative;
}

.loader {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10000000000;
  background: #fff;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  & > p {
    margin-top: 20px;
    font-size: 20px;
  }
}
</style>
