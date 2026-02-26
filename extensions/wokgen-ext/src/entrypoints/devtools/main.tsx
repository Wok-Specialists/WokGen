import React from 'react';
import ReactDOM from 'react-dom/client';

// Create devtools panel
browser.devtools.panels.create(
  'WokGen',
  '',
  'devtools-panel.html',
  () => console.log('[WokGen] DevTools panel created')
);

ReactDOM.createRoot(document.getElementById('root')!).render(<div />);
