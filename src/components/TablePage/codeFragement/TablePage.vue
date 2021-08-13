<!--  记录bug   修改运行不需要运行参数 -->
<template>
  <div class="search-wrapper">
    <slot name="search">
      <a-form
        layout="inline"
        @keyup.enter="searchQuery"
        v-if="formItem.length > 0"
      >
        <!-- 大屏手机2个 ipad 3个 电脑4个 搜索框 -->
        <!-- xs sm md lg xl xxl -->
        <a-form-item
          v-for="(item, index) in formItem"
          :label="item.options.label"
          :key="index"
        >
          <!-- el-input -->
          <template v-if="item.component == 'a-input'">
            <component
              :is="item.component"
              v-model="queryParam[item.options.prop]"
              v-bind="item.attrs"
              v-on="item.on"
            ></component>
          </template>
          <!-- el-select -->
          <template v-if="item.component == 'a-select'">
            <component
              :is="item.component"
              v-model="queryParam[item.options.prop]"
              v-bind="item.attrs"
              v-on="item.on"
            >
              <component
                :is="item.children.component"
                v-for="val of item.children.options.data"
                :value="val[item.children.options.valueKey]"
                :key="val[item.children.options.valueKey]"
                v-bind="item.children.attrs"
                v-on="item.children.on"
                >{{ val[item.children.options.titleKey] }}</component
              >
            </component>
          </template>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" @click="searchQuery" icon="search"
            >查询</a-button
          >
          <a-button
            type="primary"
            @click="searchReset"
            icon="reload"
            style="margin-left: 8px"
          >
            重置
          </a-button>
        </a-form-item>
      </a-form>
    </slot>

    <div class="table-operator" style="border-top: 5px">
      <slot name="table-operator"></slot>
    </div>

    <!--表格页面插槽-->
    <slot name="page-opts"></slot>
    <!-- <slot name="operation" :data="{id:1}"></slot> -->
    <a-table
      ref="table"
      rowKey="id"
      :pagination="pagination"
      :loading="loading"
      :dataSource="dataSource"
      @change="pagingChange"
      v-bind="$attrs"
    >
      <!--这里做插槽转发  把外层插槽在内部slot接收，外层包裹传递过来的在传入a-table插件  因为这里用了这种  所以不支持a-table-column-group组件了-->
      <template v-for="item in renderSlots" #[item]="text, record, index">
        <slot :name="item" v-bind="{ text, record, index }"></slot>
      </template>

      <slot></slot>
    </a-table>
  </div>
</template>

<script>
const pagination = {
  pageSize: 10,
  current: 1,
  total: 0,
}

let query = {
  pageNo: 1,
  pageSize: 10,
}

export default {
  props: {
    formItem: {
      type: Array,
      default() {
        return []
      },
    },
    getAsyncDate: {
      type: Function,
    },
    //排除form表单项的额外携带的参数
    setHTTParams: {
      type: Object,
      default() {
        return {}
      },
    },
    //设置传递http的分页参数的key是什么
    setHTTPPageKey: {
      type: Object,
      default() {
        return {
          currentPage: 'pageNo',
          pageSize: 'pageSize',
        }
      },
    },
  },
  created() {
    if (
      this.$attrs.dataSource !== undefined ||
      this.$attrs['data-source'] !== undefined
    ) {
      this.dataSource = this.$attrs.dataSource || this.$attrs['data-source']
    }
  },
  data: function () {
    return {
      firstInto: true,
      queryParam: null,
      pagination,
      loading: false,
      dataSource: [],
    }
  },
  methods: {
    changeSlotParams() {
      //暂时没有应用这个方法
      this.renderSlots.forEach((v) => {
        let fn = this.$scopedSlots[v]
        if (!fn) throw new Error(v + '插槽slot已定义，模板上未写写插槽~')
        this.$scopedSlots[v] = function (data) {
          let vals = Object.values(data)
          return fn(...vals)
        }
      })
    },
    initSearch() {
      let query = JSON.parse(JSON.stringify(this.setHTTParams))
      //查询参数
      this.formItem.forEach((v) => {
        let key = v?.options?.prop
        if (key) query[key] = v.options?.defaultValue ?? ''
      })
      this.queryParam = query

      this.initPagination()
    },
    initPagination() {
      if (this.$attrs.pagination === false) {
        this.pagination = false
        return
      }
      let pageNo = this.setHTTParams[this.setHTTPPageKey.currentPage]
      let pageSize = this.setHTTParams[this.setHTTPPageKey.pageSize]

      //重置分页参数
      this.pagination = JSON.parse(JSON.stringify(pagination))
      //查询
      this.queryParam[this.setHTTPPageKey.currentPage] = pageNo ?? query.pageNo
      this.queryParam[this.setHTTPPageKey.pageSize] = pageSize ?? query.pageSize
      //分页
      this.pagination.current = pageNo ?? query.pageNo
      this.pagination.pageSize = pageSize ?? query.pageSize
    },
    pagingChange({ current }) {
      this.queryParam[this.setHTTPPageKey.currentPage] = current
      this.pagination.current = current
      this.list()
    },
    searchQuery() {
      this.queryParam[this.setHTTPPageKey.currentPage] = 1
      this.pagination.current = 1
      this.list()
    },
    searchReset() {
      this.initPagination()
      //重置参数
      this.initSearch()
      //列表
      this.list()
    },
    async list() {
      if (!this.getAsyncDate) {
        this.dataSource = []
        return
      }
      this.loading = true
      this.getAsyncDate(this.queryParam, (data, total) => {
        this.dataSource = data
        if (this.pagination) this.pagination.total = total ?? 0
        this.loading = false
      })
    },
  },
  computed: {
    renderSlots() {
      //组装动态插槽
      let arr = []
      //  slots: { title: 'customTitle' },
      //scopedSlots: { customRender: 'name'  filterDropdown: 'filterDropdown',filterIcon: 'filterIcon',},
      this.$attrs.columns.map((v) => {
        let keys = Object.keys(v)
        if (~keys.indexOf('slots')) {
          v.slots?.title && arr.push(v.slots?.title)
        }
        if (~keys.indexOf('scopedSlots')) {
          v.scopedSlots?.customRender &&
            typeof v.scopedSlots.customRender == 'string' &&
            arr.push(v.scopedSlots.customRender)
          v.scopedSlots?.filterDropdown &&
            typeof v.scopedSlots.filterDropdown == 'string' &&
            arr.push(v.scopedSlots.filterDropdown)
          v.scopedSlots?.filterIcon &&
            typeof v.scopedSlots.filterIcon == 'string' &&
            arr.push(v.scopedSlots.filterIcon)
        }
      })
      //格外做的内部插槽
      //expandedRowRender  折叠slot
      this.$scopedSlots.expandedRowRender && arr.push('expandedRowRender')
      return arr
    },
  },
  watch: {
    formItem: {
      handler: 'initSearch',
      deep: true,
    },
    setHTTParams: {
      handler: 'initSearch',
      deep: true,
    },
    setHTTPPageKey: {
      handler: 'initSearch',
      deep: true,
    },
    getAsyncDate: {
      handler() {
        if (this.firstInto) {
          this.initSearch()
          this.list()
          this.firstInto = false
        } else {
          this.list()
        }
      },
      immediate: true,
    },
  },
}
</script>
<style lang="less" scoped>
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
