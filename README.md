# 整体介绍
TablePage 是在ant-desgin-vue组件的基础上封装

适用场景是表格页面布局，支持，查询，分页,过滤等功能

![效果呈现](https://github.com/mythxiaoai/antdv-table-page/blob/main/src/assets/show.png)

# 使用
```
yarn install
yarn dev
```
# 文件说明
如果需要使用移植
- filter.js //过滤功能
- index.js  //入口文件
- search.js //查询功能
- store.js  //数据管理
- Table.vue //主文件

> 其他文件说明
- /test
组件demo

# 功能
1. 查询 [✔]
2. 表格二次筛选 [✔]
3. 自适应列宽(根据内容自适应宽度而不用每个列配置width) [✔]
4. 分页(分页与请求解耦,妈妈再也不用担心Page小九九了) [✔]
5. 数据默认值配置(不同系统可以设置Page传参和a-table默认值) [✔]
6. 自定义显示列字段(同步导出) [-]
7. 查询，二次筛选，几乎支持ant-desgin全表单控件，组件配置共享(a-transfer和a-upload不支持) [✔]
8. 几乎全部支持原本ant-table所有配置 [✔]


# 使用
## 默认配置
```
//store.js  可以在Table.vue中导出更改也是OK的  一次配置  多次生效
export const _defaultTable = {
  //自动配置唯一key
  rowKey: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  },
  //表格边框
  bordered: true,
  //分页参数
  pagination: {
    pageSize: 10,
    current: 1,
    total: 0,
    showTotal: (total, range) => `${range[0]}-${range[1]} 共${total}条`
  },
  //自定义分页传参的key  如果你的list列表传入的值不一样请修改这个配置
  pageKey: {
    current: 'pageNo',
    pageSize: 'page_size'
  },
  //高度自动计算，为了达到横向滚动条始终在页面可视范围内，方便横向滚动条拖拽
  height: 'auto'
}

```
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
  - 整体a的外层除了 component value props filter 其他配置加上外层的key会作为AFormItem的v-bind绑定,里层props会作为子组件的属性绑定
  - a:作为key 意义与columns的dataIndex对应 查询的query会携带a:XX 也会作为AFormItem的name属性绑定，如果含有：会以冒号后面userId作为query携带，如果search:"userInfo"会以这个优先级有限，query的优先级，里层的serarch:"key" > "a:userId"的userId > "a:userId"的a
  - component：表单控件用什么组件渲染,内部用vue提供的component组件去实现的
  - value：初始值 不同的控件初始值需要注意下
  - props: 表单控件的属性直接v-bind绑定  也就是说事件也是支持的 such:onClick
  - search true|false 是否查询表格，默认true
  - filter true|false 是否过滤  与查询互斥
```
a:userId: {
    label: 'AInput',
    component: 'AInput',
    value: '',//默认值
    props: {
        placeholder: '请输入字典名称'//不加默认会加上 请输入 + label
    },
    search:true
    filter:true
}
```
## slots
- search 自定义查询 {query} 查询query拓展  需要在formItem上加上初始化值 key:{value:""}
- search-after 自定义查询后面的表单控件 {query} 查询query拓展  需要在formItem上加上初始化值 key:{value:""}  并手动调用实例的searchQuery方法  详情看search-after  "只看我"
- toolbar 自定义查询 {query} 查询query拓展 表格按钮操作栏  方便做导出

## 方法
search 重新调用查询方法(会重置分页)
searchReset 重置
pagingChange({curremt}) 跳转到指定页
reflush 刷新(不会重置分页)


# 写在最后
原本计划是准备加上编辑和导出功能的，卡在编辑的回显，多表格需要做兼容回显过于繁琐，考虑到投入产出比，决定只做这两个功能，编辑功能完成70%感兴趣可以看下edit分支。