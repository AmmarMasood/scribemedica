<template>
  <q-page id="recordingListPage">
    <q-inner-loading :showing="loading" style="z-index: 2000000">
      <q-spinner-gears size="100px" color="orange" style="z-index: 2000000"
    /></q-inner-loading>

    <div class="container">
      <h2>Here is a list of your past recordings.</h2>
      <div class="container--inner">
        <div class="container--inner-searchbox">
          <q-input
            standout="bg-orange-14 text-white"
            v-model="searchTxt"
            @change="handleSearch"
            label="Search recording by patient name..."
          />
          <q-select
            color="orange-14"
            filled
            v-model="selection"
            :options="options"
            label="Type"
          />
        </div>

        <div style="margin-top: 20px">
          <q-infinite-scroll @load="onLoad" :offset="50">
            <div
              v-for="(detail, items) in details"
              :key="items"
              class="detail-card"
            >
              <router-link
                :to="
                  detail.finalized
                    ? `/recordings/details/${detail._id}`
                    : `/new/${detail.type}/${detail._id}`
                "
                style="text-decoration: none; color: #000"
              >
                <div>
                  <img :src="MicIcon" alt="mic" />
                  <div>
                    <p style="font-weight: 700">{{ detail.patientName }}</p>
                    <p>{{ detail.type }}</p>
                    <p>
                      {{
                        DateTime.fromISO(detail.createdAt).toFormat(
                          "dd LLL yyyy"
                        )
                      }}
                    </p>
                  </div>
                </div>
              </router-link>
              <img
                :src="DeleteIcon"
                alt="delete"
                @click="
                  confirm = true;
                  selected = detail;
                "
                style="height: 32px; width: 32px"
              />
            </div>
          </q-infinite-scroll>
        </div>
      </div>
      <div
        style="
          display: flex;
          align-items: center;
          margin-top: 20px;
          justify-content: center;
        "
      >
        <q-spinner
          v-if="loadingNotes"
          color="orange"
          size="3em"
          :thickness="3"
        />
      </div>
    </div>

    <q-dialog v-model="confirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <p style="font-size: 18px">
            Are you sure you want to delete this recording
          </p>
        </q-card-section>

        <q-card-actions align="right" style="margin-top: -20px">
          <q-btn flat label="Cancel" color="red-12" v-close-popup />
          <q-btn
            flat
            label="Confirm Deletion"
            color="red-12"
            @click="deleteNote()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- <VerifyEmail v-if="!currentAuth?.emailVerified" /> -->
    <!-- <TermsAndService /> -->
  </q-page>
</template>

<script setup>
import { useRouter } from "vue-router";
import { onMounted, ref, watch } from "vue";
import MicIcon from "../../assets/mic.png";
import DeleteIcon from "../../assets/icons8-delete-100.png";
import axiosApiInstance from "src/services/axios";
import { debounce, useQuasar } from "quasar";
import { SERVER_URL } from "src/utils/constants";
import { DateTime } from "luxon";

const router = useRouter();
const searchTxt = ref("");
const options = ["All", "New Patient", "Return Visit"];
const selection = ref(options[0]);
const details = ref([]);
const $q = useQuasar();
const loadingNotes = ref(false);
const loading = ref(false);
const finished = ref(false);
//
const confirm = ref(false);
const selected = ref(null);

const getNotesFromBack = async (page, limit, search = "") => {
  try {
    const res = await axiosApiInstance.get(
      `${SERVER_URL}/private/notes?noteType=${selection.value.toLowerCase()}&page=${page}&limit=${limit}&search=${search}`
    );
    return res.data;
  } catch (error) {
    $q.notify({
      color: "negative",
      message: "Unable to get notes",
      icon: "report_problem",
      position: "top",
    });
    // console.log(error);
  }
};

const handleSearch = debounce(async () => {
  loading.value = true;
  const res = await getNotesFromBack(1, 6, searchTxt.value);
  details.value = res;
  loading.value = false;
}, 1000);

watch(searchTxt, () => {
  handleSearch();
});

watch(selection, async () => {
  finished.value = false;
  loading.value = true;
  const res = await getNotesFromBack(1, 6);
  details.value = res;
  loading.value = false;
});

const getAllNotes = async (page, limit) => {
  if (finished.value) return;
  loadingNotes.value = true;
  try {
    const res = await getNotesFromBack(page, limit);
    if (res.length === 0) {
      finished.value = true;
    }
    details.value.push(...res);
  } catch (error) {
    // console.log(error);
  }
  loadingNotes.value = false;
};

const deleteNote = async () => {
  const note = selected.value;
  loadingNotes.value = true;
  try {
    const res = await axiosApiInstance.delete(
      `${SERVER_URL}/private/notes/${note._id}`
    );
    if (res.data) {
      $q.notify({
        color: "positive",
        message: "Note deleted successfully",
        icon: "report_problem",
        position: "top",
      });
      confirm.value = false;
      details.value = details.value.filter((item) => item._id !== note._id);
    }
  } catch (err) {
    // console.log(err);
    $q.notify({
      color: "negative",
      message: "Unable to delete note",
      icon: "report_problem",
      position: "top",
    });
  }
  loadingNotes.value = false;
};
const onLoad = async (index, done) => {
  await getAllNotes(index, 6);
  done();
};
</script>

<style lang="scss" scoped>
#recordingListPage {
  min-height: 400px !important;
}
.container {
  padding: 50px;
  margin-top: 20px;

  @media screen and (max-width: 600px) {
    padding: 20px;
  }

  & > h2 {
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

  &--inner {
    &-searchbox {
      display: grid;
      grid-template-columns: 1fr 200px;
      grid-gap: 20px;
      @media screen and (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    &-detailContainer {
      margin-top: 20px;
      height: 60vh;
      overflow-y: auto;
      padding: 10px;

      a {
        text-decoration: none;
        color: #353935;
      }
      // border-radius: 10px;
    }
  }
}

.detail-card {
  // border: 2px solid red;
  padding: 20px 50px;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,
    rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.4s;

  @media screen and (max-width: 600px) {
    padding: 10px;
  }

  & > a > div {
    display: flex;
    align-items: center;
  }
  p {
    font-size: 18px;
    padding: 0;
    margin: 0;
    margin-left: 30px;

    &:nth-child(2) {
      font-size: 16px;
    }
    &:nth-child(3) {
      font-size: 14px;
    }

    @media screen and (max-width: 600px) {
      margin-left: 20px;
    }
  }
  & > a > div > img {
    height: 32px;
    width: 32px;
  }
  & > img {
    height: 52px;
    width: 52px;
    cursor: pointer;

    @media screen and (max-width: 600px) {
      height: 32px;
      width: 32px;
    }
  }

  &:hover {
    background-color: #f2f2f2;
  }
}

.bg-orange {
  background: #f57927 !important;
}
</style>
