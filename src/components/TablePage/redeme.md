# 整体介绍
MTable.vue 是在ant-desgin的a-table v2.12组件的基础上封装

适用场景是表格页面布局，支持，查询，分页，单元格编辑，导出等功能

# 功能
1. 查询 [✔]
2. 表格二次筛选 [✔]
3. 单元格编辑 [-]
4. 自适应列宽(根据内容自适应宽度而不用每个列配置width) [✔]
5. 前端导出(配合FileSaver xlsx做前端导出，减少项目整体工作量,表格数据所见即所得，方便后期维护) [-]
6. 分页(分页与请求解耦,妈妈再也不用担心Page小九九了) [✔]
7. 数据默认值配置(不同系统可以设置Page传参和a-table默认值) [✔]
8. 自定义显示列字段(同步导出) [-]
9. 查询，二次删选，单元格编辑，几乎支持ant-desgin全表单控件(a-transfer和a-upload不支持) [✔](单元格编辑还未完成)
10. 几乎全部支持原本ant-table所有配置 [✔]


# 使用
## props

> 只写改装的属性，其他与a-table一致
> https://2x.antdv.com/components/table-cn

- dataSource [Function, Array]
  - Function  (params:object):[list:string, total:number]
    - params 查询参数的回调
    - list 返回数组第一个是数组
    - total 分页需要用的总数量
  - Array [obj] 表格需要的数据
```
this.tablePageConfig.dataSource = async (params) => {
    console.log('params', params)
    let { data } = await api.get('/list', params)
    return [data.list, data.total]
}
```
- formItem:Object 按照下面例子讲解
  - 整体a的外层除了 component value props 其他配置加上外层的key会作为AFormItem的v-bind绑定,里层props会作为子组件的属性绑定
  - a:作为key 意义与columns的dataIndex对应 查询的params会携带a:XX 也会作为AFormItem的name属性绑定
  - component：表单控件用什么组件渲染,内部用vue提供的component组件去实现的
  - value：初始值 不同的控件初始值的类型不一样，注意一下
  - props: 表单控件的属性直接v-bind绑定  也就是说事件也是支持的 such:onClick
  - slot: 后期新增 查询,二次筛选，编辑的自定义插槽
  - filter true 是否过滤
```
a: {
    label: 'AInput',
    component: 'AInput',
    value: '',//默认值
    props: {
        placeholder: '请输入字典名称'//不加默认会加上 请输入 + label
    },
    filter:true
},
```
## slots

- search 查询如果你想自己写的话~ 无传参
- table-operator 表格按钮操作栏  无传参
- page-opts 表格上面一点选中装饰栏 无传参


# 调用实例

