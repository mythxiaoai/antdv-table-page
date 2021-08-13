<template>
  <div style="padding: 15px">
    <a-card :bordered="false">
      <m-table v-bind="tablePageConfig">
        <template #table-operator>
          <a-button><PlusOutlined />添加</a-button>
          <a-button><DownloadOutlined />导出</a-button>
        </template>
        <template #widthDeal="{text}">
          <div style="width:200px;white-space: normal;">
            {{text}}
          </div>
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
      </m-table>
    </a-card>
  </div>
</template>
<script>
import { ref, reactive, shallowRef, unref, computed, h, defineComponent } from 'vue'
import getAxios from '@utils/http/index'
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import MTable from './MTable.vue'
let { api } = getAxios({ baseURL: 'http://mars-yapi.patpat.shop/mock/13' })

export default {
  components: {
    MTable,
    PlusOutlined,
    DownloadOutlined
  },
  created() {
    this.tablePageConfig.dataSource = async (params) => {
      console.log("params",params);
      let { data } = await api.get('/list', params);
      return [data.list, data.total]
    }
  },
  mounted() {},
  data: function () {
    return {
      tablePageConfig: {
        formItem: [
          {
            component: 'a-input',
            options: {
              label: '字典名称',
              prop: 'dictName',
              defaultValue: ''
            },
            attrs: {
              placeholder: '请输入字典名称'
            },
            on: {}
          },
          {
            component: 'a-input',
            options: {
              label: '字典编号',
              prop: 'dictName',
              defaultValue: ''
            },
            attrs: {
              placeholder: '请输入字典编号'
            },
            on: {}
          }
        ],
        columns: [
          { title: '姓名', dataIndex: 'name' },
          { title: 'longChar', dataIndex: 'longChar' },
          { title: 'longChar2', dataIndex: 'longChar2',slots: { customRender: 'widthDeal' }},
          { title: 'time', dataIndex: 'time' },
          {
            title: '操作',
            key: 'operation',
            slots: { customRender: 'operation' }
          }
        ]
      },
      queryParam: {
        dictName: '',
        dictCode: ''
      },
      dataSource: []
    }
  },
  methods: {},
  computed: {},
  watch: {}
}
</script>
<style scoped lang="less">
</style>
<style lang="less" scoped>
</style>
