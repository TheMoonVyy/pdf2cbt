import { h } from 'vue'

export const pagesTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', 'Specify the pages to search in.'),
  h('p', [
    'For numbering, you can use ',
    h('strong', '1, 2, 3...'),
    ' for pages from the beginning and ',
    h('strong', 'L (= L1), L2, L3...'),
    ' for pages from the end.',
  ]),
  h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
    h('li', [
      h('strong', 'L, L2, L3...'),
      ' (pages counted from the end):',
      h('ul', { class: 'list-disc ml-6 mt-1 space-y-1 [&>li]:mb-0.5' }, [
        h('li', [h('strong', 'L or L1'), ': last page']),
        h('li', [h('strong', 'L2'), ': second last page']),
        h('li', [h('strong', 'L3'), ': third last page']),
        h('li', 'and so on...'),
      ]),
    ]),
  ]),
  h('p', 'To specify pages, use these formats:'),
  h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
    h('li', [
      h('strong', 'Range'),
      ': p-q format, both p and q are included.',
      h('br'),
      'e.g. "1-10" or "2-L"',
    ]),
    h('li', [
      h('strong', 'Specific pages'),
      ': comma-separated values to specifically pick these pages.',
      h('br'),
      'e.g. "2, 4, 7, L3, L".',
    ]),
  ]),
  h('p', [
    'You can combine ranges and specific pages.',
    h('br'),
    'e.g. "1-5, 7, 9-12, L4-L, 13-L".',
    h('br'),
    'Using this you can exclude certain pages, ',
    'for example "1-8, 10-L" includes all pages excluding 9.',
  ]),
  h('p', 'Case is insensitive so upper and lower case mean the same.'),
])

export const subjectEndTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', [
    'This is optional as typically next subject\'s start '
    + 'indicates the end of the current subject.',
    h('br'),
    'This is useful when PDF contains solutions/answers '
    + 'after subject.',
    h('br'),
    'Heading of solutions/answers '
    + 'can be used for end pattern to prevent the tool '
    + 'from cropping the solutions as questions.',
  ]),
])

export const partialMarkingTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p',
    h('strong', 'If you want JEE Advanced format then use +1 as partial marking.'),
  ),
  h('p',
    'While JEE Advanced format looks complex, the logic for partial marking in a nutshell is:',
  ),
  h('p', 'marks awarded = no. of partially correct answer * 1.'),
  h('p', { class: 'mt-3' }, [
    'Look at their format properly,',
    'you will notice you get +1 for each option you answer correctly',
    ' (when the case is of "partially correct").',
  ]),
])

export const answerOptionsCounterTypeTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', [
    'Counter type to use while showing options in test interface',
    ' and question preview (of results page).',
  ]),
  h('p', [
    'If "Default" is selected then uses the counter type as',
    ' it is in test interface\'s UI Settings & Customization.',
  ]),
])

const absOrRelativeCoordinate = h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
  h('li', [
    h('strong', 'Exact coordinate'),
    ': in same units as shown in crop section (unit is in points, 1 point = 1/72 inch).',
    h('br'),
    'e.g. "72".',
  ]),
  h('li', [
    h('strong', 'Relative coordinate'),
    ': in percentage of page width (for left/right) and height (for top/bottom).',
    h('br'),
    'e.g. "50%".',
  ]),
])

const coordinateSystemNote = () => h('p', [
  h('strong', 'Note: '),
  h('br'),
  'Top left corner of the page is taken as origin (i.e. x=0, y=0).',
  h('br'),
  'For left/right (x-axis) coordinate increases as you move rightwards.',
  h('br'),
  'For top/bottom (y-axis) coordinate increases as you move downwards.',
])

export const searchInAreaTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', 'Specify the boundaries (sides) of the area to consider.'),
  h('p', 'You can specify coordinate in two ways:'),
  absOrRelativeCoordinate,
  coordinateSystemNote(),
])

