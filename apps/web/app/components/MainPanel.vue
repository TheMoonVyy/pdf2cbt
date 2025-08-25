<script lang="ts" setup>
import { useForm } from 'vee-validate'
import * as z from 'zod'

const tooltipContent = {
  searchRegion: {
    pageNums: 'For numbering, you can use 1, 2, 3... for pages from the beginning,\n'
      + 'and L (= L1), L2, L3... for pages from the end.\n\n'
      + '• L, L2, L3... → Pages counted from the end of the PDF:\n'
      + '    • L or L1 → last page\n'
      + '    • L2 → second last page\n'
      + '    • L3 → third last page\n'
      + '    (and so on)\n\n'
      + 'To specify pages, use these formats:\n\n'
      + '• Range → Use p-q format (e.g. 1-10 or 2-L). Both p and q are included.\n'
      + '• Specific pages → Use comma-separated values (e.g. 2, 4, 7, L3, L).\n'
      + '• Mixed format → Combine ranges and specific pages (e.g. 1-5, 7, 9-12, L4-L, 13-L).\n'
      + '• all → All pages.\n'
      + '• none → No pages.\n\n'
      + 'Case is insensitive so upper and lower case mean the same.',
  },
}

const boundariesSchema = z.object({
  left: z.string().regex(/^\d+(\s*%)?$/, 'Invalid format'),
  right: z.string().regex(/^\d+(\s*%)?$/, 'Invalid format'),
  top: z.string().regex(/^\d+(\s*%)?$/, 'Invalid format'),
  bottom: z.string().regex(/^\d+(\s*%)?$/, 'Invalid format'),
}).refine(
  (val) => {
    const parse = (v: string) => parseInt(v)
    if (val.left.endsWith('%') === val.right.endsWith('%')) {
      if (parse(val.left) === parse(val.right)) return false
      if (parse(val.left) > parse(val.right)) return false
    }
    if (val.top.endsWith('%') === val.bottom.endsWith('%')) {
      if (parse(val.top) === parse(val.bottom)) return false
      if (parse(val.top) > parse(val.bottom)) return false
    }
    if (val.left.endsWith('%') && parse(val.left) > 100) return false
    if (val.right.endsWith('%') && parse(val.right) > 100) return false
    if (val.top.endsWith('%') && parse(val.top) > 100) return false
    if (val.bottom.endsWith('%') && parse(val.bottom) > 100) return false
    return true
  },
  { message: 'Invalid region boundaries' },
)

const pagesSchema = z.object({
  include: z.string().min(1, 'Required'),
  exclude: z.string().min(1, 'Required'),
})

const schema = z.object({
  name: z.string().min(1, 'Required'),
  pattern: z.string().min(1, 'Required'),
  type: z.enum(['regex', 'text']),
  flags: z.object({
    ignoreCase: z.boolean(),
    dotAll: z.boolean(),
  }),
  pages: pagesSchema,
  boundaries: boundariesSchema,
})

const form = useForm({
  validationSchema: schema,
  initialValues: {
    name: '',
    pattern: '',
    type: 'text',
    flags: {
      ignoreCase: false,
      dotAll: false,
    },
    pages: {
      include: 'all',
      exclude: 'none',
    },
    boundaries: {
      left: '0',
      right: '100%',
      top: '0',
      bottom: '100%',
    },
  },
})

function onSubmit(values: unknown) {
  // handle save
  console.log('Form values:', values)
}
</script>

