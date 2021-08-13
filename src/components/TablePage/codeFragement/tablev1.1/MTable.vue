<!--v1.1
1.分页
2.查询
-->
<template>
  <div class="search-wrapper">
    <slot name="search">
      <a-form layout="inline" @keyup.enter="searchQuery" v-if="formItemDeal.length > 0">
        <!-- 大屏手机2个 ipad 3个 电脑4个 搜索框 -->
        <!-- xs sm md lg xl xxl -->
        <template v-for="item in formItemDeal" :key="item.p.name">
          <a-form-item v-bind="item.p">
            <!--check的checked处理-->
            <template v-if="checkedComponents.includes(item.component)">
              <component
                :is="item.component"
                v-model:checked="queryParam[item.p.name]"
                v-bind="item.s"
              ></component>
            </template>
            <!--a-mentions的a-mentions-option处理-->
            <template v-else-if="item.component === 'a-mentions'">
              <component
                :is="item.component"
                v-model:checked="queryParam[item.p.name]"
                v-bind="item.s"
              >
                <a-mentions-option
                  v-for="sItem of item.s.options"
                  :key="sItem.value"
                  :value="sItem.value"
                >
                  {{ sItem.label }}
                </a-mentions-option>
              </component>
            </template>
            <!--default-->
            <template v-else>
              <component
                :is="item.component"
                v-model:value="queryParam[item.p.name]"
                v-bind="item.s"
              />
            </template>
          </a-form-item>
        </template>
        <a-form-item>
          <a-button type="primary" @click="searchQuery">
            <SearchOutlined />
            查询</a-button
          >
          <a-button type="primary" @click="searchReset" style="margin-left: 8px">
            <ReloadOutlined />
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
      :dataSource="data"
      @change="pagingChange"
      v-bind="opts"
    >
      <!--这里做插槽转发  把外层插槽在内部slot接收，外层包裹传递过来的在传入a-table插件  因为这里用了这种  所以不支持a-table-column-group组件了-->
      <template v-for="item in renderSlots" #[item]="res">
        <slot :name="item" v-bind="res"></slot>
      </template>

      <template #filterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
        <div style="padding: 8px">
          <a-input
            ref="searchInput"
            :placeholder="`Search ${column.dataIndex}`"
            :value="selectedKeys[0]"
            style="width: 188px; margin-bottom: 8px; display: block"
            @change="(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])"
            @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
          />
          <a-button
            type="primary"
            size="small"
            style="width: 90px; margin-right: 8px"
            @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
          >
            <template #icon><SearchOutlined /></template>
            Search
          </a-button>
          <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">
            Reset
          </a-button>
        </div>
      </template>

      <slot></slot>
    </a-table>
  </div>
</template>

<script>
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { merge, cloneDeep, isEmpty, isBoolean, isNumber } from 'lodash'

