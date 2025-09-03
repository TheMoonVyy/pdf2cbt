# Changelog

## [1.23.0](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.22.1...v1.23.0) (2025-09-03)


### Features

* **cbt-interface:** add feature to show preview of whole question paper and add setting to allow disabling mouse wheel to prevent scrolling using it ([a52e0bd](https://github.com/TheMoonVyy/pdf2cbt/commit/a52e0bd5d2ab7b2b735f81167f532e95f6db2854))

## [1.22.1](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.22.0...v1.22.1) (2025-07-29)


### Bug Fixes

* on test interface prevent dialog overlap, disable animation on start-test dialog and on results page fix answer key dialog not showing when clicked on generate results ([c61a159](https://github.com/TheMoonVyy/pdf2cbt/commit/c61a159a5368692dac772d1a73c78d574061c9db))

## [1.22.0](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.21.0...v1.22.0) (2025-07-27)


### Features

* add ability to load existing data to edit on pdf cropper page, and in generate answer key page load answer key present in the loaded json data ([9ef765d](https://github.com/TheMoonVyy/pdf2cbt/commit/9ef765dde1ec9f89ebeab48f56471b32b3cf6504))

## [1.21.0](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.20.1...v1.21.0) (2025-07-26)


### Features

* add toast and show errors via toast ([b6959a6](https://github.com/TheMoonVyy/pdf2cbt/commit/b6959a67aba806ac0c7322e3806be60f971ab8d2))

## [1.20.1](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.20.0...v1.20.1) (2025-07-25)


### Bug Fixes

* **cbt-results:** fix notes dialog not showing up when opened ([2861c5a](https://github.com/TheMoonVyy/pdf2cbt/commit/2861c5acd16783f253c58833df1b7b42dc9e5ef6))

## [1.20.0](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.19.1...v1.20.0) (2025-07-25)


### Features

* **cbt-results:** improve layout of question preview panel, separating question images and info into different columns for width screens ([6c78b1f](https://github.com/TheMoonVyy/pdf2cbt/commit/6c78b1f79be626bf5e22bd8b7d151d35e402b9f9))

## [1.19.1](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.19.0...v1.19.1) (2025-07-21)


### Bug Fixes

* **generate-answer-key-page:** fix OR not working in input answer field for NAT question type ([7ea8ee0](https://github.com/TheMoonVyy/pdf2cbt/commit/7ea8ee0ceb188371f9557a40b3c0f833dcf92c8a))

## [1.19.0](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.18.0...v1.19.0) (2025-07-18)


### New Features

* **pdf-cropper:** add ability to bulk edit group of questions, sections, subjects on pdf cropper ([51140ae](https://github.com/TheMoonVyy/pdf2cbt/commit/51140ae5ece531665eea84462f9b9f178de53d0d))


### Reverts

* **ci:** restore last-release-sha config of release please ([b3cc172](https://github.com/TheMoonVyy/pdf2cbt/commit/b3cc172dc42ed1471c694fbf061598ce1ab1b63b))

## [1.9.0](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.8.0...v1.9.0) (2025-07-18)


### New Features

* **pdf-cropper:** add ability to bulk edit group of questions, sections, subjects on pdf cropper ([51140ae](https://github.com/TheMoonVyy/pdf2cbt/commit/51140ae5ece531665eea84462f9b9f178de53d0d))


### Reverts

* **ci:** restore last-release-sha config of release please ([b3cc172](https://github.com/TheMoonVyy/pdf2cbt/commit/b3cc172dc42ed1471c694fbf061598ce1ab1b63b))

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
