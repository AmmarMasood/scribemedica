<template>
  <q-page id="startRecordingPage">
    <div class="container">
      <div class="container--inner">
        <h2>Start a new recording.</h2>
        <!-- <q-input
          color="orange-14"
          filled
          v-model="noteName"
          label="Description"
        /> -->
        <q-input
          color="orange-14"
          filled
          v-model="patientName"
          label="Patient Name"
        />
        <q-select
          color="orange-14"
          filled
          v-model="type"
          :options="options"
          label="Type"
        />
        <q-btn
          text-color="white"
          size="md"
          style="background-color: #f57927"
          @click="handleNewRecording"
          >BEGIN A NEW RECORDING</q-btn
        >
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref } from "vue";
import { useQuasar } from "quasar";
import { SERVER_URL } from "src/utils/constants";
import axiosApiInstance from "src/services/axios";

// const options = ["Inpatient", "Outpatient", "Dictation"];
const options = ["New Patient", "Return Visit"];

const $q = useQuasar();
const type = ref(options[0]);
const noteName = ref("");
const patientName = ref("");
const router = useRouter();

async function handleNewRecording() {
  try {
    if (!patientName.value) {
      $q.notify({
        color: "negative",
        message: "Patient name is required",
        icon: "report_problem",
        position: "top",
      });
      return;
    }

    const response = await axiosApiInstance.post(
      `${SERVER_URL}/private/notes/create`,
      {
        type: type.value.toLowerCase(),
        // description: noteName.value,
        patientName: patientName.value,
        finalized: false,
      }
    );
    router.push(`/new/${response.data.type}/${response.data._id}`);
  } catch (err) {
    $q.notify({
      color: "negative",
      message:
        err?.response?.data?.message || "Unable to create a new recording.",
      icon: "report_problem",
      position: "top",
    });
    // console.log(err);
  }
}
</script>

<style lang="scss" scoped>
#startRecordingPage {
  min-height: 400px !important;
}

.container {
  padding: 50px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  @media screen and (max-width: 600px) {
    padding: 20px;
  }

  &--inner {
    width: 60vw;
    max-width: 800px;
    text-align: center;

    @media screen and (max-width: 600px) {
      width: 100%;
    }

    & > h2 {
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

    & > label {
      margin-bottom: 20px;
    }
  }
}
</style>
