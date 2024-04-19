<template>
  <q-page id="loginPage">
    <div class="flex column justify-center align-center card">
      <h6 class="text-h5 text-center q-mt-sm q-mb-lg">
        Log in to your account
      </h6>
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
      <q-separator class="q-mt-lg q-mb-lg" />
      <q-btn
        text-color="white"
        size="md"
        style="background-color: #f57927"
        @click="handleGoogleLogin"
        >LOG IN WITH GOOGLE</q-btn
      >
    </div>
    <p
      v-if="errorMessage"
      class="text-h6 text-center q-pt-lg cursor-pointer"
      style="width: fit-content; margin: 0 auto; color: red"
    >
      {{ errorMessage }}
    </p>
    <p style="margin-top: 10px; text-align: center">
      <router-link
        style="font-size: 14px; text-transform: uppercase"
        to="/auth/forgot-password"
        class="text-h6 text-center q-pt-lg cursor-pointer"
      >
        Forgot Your Password?
      </router-link>
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
function handleLogin() {
  if (validateEmail() && password.value) {
    errorMessage.value = "";
    // Here you can implement your sign-up logic using the 'email' and 'password' values
    const login = signInWithEmailAndPassword(auth, email.value, password.value)
      .then((data) => {
        localStorage.setItem("auth", data.user.accessToken);
        if (!data.user.emailVerified) {
          localStorage.setItem("emailNotVerified", true);
        }
        location.reload();
      })
      .catch((err) => {
        const message = mapAuthCodeToMessage(err.code);
        errorMessage.value = message;
      });

    // console.log(login);
  }
}

// Function to handle Google sign-up
async function handleGoogleLogin() {
  errorMessage.value = "";
  try {
    const provider = await new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);
    await axiosApiInstance.post(`${SERVER_URL}/auth/register`, {
      userId: res.user.uid,
      fullName: res.user.displayName,
      email: res.user.email,
    });

    if (!res.user.emailVerified) {
      localStorage.setItem("emailNotVerified", true);
    }
    localStorage.setItem("auth", res.user.accessToken);

    location.reload();
  } catch (err) {
    errorMessage.value = "Unable to authenticate with google.";
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
