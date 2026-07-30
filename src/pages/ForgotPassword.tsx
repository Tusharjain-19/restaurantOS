import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

type Step = 'email' | 'otp' | 'reset' | 'done';

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setStep('otp');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
    if (newOtp.every((d) => d) && newOtp.join('').length === 6) {
      setStep('reset');
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setStep('done');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md rounded-xl bg-card p-8 shadow-lg">
        <Link to="/login" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>

        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <h1 className="text-xl font-bold text-card-foreground">Forgot Password</h1>
            <p className="text-sm text-muted-foreground">Enter your email to receive a reset link.</p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
          </form>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-card-foreground">Enter Verification Code</h1>
            <p className="text-sm text-muted-foreground">We sent a 6-digit code to {email}</p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-center gap-2">
              {otp.map((digit, i) => (
                <Input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value.replace(/\D/, ''))}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="h-12 w-12 text-center text-lg font-semibold"
                />
              ))}
            </div>
          </div>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <h1 className="text-xl font-bold text-card-foreground">Set New Password</h1>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </form>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle2 className="h-12 w-12 text-success" />
            <h1 className="text-xl font-bold text-card-foreground">Password Reset!</h1>
            <p className="text-sm text-muted-foreground">Your password has been updated successfully.</p>
            <Button asChild className="w-full">
              <Link to="/login">Back to Login</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
