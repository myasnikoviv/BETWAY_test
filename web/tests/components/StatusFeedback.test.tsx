/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  LoadingFeedback,
  ErrorBanner,
  IdlePlaceholder,
} from '@/components/StatusFeedback';

describe('StatusFeedback components', () => {
  describe('LoadingFeedback', () => {
    it('renders default loading message and status role', () => {
      render(<LoadingFeedback />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/Fetching Bet Slip/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Resolving booking code from Betway Nigeria.../i)
      ).toBeInTheDocument();
    });

    it('renders custom loading message when provided', () => {
      render(<LoadingFeedback message="Custom loading text..." />);

      expect(screen.getByText('Custom loading text...')).toBeInTheDocument();
    });
  });

  describe('ErrorBanner', () => {
    it('renders alert role, message, and default title', () => {
      render(<ErrorBanner message="Booking code BW00000000 not found." />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(
        screen.getByText('Failed to Decode Booking Code')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Booking code BW00000000 not found.')
      ).toBeInTheDocument();
    });

    it('renders custom title and handles onRetry and onDismiss callbacks', () => {
      const handleRetry = vi.fn();
      const handleDismiss = vi.fn();

      render(
        <ErrorBanner
          title="Network Connection Failed"
          message="Could not connect to Betway."
          onRetry={handleRetry}
          onDismiss={handleDismiss}
        />
      );

      expect(
        screen.getByText('Network Connection Failed')
      ).toBeInTheDocument();

      const retryBtn = screen.getByRole('button', { name: /Try Again/i });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);

      const dismissBtn = screen.getByRole('button', { name: /Dismiss/i });
      fireEvent.click(dismissBtn);
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('IdlePlaceholder', () => {
    it('renders idle placeholder guidance text', () => {
      render(<IdlePlaceholder />);

      expect(screen.getByTestId('idle-placeholder')).toBeInTheDocument();
      expect(screen.getByText('No Bet Slip Loaded')).toBeInTheDocument();
      expect(
        screen.getByText(/Enter a Betway booking code above/i)
      ).toBeInTheDocument();
    });
  });
});
