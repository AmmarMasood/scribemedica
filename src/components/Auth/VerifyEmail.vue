<template>
  <div class="container">
    <div class="container--inner">
      <h1>Please check your email for a verification link.</h1>
      <p>You may need to check your spam folder.</p>
      <div>
        <q-btn
          outline
          style="color: #f57927; margin-right: 10px"
          label="Resend Email"
          @click="resendEmail"
        />
        <q-btn
          style="background: #f57927; color: white"
          label="Done"
          @click="confirmVerification"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { auth } from "../../services/firebase";
import { useQuasar } from "quasar";
import {
  sendEmailVerification,
  onAuthStateChanged,
  getAuth,
} from "firebase/auth";
import { onMounted } from "vue";

const alerts = [
  {
    color: "negative",
    message: "Unable to send verification email. ",
    icon: "report_problem",
    position: "top",
  },
  {
    color: "positive",
    message: "Verification email sent. ",
    icon: "check_circle",
    position: "top",
  },
  {
    color: "positive",
    message: "Email verified. ",
    icon: "check_circle",
    position: "top",
  },
  {
    color: "negative",
    message: "Email not verified.",
    icon: "report_problem",
    position: "top",
  },
];

const $q = useQuasar();

const resendEmail = async () => {
  // console.log(auth);
  try {
    await sendEmailVerification(auth.currentUser);
    $q.notify(alerts[1]);
  } catch (err) {
    $q.notify(alerts[0]);
  }
};
const confirmVerification = async () => {
  await auth.currentUser.reload();
  if (auth.currentUser.emailVerified) {
    $q.notify(alerts[2]);
    localStorage.removeItem("emailNotVerified");
    location.reload();
  } else {
    $q.notify(alerts[3]);
  }
};
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  height: 60vh;
  width: 100%;
  left: 0;
  background: #fff;

  &--inner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #f2f2f2;
    border-radius: 10px;
    padding: 25px;
    text-align: center;
    min-width: 500px;

    @media screen and (max-width: 600px) {
      min-width: 350px;
    }

    & > h1 {
      font-size: 32px;
      margin: 0;
      padding: 0;
      line-height: 2rem;
      font-weight: 700;

      @media screen and (max-width: 600px) {
        font-size: 24px;
      }
    }
    & > p {
      font-size: 22px;
      margin-top: 10px;
    }
  }
}
</style>
