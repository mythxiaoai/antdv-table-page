import { defineComponent, toRefs, reactive, shallowReactive, watch, computed, unref } from "vue";//可以导出并设置初始值
import { merge, cloneDeep, isEmpty, isBoolean, isNumber } from "lodash";
import { useSearch } from "./search.js";
import { useFilter } from "./filter.js";
import moment from 'moment'

export function useTable(state, props) {
    let { initSearch } = useSearch(state);
    let { initFilter } = useFilter(state);
    let queryComplete = computed(
        () => {
            //1.处理分页参数[current,pageSize] -->this.pageKey.current,this.pageKey.pageSize  处理传出去的参数
            //2.过滤空数据
            let res = cloneDeep(state.query);
            let { current, pageSize } = res;
            delete res.current;
            delete res.pageSize;
            res[state.opts.pageKey.current] = current;
            res[state.opts.pageKey.pageSize] = pageSize;
            let result = {};
            //过滤非空的数据
            Object.keys(res).forEach((key) => {
                let v = res[key];
                let keyOperator = "";
                let keyUserSeting = "";
                //非空
                if ((!isBoolean(v) && !isNumber(v) && isEmpty(v))) return
                //对key:的处理
                if (~key.indexOf(':')) {
                    const arr = key.split(':')
                    keyOperator = arr.pop()
                }
                //对search,filter做处理  filter优先级会高一些
                let item = state.renderFormItem.find(v => v.p.name === key);
                if (item?.search && typeof item.search === 'string') {
                    keyUserSeting = item.search
                }
                if (item?.filter && typeof item.filter === 'string') {
                    keyUserSeting = item.filter
                }
                //处理moment日期
                if (isMoment(v)) {
                    v = momentToDate(v);
                }
                //key的优先级  用户自定义key>操作符key>:
                key = keyUserSeting || keyOperator || key
                result[key] = v
            });
            return result;
        }
    );

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
        if (!isQueryChange(state.cache.query, unref(queryComplete))) return;
        state.loading = true;
        let [data, total] = await state.opts.dataSource(unref(queryComplete));
        state.loading = false;
        state.data = data;
        if (state.opts.pagination) state.opts.pagination.total = total ?? false;
        //记录
        state.cache.query = cloneDeep(unref(queryComplete))
    };

    watch(() => props.dataSource, (value) => {
        state.opts.dataSource = value
        list()
    });
    watch(() => props.formItem, (value) => {
        initSearch();
        initFilter();
        state.renderFormItem = getRenderFormItem(value);
    }, { deep: true, immediate: true });

    //暴露出去其他模块使用
    state.initPagination = initPagination;
    state.list = list;
    return { list, initPagination, pagingChange, queryComplete }
}

//查询是否改变
function isQueryChange(Oquery, query) {
    //如果是空条件查询返回 true  这里只有pageNum  pageSize两个字段
    if (Object.keys(query).length === 2) return true;
    return JSON.stringify(Oquery) !== JSON.stringify(query)
}

//公共的处理
function getRenderFormItem(formItem) {
    let arr = []
    let res = cloneDeep(formItem)
    Object.keys(res).forEach((key) => {
        let o = res[key],
            p
        let props = o.props || {}
        let component = transfUnderline(o.component);
        let search = o.search || true
        let filter = o.filter
        let edit = o.edit;
        //delete key

        ;["props", "component", "value", "search", "filter", "edit"]
            .forEach(v => {
                delete o[v];
            })
        p = { name: key, ...o }
        //小优化
        optimize(component, p, props)
        arr.push({
            p,
            component,
            s: props,
            search,
            filter,
            edit
        })
    })
    //[ { "p": { "name": "a", "label": "字典名称" }, "component": "a-input", "s": { "placeholder": "请输入字典名称" } } ]
    return arr
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

function isMoment(value) {
    return Array.isArray(value) && moment.isMoment(value[0]) || moment.isMoment(value)
}

function momentToDate(value, valueFormat = 'YYYY-MM-DD') {
    if (Array.isArray(value)) {
        return value.map((val) => (moment.isMoment(val) ? val.utc().format(valueFormat) : val))
    } else {
        return moment.isMoment(value) ? value.utc().format(valueFormat) : value
    }
}
  // function dateToMoment(value, valueFormat = 'YYYY-MM-DD') {
//   if (Array.isArray(value)) {
//     return value.map((val) =>
//       isEmpty(val) ? null : moment.isMoment(val) ? val : moment(val, valueFormat)
//     )
//   } else {
//     return isEmpty(value) ? null : moment.isMoment(value) ? value : moment(value, valueFormat)
//   }
// }
