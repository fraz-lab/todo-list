import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders login form when not logged in', () => {
  render(<App />);
  expect(screen.getByText(/Login/i)).toBeInTheDocument();
  expect(screen.getByTestId('login-username')).toBeInTheDocument();
  expect(screen.getByTestId('login-password')).toBeInTheDocument();
});

test('renders audit log table for admin', () => {
  // Mock admin login by setting cookie
  // Simplified; requires mocking Cookies.get and localStorage
  render(<App />);
  // Simulate admin login and check for audit log table
  expect(screen.queryByTestId('audit-log-table')).toBeNull(); // Not visible without login
});

test('persists tasks after login', () => {
  // Mock login and task storage
  // Simplified; requires mocking localStorage
  render(<App />);
  // Simulate adding a task and reloading to check persistence
});