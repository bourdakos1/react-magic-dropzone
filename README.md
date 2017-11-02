![react-dropzone logo](https://storybird.s3.amazonaws.com/artwork/PaulMcDougall/square_crops/magic.jpeg)

# react-magic-dropzone

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
<div style={{}}>
  <MagicDropzone
    accept="image/jpeg, image/png, .jpg, .jpeg, .png"
    onDrop={this.onDrop}
   >
    Drop some files on me!
  </MagicDropzone>
</div>
```

## License

MIT
