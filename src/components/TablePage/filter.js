import { defineComponent, toRefs, reactive, shallowReactive, watch, computed, unref,ref,onMounted,nextTick } from "vue";//可以导出并设置初始值
import { merge, cloneDeep, isEmpty, isBoolean, isNumber } from "lodash";

export function useFilter(state) {
  let filterRef = ref(null)
  let filterFormItem = computed(() => {
    return state.renderFormItem.filter((v) => {
      return v.filter
    }).reduce((res, next) => ((res[next.p.name] = next), res), {})
  });
 
  let initFilter = () => {
    let columns = cloneDeep(state.opts.columns)
    state.opts.columns = columns.map((v) => {
      //做递归  兼容children的多级表头的方式
      return dealChaildren(v, (v) => {
        if (!v.dataIndex) return v
        //  roleName:roleId  columns[]dataIndex:"list.roleName"   roleName ==roleName
        let renderFormItem = state.renderFormItem.find(k => k.p.name.split(":")[0] == v.dataIndex.split(".").pop());
        if (!renderFormItem.component || !renderFormItem.filter) return v;
        //先储存全量的key
        v.key = renderFormItem.p.name
        v.slots = v.slots ?? {}
        v.slots.filterDropdown = '_filterDropdown'
        v.slots.filterIcon = '_filterIcon'
        v.onFilterDropdownVisibleChange = async (visible) => {
          if (visible) {
            await nextTick();
            //获取元素焦点
            state.filterRef.$el.focus?.()
          } else {
            //查询
            //当点击确定和移开和重置都会触发
            //新老值没发生变化就不触发查询
            if (state.cache.preQuery !== JSON.stringify(state.query)) {
              state.search()
            }
          }
        }
        return v
      })
    })
  }
  let getColor = (key) => {
    let v = state.query[key]
    let res = false
    if (!(!isBoolean(v) && !isNumber(v) && isEmpty(v))) {
      res = true
    }
    return { color: res ? '#108ee9' : undefined }
  }
  let filterSearch = close => close()

  let filterReset = (column, close) => {
    state.query[column.key] = state.cache.query[column.key]
    close()
  }
  state.initFilter = initFilter;
  state.filterRef = filterRef;
  return { filterRef,filterFormItem, initFilter, getColor, filterSearch, filterReset }
}

function dealChaildren(v, cb) {
  if (v.children && v.children.length > 0) {
    v.children = v.children.map((v) => dealChaildren(v, cb))
  }
  v = cb(v)
  return v
}
