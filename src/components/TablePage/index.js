import Table from './Table.vue'

// 为组件提供 install 安装方法，供按需引入
Table.install = function (app) {
  app.component(Table.name, Table)
}

// 默认导出组件
export default Table
