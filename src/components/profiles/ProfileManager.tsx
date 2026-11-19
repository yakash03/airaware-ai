'use client';

import React, { useState, useEffect } from 'react';
import { FamilyProfile, ProfileCategory, Language } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { UserIcon, PlusIcon, EditIcon, TrashIcon, CheckIcon } from '../ui/Icons';

interface ProfileManagerProps {
  language: Language;
  activeProfileId: string;
  onSelectProfile: (profile: FamilyProfile) => void;
  onProfilesChange?: (profiles: FamilyProfile[]) => void;
}

const DEFAULT_PROFILES: FamilyProfile[] = [
  {
    id: 'prof-child-1',
    name: 'Aarav',
    category: 'CHILD',
    ageRange: '< 12 yrs',
    avatarColor: '#10b981', // emerald
    createdAt: '2026-11-19T00:00:00.000Z',
  },
  {
    id: 'prof-teen-1',
    name: 'Priya',
    category: 'TEEN',
    ageRange: '13–17 yrs',
    avatarColor: '#0ea5e9', // sky
    createdAt: '2026-11-19T00:01:00.000Z',
  },
  {
    id: 'prof-adult-1',
    name: 'Rajesh',
    category: 'ADULT',
    ageRange: '18–59 yrs',
    avatarColor: '#6366f1', // indigo
    createdAt: '2026-11-19T00:02:00.000Z',
  },
  {
    id: 'prof-senior-1',
    name: 'Grandma Lakshmi',
    category: 'SENIOR',
    ageRange: '60+ yrs',
    avatarColor: '#f59e0b', // amber
    accessibility: { highContrast: true, fontSize: 'large' },
    createdAt: '2026-11-19T00:03:00.000Z',
  },
];

export function ProfileManager({
  language,
  activeProfileId,
  onSelectProfile,
  onProfilesChange,
}: ProfileManagerProps) {
  const t = TRANSLATIONS[language];
  const [profiles, setProfiles] = useState<FamilyProfile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<FamilyProfile | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProfileCategory>('ADULT');
  const [formError, setFormError] = useState<string | null>(null);

  // Load profiles from localStorage or initialize defaults
  useEffect(() => {
    try {
      const stored = localStorage.getItem('airaware_family_profiles');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProfiles(parsed);
          if (onProfilesChange) onProfilesChange(parsed);
          return;
        }
      }
    } catch {
      // LocalStorage access issue
    }

    // Set defaults
    setProfiles(DEFAULT_PROFILES);
    if (onProfilesChange) onProfilesChange(DEFAULT_PROFILES);
    try {
      localStorage.setItem('airaware_family_profiles', JSON.stringify(DEFAULT_PROFILES));
    } catch {}
  }, [onProfilesChange]);

  const saveProfilesToStorage = (updated: FamilyProfile[]) => {
    setProfiles(updated);
    if (onProfilesChange) onProfilesChange(updated);
    try {
      localStorage.setItem('airaware_family_profiles', JSON.stringify(updated));
    } catch {}
  };

  const openAddModal = () => {
    setEditingProfile(null);
    setFormName('');
    setFormCategory('ADULT');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: FamilyProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProfile(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (profiles.length <= 1) {
      alert('You must have at least one family profile.');
      return;
    }
    const updated = profiles.filter((p) => p.id !== id);
    saveProfilesToStorage(updated);
    if (activeProfileId === id && updated[0]) {
      onSelectProfile(updated[0]);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formName.trim();
    if (!cleanName || cleanName.length < 2) {
      setFormError('Please enter a name with at least 2 characters.');
      return;
    }

    const ageMap: Record<ProfileCategory, string> = {
      CHILD: '< 12 yrs',
      TEEN: '13–17 yrs',
      ADULT: '18–59 yrs',
      SENIOR: '60+ yrs',
    };

    const colorMap: Record<ProfileCategory, string> = {
      CHILD: '#10b981',
      TEEN: '#0ea5e9',
      ADULT: '#6366f1',
      SENIOR: '#f59e0b',
    };

    if (editingProfile) {
      const updated = profiles.map((p) =>
        p.id === editingProfile.id
          ? {
              ...p,
              name: cleanName,
              category: formCategory,
              ageRange: ageMap[formCategory],
              avatarColor: colorMap[formCategory],
            }
          : p
      );
      saveProfilesToStorage(updated);
      const modified = updated.find((p) => p.id === editingProfile.id);
      if (modified && activeProfileId === modified.id) {
        onSelectProfile(modified);
      }
    } else {
      const newProf: FamilyProfile = {
        id: `prof-${Date.now()}`,
        name: cleanName,
        category: formCategory,
        ageRange: ageMap[formCategory],
        avatarColor: colorMap[formCategory],
        createdAt: new Date().toISOString(),
      };
      const updated = [...profiles, newProf];
      saveProfilesToStorage(updated);
      onSelectProfile(newProf);
    }

    setIsModalOpen(false);
  };

  const getCategoryLabel = (cat: ProfileCategory) => {
    switch (cat) {
      case 'CHILD':
        return t.childCat;
      case 'TEEN':
        return t.teenCat;
      case 'ADULT':
        return t.adultCat;
      case 'SENIOR':
        return t.seniorCat;
    }
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
            <UserIcon size={18} className="text-emerald-600" />
            <span>{t.profilesTitle}</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t.profilesSubtitle}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs shrink-0 self-start sm:self-auto"
        >
          <PlusIcon size={14} />
          <span>{t.addMemberBtn}</span>
        </button>
      </div>

      {/* Profiles horizontal list */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {profiles.map((p) => {
          const isSelected = p.id === activeProfileId;
          return (
            <div
              key={p.id}
              onClick={() => onSelectProfile(p)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-800/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 shadow-xs"
                    style={{ backgroundColor: p.avatarColor || '#10b981' }}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {p.name}
                    </p>
                    <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                      {getCategoryLabel(p.category)}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckIcon size={12} />
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-between text-[11px]">
                <span className="text-zinc-400 font-mono text-[10px]">{p.ageRange}</span>
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => openEditModal(p, e)}
                    className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md"
                    title={t.editProfile}
                  >
                    <EditIcon size={12} />
                  </button>
                  {profiles.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteProfile(p.id, e)}
                      className="p-1 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md"
                      title={t.deleteProfile}
                    >
                      <TrashIcon size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-[11px] text-zinc-400 text-center sm:text-left">
        🔒 {t.localStorageNotice}
      </div>

      {/* Add / Edit Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {editingProfile ? t.editProfile : t.addMemberBtn}
            </h4>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arjun, Grandfather, Me"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t.ageCategoryLabel}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['CHILD', 'TEEN', 'ADULT', 'SENIOR'] as ProfileCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormCategory(cat)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        formCategory === cat
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50'
                      }`}
                    >
                      <p className="text-xs">{getCategoryLabel(cat)}</p>
                      <p className="text-[10px] text-zinc-400 font-normal">
                        {cat === 'CHILD'
                          ? t.childAge
                          : cat === 'TEEN'
                          ? t.teenAge
                          : cat === 'ADULT'
                          ? t.adultAge
                          : t.seniorAge}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {formError && <p className="text-xs text-rose-600">{formError}</p>}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                >
                  {t.saveProfile}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
