/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

// Note: import explicitly to use the types shipped with jest.
import {it} from '@jest/globals';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders Curio onboarding on first launch', async () => {
  let tree: renderer.ReactTestRenderer;
  await renderer.act(async () => {
    tree = renderer.create(<App />);
    await Promise.resolve();
  });
  expect(tree!.root.findAllByProps({children: 'What are you into?'}).length).toBeGreaterThan(0);
});
