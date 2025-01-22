# md-to-react-component

## Webpack

```javascript
const { MdToReactWebpackPlugin, mdToReactWebpackLoader } = require('md-to-react-component');

config.module.rules.unshift({
  test: /\.md$/,
  use: mdToReactWebpackLoader
});

config.plugins.unshift(new MdToReactWebpackPlugin());
```

## Usage

```jsx
import { Markdown } from 'md-to-react-component/es/client';

return (
  <Markdown markdown="Hello, **world!**" />
);
```

```jsx
import { markdown } from 'md-to-react-component/es/client';

return markdown('Hello, **world!**');
```