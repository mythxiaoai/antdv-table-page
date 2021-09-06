# 整体介绍
TablePage 是在ant-desgin-vue组件的基础上封装

适用场景是表格页面布局，支持，查询，分页,过滤等功能

![效果呈现](https://github.com/mythxiaoai/antdv-table-page/blob/main/src/assets/show.png)

# 使用
```
yarn install
yarn dev
```
# 文件说明
如果需要使用移植
- filter.js //过滤功能
- index.js  //入口文件
- search.js //查询功能
- store.js  //数据管理
- Table.vue //主文件

> 其他文件说明
- /test
组件demo

# 功能
1. 查询 [✔]
2. 表格二次筛选 [✔]
3. 自适应列宽(根据内容自适应宽度而不用每个列配置width) [✔]
4. 分页参数自动携带(分页与请求解耦,妈妈再也不用担心Page小九九了) [✔]
5. 数据默认值配置(可配置默认参数_defaultTable,让表格组件整体统一) [✔]
6. 查询，二次筛选，几乎支持ant-desgin全表单控件21个表单控件的支持，组件配置共享(a-transfer和a-upload不支持) [✔]
7. 几乎全部支持原本ant-table所有配置 [✔]

# 使用
## 默认配置
```
//store.js  可以在Table.vue中导出更改也是OK的  一次配置  多次生效
export const _defaultTable = {
  //自动配置唯一key
  rowKey: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  },
  //表格边框
  bordered: true,
  //分页参数
  pagination: {
    pageSize: 10,
    current: 1,
    total: 0,
    showTotal: (total, range) => `${range[0]}-${range[1]} 共${total}条`
  },
  //自定义分页传参的key  如果你的list列表传入的值不一样请修改这个配置
  pageKey: {
    current: 'pageNo',
    pageSize: 'page_size'
  },
  //高度自动计算，为了达到横向滚动条始终在页面可视范围内，方便横向滚动条拖拽
  height: 'auto'
}

```
## props
> 只写改装的属性，其他与a-table一致
> https://2x.antdv.com/components/table-cn

- dataSource [Function, Array]
  - Function  (params:object):[list:string, total:number]
    - params 查询参数的回调
    - list 返回数组第一个是数组
    - total 分页需要用的总数量
  - Array [obj] 表格需要的数据
```
this.tablePageConfig.dataSource = async (params) => {
    console.log('params', params)
    let { data } = await api.get('/list', params)
    return [data.list, data.total]
}
```
- formItem:Object 按照下面例子讲解
  - 整体a的外层除了 component value props filter 其他配置加上外层的key会作为AFormItem的v-bind绑定,里层props会作为子组件的属性绑定
  - Key(a):作为key 意义与columns的dataIndex对应 查询的query会携带a:XX 也会作为AFormItem的name属性绑定，如果含有：会以冒号后面userId作为query携带，如果search:"userInfo"会以这个优先级有限，query的优先级，里层的serarch:"key" > "a:userId"的userId > "a:userId"的a
  - component：表单控件用什么组件渲染,内部用vue提供的component组件去实现的 支持全ant表单控件(21个)"AInput"或"a-input"都支持
  - value：初始值 不同的控件初始值需要注意下
  - props: 表单控件的属性直接v-bind绑定  也就是说事件也是支持的 eg:onClick
  - search true|false 是否查询表格，如果有写key则默认查询true
  - filter true|false 是否过滤  与查询互斥
```
a:userId: {
    label: 'AInput',
    component: 'AInput',
    value: '',//默认值
    props: {
        placeholder: '请输入字典名称'//不加默认会加上 请输入 + label
    },
    search:true
    filter:true
}
```
- height:String "auto"
    - 高度自动计算，为了达到横向滚动条始终在页面可视范围内，方便横向滚动条拖拽
## slots
- search 自定义查询 {query} 查询query拓展  需要在formItem上加上初始化值 key:{value:""}
- search-after 自定义查询后面的表单控件 {query} 查询query拓展  需要在formItem上加上初始化值 key:{value:""}  并手动调用实例的searchQuery方法  详情看search-after  "只看我"
- toolbar 自定义查询 {query} 查询query拓展 表格按钮操作栏  方便做导出

## 方法
- reflush 刷新(不会重置分页)
- search 重新调用查询方法(会重置分页)
- searchReset 重置
- pagingChange({curremt}) 跳转到指定页

## 调用事例

```
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
```
# 写在最后
原本计划是准备加上编辑和导出功能的，卡在编辑的回显，多表格需要做兼容回显过于繁琐，考虑到投入产出比，决定只做这两个功能，编辑功能完成70%感兴趣可以看下edit分支。