<template>
  <div class="antv-table-page">
    <!-- <p>query:{{ query }}</p> -->
    <!-- <p>renderFormItem:{{ renderFormItem }}</p> -->
    <!-- <p>searchFormItem:{{ searchFormItem }}</p> -->
    <!-- <p>filterFormItem:{{ filterFormItem }}</p> -->
    <!-- <p>editFormItem:{{ editFormItem }}</p> -->
    <!-- <p>opts:{{ opts.columns }}</p> -->
    <!-- <p>editTitleSlots:{{ editTitleSlots }}</p> -->
    <!-- <p>renderSlots:{{ renderSlots }}</p> -->
    <!-- <p>editableData:{{ editableData }}</p> -->
    <!-- <p>data:{{ data }}</p> -->
    <!--search start-->
    <slot name="search" :query="query">
      <a-form class="search" layout="inline" @keyup.enter="search">
        <template v-for="item in searchFormItem" :key="item.p.name">
          <a-form-item v-bind="item.p">
            <ant-component
              :props="item.s"
              :component="item.component"
              v-model:value="query[item.p.name]"
            ></ant-component>
          </a-form-item>
        </template>
        <a-form-item v-if="searchFormItem.length > 0">
          <a-space>
            <a-button type="primary" @click="search"
              ><SearchOutlined />查询
            </a-button>
            <a-button @click="searchReset">
              <ReloadOutlined />
              重置
            </a-button>
          </a-space>
        </a-form-item>
        <slot name="search-after" :query="query"></slot>
      </a-form>
    </slot>
    <!--end search-->

    <div class="toolbar">
      <slot name="toolbar" :query="cloneDeep(query)"></slot>
    </div>

    <!--表格页面插槽-->
    <a-table
      :loading="loading"
      @change="pagingChange"
      v-bind="opts"
      :dataSource="data"
      ref="tableRef"
      :class="{'scroll-table':opts.height==='auto'}"
    >
      <!--这里做插槽转发  把外层插槽在内部slot接收，外层包裹传递过来的在传入a-table插件  因为这里用了这种  所以不支持a-table-column-group组件了-->
      <template v-for="item in slots" #[item]="res">
        <slot :name="item" v-bind="res"></slot>
      </template>
      <!--filter start-->
      <template #_filterIcon="{ column }">
        <FilterFilled :style="getColor(column.key)"></FilterFilled>
      </template>
      <template #_filterDropdown="{ column, confirm }">
        <div
          class="m-filter"
          style="padding: 8px"
          @keyup.enter="filterSearch(confirm)"
        >
          <ant-component
            :props="filterFormItem[column.key].s"
            :component="filterFormItem[column.key].component"
            v-model:value="query[column.key]"
            ref="filterRef"
          ></ant-component>
          <div class="opts">
            <a-button
              type="primary"
              size="small"
              @click="filterSearch(confirm)"
            >
              <SearchOutlined />查询
            </a-button>
            <a-button size="small" @click="filterReset(column, confirm)">
              <ReloadOutlined />重置
            </a-button>
          </div>
        </div>
      </template>
      <!--end filter-->
      <!--edit start-->
      <template #_edit="{ column, text, index }">
        <span :class="{ edit_updated: column.updated[index] }">
          <template v-if="editableData && isEditShow(column, index)">
            <ant-component
              class="{}"
              :props="editFormItem[column.key].s"
              :component="editFormItem[column.key].component"
              ref="editRef"
              v-model:value="editValue.value"
            ></ant-component>
          </template>
          <template v-else>
            {{ column._isOptions ? column._getOptionsLabel(text) : text }}
          </template>
        </span>
      </template>
      <!--end edit-->
      <slot></slot>
    </a-table>
  </div>
</template>

<script>
import {
  SearchOutlined,
  ReloadOutlined,
  FilterFilled,
} from "@ant-design/icons-vue";
import AntComponent from "./AntComponent.vue";
import { defineComponent, toRefs } from "vue";
import { createdStore, _defaultTable as defaultConfig } from "./store.js";
import { useTable } from "./table.js";
import { useSearch } from "./search.js";
import { useFilter } from "./filter.js";
import { useEdit } from "./edit.js";
import { cloneDeep } from "lodash";

//外界可以导出修改配置
export let _defaultTable = defaultConfig;

export default defineComponent({
  inheritAttrs: false,
  name: "table-page",
  components: {
    SearchOutlined,
    ReloadOutlined,
    FilterFilled,
    AntComponent,
  },
  emit: ["save"],
  props: {
    formItem: {
      type: Object,
      default: () => {},
    },
    dataSource: {
      type: [Function, Array],
      default() {
        return [];
      },
    },
    height:{
      type: String
    }
  },
  setup(props, context) {
    let state = createdStore(props, context);
    let { searchFormItem, searchReset, search } = useSearch(state, props);
    let { filterRef, filterFormItem, getColor, filterSearch, filterReset } =
      useFilter(state, props);
    let { editRef, save, editFormItem, isEditShow } = useEdit(
      state,
      props,
      context
    );
    let { tableRef,pagingChange, list, initPagination } = useTable(
      state,
      props,
      context
    );
    initPagination();
    list();
    return {
      searchFormItem,
      filterFormItem,
      editFormItem,
      tableRef,
      filterRef,
      editRef,
      save,
      ...toRefs(state),
      pagingChange,
      cloneDeep,
      searchReset,
      search,
      getColor,
      filterSearch,
      filterReset,
      isEditShow,
    };
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

.antv-table-page .search label {
  /* 开启GPU渲染加速 局部重绘 */
  font-size: 12px;
}
.antv-table-page {
  /* 开启GPU渲染加速 局部重绘 */
  transform: translateZ(0);
}
.antv-table-page .search {
  margin-bottom: 15px;
}
.antv-table-page .search .ant-form-item {
  display: flex;
  flex-wrap: nowrap;
  margin-bottom: 8px;
}
.antv-table-page .search .ant-form-item .ant-form-item-control-wrapper {
  flex: 1 1 auto;
}
.antv-table-page
  .search
  .ant-form-item
  .ant-form-item-control-wrapper
  .ant-form-item-children {
  white-space: nowrap;
}
.antv-table-page .search .ant-select,
.antv-table-page .search .ant-slider {
  min-width: 180px;
}
/**end search */

/**start toolbar */
.antv-table-page .toolbar {
  margin-bottom: 8px;
}
.antv-table-page .toolbar .ant-btn {
  margin: 0 8px 8px 0;
}
/**end  toolbar*/
/*start m-filter */
.m-filter {
  /* text-align: center; */
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

/*edit start*/
.antv-table-page .ant-table-tbody td {
  position: relative;
}
.antv-table-page .ant-table-tbody .ant-table-row .ant-input {
  padding: 0 3px;
}
.antv-table-page .ant-table-tbody .ant-table-row .ant-input-affix-wrapper {
  padding: 0 3px;
}

.antv-table-page .edit_updated::before {
  content: "";
  top: -5px;
  left: -5px;
  position: absolute;
  border-width: 5px;
  border-style: solid;
  border-color: transparent #f56c6c transparent transparent;
  transform: rotate(45deg);
}
/*end edit*/

/*scroll-table start*/
.antv-table-page .scroll-table .ant-table-body {
  overflow-y: auto;
}
.antv-table-page .scroll-table .ant-table-thead {
  position: sticky;
  z-index: 999;
  top: 0;
}
/*end scroll-table */
</style>