const checkedComponents = ['a-checkbox', 'a-radio', 'a-switch']
//外界可以导出修改配置
export const _defaultTable = {
  rowKey: 'id',
  pagination: {
    pageSize: 10,
    current: 1,
    total: 0
  },
  //自定义分页传参的key
  pageKey: {
    current: 'pageNo',
    pageSize: 'page_size'
  }
}
export default {
  components: {
    SearchOutlined,
    ReloadOutlined
  },
  props: {
    formItem: {
      type: Object,
      default() {
        return {}
      }
    },
    dataSource: {
      type: [Function, Array],
      default() {
        return []
      }
    }
  },
  data: function () {
    return {
      //第一次进入
      firstInto: true,
      queryParam: null,
      pagination: false,
      loading: false,
      data: [],
      opts: {},
      checkedComponents
    }
  },
  methods: {
    initSearch() {
      let query = {}
      //拼接form查询参数
      let formItem = cloneDeep(this.formItem)

      Object.keys(formItem).forEach((key) => {
        let o = formItem[key]
        query[key] = o.value
      })
      this.queryParam = query
      this.initPagination()
    },
    initPagination() {
      if (this.opts.pagination == false) {
        this.pagination = false
        return
      }
      //重置分页参数
      this.pagination = cloneDeep(this.opts.pagination)
      //查询
      this.queryParam.current = this.pagination.current
      this.queryParam.pageSize = this.pagination.pageSize
    },
    pagingChange({ current }) {
      this.queryParam.current = current
      this.pagination.current = current
      this.list()
    },
    searchQuery() {
      this.pagination.current = 1
      this.queryParam.current = 1
      this.list()
    },
    searchReset() {
      this.initPagination()
      //重置参数
      this.initSearch()
    },
    async list() {
      if (Array.isArray(this.dataSource)) {
        this.data = this.dataSource
        return
      }
      this.loading = true
      let [data, total] = await this.dataSource(this.queryParamDeal)
      this.data = data
      if (this.pagination) this.pagination.total = total ?? false
      this.loading = false
    }
  },
  computed: {
    formItemDeal() {
      //测试修改子项会重新渲染吗
      let arr = []
      let res = cloneDeep(this.formItem)
      Object.keys(res).forEach((key) => {
        let o = res[key],
          p
        let props = o.props || {}
        let component = transfUnderline(o.component)
        delete o.props
        delete o.component
        delete o.value
        p = { name: key, ...o }
        //小优化
        optimize(component, p, props)
        arr.push({
          p,
          component,
          s: props
        })
      })
      //[ { "p": { "name": "a", "label": "字典名称" }, "component": "a-input", "s": { "placeholder": "请输入字典名称" } } ]
      return arr
    },
    queryParamDeal() {
      //1.处理分页参数[current,pageSize] -->this.pageKey.current,this.pageKey.pageSize  处理传出去的参数
      //2.过滤空数据
      let res = cloneDeep(this.queryParam)
      let { current, pageSize } = res
      delete res.current
      delete res.pageSize
      res[this.opts.pageKey.current] = current
      res[this.opts.pageKey.pageSize] = pageSize
      let result = {}
      //过滤Boolean和Number非空的数据
      Object.keys(res).forEach((key) => {
        let v = res[key]
        if (!(!isBoolean(v) && !isNumber(v) && isEmpty(v))) {
          result[key] = v
        }
      })
      return result
    },
    renderSlots() {
      //排除当前的坑位全部循环的加
      let currSolt = Object.keys(this.$slots)
      let exclude = ['search', 'page-opts', 'table-operator']
      return currSolt.filter((v) => !exclude.includes(v))
    }
  },
  watch: {
    formItem: {
      handler: 'initSearch',
      deep: true
    },
    dataSource: {
      handler() {
        if (this.firstInto) {
          this.opts = merge({}, _defaultTable, this.$attrs)
          this.initSearch()
          this.list()
          this.firstInto = false
        } else {
          //第二次进来不需要初始化查询和分页参数
          this.list()
        }
      },
      immediate: true
    }
  }
}
//驼峰转下划线
function transfUnderline(str) {
  return str.replace(/([A-Z])/g, function (_val, group, index, _allText) {
    let v = group.toLowerCase()
    return index == 0 ? v : '-' + v
  })
}
function optimize(component, p, s) {
  //placeholder
  if (
    ['a-input', 'a-auto-complete', 'a-textarea', 'a-input-search', 'a-mentions'].includes(component)
  ) {
    s.placeholder = s.placeholder ?? `请输入${p.label}`
  }
  if (~component.indexOf('select') || component === 'a-cascader') {
    s.placeholder = s.placeholder ?? `请选择${p.label}`
  }
}

</script>
<style lang="less" scoped>
//好处根据内容自动宽度，弊端：会使columns设置width无效，解决：自定义插槽外层加样式white-space: normal;
:deep .ant-table td {
  white-space: nowrap;
}
:deep .ant-table th {
  white-space: nowrap;
}
:deep .ant-table-body {
  overflow-x: auto;
}

:deep .ant-form label {
  font-size: 12px;
}
:deep .search-wrapper {
  //开启GPU渲染加速 局部重绘
  transform: translateZ(0);
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
:deep .table-operator {
  margin-bottom: 8px;
  .ant-btn {
    margin: 0 8px 8px 0;
  }
}
:deep .ant-select,
.ant-slider {
  min-width: 180px;
}
</style>
