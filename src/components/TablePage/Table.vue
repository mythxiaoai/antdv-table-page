<template>
  <div class="antv-table-page">
    <!--表格页面插槽-->
    <a-table
      :loading="loading"
      @change="pagingChange"
      v-bind="opts"
      :dataSource="data"
    >
      <!--这里做插槽转发  把外层插槽在内部slot接收，外层包裹传递过来的在传入a-table插件  因为这里用了这种  所以不支持a-table-column-group组件了-->
      <template v-for="item in slots" #[item]="res">
        <slot :name="item" v-bind="res"></slot>
      </template>
      <slot></slot>
    </a-table>
  </div>
</template>

<script>
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons-vue";
import { defineComponent, toRefs } from "vue";
//外界可以导出修改配置
import { createdStore } from "./store.js";
import { useTable } from "./table.js";

export default defineComponent({
  name: "table-page",
  components: {
    SearchOutlined,
    ReloadOutlined,
  },
  props: {
    dataSource: {
      type: [Function, Array],
      default() {
        return [];
      },
    },
  },
  setup(props, context) {
    let state = createdStore(props, context);
    let { pagingChange, list, initPagination } = useTable(state,props);
    initPagination();
    list();
    return { ...toRefs(state), pagingChange };
  },
});
</script>

<style>
/*很多都是需要:deep穿透  索性直接全局并加上.antv-table-page做约束 */
/* 好处根据内容自动宽度，弊端：会使columns设置width无效，解决：自定义插槽外层加样式white-space: normal; */
/*start antv-table-page*/
.antv-table-page .ant-table td {
  white-space: nowrap;
}
.antv-table-page .ant-table th {
  white-space: nowrap;
}
.antv-table-page .ant-table-body {
  overflow-x: auto;
}
/*end antv-table-page*/

/* start*/
.antv-table-page .ant-form label {
  /* 开启GPU渲染加速 局部重绘 */
  font-size: 12px;
}
.antv-table-page {
  /* 开启GPU渲染加速 局部重绘 */
  transform: translateZ(0);
}
.antv-table-page .ant-form {
  margin-bottom: 15px;
}
.antv-table-page .ant-form .ant-form-item {
  display: flex;
  flex-wrap: nowrap;
  margin-bottom: 8px;
}
.antv-table-page .ant-form .ant-form-item .ant-form-item-control-wrapper {
  flex: 1 1 auto;
}
.antv-table-page
  .ant-form
  .ant-form-item
  .ant-form-item-control-wrapper
  .ant-form-item-children {
  white-space: nowrap;
}
.antv-table-page .ant-select,
.antv-table-page .ant-slider {
  min-width: 180px;
}
/**end search-wrapper */

/**start table-operator */
.antv-table-page .table-operator {
  margin-bottom: 8px;
}
.antv-table-page .table-operator .ant-btn {
  margin: 0 8px 8px 0;
}
/**end  table-operator*/
/*start m-filter */
.m-filter {
  text-align: center;
}
.m-filter .ant-select,
.m-filter .ant-slider,
.m-filter .ant-time-picker {
  min-width: 180px;
  max-width: 280px;
}
.m-filter .opts {
  display: flex;
  margin-top: 8px;
  justify-content: space-between;
}
.m-filter .opts .ant-btn {
  width: 80px;
}
/*end m-filter */
</style>
