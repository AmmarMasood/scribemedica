<template>
  <q-page id="loginPage">
    <div class="flex column justify-center align-center card">
      <h6 class="text-h5 text-center q-mt-sm q-mb-lg">Log in as an admin</h6>
      <q-input
        label="Email"
        v-model="email"
        class="q-mb-md"
        :rules="[validateEmail]"
      />
      <q-input
        label="Password"
        v-model="password"
        class="q-mb-md"
        type="password"
        :rules="[(value) => (!value ? 'Please enter password' : true)]"
      />
      <q-btn
        text-color="white"
        size="md"
        style="background-color: #f57927"
        @click="handleLogin"
        >LOG IN</q-btn
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
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useRouter } from "vue-router";
import { SERVER_URL } from "src/utils/constants";
import axiosApiInstance from "src/services/axios";
import axios from "axios";

const router = useRouter();
const email = ref("");
const password = ref("");
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
  if (validateEmail() && password.value) {
    errorMessage.value = "";
    // Here you can implement your sign-up logic using the 'email' and 'password' values
    const login = signInWithEmailAndPassword(auth, email.value, password.value)
      .then(async (data) => {
        const accessToken = data.user.accessToken;
        const res = await axios.get(`${SERVER_URL}/private/auth/profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (res.data.profile.role === "ADMIN") {
          localStorage.setItem("auth", accessToken);
          localStorage.setItem("role", res.data.profile.role);
          router.push("/admin");
        } else {
          errorMessage.value = "Unable to login as admin";
        }
      })
      .catch((err) => {
        const message = mapAuthCodeToMessage(err.code);
        errorMessage.value = message;
      });

    // console.log(login);
  }
}
</script>

<style lang="scss" scoped>
#loginPage {
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
