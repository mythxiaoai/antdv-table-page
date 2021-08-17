<template>
  <component
    v-if="component === 'a-mentions'"
    :is="component"
    v-model:[model]="formItemValue"
    v-bind="props"
  >
    <!--a-mentions的a-mentions-option处理(因为没有option选项配置)-->
    <a-mentions-option
      v-for="sItem of props.options"
      :key="sItem.value"
      :value="sItem.value"
    >
      {{ sItem.label }}
    </a-mentions-option>
  </component>
  <component
    v-else
    :is="component"
    v-model:[model]="formItemValue"
    v-bind="props"
  ></component>
</template>

<script>
import { defineComponent, computed, ref, toRefs, watch } from "vue";

const checkedComponents = ["a-checkbox", "a-radio", "a-switch"];

export default defineComponent({
  name: "AntComponent",
  props: {
    component: {
      type: String,
      required: true,
    },
    value: {
      type: [Array, String, Number, Boolean, Object],
    },
    props: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:value"],
  setup(props, context) {
    let model = computed((v) => {
      return checkedComponents.includes(props.component) ? "checked" : "value";
    });
    let formItemValue = computed({
      get: () => {
        return props.value;
      },
      set: (val) => {
        context.emit("update:value", val);
      },
    });
    return { ...toRefs(props), formItemValue, model };
  },
});
</script>

<style lang="scss" scoped>
</style>
