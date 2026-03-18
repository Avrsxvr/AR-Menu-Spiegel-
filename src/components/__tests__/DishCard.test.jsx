import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DishCard from '../DishCard';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
global.IntersectionObserver = mockIntersectionObserver;

// Mock dish data
const mockDish = {
  id: 'chicken-tikka',
  name: 'Chicken Tikka',
  description: 'Juicy chicken marinated in yogurt & authentic spices, grilled to smoky perfection.',
  category: 'Starters',
  meta: '4 pcs • Serves 1 • Medium Hot 🌶️',
  price: 399,
  image: 'https://example.com/chicken-tikka.jpg'
};

const mockOnViewModal = vi.fn();

describe('DishCard Component', () => {
  beforeEach(() => {
    mockOnViewModal.mockClear();
  });

  it('renders dish information correctly', () => {
    render(
      <DishCard
        dish={mockDish}
        onViewModal={mockOnViewModal}
      />
    );

    expect(screen.getByText('Chicken Tikka')).toBeInTheDocument();
    expect(screen.getByText(/Juicy chicken marinated/)).toBeInTheDocument();
    expect(screen.getByText('4 pcs • Serves 1 • Medium Hot 🌶️')).toBeInTheDocument();
    expect(screen.getByText('₹399')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(
      <DishCard
        dish={mockDish}
        onViewModal={mockOnViewModal}
      />
    );

    expect(screen.getByText('3D View')).toBeInTheDocument();
    expect(screen.getByText('View on Table')).toBeInTheDocument();
  });

  it('calls onViewModal with correct parameters when 3D View is clicked', () => {
    render(
      <DishCard
        dish={mockDish}
        onViewModal={mockOnViewModal}
      />
    );

    const button3D = screen.getByText('3D View');
    fireEvent.click(button3D);

    expect(mockOnViewModal).toHaveBeenCalledWith(mockDish, '3d');
  });

  it('calls onViewModal with correct parameters when View on Table is clicked', () => {
    render(
      <DishCard
        dish={mockDish}
        onViewModal={mockOnViewModal}
      />
    );

    const buttonAR = screen.getByText('View on Table');
    fireEvent.click(buttonAR);

    expect(mockOnViewModal).toHaveBeenCalledWith(mockDish, 'ar');
  });

  it('shows alt text for accessibility', () => {
    render(
      <DishCard
        dish={mockDish}
        onViewModal={mockOnViewModal}
      />
    );

    const image = screen.getByAltText('Chicken Tikka');
    expect(image).toBeInTheDocument();
  });
});