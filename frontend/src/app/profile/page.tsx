'use client';

import React, { useState } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check } from 'lucide-react';
import { validatePassword } from '@/utils/passwordPolicy';

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
  
  console.log('User object:', user);
  
  return (
    <ProtectedLayout>
      <div className='ml-6 mr-6'>
        <div className="mb-6 ml-4">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-gray-300">Manage your account settings</p>
        </div> 
        
        {/* User Info */}
        <div className="bg-[#212121] rounded-lg pl-5 pt-2 pb-2 mb-6">
          <div className="flex items-center mt-4">
            <div className="w-20 h-20 rounded-full bg-[#004346] flex items-center justify-center text-2xl mr-4 mb-4">
              {user?.username?.substring(0, 1)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-4xl pl-5 font-semibold">Hi {user?.username}</h2>
              {user?.email && <p className="ml-5 mt-2 text-gray-400">{user?.email}</p>}
            </div>
          </div>
        </div>
        
        {/* Settings */}
        <div className="bg-[#212121] rounded-lg overflow-hidden mb-6">
          <div className="p-3 border-b border-gray-700">
            <h2 className="font-medium">Account Settings</h2>
          </div>
          
          <div className="divide-y divide-gray-700">
            <button 
              className="w-full p-4 text-left flex items-center hover:bg-gray-800 transition-colors"
              onClick={handleOpenEmailDialog}
            >
              <span className="mr-3">✉️</span>
              <span>Change Email</span>
            </button>
            
            <button 
              className="w-full p-4 text-left flex items-center hover:bg-gray-800 transition-colors"
              onClick={handleOpenPasswordDialog}
            >
              <span className="mr-3">🔒</span>
              <span>Change Password</span>
            </button>
            
            <button 
              className="w-full p-4 text-left flex items-center hover:bg-gray-800 transition-colors"
              onClick={handleOpenUsernameDialog}
            >
              <span className="mr-3">👤</span>
              <span>Change Username</span>
            </button>
            
            <button className="w-full p-4 text-left flex items-center hover:bg-gray-800 transition-colors">
              <span className="mr-3">🔔</span>
              <span>Notifications</span>
            </button>
            
            <button className="w-full p-4 text-left flex items-center hover:bg-gray-800 transition-colors">
              <span className="mr-3">🌙</span>
              <span>Dark Mode</span>
            </button>
          </div>
        </div>
        
        {/* About */}
        <div className="bg-[#212121] rounded-lg overflow-hidden mb-8">
          <div className="p-3 border-b border-gray-700">
            <h2 className="font-medium">About</h2>
          </div>
          
          <div className="divide-y divide-gray-700">
            <button className="w-full p-4 text-left flex items-center hover:bg-gray-800 transition-colors">
              <span className="mr-3">📘</span>
              <span>Terms of Service</span>
            </button>
            
            <button className="w-full p-4 text-left flex items-center hover:bg-gray-800 transition-colors">
              <span className="mr-3">🔒</span>
              <span>Privacy Policy</span>
            </button>
            
            <button className="w-full p-4 text-left flex items-center hover:bg-gray-800 transition-colors">
              <span className="mr-3">ℹ️</span>
              <span>About Wealth Arc</span>
            </button>
          </div>
        </div>
        
        {/* Logout Button */}
        <button 
          onClick={logout} 
          className="w-full bg-red-500 text-white rounded-lg py-3 font-bold hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
        
        {/* Admin Dashboard Button */}
        {user?.role === 'admin' && (
          <button 
            onClick={() => router.push('/admin')} 
            className="w-full mt-4 bg-[#004346] text-white rounded-lg py-3 font-bold hover:bg-[#00595d] transition-colors"
          >
            Admin Dashboard
          </button>
        )}
        
        {/* Change Email Dialog */}
        {showEmailDialog && (
          <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
            <DialogContent className="bg-[#2a2a2a] text-white border-gray-700 sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Change Email</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Enter your new email address and current password.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEmailSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="newEmail">New Email</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter new email"
                      className="bg-[#3a3a3a] border-gray-700 text-white"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="bg-[#3a3a3a] border-gray-700 text-white"
                    />
                  </div>
                  
                  {/* Error messages */}
                  {formErrors.length > 0 && (
                    <div className="mt-2 p-3 rounded bg-red-900/30 border border-red-800">
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
                  
                  {/* Success message */}
                  {successMessage && (
                    <div className="mt-2 p-3 rounded bg-green-900/30 border border-green-800">
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
                    className="bg-transparent border-gray-700 text-white hover:bg-gray-800 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-[#004346] hover:bg-[#00595d] text-white"
                  >
                    {isLoading ? 'Updating...' : 'Update Email'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Change Password Dialog */}
        {showPasswordDialog && (
          <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
            <DialogContent className="bg-[#2a2a2a] text-white border-gray-700 sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Enter your current password and a new password.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handlePasswordSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currentPwd">Current Password</Label>
                    <Input
                      id="currentPwd"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="bg-[#3a3a3a] border-gray-700 text-white"
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
                      className="bg-[#3a3a3a] border-gray-700 text-white"
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
                      className="bg-[#3a3a3a] border-gray-700 text-white"
                    />
                  </div>
                  
                  {/* Error messages */}
                  {formErrors.length > 0 && (
                    <div className="mt-2 p-3 rounded bg-red-900/30 border border-red-800">
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
                  
                  {/* Success message */}
                  {successMessage && (
                    <div className="mt-2 p-3 rounded bg-green-900/30 border border-green-800">
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
                    className="bg-transparent border-gray-700 text-white hover:bg-gray-800 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-[#004346] hover:bg-[#00595d] text-white"
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Change Username Dialog */}
        {showUsernameDialog && (
          <Dialog open={showUsernameDialog} onOpenChange={setShowUsernameDialog}>
            <DialogContent className="bg-[#2a2a2a] text-white border-gray-700 sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Change Username</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Enter your new username.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUsernameSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="newUsername">New Username</Label>
                    <Input
                      id="newUsername"
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter new username"
                      className="bg-[#3a3a3a] border-gray-700 text-white"
                    />
                  </div>
                  
                  {/* Error messages */}
                  {formErrors.length > 0 && (
                    <div className="mt-2 p-3 rounded bg-red-900/30 border border-red-800">
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
                  
                  {/* Success message */}
                  {successMessage && (
                    <div className="mt-2 p-3 rounded bg-green-900/30 border border-green-800">
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
                    className="bg-transparent border-gray-700 text-white hover:bg-gray-800 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-[#004346] hover:bg-[#00595d] text-white"
                  >
                    {isLoading ? 'Updating...' : 'Update Username'}
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