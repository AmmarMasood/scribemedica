<template>
  <q-page id="landingPage">
    <!--  -->
    <div class="landing-top">
      <div class="landing-top--inner">
        <h1>
          AI-driven service transforming patient-provider conversations into
          accurate, efficient medical notes.
        </h1>
        <p>Finally, a solution that works.</p>
        <router-link to="/auth/register">
          <q-btn text-color="white" size="lg" style="background-color: #f57927"
            >Try For Free</q-btn
          >
        </router-link>
      </div>
      <img
        src="../assets/consultation.jpeg"
        alt="Scribe Medica Logo"
        class="landing-top--img"
      />
    </div>
    <!--  -->
    <div class="landing-bottom">
      <img
        src="../assets/target-notes.png"
        alt="Scribe Medica Logo"
        class="landing-top--img"
      />
      <div class="landing-bottom--inner">
        <h1>Eliminates the burden of time-consuming clinical documentation.</h1>
        <p>Reclaim your time and cultivate a fulfilling professional life.</p>

        <p>
          Our advanced AI allows you to focus more on your patients and personal
          growth.
        </p>

        <p>
          Rediscover your passions, spend time with loved ones, or simply enjoy
          a less stressful workday.
        </p>
      </div>
    </div>
  </q-page>
</template>

<script setup></script>

<style scoped lang="scss">
.landing-top {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 20px;
  align-items: center;
  justify-items: center;
  padding: 100px;
  max-width: 1800px;
  margin: 0 auto;
  background: #045e97;

  @media (max-width: 1400px) {
    padding: 50px;
  }
  @media (max-width: 650px) {
    padding: 50px;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    text-align: center;
  }

  &--inner {
    & > h1 {
      font-size: 38px;
      margin: 0;
      margin-bottom: 20px;
      line-height: 50px;
      font-weight: 600;
      color: #fff;

      @media (max-width: 1000px) {
        font-size: 28px;
        line-height: 32px;
      }
    }
    & > p {
      font-size: 20px;
      color: #fff;
    }
  }
  &--img {
    width: 600px;
    height: 100%;
    border-radius: 20px;

    @media (max-width: 1400px) {
      width: 400px;
    }

    @media (max-width: 1000px) {
      width: 250px;
      height: 250px;
    }
  }
}

.landing-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 20px;
  align-items: center;
  justify-items: center;
  padding: 100px;
  max-width: 1800px;
  margin: 0 auto;
  background: #fff;

  @media (max-width: 1400px) {
    padding: 50px;
  }

  @media (max-width: 650px) {
    padding: 50px;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    text-align: center;
    height: 800px;
  }

  &--inner {
    & > h1 {
      font-size: 38px;
      margin: 0;
      margin-bottom: 20px;
      line-height: 50px;
      font-weight: 600;
      color: #045e97;

      @media (max-width: 1000px) {
        font-size: 28px;
        line-height: 32px;
      }
    }
    & > p {
      font-size: 20px;
      color: #aa613a;
      font-weight: 500;
    }
  }
  &--img {
    width: 600px;
    height: 100%;
    border-radius: 20px;

    @media (max-width: 1400px) {
      width: 400px;
    }

    @media (max-width: 1000px) {
      width: 250px;
      height: 250px;
    }
  }
}
</style>
