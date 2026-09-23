const React = require('react');
const ReactDOMServer = require('react-dom/server');

try {
  const html = ReactDOMServer.renderToString(React.createElement('div', { style: { width: 'NaN%' } }));
  console.log("Success:", html);
} catch (e) {
  console.log("Error:", e.message);
}