export const columnsTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', [
    'The way the tool works is that on each page ',
    'it searches for patterns line by line from top to bottom of pages.',
    h('br'),
    'So if questions are arranged in multiple columns then ',
    'the tool needs to go through the page again from top to bottom ',
    ' while shifting the area to search in to next column.',
  ]),
  h('p', [
    'Columns are added/removed based on number of dividers in',
    h('br'),
    '"Subject Config -> Column dividers".',
    h('br'),
    'Total columns = 1 + no. of column dividers.',
  ]),
  h('p', [
    'Generally column dividers divide columns into equal widths ',
    '(if 2 columns then column divider is typically at 50% of page width).',
  ]),
  h('p', [
    'This is an example of questions structure which has 2 columns (hence one column divider):',
    h('br'),
    'Q1... | Q4...',
    h('br'),
    'Q2... | Q5...',
    h('br'),
    'Q3... | Q6...',
  ]),
  h('p', [
    'Note that the tool traverses from top to bottom and then next column (left to right).',
    h('br'),
    'So if the questions are arranged in zig-zag manner like this:',
    h('br'),
    'Q1... | Q2...',
    h('br'),
    'Q3... | Q4...',
    h('br'),
    'Q5... | Q6...',
    h('br'),
    'then make sure that',
    h('br'),
    '"questions config -> Obtained question number ->',
    h('br'),
    'Next Q.Num must be one num greater..." is turned off.',
  ]),
  h('p', [
    'Note that when 2 column are same question but in different languages ',
    'then this should be treated as 1 column instead of 2.',
    h('br'),
    'As the tool needs to go from top to bottom of page only once. ',
    'When left column part of page is needed, set the',
    h('br'),
    '"Questions Config -> Column -> Crop -> Exactly To -> Right"',
    h('br'),
    'value to where left column ends (typically at 50% of page width).',
    h('br'),
    'When right column part of page is needed, set the',
    h('br'),
    '"Questions Config -> Column -> Question Start -> Search In-> Left"',
    h('br'),
    'value to where right column starts (typically at 50% of page width).',
  ]),
])

export const columnDividersTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', [
    'Specify the x-axis coordinates of dividers (if exists)',
    ' that divide page\'s questions into multiple columns.',
  ]),
  h('p', 'You can specify x-axis coordinate of dividers in two ways:'),
  h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
    h('li', [
      h('strong', 'Exact coordinate'),
      ': in same units as shown in crop section (unit is in points, 1 point = 1/72 inch).',
      h('br'),
      'If there are more than 1 divider then separate each coordinate with a comma.',
      h('br'),
      'e.g. "72" or "272, 345"',
    ]),
    h('li', [
      h('strong', 'Relative coordinate'),
      ': in percentage of page width.',
      h('br'),
      'If there are more than 1 divider then separate each coordinate with a comma.',
      h('br'),
      'e.g. "50%" (i.e. middle of the page) or "33%, 66%".',
    ]),
  ]),
  columnsTooltipContent(),
])

export const obtainedQuestionNumberTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', 'The question number obtained from matched question start pattern.'),
  h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
    h('li', [
      h('strong', 'When Duplicate'),
      ': ignore/merge/replace when another question is ',
      'found with duplicate question number in same section.',
    ]),
    h('li', [
      h('strong', 'Next Q.Num must be one num greater...'),
      ': whether to only consider matched question number if it is exactly one number greater ',
      'than previous question\'s number in same section.',
      h('br'),
      'Generally this should be enabled to avoid false positives ',
      'unless question numbering is not sequential in PDF.',
    ]),
  ]),
])

export const forTopCoordinateLookupTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', [
    h('strong', 'Without lookup'),
    ', top coordinate of matched text of ',
    'question start pattern is used as top coordinate of question.',
    h('br'),
    'While this works for most cases, it will cut off part of question ',
    ' that is above the start pattern text (like diagrams, math expressions etc).',
    h('br'),
    'To solve this issue, we can look up for content above the matched text ',
    'to find a better top coordinate for question.',
  ]),

  h('p', [
    h('strong', 'With lookup'),
    ', tool will look up for text/image/vector (as specified by you) ',
    'by given coordinates (relative to current top value),',
    ' if at least one element is found then it will use ',
    'the topmost element as top coordinate of question.',
    h('br'),
    'You can chain multiple lookups by given coordinates to refine the top coordinate further, ',
    'It will keep on chaining the lookups until the lookup fails to find any element.',
  ]),

  h('p', [
    h('strong', 'Warning: '),
    'if pdf contains other elements ',
    'around the question like watermarks then due to the way the look up logic is, ',
    'it may end up using watermark\'s top coordinate which may be incorrect top coordinate.',
  ]),
])

export const forBottomCoordinateUseBottomTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', [
    h('strong', 'By Default'),
    ', top coordinate of next question start or end pattern\'s text ',
    'is taken as bottom coordinate of current question.',
    h('br'),
    'While this won\'t cut off any part, ',
    'but it can include blank space or unwanted content at the end of question.',
  ]),

  h('p', [
    'To solve this issue, we can use the bottom coordinate of ',
    'the bottom-most text/image/vector (as specified by you) ',
    'that is fully on/inside the initial question area.',
  ]),

  h('p', [
    'Unlike "top coordinate lookup" logic, due to how "bottom coordinate" logic is, ',
    'other elements like watermarks won\'t be making it worse than initial bottom coordinate.',
  ]),
])

export const paragraphQuestionsTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', [
    'Paragraph/Table questions are a type of questions ',
    'which has a common para/table followed by questions based on it.',
    h('br'),
    h('br'),
    'For example in this structure:',
    h('br'),
    '---- para/table -----',
    h('br'),
    '---- Q1 -----',
    h('br'),
    '---- Q2 -----',
    h('br'),
    '---- Q3 -----',
    h('br'),
    h('br'),
    'After crop it will end up as this structure:',
    h('br'),
    '---- para/table -----',
    h('br'),
    '---- Q1 -----',
    h('br'),
    '---- para/table -----',
    h('br'),
    '---- Q2 -----',
    h('br'),
    '---- para/table -----',
    h('br'),
    '---- Q3 -----',
  ]),
])

export const paraCommonPartStartTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', [
    'Specify the start pattern and location to search in, ',
    'to signal the start of the common part of para/table.',
  ]),
  h('p', [
    'You can use text like "Common part for..." ',
    'or something similar in your pdf as start pattern.',
  ]),
])

export const paraCommonPartEndTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', [
    'Specify the end pattern and location to search in, ',
    'to signal the end of the common part of para/table.',
  ]),
  h('p', [
    'This is optional as typically question\'s start pattern ',
    'indicates the end of common para/table part.',
  ]),
  h('p', [
    'Note that if end pattern is provided then it or ',
    'question start will end the para/table part (whichever comes first).',
  ]),
])

export const cropTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', 'Crop related settings applied after initial crop area is determined.'),
])

export const paraCommonPartCropExactlyToTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', [
    'You can set the left/right coordinate of cropped area to ',
    'exactly the coordinate you want.',
    h('br'),
    'Exact Coordinate or in % (relative to page).',
  ]),
  h('p', [
    'When value is not provided (input box is empty) ',
    'then coordinate is determined in these ways: ',
  ]),
  h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
    h('li', [
      h('strong', 'For Left coordinate'),
      ': Left coordinate of the left-most text character ',
      'of the line in search area containing the matched start pattern is used.',
    ]),
    h('li', [
      h('strong', 'For Right coordinate'),
      ': Value of current',
      h('br'),
      '"Column -> Crop -> Exactly To -> Right" is used',
    ]),
  ]),
])

export const questionsCropExactlyToTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', [
    'You can set the left/right coordinate of cropped area to exactly the coordinate you want.',
    h('br'),
    'Exact Coordinate or in % (relative to page).',
  ]),
  h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
    h('li', [
      h('strong', 'For Left coordinate'),
      ': When blank, Left coordinate of the matched question start pattern is used.',
    ]),
    h('li', [
      h('strong', 'For Right coordinate'),
      ': This is required. Typically this is same as page/column\'s width (hence a fixed value).',
    ]),
  ]),
])

export const cropOffsetByTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', [
    'Offset cropped area\'s position relative to current position by given values.',
    h('br'),
    'Offset can be positive or negative values.',
    h('br'),
    'Offset is applied after cropped area\'s final position is determined. ',
    'This means after offset, there will be no further changes to cropped area\'s position.',
  ]),
  coordinateSystemNote(),
])

