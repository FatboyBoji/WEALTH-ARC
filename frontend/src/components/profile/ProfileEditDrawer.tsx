'use client';

import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from '@heroui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { validatePassword } from '../../utils/passwordPolicy';

type EditType = 'username' | 'email' | 'password';

interface ProfileEditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  editType: EditType;
  formData: {
    newUsername: string;
    newEmail: string;
    emailPassword: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    newUsername: string;
    newEmail: string;
    emailPassword: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>>;
  formErrors: string[];
  successMessage: string;
  isSubmitting: boolean;
}

export default function ProfileEditDrawer({
  isOpen,
  onClose,
  onSubmit,
  editType,
  formData,
  setFormData,
  formErrors,
  successMessage,
  isSubmitting
}: ProfileEditDrawerProps) {
  // Title based on edit type
  const getTitleText = () => {
    switch (editType) {
      case 'username': return 'Change Username';
      case 'email': return 'Change Email';
      case 'password': return 'Change Password';
      default: return 'Edit Profile';
    }
  };

  // Get input fields based on edit type
  const renderFormFields = () => {
    switch (editType) {
      case 'username':
        return (
          <div className="space-y-4">
            <Label htmlFor="newUsername" className="text-[#F3FFFC] font-medium">New Username</Label>
            <Input
              id="newUsername"
              value={formData.newUsername || ''}
              onChange={(e) => setFormData({...formData, newUsername: e.target.value})}
              className="bg-[#004346] border-none text-white h-14 rounded-xl shadow-sm focus:ring-[#09BC8A] focus:ring-1"
              placeholder="Enter new username"
            />
          </div>
        );
        
      case 'email':
        return (
          <>
            <div className="space-y-4">
              <Label htmlFor="newEmail" className="text-[#F3FFFC] font-medium">New Email</Label>
              <Input
                id="newEmail"
                type="email"
                value={formData.newEmail || ''}
                onChange={(e) => setFormData({...formData, newEmail: e.target.value})}
                className="bg-[#004346] border-none text-white h-14 rounded-xl shadow-sm focus:ring-[#09BC8A] focus:ring-1"
                placeholder="Enter new email address"
              />
            </div>
            
            <div className="space-y-4 mt-6">
              <Label htmlFor="emailPassword" className="text-[#F3FFFC] font-medium">Current Password</Label>
              <Input
                id="emailPassword"
                type="password"
                value={formData.emailPassword || ''}
                onChange={(e) => setFormData({...formData, emailPassword: e.target.value})}
                className="bg-[#004346] border-none text-white h-14 rounded-xl shadow-sm focus:ring-[#09BC8A] focus:ring-1"
                placeholder="Enter your current password"
              />
            </div>
          </>
        );
        
      case 'password':
        return (
          <>
            <div className="space-y-4">
              <Label htmlFor="currentPassword" className="text-[#F3FFFC] font-medium">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={formData.currentPassword || ''}
                onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                className="bg-[#004346] border-none text-white h-14 rounded-xl shadow-sm focus:ring-[#09BC8A] focus:ring-1"
                placeholder="Enter current password"
              />
            </div>
            
            <div className="space-y-4 mt-6">
              <Label htmlFor="newPassword" className="text-[#F3FFFC] font-medium">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword || ''}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                className="bg-[#004346] border-none text-white h-14 rounded-xl shadow-sm focus:ring-[#09BC8A] focus:ring-1"
                placeholder="Enter new password"
              />
            </div>
            
            <div className="space-y-4 mt-6">
              <Label htmlFor="confirmPassword" className="text-[#F3FFFC] font-medium">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword || ''}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="bg-[#004346] border-none text-white h-14 rounded-xl shadow-sm focus:ring-[#09BC8A] focus:ring-1"
                placeholder="Confirm new password"
              />
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <Drawer 
      isOpen={isOpen} 
      onOpenChange={onClose} 
      placement="bottom"
      classNames={{
        closeButton: "hidden",
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "drawer-slide-up"
      }}
    >
      <DrawerContent className="bg-[#192A38] text-white rounded-t-2xl max-h-[90vh]">
        {() => (
          <>
            <DrawerHeader className="border-b border-gray-700/30 pb-4 pt-6">
              <h2 className="text-2xl font-medium text-[#09BC8A] text-center">
                {getTitleText()}
              </h2>
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="absolute right-4 top-6 text-gray-400 hover:text-white hover:bg-[#004346]/50 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
                <span className="sr-only">Close</span>
              </Button>
            </DrawerHeader>

            <DrawerBody className="py-6 px-5">
              <form onSubmit={onSubmit} id="profile-form" className="space-y-6">
                {renderFormFields()}
                
                {/* Error messages */}
                {formErrors.length > 0 && (
                  <div className="p-4 rounded-xl bg-red-900/20 border border-red-800/50 mt-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        {formErrors.map((err, index) => (
                          <p key={index} className="text-red-400 text-sm">{err}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Success message */}
                {successMessage && (
                  <div className="p-4 rounded-xl bg-green-900/20 border border-green-800/50 mt-4">
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-[#09BC8A] mr-2 flex-shrink-0" />
                      <p className="text-[#09BC8A]">{successMessage}</p>
                    </div>
                  </div>
                )}
              </form>
            </DrawerBody>

            <DrawerFooter className="border-t border-gray-700/30 pt-4 pb-8 px-5">
              <div className="grid grid-cols-2 gap-4 w-full">
                <Button 
                  type="button" 
                  onClick={onClose}
                  className="bg-[#212121] border-none text-white hover:bg-[#2d2d2d] rounded-xl h-14 font-medium"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  form="profile-form"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#09BC8A] text-[#192A38] hover:bg-[#09BC8A]/90 rounded-xl h-14 font-medium"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2 text-[#192A38]" />
                      <span>Updating...</span>
                    </div>
                  ) : (
                    `Update ${editType.charAt(0).toUpperCase() + editType.slice(1)}`
                  )}
                </Button>
              </div>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
} 