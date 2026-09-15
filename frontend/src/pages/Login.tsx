import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Button } from '../components/UI/Button';
import { Card, Input } from '../components/UI/Card';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState(() => localStorage.getItem('login_email') || '');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>(() => (localStorage.getItem('login_step') as 'email' | 'code') || 'email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem('login_email', email);
  }, [email]);

  useEffect(() => {
    localStorage.setItem('login_step', step);
  }, [step]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.requestCode(email);
      setStep('code');
    } catch (err: any) {
      setError(err.message || 'Failed to request code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { access_token } = await api.verifyCode(email, code);
      localStorage.setItem('auth_token', access_token);
      localStorage.removeItem('login_email');
      localStorage.removeItem('login_step');
      onLogin();
    } catch (err: any) {
      setError('Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">B</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome to BiteWise</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to track your calories</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              label="Email address"
            />
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Send Verification Code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <Input
              type="text"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              maxLength={6}
              label="Verification Code"
            />
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Verify & Sign In
            </Button>
            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mt-2"
            >
              Back to email
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}
