import { useQuery } from "./query.js"
import { defineComponent, toRefs, reactive,shallowReactive,watch, computed, unref } from "vue";//可以导出并设置初始值
import { merge, cloneDeep, isEmpty, isBoolean, isNumber } from "lodash";
export function useTable(state,props) {
    let { queryComplete } = useQuery(state);
    let initPagination = () => {
        if (state.opts.pagination == false) {
            return;
        }
        //query查询
        state.query.current = state.opts.pagination?.current;
        state.query.pageSize = state.opts.pagination?.pageSize;
    };
    let pagingChange = ({ current }) => {
        state.query.current = current;
        state.opts.pagination.current = current;
        list();
    };
    let list = async () => {
        if (Array.isArray(state.opts.dataSource)) {
            state.data = state.opts.dataSource;
            state.opts.pagination.total = state.opts.dataSource.length;
            return;
        }
        if(!isQueryChange(state.cache.query,unref(queryComplete)))return;
        state.loading = true;
        let [data, total] = await state.opts.dataSource(unref(queryComplete));
        state.loading = false;
        state.data = data;
        if (state.opts.pagination) state.opts.pagination.total = total ?? false;
        //记录
        state.cache.query = cloneDeep(unref(queryComplete))
    };

    watch(() => props.dataSource, (value)=>{
        state.opts.dataSource = value
        list()
    });

    return { list, initPagination, pagingChange }
}

//查询是否改变
function isQueryChange(Oquery,query){
    //如果是空条件查询返回 true  这里只有pageNum  pageSize两个字段
    if(Object.keys(query).length ===2)return true;
    return JSON.stringify(Oquery) !== JSON.stringify(query)
}
