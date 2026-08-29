import { describe, it, expect } from 'vitest';
import { formatPrice, getAdjustedPrice, pricePerLesson } from './utils';
import type { Package } from './types';

describe('Pricing utilities', () => {
  const mockPackage: Package = {
    lessons_count: 4,
    price: 8000,
  };

  describe('getAdjustedPrice', () => {
    it('should use expert multiplier (1.0) for expert level', () => {
      const result = getAdjustedPrice(mockPackage, 'expert');
      expect(result).toBe(8000); // 8000 * 1.0, rounded to nearest 100
    });

    it('should use default master multiplier (1.3) when masterMultiplier not provided', () => {
      const result = getAdjustedPrice(mockPackage, 'master');
      expect(result).toBe(10400); // 8000 * 1.3 = 10400, rounded to nearest 100
    });

    it('should use provided masterMultiplier when specified', () => {
      const result = getAdjustedPrice(mockPackage, 'master', 1.5);
      expect(result).toBe(12000); // 8000 * 1.5 = 12000, rounded to nearest 100
    });

    it('should ignore masterMultiplier for expert level', () => {
      const result = getAdjustedPrice(mockPackage, 'expert', 1.8);
      expect(result).toBe(8000); // Should still use 1.0 multiplier for expert
    });

    it('should round to nearest 100', () => {
      const pkg: Package = { lessons_count: 4, price: 7550 };
      const result = getAdjustedPrice(pkg, 'master', 1.4);
      expect(result).toBe(10600); // 7550 * 1.4 = 10570, rounded to 10600
    });
  });

  describe('pricePerLesson', () => {
    it('should calculate correct per-lesson price for expert level', () => {
      const result = pricePerLesson(mockPackage, 'expert');
      expect(result).toBe(2000); // 8000 * 1.0 / 4 = 2000
    });

    it('should use default master multiplier (1.3) when masterMultiplier not provided', () => {
      const result = pricePerLesson(mockPackage, 'master');
      expect(result).toBe(2600); // Math.round(8000 * 1.3) / 4 = 10400 / 4 = 2600
    });

    it('should use provided masterMultiplier when specified', () => {
      const result = pricePerLesson(mockPackage, 'master', 1.5);
      expect(result).toBe(3000); // Math.round(8000 * 1.5) / 4 = 12000 / 4 = 3000
    });

    it('should ignore masterMultiplier for expert level', () => {
      const result = pricePerLesson(mockPackage, 'expert', 1.8);
      expect(result).toBe(2000); // Should still use 1.0 multiplier for expert
    });

    it('should handle rounding correctly', () => {
      const pkg: Package = { lessons_count: 3, price: 7500 };
      const result = pricePerLesson(pkg, 'master', 1.4);
      // 7500 * 1.4 = 10500 (rounded to 10500), 10500 / 3 = 3500
      expect(result).toBe(3500);
    });
  });
});