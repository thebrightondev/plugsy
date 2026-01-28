import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LocationPanel from './LocationPanel';
import type { Location } from '../../types';

const mockLocation: Location = {
  id: '123',
  name: 'Test Charging Station',
  latitude: 50.8198,
  longitude: -1.0879,
  address: '123 Test Street, Portsmouth, PO1 1AA',
  operator: 'Test Operator',
  connectionTypes: ['Type 2', 'CCS'],
  powerKW: 50,
  available: true,
  numberOfPoints: 4,
  source: 'transport',
};

describe('LocationPanel', () => {
  it('should render location name', () => {
    render(<LocationPanel location={mockLocation} onClose={vi.fn()} />);
    expect(screen.getByText('Test Charging Station')).toBeInTheDocument();
  });

  it('should show available status', () => {
    render(<LocationPanel location={mockLocation} onClose={vi.fn()} />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('should show unavailable status when location is unavailable', () => {
    const unavailable = { ...mockLocation, available: false };
    render(<LocationPanel location={unavailable} onClose={vi.fn()} />);
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('should render address', () => {
    render(<LocationPanel location={mockLocation} onClose={vi.fn()} />);
    expect(screen.getByText('123 Test Street, Portsmouth, PO1 1AA')).toBeInTheDocument();
  });

  it('should render operator', () => {
    render(<LocationPanel location={mockLocation} onClose={vi.fn()} />);
    expect(screen.getByText('Test Operator')).toBeInTheDocument();
  });

  it('should render connection types', () => {
    render(<LocationPanel location={mockLocation} onClose={vi.fn()} />);
    expect(screen.getByText('Type 2')).toBeInTheDocument();
    expect(screen.getByText('CCS')).toBeInTheDocument();
  });

  it('should render power in kW', () => {
    render(<LocationPanel location={mockLocation} onClose={vi.fn()} />);
    expect(screen.getByText('50 kW')).toBeInTheDocument();
  });

  it('should render number of charging points', () => {
    render(<LocationPanel location={mockLocation} onClose={vi.fn()} />);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<LocationPanel location={mockLocation} onClose={onClose} />);
    
    fireEvent.click(screen.getByLabelText('Close panel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should have directions link with correct coordinates', () => {
    render(<LocationPanel location={mockLocation} onClose={vi.fn()} />);
    
    const link = screen.getByRole('link', { name: /get directions/i });
    expect(link).toHaveAttribute(
      'href',
      'https://www.google.com/maps/dir/?api=1&destination=50.8198,-1.0879'
    );
  });

  it('should handle missing operator', () => {
    const noOperator = { ...mockLocation, operator: null };
    render(<LocationPanel location={noOperator} onClose={vi.fn()} />);
    
    expect(screen.queryByText('Operator')).not.toBeInTheDocument();
  });

  it('should handle missing power', () => {
    const noPower = { ...mockLocation, powerKW: null };
    render(<LocationPanel location={noPower} onClose={vi.fn()} />);

    expect(screen.queryByText('kW')).not.toBeInTheDocument();
  });

  it('should show EV Charger badge for transport locations', () => {
    render(<LocationPanel location={mockLocation} onClose={vi.fn()} />);
    expect(screen.getByText('EV Charger')).toBeInTheDocument();
  });
});

