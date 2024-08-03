<template>
  <q-page id="noteDetailPage">
    <div v-if="noteloading" style="z-index: 2000000" class="loader">
      <q-spinner-gears size="100px" color="orange" style="z-index: 2000000" />
      <p>Reenerating note...</p>
    </div>

    <div class="container">
      <div class="container--header">
        <div>
          <h2>Note Details</h2>
          <p>
            Last Updated On:
            {{ DateTime.fromISO(note?.updatedAt).toFormat("dd LLL yyyy") }}
          </p>
        </div>
      </div>

      <!-- <q-input
        color="orange-14"
        filled
        v-model="noteName"
        label="Description"
        class="field"
      /> -->
      <q-input
        color="orange-14"
        filled
        v-model="patientName"
        label="Patient Name"
        class="field"
      />

      <div class="header-bottom">
        <h2>Generated {{ noteDetail?.noteType }}</h2>
      </div>
      <q-select
        color="orange-14"
        filled
        v-model="noteDetailType"
        :options="noteDetailTypeOptions"
        label="Type"
        class="field"
      />
      <!-- <q-select
        color="orange-14"
        filled
        v-model="patientGender"
        :options="patientGenderOptions"
        label="Gender / Pronouns"
        class="field"
      /> -->
      <div class="textarea-container">
        <q-input
          type="textarea"
          color="orange-14"
          filled
          v-model="generatedNote"
          label="Generated Notes"
          class="extaread-field"
          ref="textareaNote"
        />
        <q-btn
          icon="content_copy"
          @click="copyText(generatedNote)"
          color="orange-14"
          flat
          round
          class="copy-btn"
        />
      </div>
      <div class="textarea-container" style="margin-top: 30px">
        <q-input
          type="textarea"
          color="orange-14"
          filled
          v-model="patientInstructions"
          class="extaread-field"
          label="Patient Instructions"
          ref="textareaPatientInstructions"
        />
        <q-btn
          icon="content_copy"
          @click="copyText(patientInstructions)"
          color="orange-14"
          flat
          round
          class="copy-btn"
        />
      </div>
      <div class="textarea-container" style="margin-top: 30px">
        <q-input
          type="textarea"
          color="orange-14"
          filled
          v-model="transcript"
          class="extaread-field"
          label="Transcript"
          ref="textareaTranscript"
        />
        <q-btn
          icon="content_copy"
          @click="copyText(transcript)"
          color="orange-14"
          flat
          round
          class="copy-btn"
        />
      </div>
      <div style="display: flex; justify-content: flex-end; margin-top: 20px">
        <q-btn
          text-color="white"
          size="md"
          style="background-color: #f57927; margin-right: 10px"
          @click="regerateMedicalNote"
          >Regenerate Note</q-btn
        >
        <q-btn
          text-color="white"
          size="md"
          style="background-color: #f57927"
          @click="updateNote"
          >Save Changes</q-btn
        >
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { SERVER_URL } from "../../utils/constants";
import { useRoute, useRouter } from "vue-router";
import axiosApiInstance from "../../services/axios";
import { DateTime } from "luxon";

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const loading = ref(false);
const noteloading = ref(false);

const note = ref(null);
const type = ref("");
const noteName = ref("");
const patientName = ref("");
const transcript = ref("");

const noteDetail = ref(null);
const noteDetailType = ref("");
const noteDetailMedicalType = ref("");
const noteDetailTypeOptions = ["Standard Length", "Concise"];
const patientGender = ref("");
const patientGenderOptions = ["she/her", "he/him", "they/them"];
const generatedNote = ref("");
const patientInstructions = ref("");

const regerateMedicalNote = async () => {
  if (transcript.value.length < 300) {
    $q.notify({
      color: "negative",
      message:
        "Our AI requires just a bit more clinical information to generate an accurate clinical note.",
      icon: "report_problem",
      position: "top",
    });
    return;
  }
  if (!noteDetailType.value) {
    $q.notify({
      color: "negative",
      message: "Note type is required",
      icon: "report_problem",
      position: "top",
    });
    return;
  }
  // if (!patientGender.value) {
  //   $q.notify({
  //     color: "negative",
  //     message: "Patient gender is required",
  //     icon: "report_problem",
  //   });
  //   return;
  // }
  noteloading.value = true;
  try {
    const res = await axiosApiInstance.post(
      `${SERVER_URL}/private/notes/generate-details`,
      {
        transcript: transcript.value,
        noteType: noteDetailType.value,

        // patientGender: patientGender.value,
      }
    );
    if (res.data) {
      generatedNote.value = res.data.note;
      patientInstructions.value = res.data.patientInstructions;
    }
  } catch (err) {
    console.log(err);
    $q.notify({
      color: "negative",
      message: "Unable to regenerate note.",
      icon: "report_problem",
      position: "top",
    });
  }

  noteloading.value = false;
};

