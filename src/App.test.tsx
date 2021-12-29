import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { Arcgis } from './arcgis';
import { FileHandler } from './FileHandler';

const arc = new Arcgis()
const fileHandler = new FileHandler()

test('renders learn react link', () => {
  render(
    <App
      arc={arc}
      fileHandler={fileHandler}
    />
  );
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
