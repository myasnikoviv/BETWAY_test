/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CodeComparisonBadge } from '@/components/CodeComparisonBadge';

describe('CodeComparisonBadge component', () => {
  it('renders source code, new code, odds, and leg counts', () => {
    render(
      <CodeComparisonBadge
        sourceCode="BW6D7ABCFB"
        newCode="BW6D7AC4BA"
        totalOdds={21.57}
        legsCount={3}
      />
    );

    expect(screen.getByTestId('code-comparison-badge')).toBeInTheDocument();
    expect(screen.getByTestId('source-code-display')).toHaveTextContent('BW6D7ABCFB');
    expect(screen.getByTestId('new-code-display')).toHaveTextContent('BW6D7AC4BA');
    expect(screen.getByText(/Conversion Successful/i)).toBeInTheDocument();
    expect(screen.getByText(/3 legs • Odds: 21.57x/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Identical bet reconstructed: All fixtures, markets, and leg outcomes match the source slip./i)
    ).toBeInTheDocument();
  });

  it('copies new booking code to clipboard and shows feedback indicator', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <CodeComparisonBadge
        sourceCode="BW6D7ABCFB"
        newCode="BW6D7AC4BA"
      />
    );

    const copyNewBtn = screen.getByTestId('copy-new-code-button');
    await act(async () => {
      fireEvent.click(copyNewBtn);
    });

    expect(writeTextMock).toHaveBeenCalledWith('BW6D7AC4BA');
    expect(screen.getByText('✓ Copied')).toBeInTheDocument();
  });

  it('copies source booking code to clipboard and shows feedback', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <CodeComparisonBadge
        sourceCode="BW6D7ABCFB"
        newCode="BW6D7AC4BA"
      />
    );

    const copySourceBtn = screen.getByRole('button', { name: /Copy source booking code/i });
    await act(async () => {
      fireEvent.click(copySourceBtn);
    });

    expect(writeTextMock).toHaveBeenCalledWith('BW6D7ABCFB');
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('calls onOpenVerificationModal when Verify on Betway button is clicked', () => {
    const onOpenModalMock = vi.fn();
    render(
      <CodeComparisonBadge
        sourceCode="BW6D7ABCFB"
        newCode="BW6D7AC4BA"
        onOpenVerificationModal={onOpenModalMock}
      />
    );

    const verifyBtn = screen.getByTestId('open-verification-modal-button');
    fireEvent.click(verifyBtn);

    expect(onOpenModalMock).toHaveBeenCalledTimes(1);
  });
});
