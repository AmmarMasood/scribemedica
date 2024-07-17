<template>
  <div class="q-pa-md q-gutter-sm">
    <q-inner-loading :showing="loading" style="z-index: 2000000">
      <q-spinner-gears size="100px" color="orange" style="z-index: 2000000" />
    </q-inner-loading>
    <!-- User Information Dialog -->
    <q-dialog v-model="userInfoDialog" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h5">Welcome to Scribe Medica</div>
          <div class="text-subtitle3 q-mt-sm">
            Begin your journey with us. Scribe Medica will adapt to your unique
            style and preferences over time, creating notes tailored just for
            you.
          </div>
        </q-card-section>

        <q-card-section>
          <q-input
            outlined
            color="orange-14"
            v-model="userInfo.name"
            label="Full name"
          />
          <q-select
            class="q-mt-md"
            outlined
            color="orange-14"
            v-model="userInfo.specialty"
            :options="[
              'Cardiologist',
              'General practitioner',
              'Neurologist',
              'Surgeon',
              'Dermatologist',
              'Pediatrician',
              'Psychiatrist',
              'Radiologist',
              'Oncologist',
              'Internal medicine',
              'Gastroenterologist',
              'Orthopedic surgeon',
              'Pathologist',
              'Family medicine',
            ]"
            label="Speciality"
          />

          <q-select
            class="q-mt-md"
            outlined
            color="orange-14"
            v-model="userInfo.heardAboutUs"
            :options="[
              'Social Media',
              'Friend',
              'Google Search',
              'Third Party Review',
              'Other',
            ]"
            label="How did you hear about us?"
          />
        </q-card-section>

        <q-card-actions
          class="q-mt-sm q-ma-sm"
          style="display: flex; align-items: center; justify-content: flex-end"
        >
          <q-btn
            flat
            label="Skip"
            @click="skipUserInfo"
            style="color: #f57927"
          />
          <q-btn
            flat
            label="Submit"
            @click="submitUserInfo"
            style="color: #f57927"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { updateProfile } from "firebase/auth";
import { useQuasar } from "quasar";
import axiosApiInstance from "src/services/axios";
import { auth } from "src/services/firebase";
import { SERVER_URL } from "src/utils/constants";
import { ref, onMounted } from "vue";

export default {
  setup() {
    const $q = useQuasar();
    const basic = ref(false);
    const fixed = ref(false);
    const userInfoDialog = ref(false);
    const userInfo = ref({
      specialty: "",
      name: "",
      heardAboutUs: "",
    });
    const loading = ref(false);
    const emailNotVerified = ref(
      localStorage.getItem("emailNotVerified") ? true : false
    );
    const authToken = ref(localStorage.getItem("auth"));

    onMounted(async () => {
      if (authToken.value && emailNotVerified.value === false) {
        await fetchUserProfile();
      }
    });

    const fetchUserProfile = async () => {
      try {
        const response = await axiosApiInstance.get(
          `${SERVER_URL}/private/auth/profile`
        );

        console.log(response.data.profile);
        const profile = response.data.profile;
        const isFirstLogin = localStorage.getItem("firstLogin");

        if (!profile.fullName) {
          userInfo.value.name = profile.fullName || "";
          userInfo.value.specialty = profile.speciality || "";
          userInfo.value.heardAboutUs = profile.heardAboutUs || "";

          if (isFirstLogin === "true") {
            userInfoDialog.value = true;
            localStorage.setItem("firstLogin", "false");
          }
        } else {
          userInfo.value.name = profile.fullName || "";
          userInfo.value.specialty = profile.speciality || "";
          userInfo.value.heardAboutUs = profile.heardAboutUs || "";
          localStorage.setItem("firstLogin", "false");
        }
      } catch (err) {
        $q.notify({
          color: "negative",
          message: "Unable to fetch profile information",
          icon: "report_problem",
          position: "top",
        });
        console.log(err);
      }
    };

    const skipUserInfo = () => {
      userInfoDialog.value = false;
    };

    const updateMyProfile = async () => {
      loading.value = true;
      try {
        if (!userInfo.value.name || !userInfo.value.specialty) {
          $q.notify({
            color: "negative",
            message: "Please fill in all fields",
            icon: "report_problem",
            position: "top",
          });
          return;
        }
        await updateProfile(auth.currentUser, {
          displayName: userInfo.value.name,
        });
        await axiosApiInstance.put(`${SERVER_URL}/private/auth/profile`, {
          fullName: userInfo.value.name,
          speciality: userInfo.value.specialty,
          heardAboutUs: userInfo.value.heardAboutUs,
        });
        userInfoDialog.value = false;
        $q.notify({
          color: "positive",
          message: "Profile updated successfully",
          icon: "check",
          position: "top",
        });
      } catch (err) {
        $q.notify({
          color: "negative",
          message: "Unable to update profile",
          icon: "report_problem",
          position: "top",
        });
        // console.log(err);
      }
      loading.value = false;
    };

    const submitUserInfo = () => {
      updateMyProfile();
    };

    return {
      basic,
      fixed,
      userInfoDialog,
      userInfo,
      skipUserInfo,
      submitUserInfo,
      loading,
    };
  },
};
</script>

<style scoped>
.scroll {
  overflow-y: auto;
}
</style>
