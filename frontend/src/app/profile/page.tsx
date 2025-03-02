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
import ProfileEditDrawer from '@/components/profile/ProfileEditDrawer';

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
  
  // Add a new state to track which drawer is open
  const [activeDrawer, setActiveDrawer] = useState<'username' | 'email' | 'password' | null>(null);
  
  // Combine form states into a single object for the drawer
  const [drawerFormData, setDrawerFormData] = useState({
    newUsername: '',
    newEmail: '',
    emailPassword: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
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
  
  // Handlers for opening drawers
  const handleOpenUsernameDrawer = () => {
    setActiveDrawer('username');
    setFormErrors([]);
    setSuccessMessage('');
    setDrawerFormData({
      ...drawerFormData,
      newUsername: ''
    });
  };
  
  const handleOpenEmailDrawer = () => {
    setActiveDrawer('email');
    setFormErrors([]);
    setSuccessMessage('');
    setDrawerFormData({
      ...drawerFormData,
      newEmail: '',
      emailPassword: ''
    });
  };
  
  const handleOpenPasswordDrawer = () => {
    setActiveDrawer('password');
    setFormErrors([]);
    setSuccessMessage('');
    setDrawerFormData({
      ...drawerFormData,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };
  
  const handleCloseDrawer = () => {
    setActiveDrawer(null);
  };
  
  const handleDrawerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setSuccessMessage('');
    
    switch (activeDrawer) {
      case 'username':
        await handleUpdateUsername(e);
        break;
      case 'email':
        await handleUpdateEmail(e);
        break;
      case 'password':
        await handleUpdatePassword(e);
        break;
    }
  };
  
  // Update handlers to use drawer form data
  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setSuccessMessage('');
    setIsSubmittingUsername(true);
    
    try {
      // Validate
      if (!drawerFormData.newUsername?.trim()) {
        setFormErrors(['Username cannot be empty']);
        setIsSubmittingUsername(false);
        return;
      }
      
      if (drawerFormData.newUsername.length < 3) {
        setFormErrors(['Username must be at least 3 characters long']);
        setIsSubmittingUsername(false);
        return;
      }
      
      await changeUsername(drawerFormData.newUsername);
      setSuccessMessage('Username updated successfully');
      
      setTimeout(() => {
        setIsSubmittingUsername(false);
        setActiveDrawer(null);
      }, 1500);
      
    } catch (error: any) {
      setFormErrors([error.message || 'Failed to update username']);
      setIsSubmittingUsername(false);
    }
  };
  
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setSuccessMessage('');
    setIsSubmittingEmail(true);
    
    try {
      if (!drawerFormData.newEmail) {
        setFormErrors(['Please enter a new email address']);
        setIsSubmittingEmail(false);
        return;
      }
      
      if (!drawerFormData.emailPassword) {
        setFormErrors(['Please enter your current password']);
        setIsSubmittingEmail(false);
        return;
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(drawerFormData.newEmail)) {
        setFormErrors(['Please enter a valid email address']);
        setIsSubmittingEmail(false);
        return;
      }
      
      await changeEmail(drawerFormData.newEmail, drawerFormData.emailPassword);
      setSuccessMessage('Email updated successfully!');
      
      setTimeout(() => {
        setIsSubmittingEmail(false);
        setActiveDrawer(null);
      }, 1500);
      
    } catch (error: any) {
      setFormErrors([error?.response?.data?.message || 'Failed to update email']);
      setIsSubmittingEmail(false);
    }
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setSuccessMessage('');
    setIsSubmittingPassword(true);
    
    try {
      if (!drawerFormData.currentPassword) {
        setFormErrors(['Please enter your current password']);
        setIsSubmittingPassword(false);
        return;
      }
      
      if (!drawerFormData.newPassword) {
        setFormErrors(['Please enter a new password']);
        setIsSubmittingPassword(false);
        return;
      }
      
      if (drawerFormData.newPassword !== drawerFormData.confirmPassword) {
        setFormErrors(['Passwords do not match']);
        setIsSubmittingPassword(false);
        return;
      }
      
      // Password policy validation
      const passwordErrors = validatePassword(drawerFormData.newPassword);
      if (passwordErrors.length > 0) {
        setFormErrors(passwordErrors);
        setIsSubmittingPassword(false);
        return;
      }
      
      await changePassword(drawerFormData.currentPassword, drawerFormData.newPassword);
      setSuccessMessage('Password updated successfully! You will be logged out.');
      
      setTimeout(() => {
        setIsSubmittingPassword(false);
        setActiveDrawer(null);
        // Optionally trigger logout here
        logout();
      }, 2000);
      
    } catch (error: any) {
      setFormErrors([error?.response?.data?.message || 'Failed to update password']);
      setIsSubmittingPassword(false);
    }
  };
  
  return (
    <ProtectedLayout>
      <div className="">
        {/* Header */}
        <div className="border-b border-[#09BC8A]/30 pb-4">
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <p className="text-[#9CA3AF] mt-1">Manage your profile and preferences</p>
        </div>
        
        {/* Profile Information */}
        <section>
          <h2 className="text-lg font-medium mt-8 mb-4 text-[#F3FFFC]">Profile Information</h2>
          
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
                    onClick={handleOpenUsernameDrawer}
                    className="flex items-center justify-center flex-1 px-4 py-3 text-sm font-medium rounded-md border border-[#09BC8A]/30 hover:bg-[#09BC8A]/10 transition-colors text-[#F3FFFC]"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Edit Username
                  </button>
                  
                  <button 
                    onClick={handleOpenEmailDrawer}
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
                  <Key className="h-5 w-8 text-[#09BC8A] mr-3" />
                  <div>
                    <h3 className="text-base font-medium">Password</h3>
                  </div>
                </div>
                <button 
                  onClick={handleOpenPasswordDrawer}
                  className="px-16 ml-2 py-4 text-sm font-medium rounded-lg bg-transparent border border-[#09BC8A]/50 hover:bg-[#09BC8A]/10 transition-colors text-[#F3FFFC]"
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
        
        {/* Profile Edit Drawer */}
        <ProfileEditDrawer
          isOpen={activeDrawer !== null}
          onClose={handleCloseDrawer}
          onSubmit={handleDrawerSubmit}
          editType={activeDrawer || 'username'}
          formData={drawerFormData}
          setFormData={setDrawerFormData}
          formErrors={formErrors}
          successMessage={successMessage}
          isSubmitting={
            (activeDrawer === 'username' && isSubmittingUsername) || 
            (activeDrawer === 'email' && isSubmittingEmail) || 
            (activeDrawer === 'password' && isSubmittingPassword)
          }
        />
      </div>
    </ProtectedLayout>
  );
} 