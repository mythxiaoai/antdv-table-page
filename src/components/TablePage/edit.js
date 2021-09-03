import { defineComponent, toRefs, reactive, shallowReactive, watch, computed, unref, ref, onMounted, onUnmounted, nextTick, createVNode } from "vue";//可以导出并设置初始值
import { merge, cloneDeep, isEmpty, isBoolean, isNumber, get } from "lodash";
import { EditOutlined } from "@ant-design/icons-vue";

//AAutoComplete ACascader:[]  ACheckboxGroup:[] AMentions:[] ASelect:[]|String x:"multiple",ATreeSelect:string|string[]
const optionsComponent = ["a-auto-complete","a-cascader","a-select","a-checkbox-group","a-select"]
//ARangePicker:[]
export function useEdit(state, props, context) {
  let editRef = ref(null)
  let editFormItem = computed(() => {
    return state.renderFormItem.filter((v) => {
      return v.edit
    }).reduce((res, next) => ((res[next.p.name] = next), res), {})
  });

  let initEdit = (state, props, context) => {
    let columns = cloneDeep(state.opts.columns)
    state.opts.columns = columns.map((v) => {
      //做递归  兼容children的多级表头的方式
      return dealChaildren(v, (v) => {
        if (!v.dataIndex) return v
        //  roleName:roleId  columns[]dataIndex:"list.roleName"   roleName ==roleName
        let renderFormItem = state.renderFormItem.find(k => k.p.name.split(":")[0] === v.dataIndex.split(".").pop());
        if (!renderFormItem.component || !renderFormItem.edit) return v;
        //标记单元格是否被修改过
        v.updated = []
        //下拉框字段值的数据回显  id--label-->id   getRenderDate  因为这个时候data没有值所以只能用方法来计算
        if (renderFormItem?.s?.options) {
          v._isOptions = true
          v._getOptionsLabel = function (text) {
            return renderFormItem?.s?.options.find(v => v.value === text)?.label || text;
          }
        }
        //先储存全量的key
        v.key = renderFormItem.p.name
        v.slots = v.slots ?? {}
        v.slots.customRender = '_edit'
        let temp = v.title;
        v.title = () => {
          return createVNode("div", {}, [temp + " ", createVNode(EditOutlined)])
        }
        v.customCell = (record, index) => {
          return {
            onClick: (e) => {
              e.stopPropagation();
              state.edit({
                keyall: v.key,
                columns: v,
                record,
                index
              })
            },
            onKeyup: (e) => {
              if (e.keyCode === 13) {
                save(state, props, context)
              }
            }
          }
        }
        return v
      })
    })
  }
  const edit = async ({ keyall, columns, record, index }) => {
    if (state.editableData) {
      //如果有其他值在编辑，先保存
      save(state, props, context)
    }
    //  roleName:roleId  columns[]dataIndex:"list.roleName"   roleName ==roleName
    let renderFormItem = state.renderFormItem.find(k => k.p.name === keyall);
    //data回显的数据
    let value = get(state.data[index], columns.dataIndex)
    //label 是否需要用label回显
    if (optionsComponent.includes(renderFormItem.component)) {
      if(renderFormItem.component === 'a-select' && renderFormItem.s?.mode ==='multiple'){
        value = renderFormItem?.s?.options.filter(v => v.value === value).map(v=>v.label).join(',') || value;
      }else{
        value = renderFormItem?.s?.options.find(v => v.value === value)?.label || value;
      }
    }
    let label = get(state.data[index], columns.dataIndex)
    let keyUserSeting, keyOperator;
    if (renderFormItem.edit === 'string') {
      keyUserSeting = renderFormItem.filter
    }
    keyOperator = keyall.split(":").pop();
    //key的优先级  用户自定义key>操作符key>:
    let sendKey = keyUserSeting || keyOperator
    //要发送的值
    state.editValue = { key: sendKey, value }
    //编辑值
    state.editableData = { dataIndex: columns.dataIndex, record, index }
    //保存快照
    state.cache.preEditValue = JSON.stringify(state.editValue)
    await nextTick()
    editRef.value?.$el.focus?.()
  }
  const save = (state, props, context) => {
    //当前如果没有编辑显示  直接retuen
    //修改data值
    //触发save事件
    //标记单元格被改动
    console.log("save");
    if (!unref(showEdit)) return;
    console.log(state.cache.preEditValue, JSON.stringify(state.editValue));
    if (state.cache.preEditValue === JSON.stringify(state.editValue)) {
      console.log("值没变");
      state.editableData = null;
      state.editValue = null;
      return;
    }
    //处理 dataIndex点的情况
    let isDotIndex = state.editableData.dataIndex.indexOf(".")
    if (~isDotIndex) {
      get(state.data[state.editableData.index], state.editableData.dataIndex.slice(0, isDotIndex)) = state.editValue.value
    } else {
      state.data[state.editableData.index][state.editableData.dataIndex] = state.editValue.value
    }
    context.emit("save", { [state.editValue.key]: state.editValue.value })

    let column = state.opts.columns.find(v => v.dataIndex === state.editableData.dataIndex);
    column.updated[state.editableData.index] = true;
    state.editableData = null;
    state.editValue = null;
  }
  const isEditShow = (columns, index) => {
    return columns.dataIndex == state.editableData?.dataIndex && index === state.editableData?.index
  }
  const showEdit = computed(() => !!editRef.value)

  function saveWarp() {
    save(state, props, context)
  }
  // onMounted
  onMounted(() => {
    document.addEventListener("click", saveWarp)
  });
  onUnmounted(() => {
    document.removeEventListener("click", saveWarp)
  });
  state.editRef = editRef;
  state.initEdit = initEdit;
  state.edit = edit;
  return { editFormItem, initEdit, edit, isEditShow }
}

function dealChaildren(v, cb) {
  if (v.children && v.children.length > 0) {
    v.children = v.children.map((v) => dealChaildren(v, cb))
  }
  v = cb(v)
  return v
}


function dom_findParentIsExist(dom, target) {
  for (; ;) {
    if (dom.nodeName === "BODY") return false;
    if (target === dom) return true;
    dom = dom.parentElement;
  }
}
