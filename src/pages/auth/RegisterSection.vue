<template>
  <q-page id="registrationPage">
    <div class="flex column justify-center align-center card">
      <h6 class="text-h5 text-center q-mt-sm q-mb-lg">
        Welcome to Scribe Medica
      </h6>
      <q-input
        label="Email"
        v-model="email"
        class="q-mb-md"
        :rules="[validateEmail]"
        :error="signupStatus === 'error' ? signupError : null"
      />
      <q-input
        label="Password"
        v-model="password"
        class="q-mb-md"
        type="password"
        :rules="[validatePassword]"
        :error="signupStatus === 'error' ? signupError : null"
      />
      <q-input
        label="Confirm Password"
        v-model="confirmPassword"
        class="q-mb-lg"
        type="password"
        :rules="[validateConfirmPassword]"
        :error="signupStatus === 'error' ? signupError : null"
      />
      <q-btn
        text-color="white"
        size="md"
        style="background-color: #f57927"
        @click="handleSignUp"
        >SIGN UP</q-btn
      >
      <p
        v-if="error"
        class="text-h6 text-center q-pt-lg cursor-pointer"
        style="width: fit-content; margin: 0 auto; color: red"
      >
        {{ error }}
      </p>
      <q-separator class="q-mt-md q-mb-md" />
      <q-btn
        text-color="white"
        size="md"
        style="background-color: #f57927"
        @click="handleGoogleSignUp"
        >SIGN UP WITH GOOGLE</q-btn
      >
    </div>

    <p
      v-if="showAgreeError"
      class="text-h6 text-center q-pt-lg cursor-pointer"
      style="width: fit-content; margin: 0 auto; color: red"
    >
      You must agree to the terms of service to continue.
    </p>

    <div class="q-mt-lg agree-container">
      <q-checkbox v-model="agreeTerms" color="orange" />
      <p>
        I agree to the terms of
        <a
          href="https://drive.google.com/file/d/1LTJXG3QOSWIUpUjIZOrm0XgOUbkRDIFB/view?usp=sharing"
          target="_blank"
        >
          privacy policy</a
        >
        and
        <a
          href="https://drive.google.com/file/d/1b-xfyJKzA2DhmRx0VpxhvQnWRtgHbhcc/view?usp=sharing"
          target="_blank"
          >terms of use.</a
        >
      </p>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth, mapAuthCodeToMessage } from "../../services/firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from "firebase/auth";
import { SERVER_URL } from "../../utils/constants";
import axiosApiInstance from "src/services/axios";

const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const agreeTerms = ref(false);
const showAgreeError = ref(false);

const error = ref("");

function validateIsAgree() {
  if (!agreeTerms.value) {
    showAgreeError.value = true;
    return false;
  }
  showAgreeError.value = false;
  return true;
}

// Function to check if passwords match
function validateConfirmPassword() {
  if (password.value !== confirmPassword.value) {
    return false || "Passwords do not match.";
  }

  return true;
}

// Function to check password is valid
function validatePassword() {
  // Password validation: at least 8 characters, one special character, and one number
  if (password.value.length < 8) {
    return false || "Password must be at least 8 characters long.";
  }
  if (
    !password.value.match(
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/
    )
  ) {
    return (
      false ||
      "Password must contain at least one number and one special character."
    );
  }
  return true;
}

// Function to validate email
function validateEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email.value.length <= 0 && !emailRegex.test(email.value)) {
    return false || "Invalid email address.";
  }
  return true;
}

// Function to handle form submission
async function handleSignUp() {
  if (
    password.value.length >= 1 &&
    email.value.length >= 1 &&
    validatePassword() &&
    validateEmail() &&
    validateConfirmPassword()
  ) {
    if (!validateIsAgree()) {
      return;
    }
    try {
      error.value = "";
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.value,
        password.value
      );

      await sendEmailVerification(userCredential.user);
      await axiosApiInstance.post(`${SERVER_URL}/auth/register`, {
        userId: userCredential.user.uid,
        fullName: userCredential.user.displayName,
        email: userCredential.user.email,
      });
      localStorage.setItem("auth", userCredential.user.accessToken);
      if (!userCredential.user.emailVerified) {
        localStorage.setItem("emailNotVerified", true);
      }

      localStorage.setItem("firstLogin", true);

      location.reload();
    } catch (err) {
      const message = mapAuthCodeToMessage(err.code);
      error.value = message;
      // console.log(err);
    }
  }
}

// Function to handle Google sign-up
async function handleGoogleSignUp() {
  error.value = "";
  if (!validateIsAgree()) {
    return;
  }
  try {
    const provider = await new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);
    await axiosApiInstance.post(`${SERVER_URL}/auth/register`, {
      userId: res.user.uid,
      fullName: res.user.displayName,
      email: res.user.email,
    });

    localStorage.setItem("auth", res.user.accessToken);
    if (!res.user.emailVerified) {
      localStorage.setItem("emailNotVerified", true);
    }
    const firstLogin = localStorage.getItem("firstLogin");
    if (firstLogin) {
      localStorage.setItem("firstLogin", false);
    } else {
      localStorage.setItem("firstLogin", true);
    }

    location.reload();
  } catch (err) {
    error.value = "Unable to authenticate with google.";
  }
}
</script>

<style lang="scss" scoped>
#registrationPage {
  margin-top: 100px;
  max-width: 500px;
  margin: 0 auto;
  min-height: 600px !important;

  @media screen and (max-width: 600px) {
    padding: 0 25px;
  }
}
.card {
  height: 100%;
  padding-top: 100px;
}
.agree-container {
  display: flex;
  align-items: center;
  justify-content: center;

  p {
    margin: 0;
    font-size: 14px;
  }
}
</style>
