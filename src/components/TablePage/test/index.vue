<template>
  <div style="padding: 15px">
    <a-card :bordered="false">
      <m-table v-bind="tablePageConfig" ref="tableRef">
        <template #search-after="{ query }">
          <a-form-item>
            <a-switch
              v-model:checked="query.switch"
              @change="change"
            ></a-switch>
            只看我
          </a-form-item>
        </template>

        <template #toolbar>
          <a-button><PlusOutlined />添加</a-button>
          <a-button><DownloadOutlined />导出</a-button>
        </template>
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
import { reactive, ref } from "vue";
import { PlusOutlined, DownloadOutlined } from "@ant-design/icons-vue";
import MTable from "../Table.vue";
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
      formItem: {
        is_mine: {
          value: true,
        },
        "a:userId": {
          component: "AInput", //或者 a-input
          label: "AInput",
          value: "aaa", //默认值
          props: {
            placeholder: "请输入字典名称", //不加默认会加上 请输入 + label
          },
        },
        b: {
          search: false,
          label: "AAutoComplete",
          component: "AAutoComplete", //或者 a-auto-complete
          value: "2", //默认值
          props: {
            options: [
              { text: "a", value: "1" },
              { text: "b", value: "2" },
              { text: "c", value: "3" },
            ],
          },
        },
        c: {
          label: "ACascader",
          component: "ACascader",
          value: [], //默认值
          props: {
            options: [
              {
                label: "a",
                value: "1",
                children: [{ label: "a", value: "1" }],
              },
              { label: "b", value: "2" },
              { label: "c", value: "3" },
            ],
          },
        },
        d: {
          label: "ACheckbox",
          component: "ACheckbox",
          value: true, //默认值
        },
        e: {
          label: "ACheckboxGroup",
          component: "ACheckboxGroup",
          value: ["1"], //默认值
          props: {
            options: [
              { label: "Apple", value: "1" },
              { label: "Pear", value: "2" },
              { label: "Orange", value: "3" },
            ],
          },
        },
        f: {
          label: "ADatePicker",
          component: "ADatePicker",
          value: "", //或者设置默认时间 moment()  输出的都是Moment对象但是get请求会默认转化为utc,其他情况需要utc请在第38行自行格式化moment().utc().format()
        },
        g: {
          label: "AMonthPicker",
          component: "AMonthPicker",
          value: "",
        },

        i: {
          label: "AWeekPicker",
          component: "AWeekPicker",
          value: "",
        },
        j: {
          label: "ATextarea",
          component: "ATextarea",
          value: "",
        },
        k: {
          label: "AInputSearch",
          component: "AInputSearch",
          value: "",
        },
        l: {
          label: "AInputNumber",
          component: "AInputNumber",
          value: 0,
        },
        m: {
          label: "AMentions",
          component: "AMentions",
          value: "2",
          props: {
            options: [
              { label: "Apple", value: "1" },
              { label: "Pear", value: "2" },
              { label: "Orange", value: "3" },
            ],
          },
        },
        n: {
          label: "ARadio",
          component: "ARadio",
          value: false,
        },
        o: {
          label: "ARadioGroup",
          component: "ARadioGroup",
          value: "2", //默认值
          props: {
            options: [
              { label: "Apple", value: "1" },
              { label: "Pear", value: "2" },
              { label: "Orange", value: "3" },
            ],
          },
        },
        p: {
          label: "ARate",
          component: "ARate",
          value: 2, //默认值
        },
        q: {
          label: "ASelect",
          component: "ASelect",
          value: "",
          props: {
            options: [
              { label: "--请选择--", value: "" },
              { label: "Apple", value: "1" },
              { label: "Pear", value: "2" },
              { label: "Orange", value: "3" },
            ],
          },
        },
        r: {
          label: "ASelect 多选",
          component: "ASelect",
          value: [],
          props: {
            mode: "multiple",
            options: [
              { label: "Apple", value: "1" },
              { label: "Pear", value: "2" },
              { label: "Orange", value: "3" },
            ],
          },
        },
        s: {
          label: "ASlider",
          component: "ASlider",
          value: 44,
        },
        t: {
          label: "ASwitch",
          component: "ASwitch",
          value: true,
        },
        u: {
          label: "ATimePicker",
          component: "ATimePicker",
          value: "", //moment('08:00:00', 'HH:mm:ss')
        },
        v: {
          label: "ATreeSelect",
          component: "ATreeSelect",
          value: "",
          props: {
            treeData: [
              {
                title: "Node1",
                value: "0-0",
                key: "0-0",
                children: [
                  {
                    title: "Child Node1",
                    value: "0-0-1",
                    key: "0-0-1",
                  },
                  {
                    title: "Child Node2",
                    value: "0-0-2",
                    key: "0-0-2",
                  },
                ],
              },
              {
                title: "Node2",
                value: "0-1",
                key: "0-1",
              },
            ],
          },
        },
      },
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

    let tableRef = ref(null);
    let change = () => {
      console.log(tableRef);
      tableRef.value.search();
    };
    return { tableRef, tablePageConfig, change };
  },
};
</script>
<style scoped lang="less">
</style>

