import { defineComponent, toRefs, reactive, shallowReactive, watch, computed, unref } from "vue";//可以导出并设置初始值
import { merge, cloneDeep, isEmpty, isBoolean, isNumber } from "lodash";

export function useSearch(state) {
  let initSearch = () => {
    let query = {}
    state.renderFormItem.forEach((o) => {
      query[o.p.name] = o.value;
    })
    state.query = query
  }
  let searchFormItem = computed(() => {
    return state.renderFormItem.filter((v) => {
      return v.component &&v.search && !v.filter
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
  state.search = search;
  return { searchFormItem,initSearch,search,searchReset}
}



