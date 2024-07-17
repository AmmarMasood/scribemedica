<template>
  <q-page id="accountSettingsPage">
    <q-inner-loading :showing="loading" style="z-index: 2000000">
      <q-spinner-gears size="100px" color="orange" style="z-index: 2000000"
    /></q-inner-loading>
    <PlansPopup
      :plans="plans"
      :subscription="userProfile?.subscription"
      :auth="auth"
      :show="showModal"
      :closeModal="closeModal"
    />
    <div class="container" v-if="!loading">
      <div class="container--aboutme">
        <h4>About Me</h4>
        <div class="container--aboutme-inner" v-if="userProfile">
          <div>
            <q-avatar
              size="60px"
              font-size="32px"
              color="primary"
              text-color="white"
              >{{ userProfile?.profile?.fullName?.charAt(0) }}</q-avatar
            >
            <div>
              <p>{{ userProfile?.profile?.fullName }}</p>
              <p>{{ auth?.currentUser?.email }}</p>
            </div>
          </div>
          <div>
            <q-input outlined v-model="fullName" label="Full name" />
            <q-input outlined v-model="profession" label="Profession" />
            <q-input outlined v-model="phoneNumber" label="Phone Number" />
            <q-input outlined v-model="country" label="Country" />
            <q-select
              outlined
              color="orange-14"
              v-model="doctorType"
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
          </div>
          <q-btn
            @click="updateMyProfile"
            style="background: #f57927; color: white; margin-top: 20px"
            label="Update Details"
          />
        </div>
      </div>
      <div class="container--subscription">
        <h4>Plans and billing</h4>
        <div class="container--subscription-outer">
          <!-- <div
            class="container--subscription-inner"
            v-if="userProfile?.subscription?.planId === 'free'"
          >
            <div class="container--subscription-inner--top">
              <div>
                <p style="text-transform: capitalize">
                  {{ userProfile?.subscription?.planId }}
                </p>
                <p>Active</p>
                <p>5 notes for a single person.</p>
              </div>
              <div>
                <h2>$20 <span>per month</span></h2>
              </div>
            </div>
            <div class="container--subscription-inner--bottom">
              <q-btn outline style="color: #f57927" label="Upgrade Plan" />
            </div>
          </div> -->

          <div
            class="container--subscription-inner"
            v-if="userProfile?.subscription?.planId === 'free'"
          >
            <div class="container--subscription-inner--top">
              <div>
                <p style="text-transform: capitalize">
                  {{ userProfile?.subscription?.planId }}
                </p>
                <p>{{ checkIfFreePlanIsActive(userProfile?.subscription) }}</p>
              </div>
              <div>
                <h2>
                  <span>
                    Notes Left:
                    {{ userProfile?.notesCount }}/{{
                      userProfile?.profile?.notesAllowed
                    }}</span
                  >
                </h2>
              </div>
            </div>
            <div class="container--subscription-inner--bottom">
              <q-btn
                outline
                style="color: #f57927"
                label="Upgrade Plan"
                @click="showMyModal"
              />
            </div>
          </div>

          <div
            class="container--subscription-inner"
            v-if="userProfile && userProfile?.subscription?.planId !== 'free'"
          >
            <div class="container--subscription-inner--top">
              <div>
                <p style="text-transform: capitalize">
                  {{ userProfile?.subscription?.planId }}
                </p>
                <p>{{ checkIfFreePlanIsActive(userProfile?.subscription) }}</p>
              </div>
              <div>
                <h2>
                  <span>
                    Renews On:
                    {{
                      DateTime.fromISO(
                        userProfile?.subscription?.stripeCurrentPeriodEnd
                      ).toFormat("dd LLL yyyy")
                    }}</span
                  >
                </h2>
                <h2>
                  <!-- <span>
                    Notes Left:
                    {{ userProfile?.notesCount }}/{{
                      userProfile?.profile?.notesAllowed
                    }}</span
                  > -->
                </h2>
              </div>
            </div>
            <div class="container--subscription-inner--bottom">
              <q-btn
                outline
                style="color: #f57927"
                label="Mange Subscription"
                @click="handleManageSubscribtion"
              />
            </div>
          </div>

          <!-- <div
            class="container--subscription-inner"
            v-if="userProfile?.subscription?.planId !== 'free'"
          >
            <div class="container--subscription-inner--top">
              <div>
                <p>Payment method</p>
              </div>
            </div>
            <div class="container--subscription-inner--paymentbox">
              <div>
                <q-avatar
                  square
                  color="red"
                  text-color="white"
                  icon="directions"
                />
                <div>
                  <p>Visa ending in 1234</p>
                  <p>Expiry 06/29</p>
                </div>
              </div>
              <q-btn
                outline
                style="color: #f57927"
                label="Edit"
                @click="handleManageSubscribtion"
              />
            </div>
          </div> -->
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import axiosApiInstance from "src/services/axios";
import { SERVER_URL } from "src/utils/constants";
import { auth } from "../../services/firebase";
import { onMounted, ref } from "vue";
import { updateProfile } from "firebase/auth";
import { DateTime } from "luxon";
import PlansPopup from "../../components/Subscription/PlansPopup.vue";
import { stripe } from "../../services/stripe";

const $q = useQuasar();

const loading = ref(false);
const plans = ref([]);
const userProfile = ref(null);
// fields
const fullName = ref("");
const profession = ref("");
const phoneNumber = ref("");
const country = ref("");
const doctorType = ref("");
const showModal = ref(false);

