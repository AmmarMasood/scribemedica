<template>
  <div class="q-pa-md q-gutter-sm">
    <q-dialog v-model="showDialog">
      <q-card class="my-card">
        <div class="info-box">
          <h4>Chief Complaint</h4>
          <div>
            <p>{{ props.chiefComplaint }}</p>
          </div>
        </div>
        <div class="info-box">
          <h4>Assessment</h4>
          <div>
            <p>{{ props.assessment }}</p>
          </div>
        </div>
        <div class="info-box">
          <h4>Plan</h4>
          <div>
            <p>{{ props.plan }}</p>
          </div>
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, onMounted } from "vue";

// Use 'props' and 'emits' from setup context
const props = defineProps(["show", "chiefComplaint", "assessment", "plan"]);

const showDialog = ref(false);

onMounted(() => {
  watch(
    () => props.show,
    (newValue) => {
      // console.log("im called", newValue);
      showDialog.value = newValue;
    }
  );
});
</script>
<style scoped>
.my-card {
  min-height: 600px;
  width: 900px;
  padding: 20px;
}

.info-box {
  margin-bottom: 10px;
}
.info-box > h4 {
  font-size: 24px;
  margin: 0;
  padding-bottom: 5px;
}
.info-box > div {
  border-radius: 5px;
  border-color: #f57927;
  background-color: #f2f2f2;
  padding: 10px;
}
</style>
