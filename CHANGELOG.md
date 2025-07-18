# Changelog

## [1.9.0](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.8.0...v1.9.0) (2025-07-18)


### New Features

* add ability to make questions in section/subject optional, and add ability to set answer options counter type per question in pdf cropper ([#53](https://github.com/TheMoonVyy/pdf2cbt/issues/53)) ([56150e5](https://github.com/TheMoonVyy/pdf2cbt/commit/56150e5833afb056b9b13c17d49c090640f1b736))
* add support for multiple select matrix question type ([b37fee7](https://github.com/TheMoonVyy/pdf2cbt/commit/b37fee7a38a45534ef14ae74005d53bde60dfc6f))
* **cbt-interface:** extend UI customization settings with font size settings for question type, number, time spent and marking scheme ([890648f](https://github.com/TheMoonVyy/pdf2cbt/commit/890648f46d268dd041992484e585a7e1ff373858))
* **cbt-results:** add feature to add and manage notes per question per test in question panel or preview of results page ([a322437](https://github.com/TheMoonVyy/pdf2cbt/commit/a3224371c254b9ba8fc08d6add98c082c2e6b1fa))
* **docs:** add docs to generate answer key page and msm question type docs to pdf cropper docs ([cd52515](https://github.com/TheMoonVyy/pdf2cbt/commit/cd52515c1a113fddf1d8d52d089f818669329c3e))
* **generate-answer-key:** support multiple answers for mcq type and multiple answer ranges for nat type ([05f1640](https://github.com/TheMoonVyy/pdf2cbt/commit/05f164059f3b54e8ce58d158673b63830ecf096f))
* **pdf-cropper:** add ability to bulk edit group of questions, sections, subjects on pdf cropper ([51140ae](https://github.com/TheMoonVyy/pdf2cbt/commit/51140ae5ece531665eea84462f9b9f178de53d0d))
* **pdf-cropper:** add bulk delete option for overlays on current page in edit mode ([439a146](https://github.com/TheMoonVyy/pdf2cbt/commit/439a14618458b27cc031840c75e54eb51ac5c4b4))
* **pdf-cropper:** add docs to pdf cropper page to be shown until pdf file is selected by user, make the docs a separate component under components/Docs folder, refactor homepage to point to the docs on pdf cropper instead ([f47ee51](https://github.com/TheMoonVyy/pdf2cbt/commit/f47ee5172e4430f860e05c55b510c5d3faa14805))
* **pdf-cropper:** separate crop and edit logic into separate new components, improve scaling logic by using css vars and make pdf cropper more versatile ([b108c69](https://github.com/TheMoonVyy/pdf2cbt/commit/b108c69de72dbc5ff71bb2b6ece818fad6362091))
* **ui:** migrate ui to use shadcn-vue, nuxt color picker and tanstack table ([2fa7db1](https://github.com/TheMoonVyy/pdf2cbt/commit/2fa7db18ba56bd7e6587bba16610c4840f798932))


### Bug Fixes

* **cbt-interface:** fix current question timeSpent in testLogs of test interface ([b0f5fab](https://github.com/TheMoonVyy/pdf2cbt/commit/b0f5fab3d4ebbf2aa08f7d1f25dc2cb593f600a3))
* **cbt-results-ques-panel:** fix result status labels of mcq question type in question panel not showing properly ([7bf1acf](https://github.com/TheMoonVyy/pdf2cbt/commit/7bf1acf688a01f1ee949916b73dee4e7b593b204))
* **pdf-cropper-settings:** bind switch inputs to model for boolean settings ([0c79c09](https://github.com/TheMoonVyy/pdf2cbt/commit/0c79c09bc5085a8166a5455909f85c6e2b8e080d))
* **pdf-cropper:** refactor data structure and fix issues around merged questions ([5929709](https://github.com/TheMoonVyy/pdf2cbt/commit/59297095b26b772910c75bd5404a5245e4417e7d))
* **pdf-cropper:** replace structuredClone with explicit object creation to avoid proxy error ([67d981f](https://github.com/TheMoonVyy/pdf2cbt/commit/67d981f4027bfdf555ac4e522c5461737827d1de))
* **utils:** fix utilStringifyAnswer to convert the mcq answer number to its respective character ([164fda5](https://github.com/TheMoonVyy/pdf2cbt/commit/164fda50832b3dc1087bf7f4601eb9f0fc847198))


### Documentation

* **pdf-cropper-docs:** fix typos and grammer ([00c2cd1](https://github.com/TheMoonVyy/pdf2cbt/commit/00c2cd118b243f0fc9e3eccd27d31a392fc050db))


### Styles

* **icons:** replace static icons with animate on render icons ([aa67bae](https://github.com/TheMoonVyy/pdf2cbt/commit/aa67bae9d5de846d650f59b3f32d2ffc100b149b))
* **pdf-cropper:** fix a typo ([b83d6cf](https://github.com/TheMoonVyy/pdf2cbt/commit/b83d6cfb3ca688b094c3069151eff65f5c3572e1))
* **pdf-cropper:** hide image container until pdf is loaded ([04774ac](https://github.com/TheMoonVyy/pdf2cbt/commit/04774ac41be50dad2bfdae846f67fd5c1f434a7f))


### Code Refactoring

* **cbt-interface-file-upload:** move zip-from-url feature option from data-file-type dropdown to a separate button ([06d2077](https://github.com/TheMoonVyy/pdf2cbt/commit/06d2077cb01117af0855edaf4e63a8df06f73d03))
* change project structure into nuxt layers ([#47](https://github.com/TheMoonVyy/pdf2cbt/issues/47)) ([c785660](https://github.com/TheMoonVyy/pdf2cbt/commit/c78566090a3b649078e1f4cdc8f8f6f064f885c2))
* **components:** remove filename path-prefixes as Nuxt normalizes with pathPrefix ([d69e5ff](https://github.com/TheMoonVyy/pdf2cbt/commit/d69e5fff77ed80d571fc6bd3bed6641c6e244c75))
* **components:** replace primevue-volt tree component with new custom BaseTreeCheckbox component ([c83c3aa](https://github.com/TheMoonVyy/pdf2cbt/commit/c83c3aa00a20e82110bf368522f65b04550caa8d))
* **db:** centralize Dexie DB read and write logic ([43fbd21](https://github.com/TheMoonVyy/pdf2cbt/commit/43fbd21cf9be9e0be40adeedababd5c42dac5c37))
* **icons:** move custom icons used in icon component to new IconBundle folder and update nuxt icon config to include all used icons in client bundle ([1d4a1a8](https://github.com/TheMoonVyy/pdf2cbt/commit/1d4a1a81478db121e6c10ec7a2fbe52ee1f0fb61))
* **mupdf:** centralize logic to determine mupdf script urls into a composable ([b9829f5](https://github.com/TheMoonVyy/pdf2cbt/commit/b9829f5c7056d57b6db93da5dbe3382beae5ad21))
* **pdf-cropper:** remove redundant console log ([07b8914](https://github.com/TheMoonVyy/pdf2cbt/commit/07b8914657c76fbeb81d48dfe4f462b6e0dab921))
* **results:** refactor test notes to keep just current test notes with a shared composable across components ([95e2666](https://github.com/TheMoonVyy/pdf2cbt/commit/95e26666552df46bad2f1d7a2a88871722c8789d))
* **template-ref:** replace templateRef of vueuse with vue native useTemplateRef ([5a846e1](https://github.com/TheMoonVyy/pdf2cbt/commit/5a846e1d9e28f02fe9dedae45c532aff019f9a36))
* **theme-variants:** remove yellow theme as its dark background matches neutral ([b14a410](https://github.com/TheMoonVyy/pdf2cbt/commit/b14a410ffbd6c0ab73b6cd2b94e3ac3cbc112f7a))

## [1.18.0](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.17.0...v1.18.0) (2025-07-17)


### Features

* add ability to make questions in section/subject optional, and add ability to set answer options counter type per question in pdf cropper ([#53](https://github.com/TheMoonVyy/pdf2cbt/issues/53)) ([56150e5](https://github.com/TheMoonVyy/pdf2cbt/commit/56150e5833afb056b9b13c17d49c090640f1b736))

## [1.17.0](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.16.0...v1.17.0) (2025-07-14)


### Features

* **docs:** add docs to generate answer key page and msm question type docs to pdf cropper docs ([cd52515](https://github.com/TheMoonVyy/pdf2cbt/commit/cd52515c1a113fddf1d8d52d089f818669329c3e))

## [1.16.0](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.15.1...v1.16.0) (2025-07-13)


### Features

* add support for multiple select matrix question type ([b37fee7](https://github.com/TheMoonVyy/pdf2cbt/commit/b37fee7a38a45534ef14ae74005d53bde60dfc6f))

## [1.15.1](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.15.0...v1.15.1) (2025-06-19)


### Bug Fixes

* **pdf-cropper-settings:** bind switch inputs to model for boolean settings ([0c79c09](https://github.com/TheMoonVyy/pdf2cbt/commit/0c79c09bc5085a8166a5455909f85c6e2b8e080d))

## [1.15.0](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.14.0...v1.15.0) (2025-06-19)


### Features

* **ui:** migrate ui to use shadcn-vue, nuxt color picker and tanstack table ([2fa7db1](https://github.com/TheMoonVyy/pdf2cbt/commit/2fa7db18ba56bd7e6587bba16610c4840f798932))

## [1.14.0](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.13.2...v1.14.0) (2025-06-09)


### Features

* **pdf-cropper:** add bulk delete option for overlays on current page in edit mode ([439a146](https://github.com/TheMoonVyy/pdf2cbt/commit/439a14618458b27cc031840c75e54eb51ac5c4b4))

## [1.13.2](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.13.1...v1.13.2) (2025-06-09)


### Bug Fixes

* **pdf-cropper:** refactor data structure and fix issues around merged questions ([5929709](https://github.com/TheMoonVyy/pdf2cbt/commit/59297095b26b772910c75bd5404a5245e4417e7d))

## [1.13.1](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.13.0...v1.13.1) (2025-06-06)


### Bug Fixes

* **pdf-cropper:** replace structuredClone with explicit object creation to avoid proxy error ([67d981f](https://github.com/TheMoonVyy/pdf2cbt/commit/67d981f4027bfdf555ac4e522c5461737827d1de))

## [1.13.0](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.12.0...v1.13.0) (2025-06-02)


### Features

* **pdf-cropper:** add docs to pdf cropper page to be shown until pdf file is selected by user, make the docs a separate component under components/Docs folder, refactor homepage to point to the docs on pdf cropper instead ([f47ee51](https://github.com/TheMoonVyy/pdf2cbt/commit/f47ee5172e4430f860e05c55b510c5d3faa14805))

## [1.12.0](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.11.0...v1.12.0) (2025-06-01)


### Features

* **pdf-cropper:** separate crop and edit logic into separate new components, improve scaling logic by using css vars and make pdf cropper more versatile ([b108c69](https://github.com/TheMoonVyy/pdf2cbt/commit/b108c69de72dbc5ff71bb2b6ece818fad6362091))

## [1.11.0](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.10.2...v1.11.0) (2025-05-25)


### Features

* **cbt-interface:** extend UI customization settings with font size settings for question type, number, time spent and marking scheme ([890648f](https://github.com/TheMoonVyy/pdf2cbt/commit/890648f46d268dd041992484e585a7e1ff373858))

## [1.10.2](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.10.1...v1.10.2) (2025-05-25)


### Bug Fixes

* **cbt-results-ques-panel:** fix result status labels of mcq question type in question panel not showing properly ([7bf1acf](https://github.com/TheMoonVyy/pdf2cbt/commit/7bf1acf688a01f1ee949916b73dee4e7b593b204))

## [1.10.1](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.10.0...v1.10.1) (2025-05-25)


### Bug Fixes

* **utils:** fix utilStringifyAnswer to convert the mcq answer number to its respective character ([164fda5](https://github.com/TheMoonVyy/pdf2cbt/commit/164fda50832b3dc1087bf7f4601eb9f0fc847198))

## [1.10.0](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.9.1...v1.10.0) (2025-05-25)


### Features

* **generate-answer-key:** support multiple answers for mcq type and multiple answer ranges for nat type ([05f1640](https://github.com/TheMoonVyy/pdf2cbt/commit/05f164059f3b54e8ce58d158673b63830ecf096f))

## [1.9.1](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.9.0...v1.9.1) (2025-05-23)


### Bug Fixes

* **cbt-interface:** fix current question timeSpent in testLogs of test interface ([b0f5fab](https://github.com/TheMoonVyy/pdf2cbt/commit/b0f5fab3d4ebbf2aa08f7d1f25dc2cb593f600a3))

## [1.9.0](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.8.0...v1.9.0) (2025-05-22)


### Features

* **cbt-results:** add feature to add and manage notes per question per test in question panel or preview of results page ([a322437](https://github.com/TheMoonVyy/pdf2cbt/commit/a3224371c254b9ba8fc08d6add98c082c2e6b1fa))

## [1.8.0](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.7.3...v1.8.0) (2025-05-21)


### Features

* **pdf-cropper:** let user upload cropper data zip file if already present so that it can be used to pre generate images ([e968c00](https://github.com/TheMoonVyy/pdf2cbt/commit/e968c0045e80cc2e0994ea7281c2844a62e54cd5))

## [1.7.3](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.7.2...v1.7.3) (2025-05-20)


### Bug Fixes

* **cbt-interface:** scale question images dynamically and fix mcq options of cropper data not being set and being always fixed to 4 total options ([fa61cf1](https://github.com/TheMoonVyy/pdf2cbt/commit/fa61cf140e4df8d314aded652fc5e11720209304))

## [1.7.2](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.7.1...v1.7.2) (2025-05-20)


### Bug Fixes

* **cbt-interface-settings-panel:** fix an issue where zipurl is being overrided with empty url ([79b0d49](https://github.com/TheMoonVyy/pdf2cbt/commit/79b0d4947d109820176f3ea80be4f73b657ccef7))

## [1.7.1](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.7.0...v1.7.1) (2025-05-20)


### Bug Fixes

* **util-fetch-zip:** assign parsedHref to originalUrl instead of convertedUrl which was then returning original url as empty string ([3a6c1c6](https://github.com/TheMoonVyy/pdf2cbt/commit/3a6c1c6629b454370d7cdb19b4f8a3f08a1d7cb9))

## [1.7.0](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.6.1...v1.7.0) (2025-05-17)


### Features

* **pdf-cropper:** save marking scheme of each question type and set it to current marking scheme when question type is changed by user and add more info to generate output dialog ([d4052d2](https://github.com/TheMoonVyy/pdf2cbt/commit/d4052d2e74e9bf4214cc057d9936732c2fda9f56))

## [1.6.1](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.6.0...v1.6.1) (2025-05-17)


### Bug Fixes

* **generate-test-images:** add use device pixel ratio prop to fix dpr always being used instead of only for cbt interface ([866ae61](https://github.com/TheMoonVyy/pdf2cbt/commit/866ae6122fb568020ba2feae0167090964f1b3d8))

## [1.6.0](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.5.0...v1.6.0) (2025-05-16)


### Features

* **zip-from-url:** store zip url in json data if user uses zip from url feature to automatically use it in results page ([017d36c](https://github.com/TheMoonVyy/pdf2cbt/commit/017d36c7690504841dabb3bf177539a76edb650a))

## [1.5.0](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.4.0...v1.5.0) (2025-05-15)


### Features

* **main-navbar:** display project version from package.json in navbar next to project name ([49d95ea](https://github.com/TheMoonVyy/pdf2cbt/commit/49d95ea2811eadc5caa2477bc00018d493f79e95))
