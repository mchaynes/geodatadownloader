
import { test, expect } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { Arcgis } from './arcgis';
import { FileHandler } from './FileHandler';

const arc = new Arcgis()
const fileHandler = new FileHandler()

test('renders and doesnt crash', () => {
  render(
    <App
      arc={arc}
      fileHandler={fileHandler}
    />
  );
  const linkElement = screen.getByText(/Layer options will appear after load/i);
  expect(linkElement).toBeDefined()
});
