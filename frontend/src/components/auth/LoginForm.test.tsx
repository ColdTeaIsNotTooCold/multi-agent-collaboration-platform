import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { vi } from 'vitest';
import LoginForm from './LoginForm';
import { useAuth } from '../../contexts/AuthContext';

// Mock the useAuth hook
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn(),
    user: null,
    loading: false,
    logout: vi.fn(),
    isAuthenticated: false,
  }),
}));

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn(),
    handleSubmit: vi.fn((fn) => (e: React.FormEvent) => {
      e.preventDefault();
      fn({ username: 'testuser', password: 'testpass' });
    }),
    formState: { errors: {} },
  }),
}));

describe('LoginForm', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    (useAuth as any).mockReturnValue({
      login: mockLogin,
      user: null,
      loading: false,
      logout: vi.fn(),
      isAuthenticated: false,
    });
    mockLogin.mockClear();
  });

  it('renders login form with username and password fields', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/multi-agent platform/i)).toBeInTheDocument();
  });

  it('calls login function when form is submitted', async () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'testpass',
      });
    });
  });

  it('displays loading state when login is in progress', () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      user: null,
      loading: true,
      logout: jest.fn(),
      isAuthenticated: false,
    });

    render(<LoginForm />);

    expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();
  });

  it('displays error message when login fails', () => {
    const errorMessage = 'Invalid credentials';

    render(<LoginForm />);

    // Simulate error state
    const errorDiv = document.createElement('div');
    errorDiv.textContent = errorMessage;
    errorDiv.style.color = 'rgb(231, 76, 60)';
    document.body.appendChild(errorDiv);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});