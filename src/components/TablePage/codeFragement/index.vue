<template>
  <a-card :bordered="false">
    <table-page v-bind="tablePageConfig">
      <template #table-operator>
        <a-button @click="handleAdd" type="primary" icon="plus">添加</a-button>
      </template>
        <span slot ="operation"  slot-scope = "text,record,index">
          {{text}}-----1<br>
          {{record}}-----2<br>
          {{index}}----3
          <a @click="handleUpdate(text)"> <a-icon type="edit" />修改 </a>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定删除吗?"
            @confirm="() => handleDelete(text.id)"
          >
            <a> <a-icon type="delete" />删除 </a>
          </a-popconfirm>
        </span>
    </table-page>
  </a-card>
</template>

<script>
export default {
  async asyncData({ $http }) {},
  fetch({ store, params }) {},
  created() {
    this.tablePageConfig.getAsyncDate = async (params, next) => {
      let { result } = await this.$http.get("/ststem/sys/dict/list",params)
      next(result.records, result.total)
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
              defaultValue: '',
            },
            attrs: {
              placeholder: '请输入字典名称',
            },
            on: {},
          },
          {
            component: 'a-input',
            options: {
              label: '字典编号',
              prop: 'dictName',
              defaultValue: '',
            },
            attrs: {
              placeholder: '请输入字典编号',
            },
            on: {},
          },
        ],
        getAsyncDate: null,
        columns: [
          { title: '字典名称', dataIndex: 'dictName', key: 'dictName' },
          { title: '字典编号', dataIndex: 'dictCode', key: 'dictCode' },
          { title: '是否启用', dataIndex: 'status', key: 'status' },
          { title: '备注', dataIndex: 'description', key: 'description' },
          {
            title: '操作',
            key: 'operation',
            scopedSlots: { customRender: 'operation' },
          },
        ],
      },
      queryParam: {
        dictName: '',
        dictCode: '',
      },

      innerColumns: [
        { title: '键', dataIndex: 'itemText', key: 'itemText' },
        { title: '值', dataIndex: 'itemValue', key: 'itemValue' },
      ],
      dataSource: [],
    }
  },
  methods: {
    handleAdd() {
      this.$refs.modalForm.visible = true
    },
    handleUpdate(data) {
      this.$refs.modalForm.visible = true
      let result = JSON.parse(JSON.stringify(data))
      //添加一个标记值
      result.statusShow = true
      //修正null数据，如果不是0那么默认都是启动的
      result.status = result.status === 0 ? 0 : 1
      this.$refs.modalForm.form = result
    },
    pagingChange({ current }) {
      this.queryParam.pageNo = current
      this.pagination.current = current
      this.list()
    },
    async handleDelete(id) {
      await this.$http.sys.diction.del([id])
      this.list()
    },
    searchQuery() {
      this.queryParam.pageNo = 1
      this.pagination.current = 1
      this.list()
    },
    searchReset() {
      this.queryParam = {
        dictName: '',
        dictCode: '',
        pageNo: 1,
      }
      this.pagination.current = 1
      this.list()
    },
    async list(next) {
      let { result } = await this.$http.sys.diction.list(this.queryParam)
      next(result.records, result.total)
    },
  },
  computed: {},
  watch: {}
}
</script>
<style scoped lang="less">
</style>
<style lang="less">
.ant-form label {
  font-size: 12px;
}

.search-wrapper {
  form {
    margin-bottom: 15px;
    .ant-row {
      .ant-form-item {
        display: flex;
        flex-wrap: nowrap;
        .ant-form-item-control-wrapper {
          flex: 1 1 auto;
          .ant-form-item-control {
            .ant-form-item-children {
              white-space: nowrap;
            }
          }
        }
      }
    }
  }
}
.table-operator {
  margin-bottom: 8px;
  .ant-btn {
    margin: 0 8px 8px 0;
  }
}
</style>
