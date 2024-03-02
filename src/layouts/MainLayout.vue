<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="bg-white my-toolbar">
        <q-toolbar-title>
          <!-- Add your logo image here -->
          <img
            src="../assets/scribemedica.png"
            alt="Scribe Medica Logo"
            style="width: 200px; height: auto"
            class="q-mt-sm"
          />
        </q-toolbar-title>

        <div>
          <div v-if="!isLoggedIn" class="loggedIn-btns">
            <router-link to="/auth">
              <q-btn
                text-color="white"
                label="Login"
                icon="login"
                size="md"
                style="background-color: #f57927"
              />
            </router-link>
            <router-link to="/auth/register">
              <q-btn
                text-color="white"
                label="Try For Free"
                size="md"
                style="background-color: #f57927; margin-left: 15px"
              />
            </router-link>
          </div>
          <div v-else class="loggedIn-btns">
            <q-tabs v-model="tab" shrink>
              <router-link to="/new">
                <q-tab name="new" label="New Recordings" class="text-orange" />
              </router-link>
              <router-link to="/recordings">
                <q-tab
                  name="recordings"
                  label="Recordings"
                  class="text-orange"
                />
              </router-link>
              <router-link to="/account">
                <q-tab name="account" label="Account" class="text-orange" />
              </router-link>
            </q-tabs>
            <q-btn
              text-color="white"
              label="Logout"
              @click="logoutUser"
              size="md"
              style="background-color: #f57927"
            />
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <template v-if="!emailNotVerified">
        <router-view />
      </template>
      <template v-else>
        <VerifyEmail />
      </template>
    </q-page-container>

    <CookieBanner />

    <div class="q-pa-md example-row-equal-width">
      <div class="row q-pa-md q-mt-md">
        <div class="col">
          <q-separator />
          <h4 class="text-h6">© 2023 Scribe Medica. All rights reserved.</h4>
          <p>
            Scribe Medica <br />
            2601 Jackson Ave. #1171 <br />
            Ann Arbor, MI 48103 <br />
            support@scribemedica.ai
          </p>
        </div>
      </div>
    </div>
  </q-layout>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";
import VerifyEmail from "../components/Auth/VerifyEmail.vue";
import CookieBanner from "../components/Auth/CookieBanner.vue";

const router = useRouter();
const isLoggedIn = ref(localStorage.getItem("auth") ? true : false);
const emailNotVerified = ref(
  localStorage.getItem("emailNotVerified") ? true : false
);

const tab = ref(router.currentRoute.value.path.replace("/", ""));

function logoutUser() {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      localStorage.removeItem("auth");
      localStorage.removeItem("emailNotVerified");
      location.reload();
    })
    .catch((error) => {
      // An error happened.
      // console.log("unable to logout");
    });
}

watch(localStorage.getItem("auth"), (newValue) => {
  isLoggedIn.value = newValue ? true : false;
});

watch(localStorage.getItem("emailNotVerified"), (newValue) => {
  emailNotVerified.value = newValue ? true : false;
});
</script>

<style lang="scss">
.my-toolbar {
  @media screen and (max-width: 500px) {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
}
.loggedIn-btns {
  // border: 2px solid red;
  display: flex;
  align-items: flex-end;
  @media screen and (max-width: 500px) {
    float: right;
  }

  & > div {
    margin-bottom: -3.5px;
    @media screen and (max-width: 600px) {
      position: absolute;
      left: 0px;
      bottom: 0;
      background: #fff;
      height: fit-content;
      width: 100%;
      margin-bottom: 0px;
    }
  }
  & > div > div > a {
    border: none;
    text-decoration: none;
  }

  & > button {
    margin-left: 50px;
    align-self: center;
  }
}
</style>
