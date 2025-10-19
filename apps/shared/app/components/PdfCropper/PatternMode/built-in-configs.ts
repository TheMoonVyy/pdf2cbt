import url1 from '#layers/shared/app/assets/json/pattern-cropper-configs/new.json?url'
import url2 from '#layers/shared/app/assets/json/pattern-cropper-configs/allen-dlp-75q-left-column.json?url'
import url3 from '#layers/shared/app/assets/json/pattern-cropper-configs/allen-dlp-90q-left-column.json?url'
import url4 from '#layers/shared/app/assets/json/pattern-cropper-configs/allen-dlp-75q-right-column.json?url'
import url5 from '#layers/shared/app/assets/json/pattern-cropper-configs/allen-dlp-90q-right-column.json?url'

export const builtInConfigs: PatternModeBuiltInConfig[] = [
  {
    id: -1,
    name: 'New',
    url: url1,
    subjects: {
      Physics: ['Physics Section 1'],
    },
  },
  {
    id: -2,
    name: 'Allen DLP JEE Main (75 Q) (english i.e. left column)',
    url: url2,
    subjects: {
      Physics: [
        'Physics Section 1',
        'Physics Section 2',
      ],
      Chemistry: [
        'Chemistry Section 1',
        'Chemistry Section 2',
      ],
      Mathematics: [
        'Mathematics Section 1',
        'Mathematics Section 2',
      ],
    },
  },
  {
    id: -3,
    name: 'Allen DLP JEE Main (90 Q) (english i.e. left column)',
    url: url3,
    subjects: {
      Physics: [
        'Physics Section 1',
        'Physics Section 2',
      ],
      Chemistry: [
        'Chemistry Section 1',
        'Chemistry Section 2',
      ],
      Mathematics: [
        'Mathematics Section 1',
        'Mathematics Section 2',
      ],
    },
  },
  {
    id: -4,
    name: 'Allen DLP JEE Main (75 Q) (other lang i.e. right column)',
    url: url4,
    subjects: {
      Physics: [
        'Physics Section 1',
        'Physics Section 2',
      ],
      Chemistry: [
        'Chemistry Section 1',
        'Chemistry Section 2',
      ],
      Mathematics: [
        'Mathematics Section 1',
        'Mathematics Section 2',
      ],
    },
  },
  {
    id: -5,
    name: 'Allen DLP JEE Main (90 Q) (other lang i.e. right column)',
    url: url5,
    subjects: {
      Physics: [
        'Physics Section 1',
        'Physics Section 2',
      ],
      Chemistry: [
        'Chemistry Section 1',
        'Chemistry Section 2',
      ],
      Mathematics: [
        'Mathematics Section 1',
        'Mathematics Section 2',
      ],
    },
  },
] as const
