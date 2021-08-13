<template>
  <div style="padding: 15px">
    <a-card :bordered="false">
      <a-table v-bind="tablePageConfig">
        <template #table-operator>
          <a-button><PlusOutlined />添加</a-button>
          <a-button><DownloadOutlined />导出</a-button>
        </template>
        <template #operation="{ text, record, index }">
          <a @click="handleUpdate(text)"> 修改 </a>
          <!-- <a-icon type="edit" /> -->
          <a-divider type="vertical" />
          <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(text.id)">
            <a> 删除 </a>
            <!-- <a-icon type="delete" /> -->
          </a-popconfirm>
        </template>

        <template #filterDropdown="{ column, confirm }">
          <div style="padding: 8px">
            <!-- { "prefixCls": "ant-dropdown-custom", "selectedKeys": [], "visible": true, "column": { "title": "姓名", "dataIndex": "name", "placeholder": "请输入字典名称" } } -->
            <!-- {{aaa}} ant-design-vue\es\table\filterDropdown.js @296-->
            <!-- setSelectedKeys 设置setSelectedKeys方法-->
            <!-- 得到selectedKeys数据-->
            <!-- confirm 关闭下拉框 更新 触发onFilter事件-->
            <!-- clearFilters 清空setSelectedKeys-->
            <!-- column 当前的数据-->

            <a-input
              :placeholder="`查询${column.title}`"
              v-model:value="searchText"
              style="width: 188px; margin-bottom: 8px; display: block"
              @pressEnter="handleSearch(confirm)"
            />
            <a-button
              type="primary"
              size="small"
              style="width: 90px; margin-right: 8px"
              @click="handleSearch(confirm)"
            >
              <SearchOutlined />查询
            </a-button>
            <a-button size="small" style="width: 90px" @click="handleReset(column,confirm)">
              <ReloadOutlined />重置
            </a-button>
          </div>
        </template>
        <template #filterIcon>
          <FilterFilled :style="{ color: searchText ? '#108ee9' : undefined }"></FilterFilled>
        </template>
      </a-table>
    </a-card>
  </div>
</template>
<script>
import { ref } from 'vue'
import getAxios from '@utils/http/index'
import {
  PlusOutlined,
  DownloadOutlined,
  SearchOutlined,
  FilterFilled,
  ReloadOutlined
} from '@ant-design/icons-vue'
import MTable from '../../MTable.vue'
let { api } = getAxios({ baseURL: 'http://mars-yapi.patpat.shop/mock/13' })
import moment from 'moment'
export default {
  components: {
    MTable,
    PlusOutlined,
    DownloadOutlined,
    SearchOutlined,
    FilterFilled,
    ReloadOutlined
  },
  async created() {
    let { data } = await api.get('/list')
    this.tablePageConfig.dataSource = data.list
  },
  mounted() {},
  data: function () {
    return {
      tablePageConfig: {
        formItem: {
          a: {
            component: 'AInput', //或者 a-input
            label: '普通输入框',
            value: '', //默认值
            filter: true //是否过滤
          }
        },
        columns: [
          {
            title: '姓名',
            dataIndex: 'name',
            placeholder: '请输入字典名称', //不加默认会加上 请输入 + label
            slots: {
              filterDropdown: 'filterDropdown',
              filterIcon: 'filterIcon'
            },
            onFilterDropdownVisibleChange: (visible) => {
              console.log(visible)
              if (visible) {
                //获取焦点
              } else {
                //查询
                //当点击确定和移开和重置都会触发
                console.log("触发查询")
                //新老值没发生变化就不触发查询
              }
            }
          },
          { title: 'longChar', dataIndex: 'longChar' },
          { title: 'longChar2', dataIndex: 'longChar2' },
          { title: 'time', dataIndex: 'time' },
          {
            title: '操作',
            key: 'operation',
            slots: { customRender: 'operation' }
          }
        ]
      },
      searchText: ''
    }
  },
  methods: {
    handleSearch(close) {
      close()
    },
    handleReset(column, close) {
      close()
      this.searchText = "";
    }
  },
  computed: {},
  watch: {}
}
</script>
<style scoped lang="less">
</style>
<style lang="less" scoped>
</style>
