/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookingCodeInputForm } from '@/components/BookingCodeInputForm';

describe('BookingCodeInputForm component', () => {
  it('renders input field, decode button, and quick samples', () => {
    render(<BookingCodeInputForm onDecode={vi.fn()} />);

    expect(
      screen.getByLabelText(/Betway Booking Code/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Decode Slip/i })
    ).toBeInTheDocument();
    expect(screen.getByText('BW6D7ABCFB')).toBeInTheDocument();
  });

  it('submits valid booking code in uppercase', () => {
    const handleDecode = vi.fn();
    render(<BookingCodeInputForm onDecode={handleDecode} />);

    const input = screen.getByLabelText(/Betway Booking Code/i);
    fireEvent.change(input, { target: { value: 'bw6d7abcfb' } });

    const submitBtn = screen.getByRole('button', { name: /Decode Slip/i });
    fireEvent.click(submitBtn);

    expect(handleDecode).toHaveBeenCalledWith('BW6D7ABCFB');
  });

  it('populates input when quick sample chip is clicked', () => {
    const handleDecode = vi.fn();
    render(<BookingCodeInputForm onDecode={handleDecode} />);

    const sampleChip = screen.getByText('BW6D7ABCFB');
    fireEvent.click(sampleChip);

    const input = screen.getByLabelText(/Betway Booking Code/i) as HTMLInputElement;
    expect(input.value).toBe('BW6D7ABCFB');
  });

  it('shows error on empty submit without calling onDecode', () => {
    const handleDecode = vi.fn();
    render(<BookingCodeInputForm onDecode={handleDecode} />);

    const submitBtn = screen.getByRole('button', { name: /Decode Slip/i });
    fireEvent.click(submitBtn);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Please enter a Betway booking code.'
    );
    expect(handleDecode).not.toHaveBeenCalled();
  });

  it('shows error on invalid format submit', () => {
    const handleDecode = vi.fn();
    render(<BookingCodeInputForm onDecode={handleDecode} />);

    const input = screen.getByLabelText(/Betway Booking Code/i);
    fireEvent.change(input, { target: { value: 'ABC' } }); // too short

    const submitBtn = screen.getByRole('button', { name: /Decode Slip/i });
    fireEvent.click(submitBtn);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Booking code must be between 4 and 15 alphanumeric characters'
    );
    expect(handleDecode).not.toHaveBeenCalled();
  });

  it('disables input and button when isLoading is true', () => {
    render(<BookingCodeInputForm onDecode={vi.fn()} isLoading={true} />);

    const input = screen.getByLabelText(/Betway Booking Code/i);
    expect(input).toBeDisabled();

    const decodingBtn = screen.getByRole('button', { name: /Decoding.../i });
    expect(decodingBtn).toBeDisabled();
  });

  it('displays externalError when passed', () => {
    render(
      <BookingCodeInputForm
        onDecode={vi.fn()}
        externalError="Booking code not found on Betway"
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Booking code not found on Betway'
    );
  });
});
