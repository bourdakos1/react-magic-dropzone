# Magic Dropzone
![react-dropzone logo](https://storybird.s3.amazonaws.com/artwork/PaulMcDougall/square_crops/magic.jpeg)

## Demo

[![demo.png](/screenshots/demo.png)](https://codesandbox.io/embed/y200pqy4pz?view=preview)

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
