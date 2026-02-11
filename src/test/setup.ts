import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extends expect from Vitest with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
   cleanup();
});