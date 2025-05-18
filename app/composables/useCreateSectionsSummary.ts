export default (
  testSectionsDataRef: Ref<TestSectionsData>,
  testSectionsSummaryRef: Ref<TestSectionsSummary>,
) => {
  testSectionsSummaryRef.value.clear()

  for (const section of Object.keys(testSectionsDataRef.value)) {
    const sectionKey = section as TestSectionKey

    const summaryComputed = computed<TestSectionSummary>(() => {
      const summary: TestSectionSummary = {
        answered: 0,
        notAnswered: 0,
        notVisited: 0,
        marked: 0,
        markedAnswered: 0,
      }

      const sectionData = testSectionsDataRef.value[sectionKey]
      if (sectionData) {
        for (const question of Object.keys(sectionData)) {
          const status = sectionData[question]!.status
          summary[status] += 1
        }
      }

      return summary
    })

    const _ = summaryComputed.value // trigger computed getter
    testSectionsSummaryRef.value.set(sectionKey, summaryComputed)
  }
}
