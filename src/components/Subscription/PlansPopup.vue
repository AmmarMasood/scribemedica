<template>
  <div class="q-pa-md q-gutter-sm">
    <q-dialog v-model="showDialog" persistent class="dialog">
      <q-card class="my-card">
        <img
          src="../../assets/icons8-cancel-30.png"
          alt="cancel"
          @click="props.closeModal()"
          style="height: 24px; width: 24px; float: right; cursor: pointer"
        />
        <div class="info-box">
          <h4>Update your plan to get access to more perks.</h4>
          <div class="info">
            <div style="margin-bottom: 30px" class="info--inner">
              <h2>Professional Path</h2>
              <h3 class="info--inner-description">
                Create unlimited notes with our AI transcription.
              </h3>
              <h3 class="info--inner-price">
                Yearly Plan with only ${{ myPlans[0]?.price / 12 }} per month
              </h3>
              <q-btn
                text-color="white"
                size="md"
                style="background-color: #f57927"
                @click="
                  handleSubscribe(myPlans[0]?.stripePriceId, myPlans[0]?.id)
                "
                >Choose</q-btn
              >
              <h3 class="info--inner-ortext">
                or subscribe to monthly program.
              </h3>
              <h3 class="info--inner-price">
                with only ${{ myPlans[1]?.price }} per month.
              </h3>
              <q-btn
                text-color="white"
                size="md"
                style="background-color: #f57927"
                @click="
                  handleSubscribe(myPlans[1]?.stripePriceId, myPlans[1]?.id)
                "
                >Choose</q-btn
              >
            </div>
          </div>
          <p
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              margin-top: 20px;
            "
          >
            <img
              src="../../assets/icons8-lock-100.png"
              alt=""
              style="height: 24px; width: 24; margin-right: 10px"
            />
            <span style="white-space: nowrap"
              >All payments are handled securely through stripe</span
            >
          </p>
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, onMounted } from "vue";
import { stripe } from "../../services/stripe";

// Use 'props' and 'emits' from setup context
const props = defineProps([
  "plans",
  "subscription",
  "auth",
  "show",
  "closeModal",
]);
const showDialog = ref(false);
const myPlans = ref([]);

watch(
  () => props.show,
  (newValue) => {
    // console.log("showDialog", newValue);
    showDialog.value = newValue;
  }
);

watch(
  () => props.plans,
  (newValue) => {
    if (newValue.length > 0) {
      myPlans.value = filterOnlyUnlimitedPlans(newValue);
    }
  }
);

const filterOnlyUnlimitedPlans = (plans) => {
  return plans.filter((plan) => plan.name.includes("Unlimited"));
};
const getPlans = (data) => {
  // Create an object to store combined plan data
  const combinedPlans = {};

  console.log("im calllled");

  // Iterate through the data array
  data.forEach((plan) => {
    const { id, name, description, price } = plan;

    // Extract the type from the plan name (e.g., "Tier 1" or "Tier 2")
    const type = name.split(" ")[1]; // Assumes the plan name format is consistent

    // Check if the type is already in combinedPlans
    if (combinedPlans[type]) {
      // If it exists, update the corresponding details
      if (name.includes("Yearly")) {
        combinedPlans[type].yearlyDetails = {
          id,
          name,
          description,
          price,
        };
      } else if (name.includes("Monthly")) {
        combinedPlans[type].monthlyDetails = {
          id,
          name,
          description,
          price,
        };
      }
    } else {
      // If it doesn't exist, create a new entry in combinedPlans
      combinedPlans[type] = {
        type,
        description,
        monthlyDetails: {},
        yearlyDetails: {},
      };

      // Initialize the details based on the plan type
      if (name.includes("Yearly")) {
        combinedPlans[type].yearlyDetails = {
          id,
          name,
          description,
          price,
        };
      } else if (name.includes("Monthly")) {
        combinedPlans[type].monthlyDetails = {
          id,
          name,
          description,
          price,
        };
      }
    }
  });

  return combinedPlans;
};

const handleSubscribe = async (priceId, planId) => {
  const stripeSession = await stripe.checkout.sessions.create({
    success_url: "https://www.scribemedica.ai/account",
    cancel_url: "https://www.scribemedica.ai/account",
    payment_method_types: ["card"],
    currency: "usd",
    mode: "subscription",
    billing_address_collection: "auto",
    customer_email: props.auth.currentUser.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId: props.auth.currentUser.uid,
      planId: planId,
    },
  });

  window.location = stripeSession.url;
  return;
};
</script>
<style scoped lang="scss">
.dialog {
}
.my-card {
  height: fit-content;
  min-width: 100% !important;
  padding: 20px;
  background: #f2f2f2;
}

.info-box {
  margin-bottom: 10px;
}
.info-box > h4 {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  margin-bottom: 20px;
  text-align: center;
  margin-top: 20px;
}

.info {
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;

  &--inner {
    border: 2px solid f57927;
    width: 350px;
    padding: 20px;
    text-align: center;
    border-radius: 10px;
    background: #fff;

    &-description {
      margin: 0;
      padding: 0;
      font-size: 25px;
      line-height: 25px;
      font-weight: bold;
      margin-top: 20px;
    }

    &-price {
      margin: 0;
      padding: 0;
      font-size: 24px;
      line-height: 25px;
      font-weight: bold;
      margin-top: 20px;
      margin-bottom: 10px;
    }

    &-ortext {
      margin: 0;
      padding: 0;
      font-size: 22px;
      line-height: 25px;
      font-weight: bold;
      margin-top: 25px;
      margin-bottom: 25px;
    }

    h2 {
      margin: 0;
      padding: 0;
      font-size: 42px;
      font-weight: bolder;
    }
  }
}

.bottom-box {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
</style>