export const questionsStartPatternTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', [
    'The start pattern is used to obtain question number (if present) ',
    'and initial top and left coordinates of the question.',
  ]),
  h('p', [
    'Question number itself can be used as question start pattern.',
    h('br'),
    'e.g. "1.", "1)", "1).", "Q1", "Q.1", "Q1.", "Q1)" etc.',
  ]),
  h('p', 'You can provide question start pattern in two ways:'),
  h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
    h('li', [
      h('strong', 'Text Pattern'),
      ': Text Pattern has prefix, question number range and suffix.',
      h('br'),
      h('br'),
      'Prefix is text before the question number.',
      h('br'),
      'Suffix is text after the question number.',
      h('br'),
      'Question number range is range of question numbers that this pattern applies to. ',
      h('br'),
      h('br'),
      'Remember Q. Num range is used to exclude number range that won\'t be question number. ',
      'This becomes critical in patterns that doesn\'t ',
      'have unique prefix/suffix (e.g. "1", "3." will also match 3.14 i.e. pi).',
      h('br'),
      h('br'),
      'e.g. for pattern "Q1." to Q90.", prefix is "Q", ',
      'question number range is "1-90" and suffix is ".".',
      h('br'),
      h('br'),
      'Internally "Text Pattern" is converted to "Regex Pattern".',
      h('br'),
      'Note that a condition that start pattern has ',
      'to be the first thing in line of search area is applied',
      '(i.e. ^\\s* prefix is added which converting text pattern to regex pattern).',
    ]),
    h('li', [
      h('strong', 'Regex Pattern'),
      ': Through Regex pattern we get more flexibility and accuracy for question start pattern.',
      h('br'),
      h('br'),
      'You can use capturing group i.e. "()" to capture Q. Num to use.',
      h('br'),
      h('br'),
      'If there are multiple capturing groups then only first group is used as Q. Num.',
      h('br'),
      h('br'),
      'If there is no capturing group then tool ',
      'will use first continuous digits it finds as Q. num. ',
      h('br'),
      'e.g. for "Q75.", "75." and "Q75.57" it will use 75 as Q. Num.',
      h('br'),
      h('br'),
      'If no digits are found then it will assign Q. Num as its SL. No. w.r.t section ',
      '(i.e. Q. Num starts from 1 in each section).',
      h('br'),
      h('br'),
      '"Fx" button has some helper tools and common patterns for Q. Start Regex Pattern.',
    ]),
  ]),
])

export const questionsEndTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', [
    'This is optional as typically next question\'s start pattern ',
    'indicates the end of current question.',
  ]),
  h('p', [
    'Note that if end pattern is provided then it or ',
    'next question start will end the current question (whichever comes first).',
  ]),
])

export const questionsCropWithinTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', [
    'This is to limit the top and bottom boundaries ',
    'of cropped area to be within given top and bottom values.',
    h('br'),
    'This will make sure that the cropped area is always within these boundaries.',
  ]),
  h('p', [
    'This is useful when your pdf pages has header ',
    'and/or footers at same positions.',
    h('br'),
    'You can set the top and bottom boundaries such that ',
    'the header and footer are excluded from being considered in crop related calculations.',
  ]),
])

export const yCoordinateGroupingRangeForLineTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', [
    'This is the ',
    h('strong', 'maximum vertical range'),
    ' (in PDF units) for line grouping.',
  ]),
  h('p', [
    'It specifies how far apart two characters\' Y-midpoints ',
    '(the average of its top and bottom Y coordinates) can be ',
    'and still be grouped into the same visual line of text.',
  ]),
])

export const calculateCharacterBoundariesPreciselyTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', [
    'This option affects how accurately the tool determines the ',
    h('strong', 'size and position'),
    ' of every characters.',
  ]),

  h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
    h('li', [
      h('strong', 'When Enabled (Precise)'),
      ': The boundaries for each character are calculated ',
      'very precisely (by analyzing outline of their shape).',
      h('br'),
      'High precision can introduce tiny vertical offsets that may ',
      'cause characters to be incorrectly separated into different lines ',
      'if your Y-coordinate grouping range is set too low.',
      h('br'),
      'Use this only when lines are too close to each other.',
    ]),
    h('li', [
      h('strong', 'When Disabled (Faster)'),
      ': The boundaries are calculated using a faster, simpler method ',
      'and usually provides better line grouping.',
      h('br'),
      'This is recommended unless lines in your pdf are too close to each other.',
    ]),
  ]),
])
