import SplitterPanel from 'primevue/splitterpanel'
import ColorPicker from 'primevue/colorpicker'
import FileUpload from 'primevue/fileupload'

import OrderList from 'primevue/orderlist'

import Panel from '~/src/volt/Panel.vue'
import InputNumber from '~/src/volt/InputNumber.vue'
import InputText from '~/src/volt/InputText.vue'
import Splitter from '~/src/volt/Splitter.vue'
import Drawer from '~/src/volt/Drawer.vue'
import Select from '~/src/volt/Select.vue'
import Dialog from '~/src/volt/Dialog.vue'
import Tree from '~/src/volt/Tree.vue'
import Message from '~/src/volt/Message.vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp
    .component('SplitterPanel', SplitterPanel)
    .component('FileUpload', FileUpload)
    .component('Dialog', Dialog)
    .component('Panel', Panel)
    .component('InputNumber', InputNumber)
    .component('InputText', InputText)
    .component('Splitter', Splitter)
    .component('Drawer', Drawer)
    .component('Select', Select)
    .component('Tree', Tree)

    .component('Message', Message)

    .component('ColorPicker', ColorPicker)
    .component('OrderList', OrderList)
})
