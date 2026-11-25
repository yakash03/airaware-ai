'use client';

import React, { useState } from 'react';
import { FamilyProfile, ProfileCategory, Language } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { DEFAULT_FAMILY_PROFILES } from '@/lib/constants/defaultProfiles';
import { useLocalStorageState } from '@/lib/hooks/useLocalStorageState';
import { UserIcon, PlusIcon, EditIcon, TrashIcon, CheckIcon } from '../ui/Icons';
import { ModalShell } from '../ui/ModalShell';

interface ProfileManagerProps {
  language: Language;
  activeProfileId: string;
  onSelectProfile: (profile: FamilyProfile) => void;
}

const VALID_CATEGORIES = new Set<ProfileCategory>(['CHILD', 'TEEN', 'ADULT', 'SENIOR']);

export function validateStoredProfiles(parsed: unknown): FamilyProfile[] | null {
  if (!Array.isArray(parsed) || parsed.length === 0) return null;
  const cleaned: FamilyProfile[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== 'object') continue;
    const p = item as Partial<FamilyProfile>;
    if (
      typeof p.id === 'string' &&
      typeof p.name === 'string' &&
      p.name.trim().length > 0 &&
      typeof p.category === 'string' &&
      VALID_CATEGORIES.has(p.category as ProfileCategory)
    ) {
      cleaned.push({
        id: p.id,
        name: p.name.slice(0, 60),
        category: p.category as ProfileCategory,
        ageRange: typeof p.ageRange === 'string' ? p.ageRange : '',
        avatarColor: typeof p.avatarColor === 'string' ? p.avatarColor : '#047857',
        accessibility: p.accessibility,
        createdAt: typeof p.createdAt === 'string' ? p.createdAt : '2026-11-19T00:00:00.000Z',
      });
    }
  }
  return cleaned.length > 0 ? cleaned : null;
}

let profileCounter = 0;
function nextProfileId(): string {
  profileCounter += 1;
  return `prof-${Date.now()}-${profileCounter}`;
}

export function ProfileManager({
  language,
  activeProfileId,
  onSelectProfile,
}: ProfileManagerProps) {
  const t = TRANSLATIONS[language];
  const [profiles, setProfiles] = useLocalStorageState<FamilyProfile[]>(
    'airaware_family_profiles',
    DEFAULT_FAMILY_PROFILES,
    validateStoredProfiles
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<FamilyProfile | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProfileCategory>('ADULT');
  const [formError, setFormError] = useState<string | null>(null);
  const [listNotice, setListNotice] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingProfile(null);
    setFormName('');
    setFormCategory('ADULT');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: FamilyProfile) => {
    setEditingProfile(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) {
      setListNotice('You must keep at least one family profile.');
      return;
    }
    setListNotice(null);
    const updated = profiles.filter((p) => p.id !== id);
    setProfiles(updated);
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
      CHILD: '#047857',
      TEEN: '#0369a1',
      ADULT: '#4338ca',
      SENIOR: '#b45309',
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
      setProfiles(updated);
      const modified = updated.find((p) => p.id === editingProfile.id);
      if (modified && activeProfileId === modified.id) {
        onSelectProfile(modified);
      }
    } else {
      const newProf: FamilyProfile = {
        id: nextProfileId(),
        name: cleanName,
        category: formCategory,
        ageRange: ageMap[formCategory],
        avatarColor: colorMap[formCategory],
        createdAt: new Date().toISOString(),
      };
      const updated = [...profiles, newProf];
      setProfiles(updated);
      onSelectProfile(newProf);
    }

    setListNotice(null);
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
    <section
      aria-label={t.profilesTitle}
      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs mb-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
            <UserIcon size={18} className="text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
            <span>{t.profilesTitle}</span>
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">{t.profilesSubtitle}</p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <PlusIcon size={14} aria-hidden="true" />
          <span>{t.addMemberBtn}</span>
        </button>
      </div>

      {listNotice && (
        <p role="alert" className="mb-3 text-xs font-medium text-rose-700 dark:text-rose-300">
          {listNotice}
        </p>
      )}

      {/* Profiles grid (non-nested interactive controls for strict WCAG 4.1.2 compliance) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {profiles.map((p) => {
          const isSelected = p.id === activeProfileId;
          return (
            <article
              key={p.id}
              className={`p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-600/20 shadow-xs'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-800/30'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectProfile(p)}
                aria-pressed={isSelected}
                aria-label={`Select profile ${p.name} (${getCategoryLabel(p.category)})`}
                className="flex items-start justify-between text-left w-full cursor-pointer"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 shadow-xs"
                    style={{ backgroundColor: p.avatarColor || '#047857' }}
                    aria-hidden="true"
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {p.name}
                    </p>
                    <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                      {getCategoryLabel(p.category)}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <span
                    className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0"
                    aria-hidden="true"
                  >
                    <CheckIcon size={12} />
                  </span>
                )}
              </button>

              <div className="mt-3 pt-2 border-t border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-between text-[11px]">
                <span className="text-zinc-600 dark:text-zinc-400 font-mono text-[10px]">
                  {p.ageRange}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(p)}
                    className="p-1 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-md cursor-pointer"
                    title={t.editProfile}
                    aria-label={`${t.editProfile}: ${p.name}`}
                  >
                    <EditIcon size={12} aria-hidden="true" />
                  </button>
                  {profiles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteProfile(p.id)}
                      className="p-1 text-zinc-600 hover:text-rose-700 dark:text-zinc-400 dark:hover:text-rose-400 rounded-md cursor-pointer"
                      title={t.deleteProfile}
                      aria-label={`${t.deleteProfile}: ${p.name}`}
                    >
                      <TrashIcon size={12} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] text-zinc-600 dark:text-zinc-400 text-center sm:text-left">
        {t.localStorageNotice}
      </p>

      {/* Accessible Add / Edit Profile Modal */}
      <ModalShell
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        titleId="profile-modal-title"
        title={editingProfile ? t.editProfile : t.addMemberBtn}
        maxWidthClassName="max-w-md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div>
            <label
              htmlFor="profile-name-input"
              className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
            >
              {t.nameLabel}
            </label>
            <input
              id="profile-name-input"
              type="text"
              required
              maxLength={60}
              placeholder="e.g. Arjun, Grandfather, Me"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
            />
          </div>

          <fieldset>
            <legend className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              {t.ageCategoryLabel}
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {(['CHILD', 'TEEN', 'ADULT', 'SENIOR'] as ProfileCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={formCategory === cat}
                  onClick={() => setFormCategory(cat)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    formCategory === cat
                      ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <p className="text-xs">{getCategoryLabel(cat)}</p>
                  <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-normal">
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
          </fieldset>

          {formError && (
            <p role="alert" className="text-xs text-rose-700 dark:text-rose-300">
              {formError}
            </p>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs cursor-pointer"
            >
              {t.saveProfile}
            </button>
          </div>
        </form>
      </ModalShell>
    </section>
  );
}
