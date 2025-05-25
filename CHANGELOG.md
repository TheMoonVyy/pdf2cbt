# Changelog

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
