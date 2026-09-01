/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/Header';

describe('Header component', () => {
  it('renders branding, title, and badges', () => {
    render(<Header />);

    expect(screen.getByText('Betway Booking Code Engine')).toBeInTheDocument();
    expect(screen.getByText(/Nigeria 🇳🇬/i)).toBeInTheDocument();
    expect(screen.getByText('Stellar Logic Assessment')).toBeInTheDocument();
    expect(screen.getByText(/API v1 Ready/i)).toBeInTheDocument();
  });

  it('renders custom title and subtitle when provided', () => {
    render(
      <Header
        title="Custom Title"
        subtitle="Custom Subtitle"
      />
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Subtitle')).toBeInTheDocument();
  });
});
