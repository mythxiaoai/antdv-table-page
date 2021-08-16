import { defineComponent, toRefs, reactive,shallowReactive,watch, computed, unref } from "vue";//可以导出并设置初始值
import { merge, cloneDeep, isEmpty, isBoolean, isNumber } from "lodash";
export function useQuery(state) {
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
            if (!(!isBoolean(v) && !isNumber(v) && isEmpty(v))) {
              result[key] = v;
            }
          });
          return result;
        }
      );
    return { queryComplete }
}



