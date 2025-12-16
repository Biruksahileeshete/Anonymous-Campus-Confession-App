import { NextRequest, NextResponse } from 'next/server';
import { simpleDb } from '@/lib/neon-db';
import { requireAuth } from '@/lib/auth-middleware';
import bcrypt from 'bcryptjs';

export const PUT = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const { fullName, currentPassword, newPassword } = await request.json();

    // Validate input
    if (!fullName || fullName.trim().length < 2) {
      return NextResponse.json({ error: 'Full name must be at least 2 characters' }, { status: 400 });
    }

    // If changing password, validate current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set new password' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
      }

      // Get current user data to verify password
      const currentUser = await simpleDb.getUserById(user.id);
      if (!currentUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, currentUser.password_hash);
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      // Hash new password and update
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await simpleDb.updateUserProfile(user.id, {
        full_name: fullName.trim(),
        password_hash: hashedPassword
      });
    } else {
      // Update only name
      await simpleDb.updateUserProfile(user.id, {
        full_name: fullName.trim()
      });
    }

    // Get updated user data
    const updatedUser = await simpleDb.getUserById(user.id);
    
    // Return updated user data (without password)
    const { password_hash, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
});