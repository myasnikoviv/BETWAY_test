/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { VerificationGuideModal } from '@/components/VerificationGuideModal';

describe('VerificationGuideModal component', () => {
  const originalBodyOverflow = document.body.style.overflow;

  beforeEach(() => {
    document.body.style.overflow = originalBodyOverflow;
  });

  afterEach(() => {
    document.body.style.overflow = originalBodyOverflow;
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <VerificationGuideModal
        isOpen={false}
        onClose={vi.fn()}
        bookingCode="BW6D7AC4BA"
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal dialog with booking code and step instructions when isOpen is true', () => {
    render(
      <VerificationGuideModal
        isOpen={true}
        onClose={vi.fn()}
        bookingCode="BW6D7AC4BA"
        sourceCode="BW6D7ABCFB"
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('verification-guide-modal')).toBeInTheDocument();
    expect(screen.getByText('Verify on Betway Nigeria')).toBeInTheDocument();
    expect(screen.getByTestId('modal-booking-code')).toHaveTextContent('BW6D7AC4BA');
    expect(screen.getByText(/Replaces source code:/i)).toBeInTheDocument();

    // Verify step instructions
    expect(screen.getByText(/Copy the Code:/i)).toBeInTheDocument();
    expect(screen.getByText(/Open Betway Nigeria:/i)).toBeInTheDocument();
    expect(screen.getByText(/Navigate to “Book-a-Bet”:/i)).toBeInTheDocument();
    expect(screen.getByText(/Paste & Search:/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirm Selections:/i)).toBeInTheDocument();
  });

  it('contains outbound link pointing to Betway Nigeria with secure rel attributes', () => {
    render(
      <VerificationGuideModal
        isOpen={true}
        onClose={vi.fn()}
        bookingCode="BW6D7AC4BA"
      />
    );

    const outboundLink = screen.getByTestId('outbound-betway-link');
    expect(outboundLink).toHaveAttribute('href', 'https://www.betway.com.ng');
    expect(outboundLink).toHaveAttribute('target', '_blank');
    expect(outboundLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('copies booking code to clipboard and updates button state', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <VerificationGuideModal
        isOpen={true}
        onClose={vi.fn()}
        bookingCode="BW6D7AC4BA"
      />
    );

    const copyBtn = screen.getByTestId('modal-copy-code-button');
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextMock).toHaveBeenCalledWith('BW6D7AC4BA');
    expect(screen.getByText('✓ Copied')).toBeInTheDocument();
  });

  it('calls onClose when close icon button is clicked', () => {
    const onCloseMock = vi.fn();
    render(
      <VerificationGuideModal
        isOpen={true}
        onClose={onCloseMock}
        bookingCode="BW6D7AC4BA"
      />
    );

    const closeBtn = screen.getByRole('button', { name: /Close verification modal/i });
    fireEvent.click(closeBtn);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when modal backdrop is clicked', () => {
    const onCloseMock = vi.fn();
    render(
      <VerificationGuideModal
        isOpen={true}
        onClose={onCloseMock}
        bookingCode="BW6D7AC4BA"
      />
    );

    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking inside the modal content', () => {
    const onCloseMock = vi.fn();
    render(
      <VerificationGuideModal
        isOpen={true}
        onClose={onCloseMock}
        bookingCode="BW6D7AC4BA"
      />
    );

    const modalContent = screen.getByTestId('verification-guide-modal');
    fireEvent.click(modalContent);

    expect(onCloseMock).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', () => {
    const onCloseMock = vi.fn();
    render(
      <VerificationGuideModal
        isOpen={true}
        onClose={onCloseMock}
        bookingCode="BW6D7AC4BA"
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
