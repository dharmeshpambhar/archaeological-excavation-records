import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import {
  Camera, Check, Shield, User, Phone, Mail, MapPin,
  GraduationCap, Briefcase, KeyRound, Lock, Loader2, Sparkles, Building, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser, updateProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('Personal Info');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Profile Form State
  const [formData, setFormData] = useState({
    // Personal Info
    name: '',
    dob: '',
    gender: 'Male',
    bio: '',
    // Contact Info
    phone: '',
    emergencyContact: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    // Education
    degree: '',
    university: '',
    fieldOfStudy: '',
    graduationYear: '',
    // Professional
    occupation: '',
    institution: '',
    specialization: '',
    expertise: '',
    yearsOfExperience: '',
    researchId: '',
  });

  // Password State for Account tab
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Sync state with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        dob: user.dob || '',
        gender: user.gender || 'Male',
        bio: user.bio || '',
        phone: user.phone || '',
        emergencyContact: user.emergencyContact || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || 'India',
        degree: user.degree || '',
        university: user.university || '',
        fieldOfStudy: user.fieldOfStudy || '',
        graduationYear: user.graduationYear || '',
        occupation: user.occupation || (user.role === 'Admin' ? 'Director General of Excavations' : 'Senior Archaeologist'),
        institution: user.institution || 'Archaeological Survey of India (ASI)',
        specialization: user.specialization || 'Harappan Archaeology & Stratigraphy',
        expertise: Array.isArray(user.expertise) ? user.expertise.join(', ') : (user.expertise || ''),
        yearsOfExperience: user.yearsOfExperience || '10+',
        researchId: user.researchId || `ASI-RES-${user._id?.slice(-4).toUpperCase() || '7821'}`,
      });
    }
  }, [user]);

  const tabs = [
    { id: 'Personal Info', label: 'Personal Info', icon: User },
    { id: 'Contact Info', label: 'Contact Info', icon: Phone },
    { id: 'Account', label: 'Account', icon: Shield },
    { id: 'Education', label: 'Education', icon: GraduationCap },
    { id: 'Professional', label: 'Professional', icon: Briefcase },
  ];

  // Helper for safe avatar url
  const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250&h=250&fit=crop&crop=face';

  const getAvatarUrl = (avatar) => {
    if (!avatar || avatar.includes('photo-1573496359142-b8d87734a5a2')) return DEFAULT_AVATAR;
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
    return avatar;
  };

  const AVATAR_PRESETS = [
    { label: 'Friendly Scholar', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250&h=250&fit=crop&crop=face' },
    { label: 'Field Explorer', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&h=250&fit=crop&crop=face' },
    { label: 'Heritage Analyst', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&fit=crop&crop=face' },
    { label: 'Archival Specialist', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=250&h=250&fit=crop&crop=face' },
  ];

  const handlePresetClick = async (presetUrl) => {
    setUploadingPhoto(true);
    try {
      const res = await authAPI.updateProfile({ avatar: presetUrl });
      if (res.data?.user) {
        updateUser(res.data.user);
        toast.success('Profile photo updated!');
      }
    } catch (err) {
      toast.error('Failed to update avatar preset');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle Photo Upload
  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image file size must be less than 10MB');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('avatar', file);

    setUploadingPhoto(true);
    try {
      const res = await authAPI.updateAvatar(uploadData);
      if (res.data?.user) {
        updateUser(res.data.user);
        toast.success('Profile photo updated successfully!');
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
      toast.error(err.response?.data?.message || 'Failed to upload profile photo');
    } finally {
      setUploadingPhoto(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Profile Details Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const expertiseArray = formData.expertise
        ? formData.expertise.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = {
        name: formData.name,
        dob: formData.dob,
        gender: formData.gender,
        bio: formData.bio,
        phone: formData.phone,
        emergencyContact: formData.emergencyContact,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        degree: formData.degree,
        university: formData.university,
        fieldOfStudy: formData.fieldOfStudy,
        graduationYear: formData.graduationYear,
        occupation: formData.occupation,
        institution: formData.institution,
        specialization: formData.specialization,
        expertise: expertiseArray,
        yearsOfExperience: formData.yearsOfExperience,
        researchId: formData.researchId,
      };

      if (updateProfile) {
        await updateProfile(payload);
      }
      toast.success(`${activeTab} updated successfully!`);
    } catch (err) {
      console.error('Update profile error:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Update under Account Tab
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setUpdatingPassword(true);
    try {
      await authAPI.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password. Verify your current password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1240, margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      {/* ─── Top Header ───────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1D20', marginBottom: 4 }}>
          Researcher Profile
        </h1>
        <p style={{ fontSize: 13.5, color: '#6A746E', margin: 0 }}>
          Manage your personal identity, contact reachability, academic credentials, and professional fieldwork specializations.
        </p>
      </div>

      {/* ─── Tab Bar (Personal Info, Contact Info, Account, Education, Professional) ── */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          borderBottom: '1px solid #E8E5DF',
          paddingBottom: 12,
          marginBottom: 28,
          flexWrap: 'wrap',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 16px',
                borderRadius: 20,
                border: '1px solid',
                borderColor: isActive ? '#31543D' : '#D8D4CC',
                background: isActive ? '#31543D' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#556059',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── 2 Column Layout (Avatar on Left, Form on Right) ──────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '290px 1fr',
          gap: 32,
          alignItems: 'start',
        }}
        className="profile-layout-grid"
      >
        {/* Left Column: Avatar + Name + Title + Change Photo */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E8E5DF',
            borderRadius: 10,
            padding: '28px 22px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          {/* Avatar with Camera Overlay */}
          <div
            onClick={handlePhotoClick}
            style={{
              position: 'relative',
              width: 110,
              height: 110,
              marginBottom: 16,
              cursor: uploadingPhoto ? 'wait' : 'pointer',
              borderRadius: '50%',
              overflow: 'hidden',
            }}
            title="Click to change profile photo"
          >
            <img
              src={getAvatarUrl(user?.avatar)}
              alt={formData.name || 'User Profile'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                border: '2.5px solid #E8E5DF',
                borderRadius: '50%',
                opacity: uploadingPhoto ? 0.4 : 1,
                transition: 'opacity 0.2s ease',
              }}
            />
            {uploadingPhoto ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.4)',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                }}
              >
                <Loader2 size={24} className="spin-animation" />
              </div>
            ) : (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(26, 29, 32, 0.45)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                }}
                className="avatar-hover-overlay"
              >
                <Camera size={22} />
                <span style={{ fontSize: 11, fontWeight: 600 }}>Change</span>
              </div>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/jpg"
            style={{ display: 'none' }}
          />

          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1A1D20', marginBottom: 4 }}>
            {formData.name || user?.name || 'Researcher'}
          </h3>
          <div style={{ fontSize: 13, color: '#7E8883', marginBottom: 16 }}>
            {formData.occupation || 'Archaeological Investigator'}
          </div>

          <button
            type="button"
            onClick={handlePhotoClick}
            disabled={uploadingPhoto}
            style={{
              padding: '7px 18px',
              background: '#FFFFFF',
              border: '1px solid #D8D4CC',
              borderRadius: 6,
              fontSize: 12.5,
              fontWeight: 600,
              color: '#31543D',
              cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => !uploadingPhoto && (e.currentTarget.style.background = '#F7FAF7')}
            onMouseLeave={(e) => !uploadingPhoto && (e.currentTarget.style.background = '#FFFFFF')}
          >
            {uploadingPhoto ? (
              <>
                <Loader2 size={13} className="spin-animation" /> Uploading...
              </>
            ) : (
              <>
                <Camera size={14} /> Change Photo
              </>
            )}
          </button>

          {/* Quick Avatar Presets */}
          <div style={{ marginTop: 16, width: '100%' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#7E8883', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Quick Avatar Presets
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
              {AVATAR_PRESETS.map((preset) => {
                const current = getAvatarUrl(user?.avatar);
                const isSelected = current === preset.url;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    title={preset.label}
                    onClick={() => handlePresetClick(preset.url)}
                    disabled={uploadingPhoto}
                    style={{
                      border: isSelected ? '2px solid #31543D' : '1.5px solid #D8D4CC',
                      borderRadius: '50%',
                      padding: 1,
                      background: '#FFFFFF',
                      cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 0 0 3px rgba(49, 84, 61, 0.15)' : 'none',
                    }}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mini Sidebar Details */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 18,
              borderTop: '1px solid #EFECE6',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              textAlign: 'left',
              fontSize: 12.5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#556059' }}>
              <Shield size={14} color="#31543D" />
              <span>
                Role: <strong style={{ color: '#1A1D20' }}>{user?.role || 'Field Assistant'}</strong>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#556059' }}>
              <Mail size={14} color="#31543D" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email || 'user@archrecords.com'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#556059' }}>
              <Building size={14} color="#31543D" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {formData.institution || 'ASI New Delhi'}
              </span>
            </div>
            {user?.createdAt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#556059' }}>
                <Calendar size={14} color="#31543D" />
                <span>Member since {new Date(user.createdAt).getFullYear()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Form depending on activeTab */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E8E5DF',
            borderRadius: 10,
            padding: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          {/* ════════════════════════════════════════════════════════════
              TAB 1: PERSONAL INFO
             ════════════════════════════════════════════════════════════ */}
          {activeTab === 'Personal Info' && (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EFECE6', paddingBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D20', margin: 0 }}>
                  Personal Information
                </h3>
                <span style={{ fontSize: 12, color: '#8A948E' }}>
                  Basic identity &amp; biography
                </span>
              </div>

              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A524D', marginBottom: 6 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Sharma"
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Date of Birth */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A524D', marginBottom: 6 }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A524D', marginBottom: 6 }}>
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A524D', marginBottom: 6 }}>
                  Biography / Summary
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Write a brief professional summary about your archaeological career and research focus..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {/* Save Button */}
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                <SaveButton loading={savingProfile} />
              </div>
            </form>
          )}

          {/* ════════════════════════════════════════════════════════════
              TAB 2: CONTACT INFO
             ════════════════════════════════════════════════════════════ */}
          {activeTab === 'Contact Info' && (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EFECE6', paddingBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D20', margin: 0 }}>
                  Contact Information
                </h3>
                <span style={{ fontSize: 12, color: '#8A948E' }}>
                  Field station &amp; communication channels
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Phone */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A524D', marginBottom: 6 }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91-98765-43210"
                    style={inputStyle}
                  />
                </div>

                {/* Emergency Contact */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A524D', marginBottom: 6 }}>
                    Emergency Contact Number
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="+91-11-2301-8888"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A524D', marginBottom: 6 }}>
                  Office / Field Station Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. ASI Head Office, Janpath Road"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {/* City */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A524D', marginBottom: 6 }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="New Delhi"
                    style={inputStyle}
                  />
                </div>

                {/* State */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A524D', marginBottom: 6 }}>
                    State / Region
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Delhi"
                    style={inputStyle}
                  />
                </div>

                {/* Country */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A524D', marginBottom: 6 }}>
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="India"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Save Button */}
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                <SaveButton loading={savingProfile} />
              </div>
            </form>
          )}

          {/* ════════════════════════════════════════════════════════════
              TAB 3: ACCOUNT & SECURITY
             ════════════════════════════════════════════════════════════ */}
          {activeTab === 'Account' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {/* Account Overview Card */}
              <div>
                <div style={{ borderBottom: '1px solid #EFECE6', paddingBottom: 14, marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D20', margin: 0 }}>
                    Account Details
                  </h3>
                  <span style={{ fontSize: 12, color: '#8A948E' }}>
                    System authentication and permission credentials
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 16,
                    padding: 16,
                    background: '#F9F8F5',
                    borderRadius: 8,
                    border: '1px solid #E8E5DF',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#7E8883', marginBottom: 4 }}>
                      Registered Email
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1D20' }}>
                      {user?.email}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#7E8883', marginBottom: 4 }}>
                      System Access Role
                    </div>
                    <div>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '3px 10px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                          background: user?.role === 'Admin' ? '#F3E8FF' : '#ECFDF5',
                          color: user?.role === 'Admin' ? '#7E22CE' : '#047857',
                        }}
                      >
                        <Shield size={12} /> {user?.role || 'Field Assistant'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#7E8883', marginBottom: 4 }}>
                      Status
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#047857', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                      Active &amp; Authorized
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Change Form */}
              <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ borderBottom: '1px solid #EFECE6', paddingBottom: 14 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D20', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <KeyRound size={17} color="#31543D" /> Change Password
                  </h3>
                  <span style={{ fontSize: 12, color: '#8A948E' }}>
                    Ensure your account is using a long, random password to stay secure
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A524D', marginBottom: 6 }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A524D', marginBottom: 6 }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Minimum 6 characters"
                      required
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A524D', marginBottom: 6 }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Repeat new password"
                      required
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 6, display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={updatingPassword}
                    style={{
                      padding: '10px 22px',
                      background: '#31543D',
                      color: '#FFFFFF',
                      fontSize: 14,
                      fontWeight: 600,
                      border: 'none',
                      borderRadius: 6,
                      cursor: updatingPassword ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {updatingPassword ? (
                      <>
                        <Loader2 size={15} className="spin-animation" /> Updating Password...
                      </>
                    ) : (
                      <>
                        <Lock size={15} /> Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              TAB 4: EDUCATION
             ════════════════════════════════════════════════════════════ */}
          {activeTab === 'Education' && (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EFECE6', paddingBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D20', margin: 0 }}>
                  Academic &amp; Educational Background
                </h3>
                <span style={{ fontSize: 12, color: '#8A948E' }}>
                  Degrees, university, and academic milestones
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Highest Degree */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A524D', marginBottom: 6 }}>
                    Highest Degree Obtained
                  </label>
                  <input
                    type="text"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    placeholder="e.g. Ph.D. in Ancient Indian History"
                    style={inputStyle}
                  />
                </div>

                {/* University / Institute */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A524D', marginBottom: 6 }}>
                    University / Institution
                  </label>
                  <input
                    type="text"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    placeholder="e.g. Deccan College Postgraduate &amp; Research Institute"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                {/* Field of Study */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A524D', marginBottom: 6 }}>
                    Field of Study / Thesis Topic
                  </label>
                  <input
                    type="text"
                    value={formData.fieldOfStudy}
                    onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                    placeholder="e.g. Proto-Historic Urban Systems &amp; Ceramic Typology"
                    style={inputStyle}
                  />
                </div>

                {/* Graduation Year */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A524D', marginBottom: 6 }}>
                    Graduation Year
                  </label>
                  <input
                    type="text"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                    placeholder="e.g. 2012"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Save Button */}
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                <SaveButton loading={savingProfile} />
              </div>
            </form>
          )}

          {/* ════════════════════════════════════════════════════════════
              TAB 5: PROFESSIONAL
             ════════════════════════════════════════════════════════════ */}
          {activeTab === 'Professional' && (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EFECE6', paddingBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D20', margin: 0 }}>
                  Professional &amp; Fieldwork Specializations
                </h3>
                <span style={{ fontSize: 12, color: '#8A948E' }}>
                  Institutional affiliation, license ID, and archaeological expertise
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Occupation / Title */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A524D', marginBottom: 6 }}>
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    placeholder="e.g. Director General of Excavations"
                    style={inputStyle}
                  />
                </div>

                {/* Institution */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A524D', marginBottom: 6 }}>
                    Affiliated Institution
                  </label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="e.g. Archaeological Survey of India (ASI)"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Specialization */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A524D', marginBottom: 6 }}>
                    Primary Specialization
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="e.g. Harappan Stratigraphy &amp; Urbanism"
                    style={inputStyle}
                  />
                </div>

                {/* Years of Experience */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A524D', marginBottom: 6 }}>
                    Years of Field Experience
                  </label>
                  <input
                    type="text"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                    placeholder="e.g. 15+ years"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Research ID */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A524D', marginBottom: 6 }}>
                  Archaeological Council / Researcher ID
                </label>
                <input
                  type="text"
                  value={formData.researchId}
                  onChange={(e) => setFormData({ ...formData, researchId: e.target.value })}
                  placeholder="e.g. ASI-EXC-2024-098"
                  style={inputStyle}
                />
              </div>

              {/* Expertise Tags */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A524D', marginBottom: 6 }}>
                  Key Expertise Areas (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  placeholder="e.g. Indus Valley Civilization, Ceramic Typology, GIS Mapping, Archaeometallurgy"
                  style={inputStyle}
                />
                <span style={{ fontSize: 11.5, color: '#7E8883', marginTop: 4, display: 'block' }}>
                  Enter multiple areas separated by commas to feature on your excavation certificates.
                </span>
              </div>

              {/* Save Button */}
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                <SaveButton loading={savingProfile} />
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .avatar-hover-overlay:hover {
          opacity: 1 !important;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @media (max-width: 860px) {
          .profile-layout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// Common styles & components
const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #D8D4CC',
  borderRadius: 6,
  fontSize: 13.5,
  color: '#1A1D20',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#FFFFFF',
  fontFamily: 'inherit',
};

function SaveButton({ loading }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        padding: '10px 24px',
        background: '#31543D',
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 600,
        border: 'none',
        borderRadius: 6,
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        transition: 'background-color 0.15s ease',
      }}
      onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#24432E')}
      onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#31543D')}
    >
      {loading ? (
        <>
          <Loader2 size={15} className="spin-animation" /> Saving Changes...
        </>
      ) : (
        <>
          <Check size={15} /> Save Changes
        </>
      )}
    </button>
  );
}
