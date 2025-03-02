'use client';

import React, { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check, Mail, Key, User, FileText, Lock, Info, LogOut } from 'lucide-react';
import { validatePassword } from '@/utils/passwordPolicy';
import api, { getUserProfile } from '@/lib/api';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function ProfilePage() {
  const { user, logout, changeEmail, changePassword, changeUsername, isLoading, error } = useAuth();
  const router = useRouter();
  
  // State for dialog visibility
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  
  // Form states
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  
  // Validation and success states
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [displayUser, setDisplayUser] = useState(user);
  
  // Add loading states for each form
  const [isSubmittingUsername, setIsSubmittingUsername] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  
  // Load user data
  useEffect(() => {
    if (user) {
      setDisplayUser(user);
      setIsProfileLoading(false);
      console.log('Profile page user data:', {
        username: user.username,
        email: user.email, 
        isEmailDefined: typeof user.email !== 'undefined'
      });
      
      // If email is undefined or null, fetch complete user data
      if (!user.email) {
        const fetchUserDetails = async () => {
          try {
            const userData = await getUserProfile();
            if (userData && userData.data && userData.data.email) {
              // Set complete user data with email
              setDisplayUser({
                ...user,
                email: userData.data.email
              });
              console.log('Updated user data with email:', userData.data.email);
            }
          } catch (error) {
            console.error('Error fetching user details:', error);
          }
        };
        
        fetchUserDetails();
      }
    } else {
      console.log('User data not yet available');
    }
  }, [user]);
  
  // Email Dialog Handlers
  const handleOpenEmailDialog = () => {
    setShowEmailDialog(true);
    setFormErrors([]);
    setSuccessMessage('');
    setNewEmail('');
    setEmailPassword('');
  };
  
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setSuccessMessage('');
    
    if (!newEmail) {
      setFormErrors(['Please enter a new email address']);
      return;
    }
    
    if (!emailPassword) {
      setFormErrors(['Please enter your current password']);
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setFormErrors(['Please enter a valid email address']);
      return;
    }
    
    try {
      await changeEmail(newEmail, emailPassword);
      setSuccessMessage('Email updated successfully!');
      setTimeout(() => {
        setShowEmailDialog(false);
        setSuccessMessage('');
      }, 2000);
    } catch (err: any) {
      setFormErrors([err?.response?.data?.message || 'Failed to update email']);
    }
  };
  
  // Password Dialog Handlers
  const handleOpenPasswordDialog = () => {
    setShowPasswordDialog(true);
    setFormErrors([]);
    setSuccessMessage('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setSuccessMessage('');
    
    if (!currentPassword) {
      setFormErrors(['Please enter your current password']);
      return;
    }
    
    if (!newPassword) {
      setFormErrors(['Please enter a new password']);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setFormErrors(['Passwords do not match']);
      return;
    }
    
    // Password policy validation
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setFormErrors(passwordErrors);
      return;
    }
    
    try {
      await changePassword(currentPassword, newPassword);
      setSuccessMessage('Password updated successfully! You will be logged out.');
      setTimeout(() => {
        setShowPasswordDialog(false);
      }, 2000);
    } catch (err: any) {
      setFormErrors([err?.response?.data?.message || 'Failed to update password']);
    }
  };
  
  // Username Dialog Handlers
  const handleOpenUsernameDialog = () => {
    setShowUsernameDialog(true);
    setFormErrors([]);
    setSuccessMessage('');
    setNewUsername('');
  };
  
  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setSuccessMessage('');
    
    if (!newUsername) {
      setFormErrors(['Please enter a new username']);
      return;
    }
    
    if (newUsername.length < 3) {
      setFormErrors(['Username must be at least 3 characters long']);
      return;
    }
    
    try {
      await changeUsername(newUsername);
      setSuccessMessage('Username updated successfully!');
      setTimeout(() => {
        setShowUsernameDialog(false);
        setSuccessMessage('');
      }, 2000);
    } catch (err: any) {
      setFormErrors([err?.response?.data?.message || 'Failed to update username']);
    }
  };
  
  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };
  
  // Update username handler
  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setSuccessMessage('');
    setIsSubmittingUsername(true); // Start loading
    
    try {
      // Validate
      if (!newUsername.trim()) {
        setFormErrors(['Username cannot be empty']);
        setIsSubmittingUsername(false);
        return;
      }
      
      if (newUsername.length < 3) {
        setFormErrors(['Username must be at least 3 characters long']);
        setIsSubmittingUsername(false);
        return;
      }
      
      await changeUsername(newUsername);
      setSuccessMessage('Username updated successfully');
      
      setTimeout(() => {
        setIsSubmittingUsername(false);
      }, 1000);
      
    } catch (error: any) {
      setFormErrors([error.message || 'Failed to update username']);
      setIsSubmittingUsername(false);
    }
  };
  
  // Similarly update email and password handlers...
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setSuccessMessage('');
    setIsSubmittingEmail(true); // Start loading
    
    try {
      // Form validation...
      
      await changeEmail(newEmail, emailPassword);
      
      setSuccessMessage('Email updated successfully');
      
      setTimeout(() => {
        setIsSubmittingEmail(false);
      }, 1000);
      
    } catch (error: any) {
      setFormErrors([error.message || 'Failed to update email']);
      setIsSubmittingEmail(false);
    }
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setSuccessMessage('');
    setIsSubmittingPassword(true); // Start loading
    
    try {
      // Form validation...
      
      await changePassword(currentPassword, newPassword);
      
      setSuccessMessage('Password updated successfully');
      
      setTimeout(() => {
        setIsSubmittingPassword(false);
      }, 1000);
      
    } catch (error: any) {
      setFormErrors([error.message || 'Failed to update password']);
      setIsSubmittingPassword(false);
    }
  };
  
  return (
    <ProtectedLayout>
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 space-y-6">
        {/* Header */}
        <div className="border-b border-[#09BC8A]/30 pb-4">
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <p className="text-[#9CA3AF] mt-1">Manage your profile and preferences</p>
        </div>
        
        {/* Profile Information */}
        <section>
          <h2 className="text-lg font-medium mb-4 text-[#F3FFFC]">Profile Information</h2>
          
          <div className="bg-[#192A38] rounded-xl overflow-hidden border border-[#09BC8A]/40 shadow-xl">
            <div className="flex flex-row items-start p-6">
              <div className="w-16 h-16 rounded-full bg-[#004346] flex items-center justify-center text-xl flex-shrink-0 border-2 border-[#09BC8A]/30 mr-4">
                {displayUser?.username?.substring(0, 1)?.toUpperCase() || 'U'}
              </div>
              
              <div className="flex-1 pt-1">
                <div className="flex flex-col mb-4">
                  <h3 className="text-xl font-medium truncate">
                    {isProfileLoading ? (
                      <div className="h-6 w-40 bg-gray-700/50 animate-pulse rounded"></div>
                    ) : (
                      displayUser?.username
                    )}
                  </h3>
                  {isProfileLoading ? (
                    <div className="h-5 w-48 bg-gray-700/50 animate-pulse rounded mt-1"></div>
                  ) : (
                    (displayUser?.email && displayUser.email !== 'undefined') ? (
                      <p className="text-[#9CA3AF] text-sm truncate mt-1">
                        {displayUser?.email}
                      </p>
                    ) : (
                      <p className="text-[#9CA3AF] text-sm truncate mt-1 italic">
                        Email not available
                      </p>
                    )
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row w-full gap-3">
                  <button 
                    onClick={handleOpenUsernameDialog}
                    className="flex items-center justify-center flex-1 px-4 py-3 text-sm font-medium rounded-md border border-[#09BC8A]/30 hover:bg-[#09BC8A]/10 transition-colors text-[#F3FFFC]"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Edit Username
                  </button>
                  
                  <button 
                    onClick={handleOpenEmailDialog}
                    className="flex items-center justify-center flex-1 px-4 py-3 text-sm font-medium rounded-md border border-[#09BC8A]/30 hover:bg-[#09BC8A]/10 transition-colors text-[#F3FFFC]"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Change Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Security Section */}
        <section>
          <h2 className="text-lg font-medium mb-2 mt-8 text-[#F3FFFC]">Security</h2>
          
          <div className="bg-[#192A38] rounded-xl overflow-hidden border border-[#09BC8A]/40 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Key className="h-5 w-5 text-[#09BC8A] mr-3" />
                  <div>
                    <h3 className="text-base font-medium">Password</h3>
                  </div>
                </div>
                <button 
                  onClick={handleOpenPasswordDialog}
                  className="px-16 py-4 text-sm font-medium rounded-lg bg-transparent border border-[#09BC8A]/50 hover:bg-[#09BC8A]/10 transition-colors text-[#F3FFFC]"
                >
                  Change
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Account Actions */}
        <section>
          <div className="flex flex-col sm:flex-row gap-4 mt-8 mb-8">
            <button 
              onClick={logout} 
              className="flex-1 bg-transparent border border-red-500/70 text-red-400 rounded-lg py-3 px-4 font-medium hover:bg-red-900/20 transition-colors flex items-center justify-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
            
            {displayUser?.role === 'admin' && (
              <button 
                onClick={() => router.push('/admin')} 
                className="flex-1 bg-[#004346] text-white rounded-lg py-3 px-4 font-medium hover:bg-[#00595d] transition-colors"
              >
                Admin Panel
              </button>
            )}
          </div>
        </section>
        
        {/* Email Dialog */}
        {showEmailDialog && (
          <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
            <DialogContent className="bg-[#1e3446] text-white border-[#004346] sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Change Email</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Enter your new email address and current password.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateEmail}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="newEmail">New Email</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter new email address"
                      className="bg-[#192A38] border-gray-700 text-white"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="bg-[#192A38] border-gray-700 text-white"
                    />
                  </div>
                  
                  {/* Messages */}
                  {formErrors.length > 0 && (
                    <div className="p-3 rounded bg-red-900/30 border border-red-800">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                        <div>
                          {formErrors.map((err, index) => (
                            <p key={index} className="text-red-500 text-sm">{err}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {successMessage && (
                    <div className="p-3 rounded bg-green-900/30 border border-green-800">
                      <div className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <p className="text-green-500 text-sm">{successMessage}</p>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowEmailDialog(false)}
                    className="bg-transparent border-gray-700 text-white hover:bg-[#192A38] hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmittingEmail}
                    className="bg-[#09BC8A] hover:bg-[#09BC8A]/90 text-[#192A38]"
                  >
                    {isSubmittingEmail ? (
                      <div className="flex items-center">
                        <LoadingSpinner size="sm" className="mr-2 text-[#192A38]" />
                        <span>Updating...</span>
                      </div>
                    ) : (
                      'Update Email'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Password Dialog */}
        {showPasswordDialog && (
          <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
            <DialogContent className="bg-[#1e3446] text-white border-[#004346] sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Enter your current password and a new password.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdatePassword}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currentPwd">Current Password</Label>
                    <Input
                      id="currentPwd"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="bg-[#192A38] border-gray-700 text-white"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="newPwd">New Password</Label>
                    <Input
                      id="newPwd"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="bg-[#192A38] border-gray-700 text-white"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPwd">Confirm New Password</Label>
                    <Input
                      id="confirmPwd"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="bg-[#192A38] border-gray-700 text-white"
                    />
                  </div>
                  
                  {/* Messages */}
                  {formErrors.length > 0 && (
                    <div className="p-3 rounded bg-red-900/30 border border-red-800">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                        <div>
                          {formErrors.map((err, index) => (
                            <p key={index} className="text-red-500 text-sm">{err}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {successMessage && (
                    <div className="p-3 rounded bg-green-900/30 border border-green-800">
                      <div className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <p className="text-green-500 text-sm">{successMessage}</p>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowPasswordDialog(false)}
                    className="bg-transparent border-gray-700 text-white hover:bg-[#192A38] hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmittingPassword}
                    className="bg-[#09BC8A] hover:bg-[#09BC8A]/90 text-[#192A38]"
                  >
                    {isSubmittingPassword ? (
                      <div className="flex items-center">
                        <LoadingSpinner size="sm" className="mr-2 text-[#192A38]" />
                        <span>Updating...</span>
                      </div>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Username Dialog */}
        {showUsernameDialog && (
          <Dialog open={showUsernameDialog} onOpenChange={setShowUsernameDialog}>
            <DialogContent className="bg-[#1e3446] text-white border-[#004346] sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Change Username</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Enter your new username.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateUsername}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="newUsername">New Username</Label>
                    <Input
                      id="newUsername"
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter new username"
                      className="bg-[#192A38] border-gray-700 text-white"
                    />
                  </div>
                  
                  {/* Messages */}
                  {formErrors.length > 0 && (
                    <div className="p-3 rounded bg-red-900/30 border border-red-800">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                        <div>
                          {formErrors.map((err, index) => (
                            <p key={index} className="text-red-500 text-sm">{err}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {successMessage && (
                    <div className="p-3 rounded bg-green-900/30 border border-green-800">
                      <div className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <p className="text-green-500 text-sm">{successMessage}</p>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowUsernameDialog(false)}
                    className="bg-transparent border-gray-700 text-white hover:bg-[#192A38] hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmittingUsername}
                    className="bg-[#09BC8A] hover:bg-[#09BC8A]/90 text-[#192A38]"
                  >
                    {isSubmittingUsername ? (
                      <div className="flex items-center">
                        <LoadingSpinner size="sm" className="mr-2 text-[#192A38]" />
                        <span>Updating...</span>
                      </div>
                    ) : (
                      'Update Username'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ProtectedLayout>
  );
} 