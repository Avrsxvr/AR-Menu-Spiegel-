import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterPills from '../FilterPills';

// Mock data
const mockCategories = ['Starters', 'Main Course', 'Desserts'];
const mockOnCategoryChange = vi.fn();

describe('FilterPills Component', () => {
  beforeEach(() => {
    mockOnCategoryChange.mockClear();
  });

  it('renders all categories including "All"', () => {
    render(
      <FilterPills
        categories={mockCategories}
        activeCategory="All"
        onCategoryChange={mockOnCategoryChange}
      />
    );

    expect(screen.getByText('ALL')).toBeInTheDocument();
    expect(screen.getByText('Starters')).toBeInTheDocument();
    expect(screen.getByText('Main Course')).toBeInTheDocument();
    expect(screen.getByText('Desserts')).toBeInTheDocument();
  });

  it('highlights the active category', () => {
    render(
      <FilterPills
        categories={mockCategories}
        activeCategory="Starters"
        onCategoryChange={mockOnCategoryChange}
      />
    );

    const startersButton = screen.getByText('Starters');
    expect(startersButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onCategoryChange when a category is clicked', () => {
    render(
      <FilterPills
        categories={mockCategories}
        activeCategory="All"
        onCategoryChange={mockOnCategoryChange}
      />
    );

    const startersButton = screen.getByText('Starters');
    fireEvent.click(startersButton);

    expect(mockOnCategoryChange).toHaveBeenCalledWith('Starters');
  });

  it('renders the explore menu title', () => {
    render(
      <FilterPills
        categories={mockCategories}
        activeCategory="All"
        onCategoryChange={mockOnCategoryChange}
      />
    );

    expect(screen.getByText('EXPLORE MENU')).toBeInTheDocument();
  });
});