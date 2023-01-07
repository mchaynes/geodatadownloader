
import { test, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import App from './App';
import { FileHandler } from './FileHandler';

const fileHandler = new FileHandler()

test('renders and doesnt crash', () => {
  render(
    <App
      fileHandler={fileHandler}
    />
  );
  const linkElement = screen.getByText(/Layer options will appear after load/i);
  expect(linkElement).toBeDefined()
});
