import { merge, cloneDeep, isEmpty, isBoolean, isNumber } from "lodash";
import { defineComponent, toRefs, reactive, shallowReactive, watch, computed, unref } from "vue";//可以导出并设置初始值

export const _defaultTable = {
    rowKey: "id",
    pagination: {
        pageSize: 10,
        current: 1,
        total: 0,
        showTotal: (total, range) => `${range[0]}-${range[1]} 共${total}条`
    },
    //自定义分页传参的key
    pageKey: {
        current: "pageNo",
        pageSize: "page_size",
    },
};

const cache = {
    preQuery: null,//上一次的查询条件,为了减少相同条件重复请求
    query: null//第一次格式化的查询条件,保留第一次进来的默认值，方便重置回初始值
};
const defaultSolts = ["search", "search-after", "toolbar"]
export function createdStore(props, context) {
    let state = reactive({
        query: {},
        loading: false,
        data: [],
        opts: {},
        slots: computed(() => Object.keys(context.slots).filter(v => !defaultSolts.includes(v))),
        cache,
        formItem: props.formItem,
        renderFormItem: []
    });
    //处理参数
    state.opts = merge({}, _defaultTable, context.attrs, props);
    return state
}