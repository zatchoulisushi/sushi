import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the supabase module
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockReturnThis(),
    })),
  },
}));

import { AuthService } from '../lib/auth';

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('should sign up a user successfully', async () => {
      const mockUserData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '0123456789',
      };

      const mockUser = {
        id: 'user-123',
        email: 'john.doe@example.com',
      };

      const { supabase } = await import('../lib/supabase');
      
      // Mock auth.signUp
      (supabase.auth.signUp as any).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock from().insert()
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      (supabase.from as any).mockReturnValue({ insert: mockInsert });

      const result = await AuthService.signUp(
        'john.doe@example.com',
        'password123',
        mockUserData
      );

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
        password: 'password123',
        options: {
          data: {
            first_name: 'John',
            last_name: 'Doe',
            phone: '0123456789',
          },
        },
      });

      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(mockInsert).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '0123456789',
        address: '',
        city: '',
        postal_code: '',
        loyalty_points: 0,
        loyalty_tier: 'bronze',
      });

      expect(result.user).toEqual(mockUser);
    });

    it('should throw error when sign up fails', async () => {
      const { supabase } = await import('../lib/supabase');
      
      (supabase.auth.signUp as any).mockResolvedValue({
        data: null,
        error: new Error('Email already exists'),
      });

      await expect(
        AuthService.signUp('existing@example.com', 'password123', {
          firstName: 'John',
          lastName: 'Doe',
          phone: '0123456789',
        })
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('signIn', () => {
    it('should sign in a user successfully', async () => {
      const mockAuthData = {
        user: { id: 'user-123', email: 'john.doe@example.com' },
        session: { access_token: 'token' },
      };

      const { supabase } = await import('../lib/supabase');
      
      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: mockAuthData,
        error: null,
      });

      const result = await AuthService.signIn('john.doe@example.com', 'password123');

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockAuthData);
    });

    it('should throw error when credentials are invalid', async () => {
      const { supabase } = await import('../lib/supabase');
      
      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: null,
        error: new Error('Invalid credentials'),
      });

      await expect(
        AuthService.signIn('wrong@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockUser = { id: 'user-123', email: 'john.doe@example.com' };

      const { supabase } = await import('../lib/supabase');
      
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await AuthService.getCurrentUser();

      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile data', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        loyalty_points: 150,
        loyalty_tier: 'silver',
      };

      const { supabase } = await import('../lib/supabase');
      
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
      };

      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await AuthService.getUserProfile('user-123');

      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'user-123');
      expect(result).toEqual(mockProfile);
    });
  });
});