# v0.4.3

#### Improvements

- Remove vendor files from repo, update dependencies [#90](https://github.com/upfrontIO/editable.js/pull/90)


# v0.4.2

#### Features

- Remove highlights at cursor on corrections [#88](https://github.com/upfrontIO/editable.js/pull/88)

#### Bugfixes

- Fix spellcheck whitespace handling [#87](https://github.com/upfrontIO/editable.js/pull/87)


# v0.4.1

#### Features

- Filter pasted content [#84](https://github.com/upfrontIO/editable.js/pull/84)

#### Bugfixes

- Remove content.normalizeSpaces() [#82](https://github.com/upfrontIO/editable.js/issues/82)


# v0.4.0

#### Features

- Spellchecking Module [#71](https://github.com/upfrontIO/editable.js/pull/71)

#### API Changes

- Do not include the editable host in cursor.before() and after() [#77](https://github.com/upfrontIO/editable.js/pull/77)
- Improve editable.getContent() [#74](https://github.com/upfrontIO/editable.js/pull/74)
- Add appendTo() and prependTo() [#80](https://github.com/upfrontIO/editable.js/pull/80)

#### Bugfixes

- Remove range.detach() [#73](https://github.com/upfrontIO/editable.js/pull/73)
- Separate instance and global configuration. Fixes [#75](https://github.com/upfrontIO/editable.js/issues/75)


# v0.3.2

- publish package in bower and npm
- Change naming of github repo (change to lowercase)


# v0.3.0

#### Features

- Add change event [#66](https://github.com/upfrontIO/Editable.JS/pull/66)
- Force height of empty elements (especially in Firefox) [#68](https://github.com/upfrontIO/Editable.JS/pull/68)

#### Bugfixes

- Set Focus in iFrame properly [657f85](https://github.com/upfrontIO/Editable.JS/commit/657f85d1c1a0f9d3018548654271616c41480b2b)


# v0.2.0

#### Breaking Changes

- API change: create instances of EditableJS [#65](https://github.com/upfrontIO/Editable.JS/pull/65)


# v0.1.2

- [Add selection methods](https://github.com/upfrontIO/Editable.JS/pull/64)
  - New Selection methods:
    #collapseAtBeginning()
    #collapseAtEnd()
  - New Cursor and Selection method:
    #setVisibleSelection() (alias for #setSelection())

# v0.1.1

- Setup Versioning
