import React, { useState, useEffect } from 'react';
import { Box, Text, Button, Card, Form, Input, Label, Notification } from '@adminjs/design-system';

const Profile = ({ currentAdmin }) => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (currentAdmin) {
      setProfile(prev => ({
        ...prev,
        name: currentAdmin.name || '',
        email: currentAdmin.email || ''
      }));
    }
  }, [currentAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    try {
      if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          currentPassword: profile.currentPassword || undefined,
          newPassword: profile.newPassword || undefined
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      setNotification({
        type: 'success',
        message: 'Profile updated successfully'
      });

      // Clear password fields
      setProfile(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setProfile(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <Box variant="grey" p={4}>
      <Box mb={4}>
        <Text variant="h3" fontWeight="bold">Profile Settings</Text>
        <Text variant="body" color="grey60">Manage your admin account settings</Text>
      </Box>

      {notification && (
        <Box mb={4}>
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        </Box>
      )}

      <Card as="form" onSubmit={handleSubmit}>
        <Box p={4}>
          <Box mb={4}>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={profile.name}
              onChange={handleChange('name')}
              disabled={loading}
            />
          </Box>

          <Box mb={4}>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={handleChange('email')}
              disabled={loading}
            />
          </Box>

          <Box mb={4}>
            <Text variant="h4" fontWeight="bold" mb={3}>Change Password</Text>
            
            <Box mb={3}>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={profile.currentPassword}
                onChange={handleChange('currentPassword')}
                disabled={loading}
                placeholder="Enter current password to change"
              />
            </Box>

            <Box mb={3}>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={profile.newPassword}
                onChange={handleChange('newPassword')}
                disabled={loading}
                placeholder="Enter new password"
              />
            </Box>

            <Box mb={4}>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={profile.confirmPassword}
                onChange={handleChange('confirmPassword')}
                disabled={loading}
                placeholder="Confirm new password"
              />
            </Box>
          </Box>

          <Box>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              isLoading={loading}
            >
              Update Profile
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default Profile;
