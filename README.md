# ✨Magic Dropzone [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Drag-and-drop%20files%20or%20urls!%20Built%20for%20React:&url=https://github.com/bourdakos1/react-magic-dropzone&hashtags=react,component,dropzone,developers)

[![Build Status](https://travis-ci.org/bourdakos1/react-magic-dropzone.svg?branch=master)](https://travis-ci.org/bourdakos1/react-magic-dropzone)
[![codecov](https://codecov.io/gh/bourdakos1/react-magic-dropzone/branch/master/graph/badge.svg)](https://codecov.io/gh/bourdakos1/react-magic-dropzone)
[![npm-version](https://img.shields.io/npm/v/react-magic-dropzone.svg)](https://www.npmjs.com/package/react-magic-dropzone)
[![npm-downloads](https://img.shields.io/npm/dm/react-magic-dropzone.svg)](https://www.npmjs.com/package/react-magic-dropzone)

<div align="center">
  <a href="https://codesandbox.io/embed/y200pqy4pz?view=preview"><img src="/screenshots/demo.gif" alt="demo.gif"></a>
</div>

Try out the [demo](https://codesandbox.io/embed/y200pqy4pz?view=preview)!

## Installation

```bash
yarn add react-magic-dropzone
```
or:
```bash
npm install --save react-magic-dropzone
```

## Usage

Import `MagicDropzone` in your React component:

```javascript static
import MagicDropzone from 'react-magic-dropzone'
```

```jsx
onDrop = (accepted, rejected, links) => {
  // Have fun
}
```

```jsx
<MagicDropzone
  accept="image/jpeg, image/png, .jpg, .jpeg, .png"
  onDrop={this.onDrop}
>
  Drop some files on me!
</MagicDropzone>
```

[![Edit jvorp575k9](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/jvorp575k9)

## License

MIT
