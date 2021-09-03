import { defineComponent, toRefs, reactive, shallowReactive, watch, computed, unref, onMounted, onUnmounted, ref } from "vue";//可以导出并设置初始值
import { merge, cloneDeep, isEmpty, isBoolean, isNumber, throttle } from "lodash";

import moment from 'moment'

export function useTable(state, props, context) {
    let tableRef = ref(null)
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
        if (!isQueryChange(state.cache.preQuery, unref(queryComplete))) return;
        state.loading = true;
        let [data, total] = await state.opts.dataSource(unref(queryComplete));
        state.loading = false;
        state.data = data;
        if (state.opts.pagination) state.opts.pagination.total = total ?? false;
        //记录
        state.cache.preQuery = cloneDeep(unref(queryComplete))
    };

    watch(() => props.dataSource, (value) => {
        state.opts.dataSource = value
        list()
    });
    watch(() => props.formItem, (value) => {
        //第一次进来的起始
        //render出需要渲染的数据
        state.renderFormItem = getRenderFormItem(value);
        state.initSearch();//查询
        state.initFilter();//过滤
        state.initEdit(state, props, context);//过滤
    }, { deep: true, immediate: true });

    const setHeight = (time) => {
        return throttle(
            function () {
                let tableBom = tableRef.value.$el
                const bounding = tableBom.getBoundingClientRect?.() || {}
                //视口高 - table的上面  - 分页
                //分页+margin
                // let pageHeight = (tableBom.querySelector('.ant-pagination')?.offsetHeight || 16) * 2
                let height = window.innerHeight - bounding.top - 64
                //设置
                let dom = tableBom.querySelector('.ant-table-body')
                dom.style['max-height'] = height + 'px'
            },
            time || 50,
            { leading: false, trailing: true }
        )()
    }
    if (state.opts.height === 'auto') {
        onMounted(() => {
            setHeight(200)
            window.addEventListener('resize', setHeight)
        })
        onUnmounted(() => {
            window.removeEventListener('resize', setHeight)
        })
    }

    //暴露出去其他模块使用
    state.initPagination = initPagination;
    state.list = list;


    return { tableRef, list, initPagination, pagingChange, queryComplete }
}

//查询是否改变
function isQueryChange(Oquery, query) {
    //如果是空条件查询返回 true  这里只有pageNum  pageSize两个字段
    if (Object.keys(query).length === 2) return true;
    return JSON.stringify(Oquery) !== JSON.stringify(query)
}

//公共的处理 转换参数
function getRenderFormItem(formItem) {
    let arr = []
    let res = cloneDeep(formItem)
    Object.keys(res).forEach((key) => {
        let o = res[key],
            p
        let props = o.props || {}
        let component = o.component && transfUnderline(o.component)
        let value = o.value || null;
        let search = o.search ?? true
        let filter = o.filter ?? false
        let edit = o.edit ?? false;
        ;["props", "component", "value", "search", "filter", "edit"]
            .forEach(v => {
                delete o[v];
            })
        p = { name: key, ...o }
        //小优化
        component && optimize(component, p, props)
        arr.push({
            p,
            component,
            s: props,
            value,
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
    const placeholderComponent = ['a-input', 'a-auto-complete', 'a-textarea', 'a-input-search', 'a-mentions'];
    const showSearchComponent = ['a-select', 'a-tree-select', 'a-cascader'];
    // const popComponent = ['a-cascader', 'a-tree-select', 'a-select'];
    // cost TimeComponent = ['', 'a-tree-select', 'a-cascader'];
    //placeholder
    if (placeholderComponent.includes(component)) {
        s.placeholder = s.placeholder ?? `请输入${p.label}`
    }
    //search
    if (showSearchComponent.includes(component)) {
        s.placeholder = s.placeholder ?? `请选择${p.label}`
        s.optionFilterProp = 'label'
        s.showSearch = true
    }
    //clear  可清除
    s.allowClear = true;
    //弹框的区域getPopupContainer
    // if (popComponent.includes(component)) {
    //     s.getPopupContainer = ()=>unref(state.editRef)
    // }

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
