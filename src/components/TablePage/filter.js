import { defineComponent, toRefs, reactive, shallowReactive, watch, computed, unref } from "vue";//可以导出并设置初始值
import { merge, cloneDeep, isEmpty, isBoolean, isNumber } from "lodash";

export function useFilter(state) {
  let filterFormItem = computed(() => {
    return state.renderFormItem.filter((v) => {
      return v.filter
    }).reduce((res, next) => ((res[next.p.name] = next), res), {})
  });

  let initFilter = ()=>{
    let columns = cloneDeep(state.opts.columns)
    state.opts.columns = columns.map((v) => {
      return dealChaildren(v, (v) => {
        if (!v.dataIndex) return v
        //  roleName:roleId  columns[]dataIndex "list.roleName"
        let key = Object.keys(state.formItem).find((f) => ~f.indexOf(v.dataIndex.split(".").pop()))
        if (state.formItem[key]?.filter) {
          //先储存全量的key
          v.key = key
          v.slots = v.slots ?? {}
          v.slots.filterDropdown = '_filterDropdown'
          v.slots.filterIcon = '_filterIcon'
          v.onFilterDropdownVisibleChange = (visible) => {
            if (visible) {
              //获取焦点
              console.log("visible");
            } else {
              //查询
              //当点击确定和移开和重置都会触发
              //新老值没发生变化就不触发查询
              if (state.cache.query !== JSON.stringify(state.query)) {
                state.search()
              }
            }
          }
        }
        return v
      })
    })
  }

  return { filterFormItem,initFilter}
}

function dealChaildren(v, cb) {
  if (v.children && v.children.length > 0) {
    v.children = v.children.map((v) => dealChaildren(v, cb))
  }
  v = cb(v)
  return v
}
