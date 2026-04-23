import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the app heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /AI Test Case Generator/i });
  expect(heading).toBeInTheDocument();
});

test('renders the requirement input textarea', () => {
  render(<App />);
  const textarea = screen.getByPlaceholderText(/Describe your software requirement here/i);
  expect(textarea).toBeInTheDocument();
});

test('renders the Generate button', () => {
  render(<App />);
  const button = screen.getByRole('button', { name: /Generate/i });
  expect(button).toBeInTheDocument();
});
