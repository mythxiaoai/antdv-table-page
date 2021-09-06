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

export default {
  components: {
    MTable,
    PlusOutlined,
    DownloadOutlined,
  },
  setup() {
    let tablePageConfig = reactive({
      formItem: {
        "a:roleId": {
          component: "AInput",
          label: "普通输入框",
          value: "",
          props: {
            placeholder: "请输入字典名称",
          },
          filter: true,
        },
        "b:userName": {
          label: "AAutoComplete",
          component: "AAutoComplete",
          value: "",
          props: {
            options: [
              {
                text: "a",
                value: "1",
              },
              {
                text: "b",
                value: "2",
              },
              {
                text: "c",
                value: "3",
              },
            ],
          },
          search: true,
          filter: false,
        },
        c: {
          label: "ACascader",
          component: "ACascader",
          value: [],
          props: {
            options: [
              {
                label: "a",
                value: "1",
                children: [
                  {
                    label: "a",
                    value: "1",
                  },
                ],
              },
              {
                label: "b",
                value: "2",
              },
              {
                label: "c",
                value: "3",
              },
            ],
          },
          filter: true,
        },
        d: {
          label: "ACheckbox",
          component: "ACheckbox",
          value: false,
          filter: true,
        },
        e: {
          label: "ACheckboxGroup",
          component: "ACheckboxGroup",
          value: ["1"],
          props: {
            options: [
              {
                label: "Apple",
                value: "1",
              },
              {
                label: "Pear",
                value: "2",
              },
              {
                label: "Orange",
                value: "3",
              },
            ],
          },
          filter: true,
        },
        f: {
          label: "ADatePicker",
          component: "ADatePicker",
          value: "",
          filter: true,
        },
        g: {
          label: "AMonthPicker",
          component: "AMonthPicker",
          value: "",
          filter: true,
        },
        h: {
          label: "ARangePicker",
          component: "ARangePicker",
          value: [],
          filter: true,
        },
        i: {
          label: "AWeekPicker",
          component: "AWeekPicker",
          value: "",
          filter: true,
        },
        j: {
          label: "ATextarea",
          component: "ATextarea",
          value: "",
          filter: true,
        },
        k: {
          label: "AInputSearch",
          component: "AInputSearch",
          value: "",
          filter: true,
        },
        l: {
          label: "AInputNumber",
          component: "AInputNumber",
          value: 0,
          filter: true,
        },
        m: {
          label: "AMentions",
          component: "AMentions",
          value: "2",
          props: {
            options: [
              {
                label: "Apple",
                value: "1",
              },
              {
                label: "Pear",
                value: "2",
              },
              {
                label: "Orange",
                value: "3",
              },
            ],
          },
          filter: true,
        },
        n: {
          label: "ARadio",
          component: "ARadio",
          value: false,
          filter: true,
        },
        o: {
          label: "ARadioGroup",
          component: "ARadioGroup",
          value: "2",
          props: {
            options: [
              {
                label: "Apple",
                value: "1",
              },
              {
                label: "Pear",
                value: "2",
              },
              {
                label: "Orange",
                value: "3",
              },
            ],
          },
          filter: true,
        },
        p: {
          label: "ARate",
          component: "ARate",
          value: 2,
          filter: true,
        },
        q: {
          label: "ASelect",
          component: "ASelect",
          value: "",
          props: {
            options: [
              {
                label: "--请选择--",
                value: "",
              },
              {
                label: "Apple",
                value: "1",
              },
              {
                label: "Pear",
                value: "2",
              },
              {
                label: "Orange",
                value: "3",
              },
            ],
          },
          filter: true,
        },
        r: {
          label: "ASelect 多选",
          component: "ASelect",
          value: [],
          props: {
            mode: "multiple",
            options: [
              {
                label: "Apple",
                value: "1",
              },
              {
                label: "Pear",
                value: "2",
              },
              {
                label: "Orange",
                value: "3",
              },
            ],
          },
          filter: true,
        },
        s: {
          label: "ASlider",
          component: "ASlider",
          value: 44,
          filter: true,
        },
        t: {
          label: "ASwitch",
          component: "ASwitch",
          value: true,
          filter: true,
        },
        u: {
          label: "ATimePicker",
          component: "ATimePicker",
          value: "",
          filter: true,
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
          filter: true,
        },
      },
      columns: [
        { title: "AInput", dataIndex: "a" },
        { title: "AAutoComplete", dataIndex: "b" },
        { title: "ACascader", dataIndex: "c" },
        { title: "ACheckbox", dataIndex: "d" },
        { title: "ACheckboxGroup", dataIndex: "e" },
        { title: "ADatePicker", dataIndex: "f" },
        { title: "AMonthPicker", dataIndex: "g" },
        { title: "ARangePicker", dataIndex: "h" },
        { title: "AWeekPicker", dataIndex: "i" },
        { title: "ATextarea", dataIndex: "j" },
        { title: "AInputSearch", dataIndex: "k" },
        { title: "AInputNumber", dataIndex: "l" },
        { title: "AMentions", dataIndex: "m" },
        { title: "ARadio", dataIndex: "n" },
        { title: "ARadioGroup", dataIndex: "o" },
        { title: "ARate", dataIndex: "p" },
        { title: "ASelect", dataIndex: "q" },
        { title: "ASelect", dataIndex: "r" },
        { title: "ASlider", dataIndex: "s" },
        { title: "ASwitch", dataIndex: "t" },
        { title: "ATimePicker", dataIndex: "u" },
        { title: "ATreeSelect", dataIndex: "v" },
        {
          title: "操作",
          key: "operation",
          slots: { customRender: "operation" },
        },
      ]
    });

    tablePageConfig.dataSource = async (params) => {
      console.log("params", params);
      let { data } = await api.get(
        "./src/components/TablePage/data/list.json",
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

