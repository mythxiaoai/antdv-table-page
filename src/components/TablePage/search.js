import { defineComponent, toRefs, reactive, shallowReactive, watch, computed, unref } from "vue";//可以导出并设置初始值
import { merge, cloneDeep, isEmpty, isBoolean, isNumber } from "lodash";

export function useSearch(state) {
  let initSearch = () => {
    let query = {}
    let formItem = cloneDeep(state.formItem)
    Object.keys(formItem).forEach((key) => {
      let o = formItem[key]
      //过滤出只加字段的
      if (!o.component) {
        delete state.formItem[key]
      }
      query[key] = o.value || null
    })
    state.query = query
  }
  let searchFormItem = computed(() => {
    return state.renderFormItem.filter((v) => {
      return v.search
    })
  });
  let search = ()=>{
    state.query.current = 1
    state.opts.pagination.current = 1
    state.list()
  }

  let searchReset = ()=>{
    state.initPagination()
    //重置参数
    initSearch()
  }
  return { searchFormItem,initSearch,search,searchReset}
}



