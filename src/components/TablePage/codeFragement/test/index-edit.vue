<template>
  <a-table ref="tableRef" bordered :data-source="dataSource" :columns="columns">
    <!--title slot -->
    <template v-for="item of editTitleSlots" #[item.slot] :key="item.slot">
      {{ item.title }} <EditOutlined />
    </template>

    <template #name="{ text, record }">
      <div class="editable-cell">
        <div v-if="editableData[record.key]" class="editable-cell-input-wrapper">
          <a-input  v-model:value="editableData[record.key].name" @pressEnter="save(record.key)" @blur="save(record.key)" />
        </div>

        <div v-else class="editable-cell-text-wrapper">
          {{ text}}
        </div>
      </div>
    </template>

  </a-table>
</template>
<script>
import { computed, defineComponent, reactive, ref, onMounted, render } from 'vue'
import { CheckOutlined, EditOutlined } from '@ant-design/icons-vue'
import { cloneDeep } from 'lodash-es'

export default defineComponent({
  components: {
    CheckOutlined,
    EditOutlined
  },
  setup(props, ctx) {
    let tableRef = ref()
    console.log(ctx)
    let editTitleSlots = [
      {
        title: '姓名',
        slot: '_edit-name'
      },
      {
        title: '年龄',
        slot: '_edit-age'
      }
    ]
    
    const dataSource = ref([
      {
        key: '0',
        name: 'Edward King 0',
        age: 32,
        address: 'London, Park Lane no. 0'
      },
      {
        key: '1',
        name: 'Edward King 1',
        age: 32,
        address: 'London, Park Lane no. 1'
      }
    ])
    const count = computed(() => dataSource.value.length + 1)
    const editableData = reactive({})

    const edit = (key) => {
      editableData[key] = cloneDeep(dataSource.value.filter((item) => key === item.key)[0])
    }

    const save = (key) => {
      Object.assign(dataSource.value.filter((item) => key === item.key)[0], editableData[key])

      
      delete editableData[key]
    }

    const onDelete = (key) => {
      dataSource.value = dataSource.value.filter((item) => item.key !== key)
    }

  const columns = [
      {
        dataIndex: 'name',
        width: '30%',
        slots: {
          customRender: 'name',
          title: '_edit-name'
        },
        customCell:function(record, rowIndex){
          return {
            onClick:(event)=>{
              edit(record.key)
            }
          }
        }
      },
      {
        dataIndex: 'age',
        slots: {
          title: '_edit-age'
        }
      },
      {
        title: 'address',
        dataIndex: 'address'
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        slots: {
          customRender: 'operation'
        }
      }
    ]

    return {
      columns,
      onDelete,
      dataSource,
      editableData,
      count,
      edit,
      save,
      tableRef,
      editTitleSlots
    }
  }
})
</script>
<style lang="less">
// .editable-cell {
//   position: relative;
//   .editable-cell-input-wrapper,
//   .editable-cell-text-wrapper {
//     padding-right: 24px;
//   }

//   .editable-cell-text-wrapper {
//     padding: 5px 24px 5px 5px;
//   }

//   .editable-cell-icon,
//   .editable-cell-icon-check {
//     position: absolute;
//     right: 0;
//     width: 20px;
//     cursor: pointer;
//   }

//   .editable-cell-icon {
//     margin-top: 4px;
//     display: none;
//   }

//   .editable-cell-icon-check {
//     line-height: 28px;
//   }

//   .editable-cell-icon:hover,
//   .editable-cell-icon-check:hover {
//     color: #108ee9;
//   }

//   .editable-add-btn {
//     margin-bottom: 8px;
//   }
// }
// .editable-cell:hover .editable-cell-icon {
//   display: inline-block;
// }
</style>