const updateNote = async () => {
  loading.value = true;
  //check if patientName, patientGender is not empty and transcript is more than 500 characters
  if (patientName.value.length < 1) {
    $q.notify({
      color: "negative",
      message: "Patient name is required",
      icon: "report_problem",
      position: "top",
    });
    return;
  }

  if (transcript.value.length < 300) {
    $q.notify({
      color: "negative",
      message:
        "Our AI requires just a bit more clinical information to generate an accurate clinical note.",
      icon: "report_problem",
      position: "top",
    });
    return;
  }

  // if (patientGender.value.length < 1) {
  //   $q.notify({
  //     color: "negative",
  //     message: "Patient gender is required",
  //     icon: "report_problem",
  //   });
  //   return;
  // }

  try {
    const res = await axiosApiInstance.put(
      `${SERVER_URL}/private/notes/${route.params.noteId}`,
      {
        // description: noteName.value,
        patientName: patientName.value,
        // patientGender: patientGender.value,
        transcription: transcript.value,
        finalized: true,
        recordingLength: note.value.recordingLength,
      }
    );
    const res2 = await axiosApiInstance.put(
      `${SERVER_URL}/private/notes/detail/${noteDetail.value._id}`,
      {
        noteType: noteDetailType.value,
        medicalNote: generatedNote.value,
      }
    );
    if (res.data && res2.data) {
      $q.notify({
        color: "positive",
        message: "Note updated successfully.",
        icon: "check",
        position: "top",
      });
    }
  } catch (err) {
    console.log(err);
    $q.notify({
      color: "negative",
      message: "Unable to generate note.",
      icon: "report_problem",
      position: "top",
    });
  }
  loading.value = false;
};

const getNoteDetails = async () => {
  loading.value = true;
  try {
    if (!route.params.noteId) return;
    const res = await axiosApiInstance.get(
      `${SERVER_URL}/private/notes/${route.params.noteId}`
    );
    if (res.data) {
      note.value = res.data.note;
      noteDetail.value = res.data.noteDetail;
      //
      noteName.value = res.data.note.description;
      type.value = res.data.note.type;
      patientName.value = res.data.note.patientName;
      patientGender.value = res.data.note.patientGender;
      transcript.value = res.data.note.transcription;
      //
      noteDetailType.value = res.data.noteDetail.noteType;
      noteDetailMedicalType.value = res.data.noteDetail.medicalNote;
      generatedNote.value = res.data.noteDetail.medicalNote;
      patientInstructions.value = res.data.noteDetail.patientInstructions;
    }
  } catch (err) {
    console.log(err);
    $q.notify({
      color: "negative",
      message: "Unable to get note details.",
      icon: "report_problem",
      position: "top",
    });
  }
  loading.value = false;
};

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    $q.notify({
      color: "positive",
      message: "Text copied to clipboard.",
      icon: "check",
      position: "top",
    });
  } catch (err) {
    console.log(err);
    $q.notify({
      color: "negative",
      message: "Failed to copy text.",
      icon: "report_problem",
      position: "top",
    });
  }
};

onMounted(() => {
  getNoteDetails();
});
</script>

<style lang="scss" scoped>
#noteDetailPage {
  min-height: 400px !important;
  position: relative;
}
.container {
  padding: 50px;
  margin-top: 20px;

  @media screen and (max-width: 600px) {
    padding: 20px;
  }

  &--header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    h2 {
      font-size: 32px;
      margin: 0;
      padding: 0;
      line-height: 2rem;
      font-weight: 700;
      margin-bottom: 20px;
      @media screen and (max-width: 600px) {
        font-size: 24px;
      }
    }
  }
}

.field {
  margin-bottom: 20px;
  font-size: 16px;
}

.extaread-field {
  height: fit-content;
  font-size: 16px;
}
.header-bottom {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-top: 50px;

  h2 {
    font-size: 32px;
    margin: 0;
    padding: 0;
    line-height: 2rem;
    font-weight: 700;
    margin-bottom: 20px;
    @media screen and (max-width: 600px) {
      font-size: 24px;
    }
  }
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
.textarea-container {
  position: relative;
}
.copy-btn {
  position: absolute;
  top: 5px;
  right: 10px;
}
</style>
