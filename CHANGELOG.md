# Changelog

## [1.20.0](https://github.com/TheMoonVyy/pdf2cbt/compare/v1.19.0...v1.20.0) (2025-07-18)


### New Features

* add ability to make questions in section/subject optional, and add ability to set answer options counter type per question in pdf cropper ([#53](https://github.com/TheMoonVyy/pdf2cbt/issues/53)) ([56150e5](https://github.com/TheMoonVyy/pdf2cbt/commit/56150e5833afb056b9b13c17d49c090640f1b736))
* add cbt-answer-key page ([#5](https://github.com/TheMoonVyy/pdf2cbt/issues/5)) ([915d364](https://github.com/TheMoonVyy/pdf2cbt/commit/915d364507baf5068498e9a7d9c8f3185bb62ed5))
* add home page ([#3](https://github.com/TheMoonVyy/pdf2cbt/issues/3)) ([05da5dd](https://github.com/TheMoonVyy/pdf2cbt/commit/05da5ddfd68f645213f1af90f6c901348d89dfe4))
* add pdf file hash verification and storage in cropper and test interface outputs ([331a3e2](https://github.com/TheMoonVyy/pdf2cbt/commit/331a3e2ada55e58f3e0bd5690e116cc71a20b6ed))
* add support for multiple select matrix question type ([b37fee7](https://github.com/TheMoonVyy/pdf2cbt/commit/b37fee7a38a45534ef14ae74005d53bde60dfc6f))
* add support for range of numbers and multiple values as correct answer for nat question type ([df61139](https://github.com/TheMoonVyy/pdf2cbt/commit/df61139df29ac29f9ba60647fa315a7cd9ac559b))
* **cbt-generate-answer-key:** add support for loading test output data from db ([382f53b](https://github.com/TheMoonVyy/pdf2cbt/commit/382f53bfd8d619dddd4002338d9dc00b8bffcb48))
* **cbt-interface:** add cbt interface ([#1](https://github.com/TheMoonVyy/pdf2cbt/issues/1)) ([580db87](https://github.com/TheMoonVyy/pdf2cbt/commit/580db871c43904edb419dd39b3eb06502fb05362))
* **cbt-interface:** add cbt interface page ([#2](https://github.com/TheMoonVyy/pdf2cbt/issues/2)) ([a128a13](https://github.com/TheMoonVyy/pdf2cbt/commit/a128a136ad11734257cd2acdf3b522e3d7448ddc))
* **cbt-interface:** add feature to pass the testAnswerKey data if found in input zip or json to results page ([3bb9576](https://github.com/TheMoonVyy/pdf2cbt/commit/3bb95765158f3313e90b44365fdb18b0076baf07))
* **cbt-interface:** add hidden settings drawer and add question img max width settings ([09ad71d](https://github.com/TheMoonVyy/pdf2cbt/commit/09ad71d58a06b91256499d11a3e9f523c78e56e4))
* **cbt-interface:** add pause/resume test and show spent time per question in the test interface ([56908f5](https://github.com/TheMoonVyy/pdf2cbt/commit/56908f5ebc4ecacf1fdce0b0c6d94216e4fb2102))
* **cbt-interface:** add testName to currentTestState ([65c92fa](https://github.com/TheMoonVyy/pdf2cbt/commit/65c92fa3ba031d538f21450fdbbb1852559090b6))
* **cbt-interface:** add testResultOverview and pdfData of cropper data to TestOutputData ([958fbe6](https://github.com/TheMoonVyy/pdf2cbt/commit/958fbe60eacebc0fa0826aa75529548be8bcf050))
* **cbt-interface:** after submitting test, redirect to results if test data is saved to db, else show download button with error msg ([eee5400](https://github.com/TheMoonVyy/pdf2cbt/commit/eee5400e11ee2689d8f0f2f1ba2d988df473bcc0))
* **cbt-interface:** extend UI customization settings with font size settings for question type, number, time spent and marking scheme ([890648f](https://github.com/TheMoonVyy/pdf2cbt/commit/890648f46d268dd041992484e585a7e1ff373858))
* **cbt-interface:** pass questions image urls to results page after test is submitted ([47b9799](https://github.com/TheMoonVyy/pdf2cbt/commit/47b979960ba3896bbcae209f44f9177b69e4b7e0))
* **cbt-interface:** support loading test data zip file from URL and test settings via url query parameters ([3e29e09](https://github.com/TheMoonVyy/pdf2cbt/commit/3e29e099871a35c6d3412be31bca255f4b1f2292))
* **cbt-results:** add CbtResultsScoreCard component to show total, per-subject or per-section result summary ([819e1ad](https://github.com/TheMoonVyy/pdf2cbt/commit/819e1ad7e7c51db45e53ffcedd0dd14c49b84005))
* **cbt-results:** add components, utils, and more charts to results page ([#7](https://github.com/TheMoonVyy/pdf2cbt/issues/7)) ([aa05ea1](https://github.com/TheMoonVyy/pdf2cbt/commit/aa05ea19652241b3bf72a9764cbaac3a2d7ae014))
* **cbt-results:** add detailed page panel to show test data in tabular format in detail ([#10](https://github.com/TheMoonVyy/pdf2cbt/issues/10)) ([13bce38](https://github.com/TheMoonVyy/pdf2cbt/commit/13bce38bdbc85b3d9438c3fdc15a51e36e18279a))
* **cbt-results:** add development notice heading to results page ([e517d24](https://github.com/TheMoonVyy/pdf2cbt/commit/e517d24000a6b8403094278cbfb8a9f3acfdfc08))
* **cbt-results:** add feature to add and manage notes per question per test in question panel or preview of results page ([a322437](https://github.com/TheMoonVyy/pdf2cbt/commit/a3224371c254b9ba8fc08d6add98c082c2e6b1fa))
* **cbt-results:** add filter and highlight controls to questions table ([2ab3418](https://github.com/TheMoonVyy/pdf2cbt/commit/2ab3418a2787af9950f8f7bffde354092c381c25))
* **cbt-results:** add filter to detailed table questions by time spent range ([5e81e72](https://github.com/TheMoonVyy/pdf2cbt/commit/5e81e7246c2f6d53eee31e25e47ea8a146659bcd))
* **cbt-results:** add hash validation and cropper upload dialogs to question panel of results page ([5aed75b](https://github.com/TheMoonVyy/pdf2cbt/commit/5aed75b47c49bc0b287bbefdf26ae575f5eaa7c7))
* **cbt-results:** add panels, utils, components for results page ([#8](https://github.com/TheMoonVyy/pdf2cbt/issues/8)) ([4a9ec7b](https://github.com/TheMoonVyy/pdf2cbt/commit/4a9ec7bd323880fbface0477ce459f9e7b6d3ffe))
* **cbt-results:** add question panel to preview questions on results page ([05dbfb1](https://github.com/TheMoonVyy/pdf2cbt/commit/05dbfb1a711dbfc6aeb82ac6712307b19b4ff150))
* **cbt-results:** add rename test name functionality to tests being shown and stored in db ([ad51635](https://github.com/TheMoonVyy/pdf2cbt/commit/ad51635181f902874759023f4dc65c5b648140ad))
* **cbt-results:** add toggleable overall questions panel and time spent sorting ([1cc90ff](https://github.com/TheMoonVyy/pdf2cbt/commit/1cc90ff2881d204f01bfb99a31dd528d255b0d78))
* **cbt-results:** added attempt type, time spent and time journey for analysis in results.vue ([#4](https://github.com/TheMoonVyy/pdf2cbt/issues/4)) ([a2ae362](https://github.com/TheMoonVyy/pdf2cbt/commit/a2ae36253fce140c2ea98574775052fb173cd04a))
* **cbt-results:** enhance results handling and improve import export ux ([#9](https://github.com/TheMoonVyy/pdf2cbt/issues/9)) ([9a94ca8](https://github.com/TheMoonVyy/pdf2cbt/commit/9a94ca84f24b818c8ddcc918a8b56c5a50502b59))
* **ci:** setup github actions for automated releases and include build static asset zip in releases ([91a8e8c](https://github.com/TheMoonVyy/pdf2cbt/commit/91a8e8ca6430bc2a7e35bf99215bbe4584701e88))
* **components:** add zoom slider to test journey chart in CbtResultsChartsPanel component ([1f5bec6](https://github.com/TheMoonVyy/pdf2cbt/commit/1f5bec65bc766241502f268f13da77d4548b1482))
* **components:** fix button state logic of CbtResultsOverviewCard to show correct button state ([0e41a92](https://github.com/TheMoonVyy/pdf2cbt/commit/0e41a927090cbe4ec0e40b7a817e332771aed88f))
* **docs:** add docs to generate answer key page and msm question type docs to pdf cropper docs ([cd52515](https://github.com/TheMoonVyy/pdf2cbt/commit/cd52515c1a113fddf1d8d52d089f818669329c3e))
* **generate-answer-key:** add function to nagivate question input via arrow up, down and enter keys ([ce63e88](https://github.com/TheMoonVyy/pdf2cbt/commit/ce63e88721328c7a7c7c00538b9fc436e5a421f4))
* **generate-answer-key:** support multiple answers for mcq type and multiple answer ranges for nat type ([05f1640](https://github.com/TheMoonVyy/pdf2cbt/commit/05f164059f3b54e8ce58d158673b63830ecf096f))
* **homepage:** add detailed instructions on how to use the project ([3f9e8f6](https://github.com/TheMoonVyy/pdf2cbt/commit/3f9e8f60d0f90f59b87ba4b30341a45795494d87))
* **main-navbar:** display project version from package.json in navbar next to project name ([49d95ea](https://github.com/TheMoonVyy/pdf2cbt/commit/49d95ea2811eadc5caa2477bc00018d493f79e95))
* **pdf-cropper:** add ability to bulk edit group of questions, sections, subjects on pdf cropper ([51140ae](https://github.com/TheMoonVyy/pdf2cbt/commit/51140ae5ece531665eea84462f9b9f178de53d0d))
* **pdf-cropper:** add bulk delete option for overlays on current page in edit mode ([439a146](https://github.com/TheMoonVyy/pdf2cbt/commit/439a14618458b27cc031840c75e54eb51ac5c4b4))
* **pdf-cropper:** add docs to pdf cropper page to be shown until pdf file is selected by user, make the docs a separate component under components/Docs folder, refactor homepage to point to the docs on pdf cropper instead ([f47ee51](https://github.com/TheMoonVyy/pdf2cbt/commit/f47ee5172e4430f860e05c55b510c5d3faa14805))
* **pdf-cropper:** add info tooltip explaining partial marking for msq questions ([1b68fd8](https://github.com/TheMoonVyy/pdf2cbt/commit/1b68fd87f588b51321d39d219b650f7d46ee07af))
* **pdf-cropper:** let user upload cropper data zip file if already present so that it can be used to pre generate images ([e968c00](https://github.com/TheMoonVyy/pdf2cbt/commit/e968c0045e80cc2e0994ea7281c2844a62e54cd5))
* **pdf-cropper:** save marking scheme of each question type and set it to current marking scheme when question type is changed by user and add more info to generate output dialog ([d4052d2](https://github.com/TheMoonVyy/pdf2cbt/commit/d4052d2e74e9bf4214cc057d9936732c2fda9f56))
* **pdf-cropper:** separate crop and edit logic into separate new components, improve scaling logic by using css vars and make pdf cropper more versatile ([b108c69](https://github.com/TheMoonVyy/pdf2cbt/commit/b108c69de72dbc5ff71bb2b6ece818fad6362091))
* **pre-generate-images:** add option to pre generate images to store in zip file of pdf cropper ([#13](https://github.com/TheMoonVyy/pdf2cbt/issues/13)) ([294ee04](https://github.com/TheMoonVyy/pdf2cbt/commit/294ee04a776f7a920093873d028da5c197ccd105))
* **results-components:** add image resize controls for question images for question panel ([4cb21f1](https://github.com/TheMoonVyy/pdf2cbt/commit/4cb21f14a4e29edd145da75a9e8f886128b277cc))
* **results-demo:** update demo data for results page to also include question preview ([89d28c1](https://github.com/TheMoonVyy/pdf2cbt/commit/89d28c168691d661286f103704f5cda51239040c))
* show notice dialog when user is on backup website ([123eac1](https://github.com/TheMoonVyy/pdf2cbt/commit/123eac106199e156db04ed2d2dcceed9443cfa06))
* **ui:** migrate ui to use shadcn-vue, nuxt color picker and tanstack table ([2fa7db1](https://github.com/TheMoonVyy/pdf2cbt/commit/2fa7db18ba56bd7e6587bba16610c4840f798932))
* **zip-from-url:** store zip url in json data if user uses zip from url feature to automatically use it in results page ([017d36c](https://github.com/TheMoonVyy/pdf2cbt/commit/017d36c7690504841dabb3bf177539a76edb650a))


### Bug Fixes

* **base-components:** fix styling of base simple filer upload component ([d4551cd](https://github.com/TheMoonVyy/pdf2cbt/commit/d4551cd30ee79dfe86db6dd2b998f63d27719f34))
* **base-components:** set number grouping prop to false for base input number component ([cc226d4](https://github.com/TheMoonVyy/pdf2cbt/commit/cc226d4c3577e7127502c43d6deba68119d75609))
* **cbt-interface-settings-panel:** fix an issue where zipurl is being overrided with empty url ([79b0d49](https://github.com/TheMoonVyy/pdf2cbt/commit/79b0d4947d109820176f3ea80be4f73b657ccef7))
* **cbt-interface:** fix current question timeSpent in testLogs of test interface ([b0f5fab](https://github.com/TheMoonVyy/pdf2cbt/commit/b0f5fab3d4ebbf2aa08f7d1f25dc2cb593f600a3))
* **cbt-interface:** fix main layout size not lowering on small screen devices ([1020161](https://github.com/TheMoonVyy/pdf2cbt/commit/1020161ab4692a6dd2e0b16fc7a341900e77acd1))
* **cbt-interface:** fix mcq radio input not working as intended ([c59d177](https://github.com/TheMoonVyy/pdf2cbt/commit/c59d17708e3722ec60d83f37b04cb1cca44c12e1))
* **cbt-interface:** fix zip from url not being loaded ([f98cc20](https://github.com/TheMoonVyy/pdf2cbt/commit/f98cc202a9f00ab321fbb0a00da7bcab76e51e8d))
* **cbt-interface:** scale question images dynamically and fix mcq options of cropper data not being set and being always fixed to 4 total options ([fa61cf1](https://github.com/TheMoonVyy/pdf2cbt/commit/fa61cf140e4df8d314aded652fc5e11720209304))
* **cbt-results-ques-panel:** fix result status labels of mcq question type in question panel not showing properly ([7bf1acf](https://github.com/TheMoonVyy/pdf2cbt/commit/7bf1acf688a01f1ee949916b73dee4e7b593b204))
* **cbt-results:** assign new object to testResultQuestionsData to ensure reactivity ([e2631ed](https://github.com/TheMoonVyy/pdf2cbt/commit/e2631ed8892ce7aeb2ac6f861c083b9fa1443f6d))
* **cbt-results:** change font size of rename button from small to default ([58f9767](https://github.com/TheMoonVyy/pdf2cbt/commit/58f97670410dd10f34d01aba6c930a5417c3d5df))
* **cbt-results:** compare numeric answers using float instead of string ([205aca3](https://github.com/TheMoonVyy/pdf2cbt/commit/205aca383b23a1d6ed5f025259271f88cd251562))
* **cbt-results:** correct typo in under development message ([ab3476a](https://github.com/TheMoonVyy/pdf2cbt/commit/ab3476ab7b99cc0b040f1d5cd87ede02a663c1e5))
* **cbt-results:** fix an issue where answer key was not being saved to db ([9ed44f8](https://github.com/TheMoonVyy/pdf2cbt/commit/9ed44f8849f1a05fc7cb2f623a4d1149a713334f))
* **cbt-results:** fix an issue where if only one section is present in subjects then CbtResultsDetailedPanel was raising an error ([8b3fa5e](https://github.com/TheMoonVyy/pdf2cbt/commit/8b3fa5e3fc36169b8edbce55f31728852edf159c))
* **cbt-results:** fix an issue where testOutputData was not loading in charts ([67cce94](https://github.com/TheMoonVyy/pdf2cbt/commit/67cce94e94672983be62b32e84254cbbc8f31b80))
* **cbt-results:** fix dialog visibility not syncing with parent as it was being passed as prop instead of v-model ([f12aa98](https://github.com/TheMoonVyy/pdf2cbt/commit/f12aa98a949751c6b88fa285fcb4fb3a7c0f7cb5))
* **cbt-results:** fix score card questionsAttempted logic to only count questions that was answered or markedAnswered ([3de1d5c](https://github.com/TheMoonVyy/pdf2cbt/commit/3de1d5cfc231b8680a34c508db20cd2af6e2d517))
* **components:** fix filtering of CbtResultsQuestionPanel not working when subject is testoverall ([bdeb98d](https://github.com/TheMoonVyy/pdf2cbt/commit/bdeb98d046e21a0bf2fcf770d1aee9c377b86229))
* **components:** fix my tests section in results page showing generate results for test that already has results generated ([1cf2c0b](https://github.com/TheMoonVyy/pdf2cbt/commit/1cf2c0b3092fbaf3a753c36d56c29e09e359dff5))
* **components:** fix typo in CbtResultsQuestionPanel where instead of index, que id was being used to navigate ([528fdc2](https://github.com/TheMoonVyy/pdf2cbt/commit/528fdc2f055b5891bf364ee4d517da48db4db725))
* **generate-test-images:** add use device pixel ratio prop to fix dpr always being used instead of only for cbt interface ([866ae61](https://github.com/TheMoonVyy/pdf2cbt/commit/866ae6122fb568020ba2feae0167090964f1b3d8))
* **mupdf-worker:** fix issue where getPageImage is returning scaled page instead of original scale ([cad3aa4](https://github.com/TheMoonVyy/pdf2cbt/commit/cad3aa41ef8d9d4c15cf4462814f5d2438ac54b5))
* **pdf-cropper-settings:** bind switch inputs to model for boolean settings ([0c79c09](https://github.com/TheMoonVyy/pdf2cbt/commit/0c79c09bc5085a8166a5455909f85c6e2b8e080d))
* **pdf-cropper:** fix answer options input not hiding when question type is nat ([054e241](https://github.com/TheMoonVyy/pdf2cbt/commit/054e241102ae35e895cec4d02bb621f47c240285))
* **pdf-cropper:** fix broken float layout class ([4db704c](https://github.com/TheMoonVyy/pdf2cbt/commit/4db704ca9304866ead3325a6b810199c731af7a5))
* **pdf-cropper:** fix zoom or scale not being in sync with the one found in local storage ([16003fb](https://github.com/TheMoonVyy/pdf2cbt/commit/16003fb55b80f34505684c88550de7f03d330268))
* **pdf-cropper:** prevent pdf page image width from being restricted on overflow ([2224540](https://github.com/TheMoonVyy/pdf2cbt/commit/2224540cc2c34d6b724a993853f015b18d90b2e1))
* **pdf-cropper:** prevent pdf page img from being dragged ([2074c7a](https://github.com/TheMoonVyy/pdf2cbt/commit/2074c7afcaf1a6e3c4b0daedaaea37a5efc53123))
* **pdf-cropper:** refactor data structure and fix issues around merged questions ([5929709](https://github.com/TheMoonVyy/pdf2cbt/commit/59297095b26b772910c75bd5404a5245e4417e7d))
* **pdf-cropper:** remove redundant prefix from incorrect marks input ([3410ab5](https://github.com/TheMoonVyy/pdf2cbt/commit/3410ab548a65a3bb55b62c8fdc0a8ef4d4fe6122))
* **pdf-cropper:** replace structuredClone with explicit object creation to avoid proxy error ([67d981f](https://github.com/TheMoonVyy/pdf2cbt/commit/67d981f4027bfdf555ac4e522c5461737827d1de))
* resolve tailwind minification issues with lightningcss ([1298af0](https://github.com/TheMoonVyy/pdf2cbt/commit/1298af013a25a2e871418309005fcac699a662dd))
* **results-components:** clarify time spent filter label with unit ([86ccd23](https://github.com/TheMoonVyy/pdf2cbt/commit/86ccd2308ecb2c4cd746b5b5fdbe800cde56ac6c))
* **results-components:** free pdf buffer and cropper data after images are generated in CbtResultsQuestionPanel ([2cf722a](https://github.com/TheMoonVyy/pdf2cbt/commit/2cf722aa9d26da90314e47a081ddd50313cf06ad))
* **style:** fix popover arrow positioning issue ([da09b3a](https://github.com/TheMoonVyy/pdf2cbt/commit/da09b3a398466b632ed599e154b8a38e171660d1))
* **style:** fix scrollbar not showing in pdf cropper page for question details panel ([47431ea](https://github.com/TheMoonVyy/pdf2cbt/commit/47431eacb6215a17370adcc9683bd35eea68a417))
* **style:** fix scrolling issue on submit panel of cbt interface ([a62b628](https://github.com/TheMoonVyy/pdf2cbt/commit/a62b628e4fe7b4cd4b6a30f1e4c801f5678d061d))
* **util-fetch-zip:** assign parsedHref to originalUrl instead of convertedUrl which was then returning original url as empty string ([3a6c1c6](https://github.com/TheMoonVyy/pdf2cbt/commit/3a6c1c6629b454370d7cdb19b4f8a3f08a1d7cb9))
* **utils:** fix utilStringifyAnswer to convert the mcq answer number to its respective character ([164fda5](https://github.com/TheMoonVyy/pdf2cbt/commit/164fda50832b3dc1087bf7f4601eb9f0fc847198))


### Performance Improvements

* **pdf-cropper:** reduce debounce delay for scale and qualityFactor updates ([edd706f](https://github.com/TheMoonVyy/pdf2cbt/commit/edd706f1c6b1d60e9eec52ec3ab9aafb0e2180ab))


### Reverts

* **ci:** restore last-release-sha config of release please ([b3cc172](https://github.com/TheMoonVyy/pdf2cbt/commit/b3cc172dc42ed1471c694fbf061598ce1ab1b63b))


### Documentation

* **homepage:** add link to video on how to merge split images into one and fix typos ([1c5c0fd](https://github.com/TheMoonVyy/pdf2cbt/commit/1c5c0fd670d87e00d3d8626325d13aed646dd7a1))
* **pdf-cropper-docs:** fix typos and grammer ([00c2cd1](https://github.com/TheMoonVyy/pdf2cbt/commit/00c2cd118b243f0fc9e3eccd27d31a392fc050db))
* update readme ([662ed61](https://github.com/TheMoonVyy/pdf2cbt/commit/662ed61158b6b051c0c585e789515e0b13b7c67c))


### Styles

* **components:** replace percentage symbol with px as unit in main layout input box ([47c84c7](https://github.com/TheMoonVyy/pdf2cbt/commit/47c84c7e0516d445c2e7b23606939d2a6a0f108a))
* **icons:** replace static icons with animate on render icons ([aa67bae](https://github.com/TheMoonVyy/pdf2cbt/commit/aa67bae9d5de846d650f59b3f32d2ffc100b149b))
* **pdf-cropper:** fix a typo ([b83d6cf](https://github.com/TheMoonVyy/pdf2cbt/commit/b83d6cfb3ca688b094c3069151eff65f5c3572e1))
* **pdf-cropper:** hide image container until pdf is loaded ([04774ac](https://github.com/TheMoonVyy/pdf2cbt/commit/04774ac41be50dad2bfdae846f67fd5c1f434a7f))


### Code Refactoring

* **cbt-interface-file-upload:** move zip-from-url feature option from data-file-type dropdown to a separate button ([06d2077](https://github.com/TheMoonVyy/pdf2cbt/commit/06d2077cb01117af0855edaf4e63a8df06f73d03))
* **cbt-results:** migrate to nuxt-echarts, move options to computed, and fix linting ([#6](https://github.com/TheMoonVyy/pdf2cbt/issues/6)) ([2e72991](https://github.com/TheMoonVyy/pdf2cbt/commit/2e72991fd3923fbcb0850fbc534965218f42bd46))
* **cbt-results:** refactor donut chart used for test result summary into pie chart ([94085de](https://github.com/TheMoonVyy/pdf2cbt/commit/94085de7ae850eca43763b2447a8eb1f34f803c0))
* **cbt-results:** reuse function to load demo test zip from url ([d6f846d](https://github.com/TheMoonVyy/pdf2cbt/commit/d6f846d80fe9cf27b7efaa12ef10ce15c22ec02a))
* change project structure into nuxt layers ([#47](https://github.com/TheMoonVyy/pdf2cbt/issues/47)) ([c785660](https://github.com/TheMoonVyy/pdf2cbt/commit/c78566090a3b649078e1f4cdc8f8f6f064f885c2))
* **components:** remove filename path-prefixes as Nuxt normalizes with pathPrefix ([d69e5ff](https://github.com/TheMoonVyy/pdf2cbt/commit/d69e5fff77ed80d571fc6bd3bed6641c6e244c75))
* **components:** replace primevue-volt tree component with new custom BaseTreeCheckbox component ([c83c3aa](https://github.com/TheMoonVyy/pdf2cbt/commit/c83c3aa00a20e82110bf368522f65b04550caa8d))
* **css:** remove redundant reference to main css file ([5ab70af](https://github.com/TheMoonVyy/pdf2cbt/commit/5ab70af0d13b0adced470d9d5fc633335ff53df1))
* **db:** centralize Dexie DB read and write logic ([43fbd21](https://github.com/TheMoonVyy/pdf2cbt/commit/43fbd21cf9be9e0be40adeedababd5c42dac5c37))
* **generate-answer-key:** change input answer to trigger parser on model value update instead of on blur ([6d7d770](https://github.com/TheMoonVyy/pdf2cbt/commit/6d7d7704ad9321fff4a37db3bde1e7683a8b6d93))
* **generate-answer-key:** remove obsolete comment ([1e03f97](https://github.com/TheMoonVyy/pdf2cbt/commit/1e03f97a6e3df8599bb80f1aa87f0440ecfc3021))
* **generate-answer-key:** rename answerKeyData to testAnswerKey and refactor related types ([0a21241](https://github.com/TheMoonVyy/pdf2cbt/commit/0a21241332e91a04820ea015cb79634dea0d532d))
* **icons:** move custom icons used in icon component to new IconBundle folder and update nuxt icon config to include all used icons in client bundle ([1d4a1a8](https://github.com/TheMoonVyy/pdf2cbt/commit/1d4a1a81478db121e6c10ec7a2fbe52ee1f0fb61))
* migrate from primevue tailwind to primevue volt ([822f54e](https://github.com/TheMoonVyy/pdf2cbt/commit/822f54e2b4f4ba421797c87a6f94db4151234d2d))
* migrate project files to app directory with nuxt compatibility v4 ([3a90b94](https://github.com/TheMoonVyy/pdf2cbt/commit/3a90b9495e34193b076313987f5443142e8598e3))
* **mupdf-import:** change mupdf import source to jsdelivr cdn with fallback to public assets ([6515ff0](https://github.com/TheMoonVyy/pdf2cbt/commit/6515ff054c8ccc266228c5ad922353585b516b6b))
* **mupdf-import:** expose mupdf version via import.meta.env to worker for loading mupdf from cdn ([2eeaddd](https://github.com/TheMoonVyy/pdf2cbt/commit/2eeaddda41af8ab18ecaec176bd9ebe9d1e5afbc))
* **mupdf:** centralize logic to determine mupdf script urls into a composable ([b9829f5](https://github.com/TheMoonVyy/pdf2cbt/commit/b9829f5c7056d57b6db93da5dbe3382beae5ad21))
* **pdf-cropper:** increase max question numbers from 99 to 9999, subject and section name length limit by 10 more chars ([4358ec5](https://github.com/TheMoonVyy/pdf2cbt/commit/4358ec5900b5f90a1d68020b616b2c817ec878cc))
* **pdf-cropper:** remove redundant console log ([07b8914](https://github.com/TheMoonVyy/pdf2cbt/commit/07b8914657c76fbeb81d48dfe4f462b6e0dab921))
* **pdf-cropper:** remove section sorting and add mupdf worker cleanup ([6518256](https://github.com/TheMoonVyy/pdf2cbt/commit/6518256667faea4dc875b21f59bd08e0d9ba4371))
* **results:** refactor test notes to keep just current test notes with a shared composable across components ([95e2666](https://github.com/TheMoonVyy/pdf2cbt/commit/95e26666552df46bad2f1d7a2a88871722c8789d))
* **template-ref:** replace templateRef of vueuse with vue native useTemplateRef ([5a846e1](https://github.com/TheMoonVyy/pdf2cbt/commit/5a846e1d9e28f02fe9dedae45c532aff019f9a36))
* **theme-variants:** remove yellow theme as its dark background matches neutral ([b14a410](https://github.com/TheMoonVyy/pdf2cbt/commit/b14a410ffbd6c0ab73b6cd2b94e3ac3cbc112f7a))
* **upload-release-asset:** rename static asset env var and include STATIC_ASSET_NAME as top level folder for packaging zip in workflow ([5f1bbb2](https://github.com/TheMoonVyy/pdf2cbt/commit/5f1bbb20421ad8cecfd716db7a4a9b5c41ef4e3d))
* use enums for useState keys and file names ([40195b3](https://github.com/TheMoonVyy/pdf2cbt/commit/40195b3561b0451feb840891299055a594098291))
* **workflow:** replace hardcoded env values with repo vars ([e57c47c](https://github.com/TheMoonVyy/pdf2cbt/commit/e57c47c0f71fb2867b12b4c4f24ee2b70e0d4db2))

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
