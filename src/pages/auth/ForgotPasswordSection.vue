<template>
  <q-page id="forgotPassword">
    <div class="flex column justify-center align-center card">
      <h6 class="text-h5 text-center q-mt-sm q-mb-lg">
        Please enter your email address. We will send you a link to reset your
        password.
      </h6>
      <q-input
        label="Email"
        v-model="email"
        class="q-mb-md"
        :rules="[validateEmail]"
      />
      <q-btn
        text-color="white"
        size="md"
        style="background-color: #f57927"
        @click="handleLogin"
        >Submit</q-btn
      >
    </div>
    <p
      v-if="errorMessage"
      class="text-h6 text-center q-pt-lg cursor-pointer"
      style="width: fit-content; margin: 0 auto; color: red"
    >
      {{ errorMessage }}
    </p>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import { auth, mapAuthCodeToMessage } from "../../services/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useQuasar } from "quasar";

const $q = useQuasar();
const email = ref("");
const errorMessage = ref("");

// Function to validate email
function validateEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    return false || "Invalid email address.";
  }
  return true;
}

// Function to handle form submission
async function handleLogin() {
  if (validateEmail()) {
    errorMessage.value = "";
    try {
      const login = await sendPasswordResetEmail(auth, email.value);
      $q.notify({
        color: "positive",
        message: "Password reset email sent. ",
        icon: "check_circle",
        position: "top",
      });
    } catch (err) {
      const message = mapAuthCodeToMessage(err.code);
      errorMessage.value = message;
    }
  }
}
</script>

<style lang="scss" scoped>
#forgotPassword {
  margin-top: 100px;
  max-width: 500px;
  margin: 0 auto;
  min-height: 600px !important;
}
.card {
  height: 100%;
  padding-top: 100px;
}
</style>
