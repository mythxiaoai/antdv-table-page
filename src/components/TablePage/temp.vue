<!--  记录bug   修改运行不需要运行参数 -->
<template>
  <div class="m-table search-wrapper">
    <slot name="search">
      <p>queryParam:{{ queryParam }}</p>
      <p>searchFormItem:{{ searchFormItem }}</p>
      <p>filterFormItem:{{ filterFormItem }}</p>
      opts:{{ opts }}
      <a-form layout="inline" @keyup.enter="searchQuery" v-if="searchFormItem.length > 0">
        <template v-for="item in searchFormItem" :key="item.p.name">
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
                v-model:value="queryParam[item.p.name]"
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
            查询
          </a-button>
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
      <!--title slot -->
      <template v-for="item of editTitleSlots" #[item.slot] :key="item.slot">
        {{ item.title }} <EditOutlined />
      </template>

      <!--这里做插槽转发  把外层插槽在内部slot接收，外层包裹传递过来的在传入a-table插件  因为这里用了这种  所以不支持a-table-column-group组件了-->
      <template v-for="item in renderSlots" #[item]="res">
        <slot :name="item" v-bind="res"></slot>
      </template>

      <!--过滤-->
      <template #_filterDropdown="{ column, confirm }">
        <div class="m-filter" style="padding: 8px">
          <!--component start-->
          <template v-if="checkedComponents.includes(filterFormItem[column.dataIndex].component)">
            <component
              :is="filterFormItem[column.dataIndex].component"
              v-model:checked="queryParam[column.dataIndex]"
              v-bind="filterFormItem[column.dataIndex].s"
            ></component>
          </template>
          <!--a-mentions的a-mentions-option处理-->
          <template v-else-if="filterFormItem[column.dataIndex].component === 'a-mentions'">
            <component
              :is="filterFormItem[column.dataIndex].component"
              v-model:value="queryParam[column.dataIndex]"
              v-bind="filterFormItem[column.dataIndex].s"
            >
              <a-mentions-option
                v-for="sItem of filterFormItem[column.dataIndex].s.options"
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
              :is="filterFormItem[column.dataIndex].component"
              v-model:value="queryParam[column.dataIndex]"
              v-bind="filterFormItem[column.dataIndex].s"
            />
          </template>
          <!--end component-->

          <div class="opts">
            <a-button type="primary" size="small" @click="filterSearch(confirm)">
              <SearchOutlined />查询
            </a-button>
            <a-button size="small" @click="filterReset(column, confirm)">
              <ReloadOutlined />重置
            </a-button>
          </div>
        </div>
      </template>
      <template #_filterIcon="{ column }">
        <FilterFilled :style="getColor(column.dataIndex)"></FilterFilled>
      </template>
      <!--filter end-->

      <!--edit start-->
      <template #_edit="{ text ,column}">
          <div v-if="editableData[column.dataIndex]" class="editable-cell-input-wrapper">
            <a-input
              v-model:value="editableData[column.dataIndex]"
              @pressEnter="save(column.dataIndex)"
              @blur="save(column.dataIndex)"
            />
          </div>

          <div v-else class="editable-cell-text-wrapper">
            {{ text }}
          </div>
      </template>
      <!--end edit-->
      <slot></slot>
    </a-table>
  </div>
</template>

