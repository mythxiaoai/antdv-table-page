<!--  1.3 单元格编辑，遇到的问题，1.页面微卡，2.初始值的赋予与表格需要的回显问题，3. 不同表单事件触发的事件不同 4.数据格式化插槽的占用的解决方案format-->
<template>
  <div style="padding: 15px">
    <a-card :bordered="false">
      <m-table v-bind="tablePageConfig">
        <template #table-operator>
          <a-button><PlusOutlined />添加</a-button>
          <a-button><DownloadOutlined />导出</a-button>
        </template>
        <template #operation="{ text, record, index }">
          <a @click="handleUpdate(text)"> 修改 </a>
          <!-- <a-icon type="edit" /> -->
          <a-divider type="vertical" />
          <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(text.id)">
            <a> 删除 </a>
            <!-- <a-icon type="delete" /> -->
          </a-popconfirm>
        </template>
      </m-table>
    </a-card>
  </div>
</template>
<script>
import { ref } from 'vue'
import getAxios from '@utils/http/index'
import { PlusOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons-vue'
import MTable from './MTable.vue'
let { api } = getAxios({ baseURL: 'http://yapi.dev.patpat.vip/mock/16/' })
import moment from 'moment'

export default {
  components: {
    MTable,
    PlusOutlined,
    DownloadOutlined,
    SearchOutlined
  },
  created() {
    this.tablePageConfig.dataSource = async (params) => {
      console.log('params', params)
      let { data } = await api.get('list_filter', params)
      return [data.list, data.total]
    }
  },
  mounted() {},
  data: function () {
    return {
      tablePageConfig: {
        formItem: {
          a: {
            component: 'AInput',
            label: '普通输入框',
            value: '',
            props: {
              placeholder: '请输入字典名称'
            },
            edit: true,
            filter:true
          },
          b: {
            label: 'AAutoComplete',
            component: 'AAutoComplete',
            value: '',
            props: {
              options: [
                {
                  text: 'a',
                  value: '1'
                },
                {
                  text: 'b',
                  value: '2'
                },
                {
                  text: 'c',
                  value: '3'
                }
              ]
            },
            edit: true
          },
          c: {
            label: 'ACascader',
            component: 'ACascader',
            value: [],
            props: {
              options: [
                {
                  label: 'a',
                  value: '1',
                  children: [
                    {
                      label: 'a',
                      value: '1'
                    }
                  ]
                },
                {
                  label: 'b',
                  value: '2'
                },
                {
                  label: 'c',
                  value: '3'
                }
              ]
            },
            edit: true
          },
          d: {
            label: 'ACheckbox',
            component: 'ACheckbox',
            value: false,
            edit: true
          },
          e: {
            label: 'ACheckboxGroup',
            component: 'ACheckboxGroup',
            value: ['1'],
            props: {
              options: [
                {
                  label: 'Apple',
                  value: '1'
                },
                {
                  label: 'Pear',
                  value: '2'
                },
                {
                  label: 'Orange',
                  value: '3'
                }
              ]
            },
            edit: true
          },
          f: {
            label: 'ADatePicker',
            component: 'ADatePicker',
            value: '',
            edit: true
          },
          g: {
            label: 'AMonthPicker',
            component: 'AMonthPicker',
            value: '',
            edit: true
          },
          h: {
            label: 'ARangePicker',
            component: 'ARangePicker',
            value: [],
            edit: true
          },
          i: {
            label: 'AWeekPicker',
            component: 'AWeekPicker',
            value: '',
            edit: true
          },
          j: {
            label: 'ATextarea',
            component: 'ATextarea',
            value: '',
            edit: true
          },
          k: {
            label: 'AInputSearch',
            component: 'AInputSearch',
            value: '',
            edit: true
          },
          l: {
            label: 'AInputNumber',
            component: 'AInputNumber',
            value: 0,
            edit: true
          },
          m: {
            label: 'AMentions',
            component: 'AMentions',
            value: '2',
            props: {
              options: [
                {
                  label: 'Apple',
                  value: '1'
                },
                {
                  label: 'Pear',
                  value: '2'
                },
                {
                  label: 'Orange',
                  value: '3'
                }
              ]
            },
            edit: true
          },
          n: {
            label: 'ARadio',
            component: 'ARadio',
            value: false,
            edit: true
          },
          o: {
            label: 'ARadioGroup',
            component: 'ARadioGroup',
            value: '2',
            props: {
              options: [
                {
                  label: 'Apple',
                  value: '1'
                },
                {
                  label: 'Pear',
                  value: '2'
                },
                {
                  label: 'Orange',
                  value: '3'
                }
              ]
            },
            edit: true
          },
          p: {
            label: 'ARate',
            component: 'ARate',
            value: 2,
            edit: true
          },
          q: {
            label: 'ASelect',
            component: 'ASelect',
            value: '',
            props: {
              options: [
                {
                  label: '--请选择--',
                  value: ''
                },
                {
                  label: 'Apple',
                  value: '1'
                },
                {
                  label: 'Pear',
                  value: '2'
                },
                {
                  label: 'Orange',
                  value: '3'
                }
              ]
            },
            edit: true
          },
          r: {
            label: 'ASelect 多选',
            component: 'ASelect',
            value: [],
            props: {
              mode: 'multiple',
              options: [
                {
                  label: 'Apple',
                  value: '1'
                },
                {
                  label: 'Pear',
                  value: '2'
                },
                {
                  label: 'Orange',
                  value: '3'
                }
              ]
            },
            edit: true
          },
          s: {
            label: 'ASlider',
            component: 'ASlider',
            value: 44,
            edit: true
          },
          t: {
            label: 'ASwitch',
            component: 'ASwitch',
            value: true,
            edit: true
          },
          u: {
            label: 'ATimePicker',
            component: 'ATimePicker',
            value: '',
            edit: true
          },
          v: {
            label: 'ATreeSelect',
            component: 'ATreeSelect',
            value: '',
            props: {
              treeData: [
                {
                  title: 'Node1',
                  value: '0-0',
                  key: '0-0',
                  children: [
                    {
                      title: 'Child Node1',
                      value: '0-0-1',
                      key: '0-0-1'
                    },
                    {
                      title: 'Child Node2',
                      value: '0-0-2',
                      key: '0-0-2'
                    }
                  ]
                },
                {
                  title: 'Node2',
                  value: '0-1',
                  key: '0-1'
                }
              ]
            },
            edit: true
          }
        },
        columns: [
          { title: 'AInput', dataIndex: 'a' },
          { title: 'AAutoComplete', dataIndex: 'b' },
          { title: 'ACascader', dataIndex: 'c' },
          { title: 'ACheckbox', dataIndex: 'd' },
          { title: 'ACheckboxGroup', dataIndex: 'e' },
          { title: 'ADatePicker', dataIndex: 'f' },
          { title: 'AMonthPicker', dataIndex: 'g' },
          { title: 'ARangePicker', dataIndex: 'h' },
          { title: 'AWeekPicker', dataIndex: 'i' },
          { title: 'ATextarea', dataIndex: 'j' },
          { title: 'AInputSearch', dataIndex: 'k' },
          { title: 'AInputNumber', dataIndex: 'l' },
          { title: 'AMentions', dataIndex: 'm' },
          { title: 'ARadio', dataIndex: 'n' },
          { title: 'ARadioGroup', dataIndex: 'o' },
          { title: 'ARate', dataIndex: 'p' },
          { title: 'ASelect', dataIndex: 'q' },
          { title: 'ASelect', dataIndex: 'r' },
          { title: 'ASlider', dataIndex: 's' },
          { title: 'ASwitch', dataIndex: 't' },
          { title: 'ATimePicker', dataIndex: 'u' },
          { title: 'ATreeSelect', dataIndex: 'v' },
          {
            title: '操作',
            key: 'operation',
            slots: { customRender: 'operation' }
          }
        ]
      }
    }
  },
  methods: {},
  computed: {},
  watch: {}
}
</script>
<style scoped lang="less">
</style>
<style lang="less" scoped>
</style>
