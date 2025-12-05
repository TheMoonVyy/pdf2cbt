import { CbtUseState } from '#layers/shared/shared/enums'

const defaultUiSettings: CbtUiSettings = {
  mainLayout: {
    testTotalHeaderHeight: 2.2,
    sectionHeaderHeight: 2.7,
    sectionHeaderAndQuesPanelDividerHeight: 1.7,
    questionTypeFontSize: 1,
    markingSchemeFontSize: 0.875,
    questionTimeSpentFontSize: 1,
    questionNumFontSize: 1,
    showQuestionType: true,
    showMarkingScheme: true,
    showQuestionTimeSpent: false,
    showQuestionPaperBtn: true,
    showScrollToTopAndBottomBtns: true,
    disableMouseWheel: false,
  },

  themes: {
    base: {
      bgColor: '#ffffff',
      textColor: '#000000',
    },
    primary: {
      bgColor: '#7d00b3',
      textColor: '#ffffff',
    },
    secondary: {
      bgColor: '#daeff8',
      textColor: '#000000',
    },
  },

  questionPanel: {
    answerOptionsFormat: {
      mcqAndMsq: {
        prefix: 'Option ',
        suffix: '',
        counterType: 'upper-latin',
        fontSize: 1.6,
        zoomSize: 1.2,
        rowGap: 0.8,
      },
      msm: {
        row: {
          prefix: '(',
          suffix: ')',
          counterType: 'upper-latin',
          fontSize: 1.6,
          gap: 1.3,
        },
        col: {
          prefix: '(',
          suffix: ')',
          counterType: 'upper-pqrs',
          fontSize: 1.6,
          gap: 1.3,
        },
        zoomSize: 1.5,
      },
    },
    questionImgMaxWidth: {
      maxWidthWhenQuestionPaletteOpened: 95,
      maxWidthWhenQuestionPaletteClosed: 100,
    },
  },

  questionPalette: {
    width: 24,
    sectionTextFontSize: 1.2,
    columnsGap: 0.7,
    rowsGap: 0.6,
    quesIcons: {
      answered: {
        image: '',
        textColor: '#000000',
        iconSize: 3.2,
        numberTextFontSize: 1.1,
        summaryIconSize: 2.5,
        summaryNumberTextFontSize: 1,
        summaryLabelFontSize: 1,
      },
      notAnswered: {
        image: '',
        textColor: '#000000',
        iconSize: 3.2,
        numberTextFontSize: 1.1,
        summaryIconSize: 2.5,
        summaryNumberTextFontSize: 1,
        summaryLabelFontSize: 1,
      },
      notVisited: {
        image: '',
        textColor: '#000000',
        iconSize: 3.2,
        numberTextFontSize: 1.1,
        summaryIconSize: 2.5,
        summaryNumberTextFontSize: 1,
        summaryLabelFontSize: 1,
      },
      marked: {
        image: '',
        textColor: '#ffffff',
        iconSize: 3.2,
        numberTextFontSize: 1.1,
        summaryIconSize: 2.5,
        summaryNumberTextFontSize: 1,
        summaryLabelFontSize: 1,
      },
      markedAnswered: {
        image: '',
        textColor: '#ffffff',
        iconSize: 3.2,
        numberTextFontSize: 1.1,
        summaryIconSize: 2.5,
        summaryNumberTextFontSize: 1,
        summaryLabelFontSize: 1,
      },
    },
  },
}

const defaultTestSettings: CbtTestSettings = {
  testName: 'Mock Test 1',
  timeFormat: 'mmm:ss',
  submitBtn: 'enabled',
  showPauseBtn: false,
  durationInSeconds: 3 * 60 * 60,
  questionImgScale: 2,
  saveTestData: true,
  saveQuestionsLikeRealExams: true,
}

const defaultMiscSettings: MiscSettings = {
  username: 'User Name',
  fontSize: 1.3,
  profileImg: '',
  imgWidth: 85,
  imgHeight: 85,
}

export default () => {
  const uiSettings = useState<CbtUiSettings>(
    CbtUseState.UiSettings,
    () => structuredClone(defaultUiSettings),
  )
  const testSettings = useState<CbtTestSettings>(
    CbtUseState.TestSettings,
    () => structuredClone(defaultTestSettings),
  )
  const miscSettings = useState<MiscSettings>(
    CbtUseState.MiscSettings,
    () => structuredClone(defaultMiscSettings),
  )

  return {
    uiSettings,
    defaultUiSettings,
    testSettings,
    defaultTestSettings,
    miscSettings,
    defaultMiscSettings,
  }
}