<script>
import { SearchOutlined, ReloadOutlined, FilterFilled,EditOutlined } from '@ant-design/icons-vue'
import { merge, cloneDeep, isEmpty, isBoolean, isNumber } from 'lodash'
//配置快照 用来恢复选项值
let formItemO = {}
//用来比对是否过滤修改 减少请求次数
let preQueryParam = ''

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
    ReloadOutlined,
    FilterFilled
  },
  emits: ['save'],
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
      checkedComponents,
      editTitleSlots: null, //编辑title插槽
      editableData:{},
    }
  },
  methods: {
    initSearch() {
      let query = {} //查询
      let editTitleSlots = [] //编辑插槽
      //拼接form查询参数
      let formItem = cloneDeep(this.formItem)
      Object.keys(formItem).forEach((key) => {
        let o = formItem[key]
        query[key] = o.value

        if (o.edit) {
          editTitleSlots.push({
            title: o.title,
            slot: `_edit-${key}`
          })
        }
      })
      this.queryParam = query
      this.editTitleSlots = editTitleSlots
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
      //记录
      preQueryParam = JSON.stringify(this.queryParam)
    },
    filterSearch(close) {
      close()
    },
    filterReset(column, close) {
      this.queryParam[column.dataIndex] = formItemO[column.dataIndex].value
      close()
    },
    getColor(key) {
      let v = this.queryParam[key]
      let res = false
      if (!(!isBoolean(v) && !isNumber(v) && isEmpty(v))) {
        res = true
      }
      return { color: res ? '#108ee9' : undefined }
    },
    edit = (key) => {
      this.editableData[key] = cloneDeep(dataSource.value.filter((item) => key === item.key)[0])
    },
    save = (key) => {
      console.log("save",editableData)
    }
  },
  computed: {
    searchFormItem() {
      let res = commDealformItem(this.formItem)
      return res.filter((v) => {
        let result = !!v.filter
        delete v.filter
        delete v.edit
        return !result
      })
    },
    filterFormItem() {
      let res = commDealformItem(this.formItem)
      //要在对应的columns加配置
      this.opts.columns = this.opts.columns.map((v) => {
        if (this.formItem[v.dataIndex]?.filter) {
          v.slots = {
            filterDropdown: '_filterDropdown',
            filterIcon: '_filterIcon'
          }
          v.onFilterDropdownVisibleChange = (visible) => {
            if (visible) {
              //获取焦点
            } else {
              //查询
              //当点击确定和移开和重置都会触发
              //新老值没发生变化就不触发查询
              if (preQueryParam !== JSON.stringify(this.queryParam)) {
                this.searchQuery()
              }
            }
          }
        }
        return v
      })
      res = res.filter((v) => {
        let result = v.filter
        delete v.filter
        delete v.edit
        return result
      })
      //转化成map让模板方便取值
      return res.reduce((res, next) => ((res[next.p.name] = next), res), {})
    },
    editFormItem() {
      let res = commDealformItem(this.formItem)
      //要在对应的columns加配置
      this.opts.columns = this.opts.columns.map((v) => {
        if (this.formItem[v.dataIndex]?.filter) {
          v.slots = {
            customRender: '_edit',
            title: `_edit-${v.dataIndex}`
          }
          v.customCell=(record, rowIndex)=>{
            return {
              onClick:(event)=>{
                this.edit(v.dataIndex)
              }
            }
          }
        }
        return v
      })

      res = res.filter((v) => {
        let result = v.edit
        delete v.filter
        delete v.edit
        return result
      })
      //转化成map让模板方便取值
      return res.reduce((res, next) => ((res[next.p.name] = next), res), {})
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
          //记录初始值
          formItemO = cloneDeep(this.formItem)
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
//公共的处理formItem
function commDealformItem(formItem) {
  let arr = []
  let res = cloneDeep(formItem)
  Object.keys(res).forEach((key) => {
    let o = res[key],
      p
    let props = o.props || {}
    let component = transfUnderline(o.component)
    let filter = o.filter
    let edit = o.edit
    delete o.props
    delete o.component
    delete o.value
    delete o.filter
    delete o.edit
    p = { name: key, ...o }
    //小优化
    optimize(component, p, props)
    arr.push({
      p,
      component,
      s: props,
      filter,
      edit
    })
  })
  //[ { "p": { "name": "a", "label": "字典名称" }, "component": "a-input", "s": { "placeholder": "请输入字典名称" } } ]
  return arr
}
</script>
<style lang="less" scoped>
</style>

<style>
/*很多都是需要:deep穿透  索性直接全局并加上.m-table做约束 */
/* 好处根据内容自动宽度，弊端：会使columns设置width无效，解决：自定义插槽外层加样式white-space: normal; */
/*start m-table*/
.m-table .ant-table td {
  white-space: nowrap;
}
.m-table .ant-table th {
  white-space: nowrap;
}
.m-table .ant-table-body {
  overflow-x: auto;
}
/*end m-table*/

/*search-wrapper start*/
.m-table.search-wrapper .ant-form label {
  /* 开启GPU渲染加速 局部重绘 */
  font-size: 12px;
}
.m-table.search-wrapper {
  /* 开启GPU渲染加速 局部重绘 */
  transform: translateZ(0);
}
.m-table.search-wrapper .ant-form {
  margin-bottom: 15px;
}
.m-table.search-wrapper .ant-form .ant-row .ant-form-item {
  display: flex;
  flex-wrap: nowrap;
}
.m-table.search-wrapper .ant-form .ant-row .ant-form-item .ant-form-item-control-wrapper {
  flex: 1 1 auto;
}
.m-table.search-wrapper
  .ant-form
  .ant-row
  .ant-form-item
  .ant-form-item-control-wrapper
  .ant-form-item-children {
  white-space: nowrap;
}
.m-table.search-wrappe .ant-select,
.m-table.search-wrappe .ant-slider {
  min-width: 180px;
}
/**end search-wrapper */

/**start table-operator */
.m-table .table-operator {
  margin-bottom: 8px;
}
.m-table .table-operator .ant-btn {
  margin: 0 8px 8px 0;
}
/**end  table-operator*/
/*start m-filter */
.m-filter {
  text-align: center;
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
</style>
