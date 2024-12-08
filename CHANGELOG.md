# Changelog

## Release (2024-12-08)

lint-to-the-future-ember-template 3.0.0 (major)

#### :boom: Breaking Change
* `lint-to-the-future-ember-template`
  * [#35](https://github.com/mansona/lint-to-the-future-ember-template/pull/35) move to esm only with type:module ([@mansona](https://github.com/mansona))
  * [#33](https://github.com/mansona/lint-to-the-future-ember-template/pull/33) drop support for node 16 ([@mansona](https://github.com/mansona))

#### :rocket: Enhancement
* `lint-to-the-future-ember-template`
  * [#32](https://github.com/mansona/lint-to-the-future-ember-template/pull/32) add support to list ignores from gjs and gts files ([@mansona](https://github.com/mansona))

#### :house: Internal
* `lint-to-the-future-ember-template`
  * [#39](https://github.com/mansona/lint-to-the-future-ember-template/pull/39) reinstate support for older ember-template-lint versions ([@mansona](https://github.com/mansona))
  * [#38](https://github.com/mansona/lint-to-the-future-ember-template/pull/38) verify that ignore respects the ignores specified in .template-lintrc.js ([@mansona](https://github.com/mansona))
  * [#37](https://github.com/mansona/lint-to-the-future-ember-template/pull/37) convert to vitest ([@mansona](https://github.com/mansona))
  * [#36](https://github.com/mansona/lint-to-the-future-ember-template/pull/36) drop support for ember-template-lint < 5 ([@mansona](https://github.com/mansona))

#### Committers: 1
- Chris Manson ([@mansona](https://github.com/mansona))

## Release (2024-11-12)

lint-to-the-future-ember-template 2.0.0 (major)

#### :boom: Breaking Change
* `lint-to-the-future-ember-template`
  * [#24](https://github.com/mansona/lint-to-the-future-ember-template/pull/24) drop support for node 14 ([@mansona](https://github.com/mansona))

#### :rocket: Enhancement
* `lint-to-the-future-ember-template`
  * [#29](https://github.com/mansona/lint-to-the-future-ember-template/pull/29) add ability to pass --filter to ignore ([@mansona](https://github.com/mansona))

#### :house: Internal
* `lint-to-the-future-ember-template`
  * [#27](https://github.com/mansona/lint-to-the-future-ember-template/pull/27) Refactor ignoreAll function into its own file ([@mansona](https://github.com/mansona))
  * [#28](https://github.com/mansona/lint-to-the-future-ember-template/pull/28) update eslint ([@mansona](https://github.com/mansona))
  * [#25](https://github.com/mansona/lint-to-the-future-ember-template/pull/25) move to release-plan ([@mansona](https://github.com/mansona))
  * [#23](https://github.com/mansona/lint-to-the-future-ember-template/pull/23) swap to pnpm ([@mansona](https://github.com/mansona))

#### Committers: 1
- Chris Manson ([@mansona](https://github.com/mansona))

v1.2.0 / 2023-04-16
==================
* Add sorting for stability #15 from @wagenet
* Respect .gitignore #17 from @wagenet
* Accept ember-template-lint (peer dependency) in v5 #19 from @tniezurawski

v1.1.1 / 2023-02-23
==================
* Add license #18 from @RobbieTheWagner

v1.1.0 / 2022-05-31
==================
* Add lib to discovery folders #14 from @locks

v1.0.1 / 2022-05-29
==================
* Fix ignore #13 from @jamescdavis

v1.0.0 / 2022-05-17
==================
* add matrix test for all ember-template-lint versions and fix ESM issue with ember-template-lint@4 #11 from @mansona
* breaking: drop support for node &lt; 14 and fix CI #10 from @mansona

v0.3.5 / 2021-07-05
==================
* Fix updating existing ignore line #8 from @mansona

v0.3.4 / 2021-07-05
==================

v0.3.3 / 2021-06-02
==================
* Fix issue caused by no gaps in comments #7 from @mansona

v0.3.2 / 2021-04-15
==================
* [BUGFIX] Fix error when trying to list with {{!-- --}} style ignore comments #6 from @mansona

v0.3.1 / 2021-04-13
==================
* [bugfix] also run against tests folder #5 from @mansona

v0.3.0 / 2021-03-23
==================
* add file comments in a prettier-compliant way #4 from @mansona

v0.2.1 / 2021-03-23
==================
* set correct peerDependencies for ember-template-lint #3 from @mansona

v0.2.0 / 2021-03-05
==================
* support ember-template-lint v2.x and v3.x #2 from @mansona

v0.1.2 / 2021-03-05
==================
* fix ember-template-lint api usage #1 from @mansona
