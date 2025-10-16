import url1 from '#layers/shared/app/assets/json/pattern-cropper-configs/new.json?url'

export const builtInConfigs: PatternModeBuiltInConfig[] = [
  {
    id: -1,
    name: 'New',
    url: url1,
    subjects: {
      Physics: ['Physics Section 1'],
    },
  },
] as const
