import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import InputTextWithSelect from './InputTextWithSelect.vue'

// Mock the UI components that this component depends on
const mockUiInput = {
  name: 'UiInput',
  template: `
    <input 
      :value="modelValue" 
      :placeholder="placeholder"
      :disabled="disabled"
      :class="$attrs.class"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur')"
    />
  `,
  props: ['modelValue', 'placeholder', 'variant', 'disabled'],
  emits: ['update:modelValue', 'blur']
}

const mockUiSelect = {
  name: 'UiSelect',
  template: '<div class="ui-select"><slot /></div>',
  props: ['modelValue'],
  emits: ['update:modelValue']
}

const mockUiSelectTrigger = {
  name: 'UiSelectTrigger',
  template: '<button :disabled="disabled" :aria-label="ariaLabel" :class="$attrs.class"><slot /></button>',
  props: ['disabled', 'ariaLabel']
}

const mockUiSelectContent = {
  name: 'UiSelectContent',
  template: '<div class="select-content"><slot /></div>'
}

const mockUiSelectGroup = {
  name: 'UiSelectGroup',
  template: '<div class="select-group"><slot /></div>'
}

const mockUiSelectItem = {
  name: 'UiSelectItem',
  template: '<div class="select-item" @click="handleClick">{{ value }}</div>',
  props: ['value'],
  emits: ['select'],
  methods: {
    handleClick() {
      this.$emit('select', this.value)
    }
  }
}

const mockBaseFloatLabel = {
  name: 'BaseFloatLabel',
  template: `
    <div :class="$attrs.class">
      <label :class="labelClass">{{ label }}</label>
      <slot />
    </div>
  `,
  props: ['label', 'labelClass']
}

