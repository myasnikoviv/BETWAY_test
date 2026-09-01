/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConvertActionBar } from '@/components/ConvertActionBar';

describe('ConvertActionBar component', () => {
  it('renders convert button with default state', () => {
    render(
      <ConvertActionBar
        bookingCode="BW6D7ABCFB"
        onConvert={vi.fn()}
      />
    );

    const button = screen.getByRole('button', { name: /Convert \/ Re-Encode Bet/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    expect(screen.getByText('Convert / Re-Encode Bet')).toBeInTheDocument();
  });

  it('calls onConvert with bookingCode when clicked', () => {
    const onConvertMock = vi.fn();
    render(
      <ConvertActionBar
        bookingCode="BW6D7ABCFB"
        onConvert={onConvertMock}
      />
    );

    const button = screen.getByRole('button', { name: /Convert \/ Re-Encode Bet/i });
    fireEvent.click(button);

    expect(onConvertMock).toHaveBeenCalledTimes(1);
    expect(onConvertMock).toHaveBeenCalledWith('BW6D7ABCFB');
  });

  it('renders loading spinner and disables button when isConverting is true', () => {
    const onConvertMock = vi.fn();
    render(
      <ConvertActionBar
        bookingCode="BW6D7ABCFB"
        onConvert={onConvertMock}
        isConverting={true}
      />
    );

    const button = screen.getByRole('button', { name: /Convert \/ Re-Encode Bet/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Converting...')).toBeInTheDocument();

    fireEvent.click(button);
    expect(onConvertMock).not.toHaveBeenCalled();
  });

  it('disables button when disabled prop is true', () => {
    const onConvertMock = vi.fn();
    render(
      <ConvertActionBar
        bookingCode="BW6D7ABCFB"
        onConvert={onConvertMock}
        disabled={true}
      />
    );

    const button = screen.getByRole('button', { name: /Convert \/ Re-Encode Bet/i });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(onConvertMock).not.toHaveBeenCalled();
  });

  it('disables button when bookingCode is empty', () => {
    const onConvertMock = vi.fn();
    render(
      <ConvertActionBar
        bookingCode=""
        onConvert={onConvertMock}
      />
    );

    const button = screen.getByRole('button', { name: /Convert \/ Re-Encode Bet/i });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(onConvertMock).not.toHaveBeenCalled();
  });
});