<template>
  <UiForm
    :form="form"
    @submit="onSubmit"
  >
    <UiCard class="space-y-6 mt-4 px-2">
      <UiCardContent class="flex flex-col w-full gap-6 divide-y px-0">
        <div class="flex gap-8 items-center justify-center px-4 pb-4">
          <div class="flex flex-col gap-4">
            <p class="text-sm text-muted-foreground">
              Final name shown in output data.
            </p>
            <UiFormField
              v-slot="{ field }"
              name="name"
            >
              <UiFormItem>
                <UiFormLabel>Subject Name</UiFormLabel>
                <UiFormControl>
                  <UiInput
                    v-bind="field"
                    class="text-center"
                  />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </UiFormField>
          </div>
          <div class="flex flex-col gap-4">
            <p class="text-sm text-muted-foreground">
              {{ utilKeyToLabel(form.values.type) }} pattern to find subject start location.
            </p>
            <div class="flex items-center justify-center">
              <BaseButton
                class="rounded-r-none"
                variant="outline"
                size="icon"
                :icon-name="form.values.type === 'regex'
                  ? 'material-symbols:regular-expression'
                  : 'my-icon:txt'"
                icon-size="1.6rem"
                icon-class="text-green-400"
                @click="form.setFieldValue('type', form.values.type === 'regex' ? 'text' : 'regex')"
              />
              <UiFormField
                v-slot="{ field }"
                name="pattern"
              >
                <UiFormItem>
                  <UiFormLabel>{{ utilKeyToLabel(form.values.type) }} Pattern</UiFormLabel>
                  <UiFormControl>
                    <UiInput
                      v-bind="field"
                      class="rounded-l-none rounded-r-none text-center"
                    />
                  </UiFormControl>
                  <UiFormMessage />
                </UiFormItem>
              </UiFormField>
              <BaseButton
                v-if="form.values.type === 'text'"
                class="rounded-l-none"
                variant="outline"
                size="icon"
                icon-name="material-symbols:match-case-rounded"
                :icon-class="form.values.flags.ignoreCase ? '' : 'text-green-400'"
                icon-size="1.6rem"
                @click="form.setFieldValue('flags.ignoreCase', !form.values.flags.ignoreCase)"
              />
            </div>
          </div>
        </div>

        <div class="flex flex-col items-center justify-center gap-4 pb-4">
          <p class="text-center font-semibold">
            Crop Region/Area Configuration
          </p>
          <div class="flex gap-6 border rounded-md divide-x">
            <div class="flex flex-col items-center gap-1 py-2 px-4">
              <div class="flex items-center justify-center gap-2">
                <span>Pages to Consider</span>
                <IconWithTooltip
                  :content="tooltipContent.searchRegion.pageNums"
                  icon-size="1.25rem"
                />
              </div>
              <p class="text-sm text-muted-foreground text-center col-span-2">
                All other pages will be ignored.
              </p>
              <div class="flex flex-col gap-5 mt-4">
                <UiFormField
                  v-slot="{ field }"
                  name="pages.include"
                >
                  <UiFormItem>
                    <UiFormLabel>Include</UiFormLabel>
                    <UiFormControl>
                      <UiInput
                        v-bind="field"
                        placeholder="e.g. 1-5,7"
                        class="text-center"
                      />
                    </UiFormControl>
                    <UiFormMessage />
                  </UiFormItem>
                </UiFormField>
                <UiFormField
                  v-slot="{ field }"
                  name="pages.exclude"
                >
                  <UiFormItem>
                    <UiFormLabel>Exclude</UiFormLabel>
                    <UiFormControl>
                      <UiInput
                        v-bind="field"
                        placeholder="e.g. 2,4"
                        class="text-center"
                      />
                    </UiFormControl>
                    <UiFormMessage />
                  </UiFormItem>
                </UiFormField>
              </div>
            </div>
            <div class="flex flex-col items-center gap-1 py-2 px-4">
              <p class="text-center font-medium col-span-2">
                Clip-In Area
              </p>
              <p class="text-sm text-muted-foreground text-center col-span-2">
                Content will be restricted within these boundaries.
              </p>
              <div class="grid grid-cols-2 gap-5 mt-4">
                <UiFormField
                  v-slot="{ field }"
                  name="boundaries.left"
                >
                  <UiFormItem>
                    <UiFormLabel>Left</UiFormLabel>
                    <UiFormControl>
                      <UiInput
                        v-bind="field"
                        class="text-center"
                      />
                    </UiFormControl>
                    <UiFormMessage />
                  </UiFormItem>
                </UiFormField>
                <UiFormField
                  v-slot="{ field }"
                  name="boundaries.right"
                >
                  <UiFormItem>
                    <UiFormLabel>Right</UiFormLabel>
                    <UiFormControl>
                      <UiInput
                        v-bind="field"
                        class="text-center"
                      />
                    </UiFormControl>
                    <UiFormMessage />
                  </UiFormItem>
                </UiFormField>
                <UiFormField
                  v-slot="{ field }"
                  name="boundaries.top"
                >
                  <UiFormItem>
                    <UiFormLabel>Top</UiFormLabel>
                    <UiFormControl>
                      <UiInput
                        v-bind="field"
                        class="text-center"
                      />
                    </UiFormControl>
                    <UiFormMessage />
                  </UiFormItem>
                </UiFormField>
                <UiFormField
                  v-slot="{ field }"
                  name="boundaries.bottom"
                >
                  <UiFormItem>
                    <UiFormLabel>Bottom</UiFormLabel>
                    <UiFormControl>
                      <UiInput
                        v-bind="field"
                        class="text-center"
                      />
                    </UiFormControl>
                    <UiFormMessage />
                  </UiFormItem>
                </UiFormField>
              </div>
            </div>
          </div>
        </div>
      </UiCardContent>
    </UiCard>
    <UiButton
      class="w-full mt-4"
      type="submit"
    >
      Save Subject
    </UiButton>
  </UiForm>
</template>