const closeModal = () => {
  showModal.value = false;
};
const showMyModal = () => {
  showModal.value = true;
};

const updateMyProfile = async () => {
  if (fullName.value === "") {
    $q.notify({
      color: "negative",
      message: "Please fill name field",
      icon: "report_problem",
      position: "top",
    });
    return;
  }

  loading.value = true;
  try {
    await updateProfile(auth.currentUser, {
      displayName: fullName.value,
    });
    await axiosApiInstance.put(`${SERVER_URL}/private/auth/profile`, {
      fullName: fullName.value,
      profession: profession.value,
      phoneNumber: phoneNumber.value,
      country: country.value,
      speciality: doctorType.value,
    });
    getUserInfo();
    $q.notify({
      color: "positive",
      message: "Profile updated successfully",
      icon: "check",
      position: "top",
    });
  } catch (err) {
    $q.notify({
      color: "negative",
      message: "Unable to  update  profile",
      icon: "report_problem",
      position: "top",
    });
    // console.log(err);
  }
  loading.value = false;
};

const getAllPlans = async () => {
  loading.value = true;
  try {
    const res = await axiosApiInstance.get(`${SERVER_URL}/subscription/all`);
    plans.value = res.data;
  } catch (error) {
    $q.notify({
      color: "negative",
      message: "Unable to get all plans",
      icon: "report_problem",
      position: "top",
    });
    // console.log(error);
  }
  loading.value = false;
};

const getUserInfo = async () => {
  loading.value = true;
  try {
    const res = await axiosApiInstance.get(
      `${SERVER_URL}/private/auth/profile`
    );
    userProfile.value = res.data;
    fullName.value = res.data.profile.fullName;
    profession.value = res.data.profile.profession;
    phoneNumber.value = res.data.profile.phoneNumber;
    country.value = res.data.profile.country;
    doctorType.value = res.data.profile.speciality;
  } catch (error) {
    $q.notify({
      color: "negative",
      message: "Unable to get user info",
      icon: "report_problem",
      position: "top",
    });
    // console.log(error);
  }
  loading.value = false;
};

const handleManageSubscribtion = async () => {
  if (userProfile.value?.subscription?.stripeCustomerId) {
    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: userProfile.value.subscription.stripeCustomerId,
      return_url: "https://www.scribemedica.ai/account",
    });

    window.location = stripeSession.url;
    return;
  }
};

const checkIfFreePlanIsActive = (subscription) => {
  // console.log("subscription", subscription);
  // if (new Date(subscription?.freePlanExpirationDate) > Date.now()) {
  //   return "Active";
  // }
  // return "Inactive";
  return subscription.status;
};

onMounted(() => {
  getUserInfo();
  getAllPlans();
});
</script>
<style scroped lang="scss">
#accountSettingsPage {
  min-height: 600px !important;
}

.container {
  padding: 50px;
  margin-top: 20px;

  @media screen and (max-width: 600px) {
    padding: 20px;
  }

  &--aboutme {
    & > h4 {
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

    &-inner {
      padding: 30px;
      box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
      border-radius: 10px;

      & > div:nth-child(1) {
        display: flex;
        align-items: center;
        margin-bottom: 20px;

        p {
          font-size: 15px;
          padding: 0;
          margin: 0;
        }
        & > div {
          margin-right: 10px;
        }
      }

      & > div:nth-child(2) {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        grid-gap: 20px;

        @media screen and (max-width: 600px) {
          grid-template-columns: 1fr;
          grid-template-rows: 1fr 1fr 1fr 1fr;
        }
      }
    }
  }

  &--subscription {
    margin-top: 50px;

    & > h4 {
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
    &-outer {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-gap: 50px;

      @media screen and (max-width: 600px) {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 1fr;
      }
    }

    &-inner {
      padding: 30px;
      box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
      border-radius: 10px;
      height: 200px;

      @media screen and (max-width: 600px) {
        height: 220px;
      }

      &--top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;

        & > div > h2 {
          font-size: 24px;
          margin: 0;
          padding: 0;
          line-height: 2rem;
          font-weight: 700;

          & > span {
            font-size: 18px;
            font-weight: 400;
          }
          @media screen and (max-width: 600px) {
            font-size: 20px;
          }
        }

        & > div > p:nth-child(1) {
          font-weight: 700;
          font-size: 20px;
          padding: 0;
          margin: 0;
        }
        & > div > p:nth-child(2) {
          border: 2px solid #000;
          text-align: center;
          border-radius: 20px;
          width: fit-content;
          font-size: 16px;
          padding: 2px 10px;
          margin: 0;
        }
        & > div > p:nth-child(3) {
          font-size: 16px;
          padding: 0;
          margin: 0;
          color: #888888;
          margin-top: 10px;
        }
      }

      &--bottom {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        width: 100%;
        margin-top: 10px;
      }

      &--paymentbox {
        border: 2px solid #e5e5e5;
        border-radius: 10px;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        padding: 16px;
        margin-top: 20px;
        & > div {
          display: flex;
          align-items: center;

          p {
            font-size: 18px;
            padding: 0;
            margin: 0;
            margin-left: 10px;
            font-weight: 700;
          }

          & p:nth-child(2) {
            font-size: 15px;
            font-size: #8888;
            font-weight: 400;
          }
        }
      }
    }
  }
}
</style>
