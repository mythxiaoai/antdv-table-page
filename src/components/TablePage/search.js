import { computed } from 'vue' //可以导出并设置初始值
import { cloneDeep } from 'lodash'

export function useSearch(state) {
  let initSearch = () => {
    let query = {}
    state.renderFormItem.forEach((o) => {
      query[o.p.name] = o.value
    })
    state.query = query
    //记录
    state.cache.query = cloneDeep(query)
  }
  let searchFormItem = computed(() => {
    return state.renderFormItem.filter((v) => {
      //过滤出component为空 因为filter的级别比search需要这样过滤
      return v.component && v.search && !v.filter
    })
  })
  let search = () => {
    state.query.current = 1
    state.opts.pagination.current = 1
    state.list()
  }

  let searchReset = () => {
    state.initPagination()
    //重置参数
    state.query = state.cache.query
  }
  state.search = search
  state.initSearch = initSearch
  return { searchFormItem, search, searchReset }
}
