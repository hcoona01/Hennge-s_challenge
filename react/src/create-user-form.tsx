import { useState } from 'react';
import type { CSSProperties, Dispatch, FormEvent, SetStateAction } from 'react';

interface CreateUserFormProps {
  setUserWasCreated: Dispatch<SetStateAction<boolean>>;
}

const API_URL =
  'https://api.challenge.hennge.com/password-validation-challenge-api/001/challenge-signup';

const PASSWORD_RULES: { message: string; test: (value: string) => boolean }[] = [
  {
    message: 'Password must be at least 10 characters long',
    test: (value) => value.length >= 10,
  },
  {
    message: 'Password must be at most 24 characters long',
    test: (value) => value.length <= 24,
  },
  {
    message: 'Password cannot contain spaces',
    test: (value) => !/\s/.test(value),
  },
  {
    message: 'Password must contain at least one number',
    test: (value) => /[0-9]/.test(value),
  },
  {
    message: 'Password must contain at least one uppercase letter',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    message: 'Password must contain at least one lowercase letter',
    test: (value) => /[a-z]/.test(value),
  },
];

function getAuthToken(): string {
  const segments = window.location.pathname.split('/').filter(Boolean);
  return segments[segments.length - 1] ?? '';
}

function CreateUserForm({ setUserWasCreated }: CreateUserFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const failedRules = PASSWORD_RULES.filter((rule) => !rule.test(password));
  const isPasswordValid = failedRules.length === 0;
  const canSubmit = username.trim().length > 0 && isPasswordValid;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError(null);

    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setUserWasCreated(true);
        return;
      }

      if (response.status === 401 || response.status === 403) {
        setApiError('Not authenticated to access this resource.');
        return;
      }

      const data: { success: boolean; errors?: string[] } | null = await response
        .json()
        .catch(() => null);

      if (data?.errors?.includes('not_allowed')) {
        setApiError('Sorry, the entered password is not allowed, please try a different one.');
        return;
      }

      setApiError('Something went wrong, please try again.');
    } catch {
      setApiError('Something went wrong, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={formWrapper}>
      <form style={form} onSubmit={handleSubmit} noValidate>
        {/* make sure the username and password are submitted */}
        {/* make sure the inputs have the accessible names of their labels */}
        <label style={formLabel} htmlFor="username">
          Username
        </label>
        <input
          id="username"
          style={formInput}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          aria-invalid={username.trim().length === 0}
        />

        <label style={formLabel} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          style={formInput}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={password.length > 0 && !isPasswordValid}
        />

        {password.length > 0 && failedRules.length > 0 && (
          <ul style={errorList}>
            {failedRules.map((rule) => (
              <li key={rule.message} style={errorItem}>
                {rule.message}
              </li>
            ))}
          </ul>
        )}

        {apiError && (
          <div style={apiErrorBox} role="alert">
            {apiError}
          </div>
        )}

        <button style={formButton} type="submit" disabled={isSubmitting}>
          Create User
        </button>
      </form>
    </div>
  );
}

export { CreateUserForm };

const formWrapper: CSSProperties = {
  maxWidth: '500px',
  width: '80%',
  backgroundColor: '#efeef5',
  padding: '24px',
  borderRadius: '8px',
};

const form: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const formLabel: CSSProperties = {
  fontWeight: 700,
};

const formInput: CSSProperties = {
  outline: 'none',
  padding: '8px 16px',
  height: '40px',
  fontSize: '14px',
  backgroundColor: '#f8f7fa',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderRadius: '4px',
};

const formButton: CSSProperties = {
  outline: 'none',
  borderRadius: '4px',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  backgroundColor: '#7135d2',
  color: 'white',
  fontSize: '16px',
  fontWeight: 500,
  height: '40px',
  padding: '0 8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '8px',
  alignSelf: 'flex-end',
  cursor: 'pointer',
};

const errorList: CSSProperties = {
  margin: 0,
  padding: '8px 0 0 20px',
  color: '#c0392b',
  fontSize: '13px',
};

const errorItem: CSSProperties = {
  marginBottom: '2px',
};

const apiErrorBox: CSSProperties = {
  color: '#c0392b',
  fontSize: '13px',
  marginTop: '4px',
};