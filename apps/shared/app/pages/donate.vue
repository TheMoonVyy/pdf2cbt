<template>
  <div class="flex flex-col items-center grow min-h-0 p-4 overflow-auto border-t-2 pb-10">
    <h1 class="text-2xl font-bold text-center text-green-500 mb-3">
      Liking PDF2CBT?
    </h1>

    <div class="text-center text-gray-400 max-w-full sm:max-w-lg mt-2 space-y-3 leading-relaxed">
      <p>
        I'm Sudhanshu (TheMoonVyy), a 1st year CSE student passionate about computers
        and building tools that make life easier.
      </p>

      <p>
        PDF2CBT is free to use, and I want to keep it that way.<br>
        It takes time and effort to maintain and improve it.
      </p>

      <p>
        If it helped you even a little, you can support me 💚
      </p>
    </div>

    <div class="bg-white p-2 rounded-xl shadow-md my-3">
      <img
        :src="upiQr"
        alt="UPI QR Code"
        class="size-60 object-contain"
      >
    </div>

    <div class="bg-gray-900 border border-gray-700 rounded-xl p-2 text-center">
      <p class="text-sm text-gray-400 mb-1">
        UPI ID
      </p>

      <div class="flex items-center gap-2 justify-center">
        <p class="text-lg font-mono text-green-400">
          {{ upiId }}
        </p>

        <button
          class="text-xs px-1.5 cursor-pointer py-1
            bg-gray-800 border border-gray-600 rounded hover:bg-gray-700"
          :class="isUpiCopied ? 'text-green-500': ''"
          @click="copyUpi"
        >
          Copy
        </button>

        <a
          :href="openUpiUrl"
          class="text-xs px-1.5 py-1
            bg-gray-800 border border-gray-600 rounded hover:bg-gray-700"
        >
          Open
        </a>
      </div>
    </div>

    <p class="text-sm text-gray-400 text-center max-w-sm my-3">
      Even ₹5 is more than enough 🙌<br>
      It's the intention that matters, not the amount 💚
    </p>

    <p class="text-sm text-gray-400 mt-2 text-center space-y-2">
      <strong>Note:</strong> When donating, add the name you want to be shown here in the UPI text note.<br>
      Otherwise, your UPI account name will be shown here (might be your real name).
    </p>

    <div class="w-full max-w-xl mt-4">
      <h2 class="text-lg font-semibold text-center text-green-400 mb-2">
        Supporters 💚
      </h2>

      <ClientOnly>
        <p
          v-if="!supporters?.length"
          class="text-sm text-gray-400 text-center"
        >
          No supporters yet.
        </p>

        <div
          v-else
          class="overflow-x-auto border border-gray-700 rounded-xl"
        >
          <table class="w-full text-sm text-left text-gray-300">
            <thead class="bg-gray-800 text-gray-400 text-center">
              <tr>
                <th class="px-3 py-2">
                  Name
                </th>
                <th class="px-3 py-2">
                  Amount
                </th>
                <th class="px-3 py-2">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(donation, index) in supporters"
                :key="index"
                class="border-t border-gray-700 text-center"
              >
                <td class="px-3 py-2">
                  {{ donation.name }}
                </td>
                <td class="px-3 py-2 text-green-400">
                  ₹{{ donation.amount }}
                </td>
                <td class="px-3 py-2">
                  {{ donation.date }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ClientOnly>
      <p class="text-sm text-gray-400 mt-3 text-center space-y-2">
        The supporters list is updated manually,
        so it may take some time for new contributions to appear.
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import upiQr from '#layers/shared/app/assets/images/upi-qr.jpg?url'
import supportersJsonLocalUrl from '../../../../supporters.json?url'

type Supporters = {
  name: string
  date: string // yyyy-mm-dd
  amount: number // in INR
}[]

const upiId = 'themoonvyy@upi'
const openUpiUrl = 'upi://pay?pa=themoonvyy@upi&pn=TheMoonVyy'

const supporters = shallowRef<Supporters>([])

const isUpiCopied = shallowRef(false)

const upiCopiedSignal = useTimeoutFn(
  () => isUpiCopied.value = false,
  1500,
  {
    immediate: false,
    immediateCallback: false,
  },
)

const SUPPORTERS_JSON_URL = 'https://cdn.jsdelivr.net/gh/TheMoonVyy/pdf2cbt@prod/supporters.json'

async function loadSupportersList() {
  try {
    const freshList = await $fetch(SUPPORTERS_JSON_URL, { params: { t: Date.now() } })
    if (!Array.isArray(freshList)) throw new Error()

    supporters.value = freshList
  }
  catch {
    $fetch(supportersJsonLocalUrl)
      .then((localList) => {
        if (Array.isArray(localList))
          supporters.value = localList
      })
  }
}

function copyUpi() {
  isUpiCopied.value = false
  upiCopiedSignal.stop()

  navigator?.clipboard?.writeText(upiId)
    ?.then(() => {
      isUpiCopied.value = true
      upiCopiedSignal.start()
    })
    ?.catch(err => useErrorToast('Error copying UPI ID into clipboard!', err))
}

onBeforeMount(() => {
  loadSupportersList()
})
</script>
