<template>
  <div style="padding: 15px">
    <a-card :bordered="false">
      <m-table v-bind="tablePageConfig">
        <template #operation="{ text, record, index }">
          <a @click="handleUpdate(text)"> 修改 </a>
          <!-- <a-icon type="edit" /> -->
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定删除吗?"
            @confirm="() => handleDelete(text.id)"
          >
            <a> 删除 </a>
            <!-- <a-icon type="delete" /> -->
          </a-popconfirm>
        </template>
      </m-table>
    </a-card>
  </div>
</template>
<script>
import { reactive } from "vue";
import { PlusOutlined, DownloadOutlined } from "@ant-design/icons-vue";
import MTable from "./../Table.vue";
import { api } from "../utils.js";
import moment from "moment";

export default {
  components: {
    MTable,
    PlusOutlined,
    DownloadOutlined,
  },
  setup() {
    let tablePageConfig = reactive({
      columns: [
        { title: "a", dataIndex: "a" },
        { title: "b", dataIndex: "b" },
        { title: "c", dataIndex: "c" },
        { title: "d", dataIndex: "d" },
        {
          title: "操作",
          key: "operation",
          slots: { customRender: "operation" },
        },
      ],
      //dataSource: [{id:1,a:1},{id:1,a:1},{id:1,a:1},{id:1,a:1},{id:1,a:1},{id:1,a:1},{id:1,name:1},{id:1,name:1},{id:1,name:1},{id:1,name:1},{id:1,name:1},{id:1,name:1},{id:1,name:1},{id:1,name:1},{id:1,name:1},{id:1,name:1},{id:1,name:1},{id:1,name:1},{id:1,name:1},{id:1,name:1},{id:1,a:1},{id:1,a:1},{id:1,a:1},{id:1,a:1},{id:1,a:1},{id:2,a:3}],
    });
 
    tablePageConfig.dataSource = async (params) => {
      console.log("params", params);
      let { data } = await api.get(
        "http://yapi.dev.patpat.vip/mock/16/list_filter",
        params
      );
      return [data.list, data.total];
    };
    return { tablePageConfig };
  },
};
</script>
<style scoped lang="less">
</style>

