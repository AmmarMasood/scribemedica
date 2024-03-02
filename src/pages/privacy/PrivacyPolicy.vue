<template>
  <div class="container">
    <h1>Terms of Use</h1>
    <div class="container--inner">
      <div
        v-for="(item, key) in termsAndConditions"
        :key="key"
        class="container--inner-pos-box"
      >
        <h2>{{ item.title }}</h2>
        <p>{{ item.text }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const termsAndConditions = ref([
  {
    title: "1. Purpose and Scope",
    text: "Scribematic is a medical transcription tool designed to assist healthcare professionals with documenting patient encounters. It is not intended for use as an Electronic Health Record (EHR) system, and users should not rely on Scribematic for the storage of complete medical records.",
  },
  {
    title: "2. Data Retention and Responsibility",
    text: "Users are responsible for copying and transferring all notes and transcriptions from Scribematic to their own EHR systems within 72 hours of creation. Scribematic automatically deletes all data after this period, and we cannot be held responsible for the loss of any information not properly saved by users.",
  },
  {
    title: "3. Privacy and Security",
    text: "Scribematic is committed to protecting the privacy and security of user data. We implement advanced security measures to prevent unauthorized access and comply with all applicable HIPAA regulations. Users are responsible for ensuring that their own systems and devices also comply with HIPAA and any other relevant privacy laws.",
  },
  {
    title: "4. Limitations and Disclaimer",
    text: "While we strive to provide an accurate and efficient transcription and AI service, Scribematic cannot guarantee complete accuracy or error-free operation. Users are responsible for verifying the accuracy of all transcriptions and should not rely solely on Scribematic for critical decision-making. Just as when a physician uses a scribe in their practice, the physician must review the note and make any necessary changes before submitting a medical note to the medical record.",
  },
  {
    title: "5. Changes to Terms of Use",
    text: "We reserve the right to modify these Terms of Use at any time without prior notice. Continued use of Scribematic constitutes acceptance of any changes to the terms. It is the responsibility of users to regularly review these terms and remain informed about any updates.",
  },
]);
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  width: 100%;

  padding: 50px;
  padding-top: 60px;

  @media screen and (max-width: 600px) {
    padding: 20px;
    padding-top: 60px;
  }

  h1 {
    font-size: 34px;
    margin: 0;
    padding: 0;
    font-weight: 700;
    line-height: 2.5rem;
  }

  p {
    margin: 0;
    padding: 0;
    font-size: 18px;
  }

  button {
    margin-top: 20px;
  }

  .container--inner {
    display: flex;
    flex-direction: column;
    margin-top: 30px;
  }

  .container--inner-pos-box {
    margin-top: 30px;
  }

  .container--inner-pos-box h2 {
    font-size: 24px;
    margin: 0;
    padding: 0;
    font-weight: 700;
    line-height: 2.5rem;
  }

  .container--inner-pos-box p {
    margin: 0;
    padding: 0;
    font-size: 18px;
  }
}
</style>