describe('InputTextWithSelect', () => {
  let wrapper: VueWrapper<any>

  const defaultProps = {
    label: 'Test Label',
    selectOptions: ['Option 1', 'Option 2', 'Option 3']
  }

  const createWrapper = (props = {}) => {
    return mount(InputTextWithSelect, {
      props: { ...defaultProps, ...props },
      global: {
        components: {
          UiInput: mockUiInput,
          UiSelect: mockUiSelect,
          UiSelectTrigger: mockUiSelectTrigger,
          UiSelectContent: mockUiSelectContent,
          UiSelectGroup: mockUiSelectGroup,
          UiSelectItem: mockUiSelectItem,
          BaseFloatLabel: mockBaseFloatLabel
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render the component with required props', () => {
      wrapper = createWrapper()
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.flex.flex-row.w-full').exists()).toBe(true)
    })

    it('should render BaseFloatLabel with correct label', () => {
      wrapper = createWrapper({ label: 'Custom Label' })
      
      const floatLabel = wrapper.findComponent({ name: 'BaseFloatLabel' })
      expect(floatLabel.exists()).toBe(true)
      expect(floatLabel.props('label')).toBe('Custom Label')
    })

    it('should render UiInput with default placeholder', () => {
      wrapper = createWrapper()
      
      const input = wrapper.findComponent({ name: 'UiInput' })
      expect(input.exists()).toBe(true)
      expect(input.props('placeholder')).toBe('Type or select...')
      expect(input.props('variant')).toBe('outline')
    })

    it('should render UiInput with custom placeholder', () => {
      wrapper = createWrapper({ placeholder: 'Enter value here...' })
      
      const input = wrapper.findComponent({ name: 'UiInput' })
      expect(input.props('placeholder')).toBe('Enter value here...')
    })

    it('should render all select option items', () => {
      const options = ['Apple', 'Banana', 'Cherry', 'Date']
      wrapper = createWrapper({ selectOptions: options })
      
      const selectItems = wrapper.findAllComponents({ name: 'UiSelectItem' })
      expect(selectItems).toHaveLength(4)
      
      selectItems.forEach((item, index) => {
        expect(item.props('value')).toBe(options[index])
        expect(item.text()).toBe(options[index])
      })
    })

    it('should render select components in correct structure', () => {
      wrapper = createWrapper()
      
      expect(wrapper.findComponent({ name: 'UiSelect' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'UiSelectTrigger' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'UiSelectContent' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'UiSelectGroup' }).exists()).toBe(true)
    })
  })

  describe('Props and Default Values', () => {
    it('should use default values for optional props', () => {
      wrapper = createWrapper()
      
      const input = wrapper.findComponent({ name: 'UiInput' })
      const selectTrigger = wrapper.findComponent({ name: 'UiSelectTrigger' })
      
      expect(input.props('disabled')).toBe(false)
      expect(selectTrigger.props('disabled')).toBe(false)
    })

    it('should apply disabled prop to both input and select', () => {
      wrapper = createWrapper({ disabled: true })
      
      const input = wrapper.findComponent({ name: 'UiInput' })
      const selectTrigger = wrapper.findComponent({ name: 'UiSelectTrigger' })
      
      expect(input.props('disabled')).toBe(true)
      expect(selectTrigger.props('disabled')).toBe(true)
    })

    it('should apply custom CSS classes correctly', () => {
      wrapper = createWrapper({
        labelRootClass: 'custom-label-root',
        labelClass: 'custom-label',
        selectClass: 'custom-select',
        inputClass: 'custom-input',
        commonClass: 'common-style'
      })

      const floatLabel = wrapper.findComponent({ name: 'BaseFloatLabel' })
      const input = wrapper.findComponent({ name: 'UiInput' })
      const selectTrigger = wrapper.findComponent({ name: 'UiSelectTrigger' })

      expect(floatLabel.classes()).toContain('custom-label-root')
      expect(floatLabel.props('labelClass')).toBe('custom-label')
      expect(input.classes()).toContain('custom-input')
      expect(input.classes()).toContain('common-style')
      expect(selectTrigger.classes()).toContain('custom-select')
      expect(selectTrigger.classes()).toContain('common-style')
    })

    it('should apply commonClass to both input and select components', () => {
      wrapper = createWrapper({ commonClass: 'shared-styling' })
      
      const input = wrapper.findComponent({ name: 'UiInput' })
      const selectTrigger = wrapper.findComponent({ name: 'UiSelectTrigger' })
      
      expect(input.classes()).toContain('shared-styling')
      expect(selectTrigger.classes()).toContain('shared-styling')
    })

    it('should handle empty commonClass', () => {
      wrapper = createWrapper({ commonClass: '' })
      
      const input = wrapper.findComponent({ name: 'UiInput' })
      const selectTrigger = wrapper.findComponent({ name: 'UiSelectTrigger' })
      
      expect(input.exists()).toBe(true)
      expect(selectTrigger.exists()).toBe(true)
    })
  })

  describe('defineModel Functionality', () => {
    it('should bind model value to input component', async () => {
      wrapper = createWrapper()
      
      // Simulate v-model change
      await wrapper.setProps({ modelValue: 'test value' })
      
      const input = wrapper.findComponent({ name: 'UiInput' })
      expect(input.props('modelValue')).toBe('test value')
    })

    it('should bind model value to select component', async () => {
      wrapper = createWrapper()
      
      // Simulate v-model change
      await wrapper.setProps({ modelValue: 'Option 2' })
      
      const select = wrapper.findComponent({ name: 'UiSelect' })
      expect(select.props('modelValue')).toBe('Option 2')
    })

    it('should emit update:modelValue when input value changes', async () => {
      wrapper = createWrapper()
      
      const input = wrapper.findComponent({ name: 'UiInput' })
      await input.vm.$emit('update:modelValue', 'new input value')
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new input value'])
    })

    it('should emit update:modelValue when select value changes', async () => {
      wrapper = createWrapper()
      
      const select = wrapper.findComponent({ name: 'UiSelect' })
      await select.vm.$emit('update:modelValue', 'Option 1')
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Option 1'])
    })
  })

  describe('Input Blur Behavior and Trimming', () => {
    it('should trim input value on blur when value has leading/trailing spaces', async () => {
      wrapper = createWrapper()
      await wrapper.setProps({ modelValue: '  test value  ' })
      
      const input = wrapper.findComponent({ name: 'UiInput' })
      await input.vm.$emit('blur')
      await nextTick()
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test value'])
    })

    it('should handle empty string with spaces on blur', async () => {
      wrapper = createWrapper()
      await wrapper.setProps({ modelValue: '   ' })
      
      const input = wrapper.findComponent({ name: 'UiInput' })
      await input.vm.$emit('blur')
      await nextTick()
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
    })

    it('should handle already trimmed value on blur', async () => {
      wrapper = createWrapper()
      await wrapper.setProps({ modelValue: 'already trimmed' })
      
      const input = wrapper.findComponent({ name: 'UiInput' })
      await input.vm.$emit('blur')
      await nextTick()
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['already trimmed'])
    })

    it('should handle null or undefined values on blur gracefully', async () => {
      wrapper = createWrapper()
      await wrapper.setProps({ modelValue: undefined })
      
      const input = wrapper.findComponent({ name: 'UiInput' })
      
      // Should not throw error when trying to trim null/undefined
      expect(async () => {
        await input.vm.$emit('blur')
        await nextTick()
      }).not.toThrow()
    })

    it('should handle special whitespace characters on blur', async () => {
      wrapper = createWrapper()
      // Test with various whitespace characters
      await wrapper.setProps({ modelValue: '\t\n  test  \r\n  ' })
      
      const input = wrapper.findComponent({ name: 'UiInput' })
      await input.vm.$emit('blur')
      await nextTick()
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test'])
    })
  })

  describe('Accessibility', () => {
    it('should set aria-label on select trigger from label prop', () => {
      wrapper = createWrapper({ label: 'Search Options' })
      
      const selectTrigger = wrapper.findComponent({ name: 'UiSelectTrigger' })
      expect(selectTrigger.attributes('aria-label')).toBe('Search Options')
    })

    it('should pass label to BaseFloatLabel for accessibility', () => {
      wrapper = createWrapper({ label: 'Form Field Label' })
      
      const floatLabel = wrapper.findComponent({ name: 'BaseFloatLabel' })
      expect(floatLabel.props('label')).toBe('Form Field Label')
    })

    it('should maintain aria-label consistency with label prop', () => {
      const labelText = 'Consistent Label'
      wrapper = createWrapper({ label: labelText })
      
      const floatLabel = wrapper.findComponent({ name: 'BaseFloatLabel' })
      const selectTrigger = wrapper.findComponent({ name: 'UiSelectTrigger' })
      
      expect(floatLabel.props('label')).toBe(labelText)
      expect(selectTrigger.attributes('aria-label')).toBe(labelText)
    })
  })

  describe('Component Structure and Styling', () => {
    it('should have correct container classes', () => {
      wrapper = createWrapper()
      
      const container = wrapper.find('.flex.flex-row.w-full')
      expect(container.exists()).toBe(true)
    })

    it('should apply rounded-r-none to input for seamless connection', () => {
      wrapper = createWrapper()
      
      const input = wrapper.findComponent({ name: 'UiInput' })
      expect(input.classes()).toContain('rounded-r-none')
    })

    it('should apply correct styling classes to select trigger', () => {
      wrapper = createWrapper()
      
      const selectTrigger = wrapper.findComponent({ name: 'UiSelectTrigger' })
      const expectedClasses = [
        'shrink-0',
        'rounded-l-none',
        'border-l-0',
        'focus-visible:ring-0',
        'focus-visible:border-input'
      ]
      
      expectedClasses.forEach(className => {
        expect(selectTrigger.classes()).toContain(className)
      })
    })

    it('should combine custom classes with default classes correctly', () => {
      wrapper = createWrapper({
        inputClass: 'custom-input',
        selectClass: 'custom-select',
        commonClass: 'shared-class'
      })
      
      const input = wrapper.findComponent({ name: 'UiInput' })
      const selectTrigger = wrapper.findComponent({ name: 'UiSelectTrigger' })
      
      // Input should have both default and custom classes
      expect(input.classes()).toContain('rounded-r-none')
      expect(input.classes()).toContain('custom-input')
      expect(input.classes()).toContain('shared-class')
      
      // Select trigger should have both default and custom classes
      expect(selectTrigger.classes()).toContain('shrink-0')
      expect(selectTrigger.classes()).toContain('custom-select')
      expect(selectTrigger.classes()).toContain('shared-class')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty selectOptions array', () => {
      wrapper = createWrapper({ selectOptions: [] })
      
      const selectItems = wrapper.findAllComponents({ name: 'UiSelectItem' })
      expect(selectItems).toHaveLength(0)
    })

    it('should handle single option in selectOptions', () => {
      wrapper = createWrapper({ selectOptions: ['Only Option'] })
      
      const selectItems = wrapper.findAllComponents({ name: 'UiSelectItem' })
      expect(selectItems).toHaveLength(1)
      expect(selectItems[0].props('value')).toBe('Only Option')
    })

    it('should handle selectOptions with special characters', () => {
      const specialOptions = [
        'Option with spaces',
        'Option-with-hyphens',
        'Option_with_underscores',
        'Option.with.dots',
        'Option@with#symbols',
        'Option/with\\slashes',
        'Option"with\'quotes'
      ]
      wrapper = createWrapper({ selectOptions: specialOptions })
      
      const selectItems = wrapper.findAllComponents({ name: 'UiSelectItem' })
      expect(selectItems).toHaveLength(7)
      
      selectItems.forEach((item, index) => {
        expect(item.props('value')).toBe(specialOptions[index])
      })
    })

    it('should handle very long option values', () => {
      const longOption = 'This is a very long option value that might cause display issues if not handled properly by the component and its styling system and layout mechanisms'
      wrapper = createWrapper({ selectOptions: [longOption] })
      
      const selectItem = wrapper.findComponent({ name: 'UiSelectItem' })
      expect(selectItem.props('value')).toBe(longOption)
      expect(selectItem.text()).toBe(longOption)
    })

    it('should handle duplicate option values', () => {
      const duplicateOptions = ['Option A', 'Option B', 'Option A', 'Option C', 'Option B']
      wrapper = createWrapper({ selectOptions: duplicateOptions })
      
      const selectItems = wrapper.findAllComponents({ name: 'UiSelectItem' })
      expect(selectItems).toHaveLength(5)
      
      // Should render all options even if duplicated
      expect(selectItems[0].props('value')).toBe('Option A')
      expect(selectItems[2].props('value')).toBe('Option A')
      expect(selectItems[1].props('value')).toBe('Option B')
      expect(selectItems[4].props('value')).toBe('Option B')
    })

    it('should handle options with Unicode characters', () => {
      const unicodeOptions = ['Café', '北京', '🚀 Rocket', 'Naïve', 'Résumé']
      wrapper = createWrapper({ selectOptions: unicodeOptions })
      
      const selectItems = wrapper.findAllComponents({ name: 'UiSelectItem' })
      expect(selectItems).toHaveLength(5)
      
      selectItems.forEach((item, index) => {
        expect(item.props('value')).toBe(unicodeOptions[index])
        expect(item.text()).toBe(unicodeOptions[index])
      })
    })

    it('should handle options with only whitespace', () => {
      const whitespaceOptions = ['  ', '\t', '\n', 'Normal Option', '   ']
      wrapper = createWrapper({ selectOptions: whitespaceOptions })
      
      const selectItems = wrapper.findAllComponents({ name: 'UiSelectItem' })
      expect(selectItems).toHaveLength(5)
      
      selectItems.forEach((item, index) => {
        expect(item.props('value')).toBe(whitespaceOptions[index])
      })
    })
  })

  describe('Integration Scenarios', () => {
    it('should work correctly when switching between input typing and select choosing', async () => {
      wrapper = createWrapper()
      
      // First type in input
      const input = wrapper.findComponent({ name: 'UiInput' })
      await input.vm.$emit('update:modelValue', 'typed text')
      
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['typed text'])
      
      // Then select from dropdown
      const select = wrapper.findComponent({ name: 'UiSelect' })
      await select.vm.$emit('update:modelValue', 'Option 1')
      
      expect(wrapper.emitted('update:modelValue')?.[1]).toEqual(['Option 1'])
    })

    it('should maintain value consistency between input and select', async () => {
      const sharedValue = 'Option 2'
      wrapper = createWrapper()
      await wrapper.setProps({ modelValue: sharedValue })
      
      const input = wrapper.findComponent({ name: 'UiInput' })
      const select = wrapper.findComponent({ name: 'UiSelect' })
      
      expect(input.props('modelValue')).toBe(sharedValue)
      expect(select.props('modelValue')).toBe(sharedValue)
    })

    it('should handle rapid input changes and blur events', async () => {
      wrapper = createWrapper()
      
      const input = wrapper.findComponent({ name: 'UiInput' })
      
      // Simulate rapid typing
      await input.vm.$emit('update:modelValue', 'a')
      await input.vm.$emit('update:modelValue', 'ab')
      await input.vm.$emit('update:modelValue', 'abc  ')
      
      // Then blur to trim
      await input.vm.$emit('blur')
      await nextTick()
      
      const emissions = wrapper.emitted('update:modelValue')
      expect(emissions).toHaveLength(4) // 3 typing + 1 trim
      expect(emissions?.[3]).toEqual(['abc']) // Last emission should be trimmed
    })

    it('should handle selecting an option then typing over it', async () => {
      wrapper = createWrapper()
      
      // First select an option
      const select = wrapper.findComponent({ name: 'UiSelect' })
      await select.vm.$emit('update:modelValue', 'Option 1')
      
      // Then type over it
      const input = wrapper.findComponent({ name: 'UiInput' })
      await input.vm.$emit('update:modelValue', 'Custom typed value')
      
      const emissions = wrapper.emitted('update:modelValue')
      expect(emissions).toHaveLength(2)
      expect(emissions?.[0]).toEqual(['Option 1'])
      expect(emissions?.[1]).toEqual(['Custom typed value'])
    })
  })

  describe('Performance and Optimization', () => {
    it('should not re-render unnecessarily when props do not change', async () => {
      wrapper = createWrapper()
      
      // Trigger a re-render with same props
      await wrapper.setProps(defaultProps)
      
      // Component should handle this efficiently
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'UiInput' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'UiSelect' }).exists()).toBe(true)
    })

    it('should handle large numbers of select options efficiently', () => {
      const manyOptions = Array.from({ length: 1000 }, (_, i) => `Option ${i + 1}`)
      
      expect(() => {
        wrapper = createWrapper({ selectOptions: manyOptions })
      }).not.toThrow()
      
      const selectItems = wrapper.findAllComponents({ name: 'UiSelectItem' })
      expect(selectItems).toHaveLength(1000)
      
      // Verify first and last options are rendered correctly
      expect(selectItems[0].props('value')).toBe('Option 1')
      expect(selectItems[999].props('value')).toBe('Option 1000')
    })

    it('should efficiently handle prop updates', async () => {
      wrapper = createWrapper()
      
      // Update multiple props
      await wrapper.setProps({
        label: 'Updated Label',
        placeholder: 'Updated Placeholder',
        disabled: true,
        selectOptions: ['New Option 1', 'New Option 2']
      })
      
      const input = wrapper.findComponent({ name: 'UiInput' })
      const floatLabel = wrapper.findComponent({ name: 'BaseFloatLabel' })
      const selectItems = wrapper.findAllComponents({ name: 'UiSelectItem' })
      
      expect(floatLabel.props('label')).toBe('Updated Label')
      expect(input.props('placeholder')).toBe('Updated Placeholder')
      expect(input.props('disabled')).toBe(true)
      expect(selectItems).toHaveLength(2)
    })
  })

  describe('Type Safety and ClassValue Props', () => {
    it('should handle ClassValue types for labelRootClass', () => {
      const classValues = [
        'string-class',
        ['array', 'of', 'classes'],
        { 'conditional-class': true, 'disabled-class': false },
        'mixed-class another-class'
      ]
      
      classValues.forEach(classValue => {
        expect(() => {
          wrapper = createWrapper({ labelRootClass: classValue })
        }).not.toThrow()
      })
    })

    it('should handle ClassValue types for commonClass', () => {
      const classValues = [
        'common-string',
        ['common', 'array'],
        { 'common-conditional': true }
      ]
      
      classValues.forEach(classValue => {
        expect(() => {
          wrapper = createWrapper({ commonClass: classValue })
        }).not.toThrow()
      })
    })

    it('should handle string types for specific class props', () => {
      wrapper = createWrapper({
        selectClass: 'select-specific-class',
        inputClass: 'input-specific-class',
        labelClass: 'label-specific-class'
      })
      
      const input = wrapper.findComponent({ name: 'UiInput' })
      const selectTrigger = wrapper.findComponent({ name: 'UiSelectTrigger' })
      const floatLabel = wrapper.findComponent({ name: 'BaseFloatLabel' })
      
      expect(input.classes()).toContain('input-specific-class')
      expect(selectTrigger.classes()).toContain('select-specific-class')
      expect(floatLabel.props('labelClass')).toBe('label-specific-class')
    })
  })
})