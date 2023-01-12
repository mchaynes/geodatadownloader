import { test, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders and doesnt crash", () => {
  render(<App />);
  const linkElement = screen.getByText(/Layer options will appear after load/i);
  expect(linkElement).toBeDefined();
});
