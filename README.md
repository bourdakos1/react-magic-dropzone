# Magic Dropzone
![react-dropzone logo](https://storybird.s3.amazonaws.com/artwork/PaulMcDougall/square_crops/magic.jpeg)

## Demo

[![demo.png](/screenshots/demo.png)](https://jvorp575k9.codesandbox.io/)

Try out the [demo](https://jvorp575k9.codesandbox.io/)!

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
