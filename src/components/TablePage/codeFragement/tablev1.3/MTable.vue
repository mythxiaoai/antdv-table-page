<!--  1.3 单元格编辑，遇到的问题，1.初始值的赋予与表格需要的回显问题，2. 不同表单事件触发的事件不同 3.数据格式化插槽的占用的解决方案format-->
<template>
  <div class="m-table search-wrapper">
    <slot name="search" :query="query">
      <!-- <p>query:{{ query }}</p> -->
      <!--<p>searchFormItem:{{ searchFormItem }}</p>
      <p>filterFormItem:{{ filterFormItem }}</p>
      <p>editFormItem:{{ editFormItem }}</p>
      <p>opts:{{ opts }}</p>
      <p>editTitleSlots:{{ editTitleSlots }}</p>
      <p>renderSlots:{{ renderSlots }}</p>
      <p>editableData:{{ editableData }}</p>
      <p>data:{{ data }}</p>  -->
      <!--search start-->
      <a-form layout="inline" @keyup.enter="search" v-if="searchFormItem.length > 0">
        <template v-for="item in searchFormItem" :key="item.p.name">
          <a-form-item v-bind="item.p">
            <!--check的checked处理-->
            <template v-if="checkedComponents.includes(item.component)">
              <component
                :is="item.component"
                v-model:checked="query[item.p.name]"
                v-bind="item.s"
              ></component>
            </template>
            <!--a-mentions的a-mentions-option处理-->
            <template v-else-if="item.component === 'a-mentions'">
              <component :is="item.component" v-model:value="query[item.p.name]" v-bind="item.s">
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
              <component :is="item.component" v-model:value="query[item.p.name]" v-bind="item.s" />
            </template>
          </a-form-item>
        </template>
        <a-form-item>
          <a-button type="primary" @click="search">
            <SearchOutlined />
            查询
          </a-button>
          <a-button type="primary" @click="searchReset" style="margin-left: 8px">
            <ReloadOutlined />
            重置
          </a-button>
        </a-form-item>
        <slot name="search-after" :query="query"></slot>
      </a-form>
    </slot>
    <!--end search-->
    <div class="table-operator" style="border-top: 5px">
      <slot name="table-operator"></slot>
    </div>

    <!--表格页面插槽-->
    <slot name="page-opts"></slot>
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

      <!--filter start -->
      <template #_filterIcon="{ column }">
        <FilterFilled :style="getColor(column.dataIndex)"></FilterFilled>
      </template>
      <template #_filterDropdown="{ column, confirm }">
        <div class="m-filter" style="padding: 8px">
          <!--component start-->
          <template v-if="checkedComponents.includes(filterFormItem[column.dataIndex].component)">
            <component
              :is="filterFormItem[column.dataIndex].component"
              v-model:checked="query[column.dataIndex]"
              v-bind="filterFormItem[column.dataIndex].s"
            ></component>
          </template>
          <!--a-mentions的a-mentions-option处理-->
          <template v-else-if="filterFormItem[column.dataIndex].component === 'a-mentions'">
            <component
              :is="filterFormItem[column.dataIndex].component"
              v-model:value="query[column.dataIndex]"
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
              ref="filterRef"
              :is="filterFormItem[column.dataIndex].component"
              v-model:value="query[column.dataIndex]"
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
      <!--end filter-->

      <!--edit slot -->
      <template v-for="item of editTitleSlots" #[item.slot] :key="item.slot">
        {{ item.title }} <EditOutlined />
      </template>
      <template v-for="item of editSlots" #[item.slot]="{ text, index }" :key="item.slot">
        <div v-if="index == editableData.index && item.key == editableData.key">
          <!-- <a-input
            v-model:value="editableData.record[editableData.key]"
            @blur="save2(text)"
            @pressEnter="save1()"
          /> -->
          <!-- @change="save(editableData.key,text)" -->

          <!--component start-->
          <template v-if="checkedComponents.includes(editFormItem[editableData.key].component)">
            <component
              :is="editFormItem[editableData.key].component"
              v-model:checked="editableData.record[editableData.key]"
              @pressEnter="save"
              v-bind="editFormItem[editableData.key].s"
            ></component>
          </template>
          <!--a-mentions的a-mentions-option处理-->
          <template v-else-if="editFormItem[editableData.key].component === 'a-mentions'">
            <component
              :is="editFormItem[editableData.key].component"
              v-model:value="editableData.record[editableData.key]"
              @pressEnter="save"
              v-bind="editFormItem[editableData.key].s"
            >
              <a-mentions-option
                v-for="sItem of editFormItem[editableData.key].s.options"
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
              :is="editFormItem[editableData.key].component"
              v-model:value="editableData.record[editableData.key]"
              @pressEnter="save"
              v-bind="editFormItem[editableData.key].s"
            />
          </template>
          <!--end component-->
        </div>
        <div v-else>
          {{ text }}
        </div>
      </template>
      <!--end edit -->

      <slot></slot>
    </a-table>
  </div>
</template>

