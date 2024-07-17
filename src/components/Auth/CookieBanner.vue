<template>
  <div class="cookie-banner" v-if="cookiesBanner">
    <img
      src="../../assets/icons8-cancel-30.png"
      alt="cancel"
      @click="cookiesBanner = false"
      class="cookie-cancel-btn"
    />

    <h5>
      Cookies help us deliver the best experience on our website. By using our
      website, you agree to the use of cookies.
      <a
        href="https://drive.google.com/file/d/1LTJXG3QOSWIUpUjIZOrm0XgOUbkRDIFB/view?usp=sharing"
        target="_blank"
        rel="noopener noreferrer"
      >
        Find out how we use cookies.
      </a>
    </h5>

    <q-btn
      text-color="white"
      label="Accept"
      size="md"
      style="background-color: #f57927; width: 100%"
      @click="onAccept"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { Cookies } from "quasar";
const cookiesBanner = ref(false);

const onAccept = () => {
  Cookies.set("cookiesAccepted", true);
  cookiesBanner.value = false;
};

onMounted(() => {
  if (!Cookies.get("cookiesAccepted")) {
    cookiesBanner.value = true;
  }
});
</script>

<style lang="scss" scoped>
.cookie-banner {
  position: fixed;
  bottom: 25px;
  right: 25px;
  width: 650px;
  background-color: #fff;
  padding: 30px;
  color: white;
  text-align: center;
  z-index: 999;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;

  @media screen and (max-width: 700px) {
    width: 450px;
  }

  @media screen and (max-width: 500px) {
    width: 350px;
  }

  h5 {
    font-weight: 500;
    margin: 0;
    padding: 0;
    margin-top: 15px;
    font-size: 22px;
    line-height: 1.8rem;
    color: #000;
    margin-bottom: 20px;
    text-align: left;
    @media screen and (max-width: 700px) {
      font-size: 20px;
    }
  }

  a {
    color: #f57927;
  }
}

.cookie-cancel-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  cursor: pointer;
  height: 24px;
  width: 24px;
}
</style>
