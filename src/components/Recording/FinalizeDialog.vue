<template>
  <div class="q-pa-md q-gutter-sm">
    <q-dialog v-model="showDialog">
      <q-card class="my-card">
        <div class="info-box">
          <h4>We just need bit more information</h4>

          <q-select
            color="orange-14"
            filled
            v-model="type"
            :options="options"
            label="Gender / Pronouns"
          />

          <q-select
            style="margin-top: 20px"
            color="orange-14"
            filled
            v-model="noteType"
            :options="noteTypeOptions"
            label="Note Type"
          />
        </div>
        <div class="bottom-box">
          <q-btn
            outline
            size="md"
            color="orange-14"
            @click="props.closeFianlizeDialog"
            >Cancel</q-btn
          >
          <q-btn
            text-color="white"
            size="md"
            style="background-color: #f57927"
            @click="handleSubmit"
            >Submit</q-btn
          >
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, onMounted } from "vue";

const options = ["She/Her", "He/Him", "They/Them"];
const noteTypeOptions = [
  "System Based Assessment And Plan",
  "Clinical Discussion",
];

// Use 'props' and 'emits' from setup context
const props = defineProps(["show", "generateNoteDetail", "handleFinalize"]);
const type = ref(options[0]);
const noteType = ref(noteTypeOptions[0]);

const handleSubmit = () => {
  props.generateNoteDetail(noteType.value, type.value.toLowerCase());
};

const showDialog = ref(false);

onMounted(() => {
  watch(
    () => props.show,
    (newValue) => {
      showDialog.value = newValue;
    }
  );
});
</script>
<style scoped>
.my-card {
  height: fit-content;
  width: 900px;
  padding: 20px;
  background: #f2f2f2;
}

.info-box {
  margin-bottom: 10px;
}
.info-box > h4 {
  font-size: 24px;
  margin: 0;
  margin-bottom: 20px;
}
.info-box > div {
  border-radius: 5px;
  border-color: #f57927;
  background-color: #f2f2f2;
  padding: 10px;
}
.bottom-box {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
</style>