<script>
import { SearchOutlined, ReloadOutlined, FilterFilled, EditOutlined } from '@ant-design/icons-vue'
import { merge, cloneDeep, isEmpty, isBoolean, isNumber, debounce } from 'lodash'
import { markRaw } from 'vue'
//配置快照 用来恢复选项值
let formItemO = {}
//用来比对是否过滤修改 减少请求次数
let prequery = ''
//编辑数据做对比 减少请求次数
let preEditableData = {}

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
    current: 'page',
    pageSize: 'page_size'
  }
}
export default {
  components: {
    SearchOutlined,
    ReloadOutlined,
    FilterFilled,
    EditOutlined
  },
  emit: ['save'],
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
      query: null,
      pagination: false,
      loading: false,
      data: [],
      opts: {},
      checkedComponents,
      editTitleSlots: null, //编辑title插槽
      editSlots: null, //编辑插槽
      editableData: {
        key: '',
        record: {},
        index: 0
      },
      searchFormItem: [],
      filterFormItem: {},
      editFormItem: {}
    }
  },
  methods: {
    initSearch() {
      let query = {} //查询
      let editTitleSlots = [] //编辑头插槽
      let editSlots = [] //编辑插槽
      //拼接form查询参数
      let formItem = cloneDeep(this.formItem)
      Object.keys(formItem).forEach((key) => {
        let o = formItem[key]
        query[key] = o.value
        //component
        if (!o.component) {
          delete this.formItem[key]
        }

        if (o.edit) {
          editTitleSlots.push({
            title: this.opts.columns.find((v) => v.dataIndex == key)?.title,
            slot: `_editTitle-${key}`
          })
          editSlots.push({
            key,
            slot: `_edit-${key}`
          })
        }
      })
      this.query = query
      this.editTitleSlots = editTitleSlots
      this.editSlots = editSlots
      this.initPagination()
      this.initOpts()
    },
    initPagination() {
      if (this.opts.pagination == false) {
        this.pagination = false
        return
      }
      //重置分页参数
      this.pagination = cloneDeep(this.opts.pagination)
      //查询
      this.query.current = this.pagination.current
      this.query.pageSize = this.pagination.pageSize
    },
    pagingChange({ current }) {
      this.query.current = current
      this.pagination.current = current
      this.list()
    },
    search() {
      this.pagination.current = 1
      this.query.current = 1
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
      let [data, total] = await this.dataSource(this.queryDeal)
      data.forEach((v) => {
        markRaw(v)
      })
      this.data = data
      if (this.pagination) this.pagination.total = total ?? false
      this.loading = false
      //记录
      prequery = JSON.stringify(this.query)
    },
    filterSearch(close) {
      close()
    },
    filterReset(column, close) {
      this.query[column.dataIndex] = formItemO[column.dataIndex].value
      close()
    },
    getColor(key) {
      let v = this.query[key]
      let res = false
      if (!(!isBoolean(v) && !isNumber(v) && isEmpty(v))) {
        res = true
      }
      return { color: res ? '#108ee9' : undefined }
    },
    save() {
      if (
        this.editableData.record[this.editableData.key] ==
        preEditableData.record[preEditableData.key]
      ) {
        // console.log('值无变化，不触发')
      } else {
        // console.log('保存')
        this.$emit('save', cloneDeep(this.editableData))
      }
      this.editableData.key && this.save1()
    },
    save1() {
      this.editableData = {
        key: '',
        record: {},
        index: 0
      }
    },
    edit(key, record, index) {
      this.editableData = {
        key,
        record: cloneDeep(record),
        index
      }
      preEditableData = cloneDeep(this.editableData)
    },
    initOpts() {
      this.searchFormItem = this.searchFormItemDeal()
      this.filterFormItem = this.filterFormItemDeal()
      this.editFormItem = this.editFormItemDeal()
    },
    searchFormItemDeal() {
      let res = commDealformItem(this.formItem)
      return res.filter((v) => {
        let result = !!v.filter
        delete v.filter
        delete v.edit
        return !result
      })
    },
    filterFormItemDeal() {
      let res = commDealformItem(this.formItem)
      let columns = cloneDeep(this.opts.columns)
      //要在对应的columns加配置
      this.opts.columns = columns.map((v) => {
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
              if (prequery !== JSON.stringify(this.query)) {
                this.search()
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
    editFormItemDeal() {
      let res = commDealformItem(this.formItem)
      let columns = cloneDeep(this.opts.columns)
      // 要在对应的columns加配置
      this.opts.columns = columns.map((v) => {
        if (this.formItem[v.dataIndex]?.edit) {
          v.slots = v.slots ? v.slots : {}
          v.slots.customRender = `_edit-${v.dataIndex}`
          v.slots.title = `_editTitle-${v.dataIndex}`
          delete v.title
          v.customCell = (record, index) => {
            return {
              onClick: () => {
                this.edit(v.dataIndex, record, index)
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
    }
  },
  computed: {
    queryDeal() {
      //1.处理分页参数[current,pageSize] -->this.pageKey.current,this.pageKey.pageSize  处理传出去的参数
      //2.过滤空数据
      let res = cloneDeep(this.query)
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
<style lang="less" scoped></style>

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
.m-table.search-wrapper .ant-select,
.m-table.search-wrapper .ant-slider {
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
