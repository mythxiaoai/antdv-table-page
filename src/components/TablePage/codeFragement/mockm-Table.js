let res = {
    a: {
      component: 'AInput', //或者 a-input
      label: '普通输入框',
      value: '', //默认值
      props: {
        placeholder: '请输入字典名称' //不加默认会加上 请输入 + label
      }
    },
    b: {
      label: 'AAutoComplete',
      component: 'AAutoComplete', //或者 a-auto-complete
      value: '', //默认值
      props: {
        options: [
          { text: 'a', value: '1' },
          { text: 'b', value: '2' },
          { text: 'c', value: '3' }
        ]
      }
    },
    c: {
      label: 'ACascader',
      component: 'ACascader',
      value: [], //默认值
      props: {
        options: [
          { label: 'a', value: '1', children: [{ label: 'a', value: '1' }] },
          { label: 'b', value: '2' },
          { label: 'c', value: '3' }
        ]
      }
    },
    d: {
      label: 'ACheckbox',
      component: 'ACheckbox',
      value: false //默认值
    },
    e: {
      label: 'ACheckboxGroup',
      component: 'ACheckboxGroup',
      value: ['1'], //默认值
      props: {
        options: [
          { label: 'Apple', value: '1' },
          { label: 'Pear', value: '2' },
          { label: 'Orange', value: '3' }
        ]
      }
    },
    f: {
      label: 'ADatePicker',
      component: 'ADatePicker',
      value: '' //或者设置默认时间 moment()  输出的都是Moment对象但是get请求会默认转化为utc,其他情况需要utc请在第38行自行格式化moment().utc().format()
    },
    g: {
      label: 'AMonthPicker',
      component: 'AMonthPicker',
      value: ''
    },
    h: {
      label: 'ARangePicker',
      component: 'ARangePicker',
      value: []
    },
    i: {
      label: 'AWeekPicker',
      component: 'AWeekPicker',
      value: ''
    },
    j: {
      label: 'ATextarea',
      component: 'ATextarea',
      value: ''
    },
    k: {
      label: 'AInputSearch',
      component: 'AInputSearch',
      value: ''
    },
    l: {
      label: 'AInputNumber',
      component: 'AInputNumber',
      value: 0
    },
    m: {
      label: 'AMentions',
      component: 'AMentions',
      value: '2',
      props: {
        options: [
          { label: 'Apple', value: '1' },
          { label: 'Pear', value: '2' },
          { label: 'Orange', value: '3' }
        ]
      }
    },
    n: {
      label: 'ARadio',
      component: 'ARadio',
      value: false
    },
    o: {
      label: 'ARadioGroup',
      component: 'ARadioGroup',
      value: '2', //默认值
      props: {
        options: [
          { label: 'Apple', value: '1' },
          { label: 'Pear', value: '2' },
          { label: 'Orange', value: '3' }
        ]
      }
    },
    p: {
      label: 'ARate',
      component: 'ARate',
      value: 2 //默认值
    },
    q: {
      label: 'ASelect',
      component: 'ASelect',
      value: '',
      props: {
        options: [
          { label: '--请选择--', value: '' },
          { label: 'Apple', value: '1' },
          { label: 'Pear', value: '2' },
          { label: 'Orange', value: '3' }
        ]
      }
    },
    r: {
      label: 'ASelect 多选',
      component: 'ASelect',
      value: [],
      props: {
        mode: 'multiple',
        options: [
          { label: 'Apple', value: '1' },
          { label: 'Pear', value: '2' },
          { label: 'Orange', value: '3' }
        ]
      }
    },
    s: {
      label: 'ASlider',
      component: 'ASlider',
      value: 44
    },
    t: {
      label: 'ASwitch',
      component: 'ASwitch',
      value: true
    },
    u: {
      label: 'ATimePicker',
      component: 'ATimePicker',
      value: '' //moment('08:00:00', 'HH:mm:ss')
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
                key: '0-0-1',
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
      }
    }
  }
let columns = [];
let mock={};
/**
"a": {
      "type": "string",
      "mock": {
        "mock": "@name"
      }
    }
 */
for (const key in res) {
    if (Object.hasOwnProperty.call(res, key)) {
        const v = res[key];
        // v.edit = true;
        columns.push({ title: v.component, dataIndex: key });
        mock[key] = {
            "type": "string",
            "mock": {
              "mock": "@name"
            }
          }
        
    }
}

console.log(JSON.stringify(res,null,4));
// console.log(JSON.stringify(columns,null));
// console.log(JSON.stringify(mock,null));