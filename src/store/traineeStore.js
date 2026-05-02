import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useTraineeStore = create(
  persist(
    (set) => ({
      cvFile: null,
      hasCvUploaded: false,
      extractedSkills: [],
      savedSkills: [],
      isExtracting: false,
      extractionError: null,
      profileData: {
        name: "",
        email: "",
        phone: "",
        university: "",
        gender: "",
        city: "",
        major: "",
        graduation_year: "",
      },
      setCvFile: (file) =>
        set({
          cvFile: file,
          hasCvUploaded: Boolean(file),
          extractionError: null,
        }),
      setHasCvUploaded: (hasCvUploaded) =>
        set({ hasCvUploaded: Boolean(hasCvUploaded) }),
      startExtraction: () => set({ isExtracting: true, extractionError: null }),
      finishExtraction: () => set({ isExtracting: false }),
      setExtractedSkills: (skills) =>
        set({
          extractedSkills: skills,
          isExtracting: false,
          extractionError: null,
        }),
      setExtractionError: (error) =>
        set({ extractionError: error, isExtracting: false }),
      removeSkill: (skill) =>
        set((state) => ({
          extractedSkills: state.extractedSkills.filter(
            (entry) => entry !== skill,
          ),
        })),
      addSkill: (skill) =>
        set((state) => ({
          extractedSkills: state.extractedSkills.includes(skill)
            ? state.extractedSkills
            : [...state.extractedSkills, skill],
        })),
      setSavedSkills: (skills) =>
        set({ savedSkills: Array.isArray(skills) ? skills : [] }),
      updateProfileData: (data) =>
        set((state) => ({
          profileData: {
            ...state.profileData,
            ...data,
          },
        })),
      setProfileData: (profileData) =>
        set({
          profileData: {
            name: profileData?.name || "",
            email: profileData?.email || "",
            phone: profileData?.phone || "",
            university: profileData?.university || "",
            gender: profileData?.gender || "",
            city: profileData?.city || "",
            major: profileData?.major || "",
            graduation_year: profileData?.graduation_year || "",
          },
        }),
    }),
    {
      name: "ims-trainee",
      version: 5,
      migrate: (persistedState) => ({
        hasCvUploaded: Boolean(persistedState?.hasCvUploaded),
        extractedSkills: [],
        savedSkills: [],
        profileData: persistedState?.profileData || {
          name: "",
          email: "",
          phone: "",
          university: "",
          gender: "",
          city: "",
          major: "",
          graduation_year: "",
        },
      }),
      partialize: (state) => ({
        hasCvUploaded: state.hasCvUploaded,
        extractedSkills: state.extractedSkills,
        savedSkills: state.savedSkills,
        profileData: state.profileData,
      }),
    },
  ),
);
