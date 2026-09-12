import { create } from 'zustand';
import { API } from '@/services/apiClient';
import { 
  DisciplineRating,
  FullProfileResponse,
  ProfileUpdateInput,
} from '@/types';
import { AuthErrorCatch } from '@/services/errorHandler';
import { globalCache, createSecureCacheKey } from '@/utils/cacheManager';
import { useAuthStore } from '@/store/useAuthStore';

interface ProfileStatistics {
  rate: number;
  label: string;
  totalDays: number;
  onTimeDays: number;
  lateDays: number;
  absentDays: number;
}

interface FlattenedEmployeeProfile {
  managerName?: string;
  managerEmail: string;
  managerPhone?: string;
  departmentName: string;
  shiftName: string;
  isWorking: boolean;
  salary?: string;
}

interface DisciplineEmployee{
  rate: number;
  label: string;
  periodCountDiscipline: string;
  includeSum?: {
    totalDays: number;
    onTimeDays: number;
    lateDays: number;
    absentDays: number;
  };
  summary?: any;
}

interface DisciplineAdmin{
  organizationRate?: number;
  organizationLabel?: string;
  periodCountDiscipline?: string;
   employeeRates: {
        employeeId: string;
        name: string;
        rate: number;
        label: DisciplineRating;
    }[];
}

interface FlattenedAdminProfile {
  department: {
    length: number;
    names: string[];
  };
  shift: {
    length: number;
    names: string[];
  };
  subordinates: {
    length: number;
    list: { id:string; fullName: string; email: string; phone: string }[];
  };
}

interface ProfileState {
  imageProfile?: string;
  fullName: string;
  jobTitle?: string;
  email: string;
  role: string;
  phone: string;
  createdAt?: string;
  dsicipline:{admin?:DisciplineAdmin , employee?:DisciplineEmployee} | null;
  message?: string | null;
  profile?: { admin?: FlattenedAdminProfile; employee?: FlattenedEmployeeProfile } | null;

  isLoading: boolean;
  isUpdating: boolean;
  isUploadingAvatar: boolean;
  updateSuccessMessage: string | null;
  error: string;

  fetchProfile: (forceFresh?: boolean) => Promise<void>;
  updateProfile: (data: ProfileUpdateInput) => Promise<boolean>;
  uploadProfileImage: (file: File) => Promise<boolean>;
  updateAvatarUrl: (imageUrl: string) => Promise<boolean>;
  clearMessages: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  imageProfile: '',
  fullName: '',
  jobTitle: '',
  email: '',
  role: '',
  phone: '',
  createdAt: '',
  dsicipline:null,
  message: '',
  profile: null,
  statis: null,
  isLoading: false,
  isUpdating: false,
  isUploadingAvatar: false,
  updateSuccessMessage: null,
  error: '',

  clearMessages: () => {
    set({ error: '', updateSuccessMessage: null, message: null });
  },

  fetchProfile: async (forceFresh = false) => {
    const cacheKey = createSecureCacheKey('user_profile', {});
    
    if (!forceFresh) {
      const cached = globalCache.get<any>(cacheKey);
      if (cached) {
        set({ ...cached, isLoading: false });
        return;
      }
    }

    set({ isLoading: true, error: '' });
    try {
      const res = await API.users.getProfile();
      const { user, mate, messageSuccessd } = res.data as any;

      if (!user || !res.data) {
        set({ message: 'لم يتم العثور على بيانات المستخدم', isLoading: false });
        return;
      }

      const rawProfile = user.role === 'EMPLOYEE' ? user.employeeProfile : user.adminProfile;
      const isEmployee = user.role === 'EMPLOYEE';

      const statePayload: Partial<ProfileState> = {
        message: messageSuccessd,
        imageProfile: user.imageProfile,
        fullName: user.fullName,
        jobTitle: user.jobTitle,
        email: user.email,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt,
        // profile
        ...(isEmployee
          ? {
              profile: {
                employee: {
                  managerName: rawProfile?.manager?.user?.fullName || 'غير محدد',
                  managerEmail: rawProfile?.manager?.user?.email || 'غير محدد',
                  managerPhone: rawProfile?.manager?.user?.phone || 'غير محدد',
                  departmentName: rawProfile?.department?.name || 'غير محدد',
                  shiftName: rawProfile?.shift?.name || 'غير محدد',
                  isWorking: rawProfile?.isWorking || false,
                  salary: rawProfile?.salary != null ? String(rawProfile.salary) : 'غير محدد',
                },
              },
            }
          : {
              profile: {
                admin: {
                  department: {
                    length: rawProfile?.managedDepartments?.length || 0,
                    names: rawProfile?.managedDepartments?.map((item: any) => item.name) || [],
                  },
                  shift: {
                    length: rawProfile?.managedDepartments?.flatMap((item: any) => item.shift || []).length || 0,
                    names: Array.from(
                      new Set(
                        rawProfile?.managedDepartments?.flatMap((item: any) => item.shift || []).map((s: any) => s.name)
                      )
                    ) || [],
                  },
                  subordinates: {
                    length: rawProfile?.subordinates?.length || 0,
                    list:
                      rawProfile?.subordinates?.map((sub: any) => ({
                        id: sub.user?.id || 'غير محدد',
                        fullName: sub.user?.fullName || 'غير محدد',
                        email: sub.user?.email || 'غير محدد',
                        phone: sub.user?.phone || 'غير محدد',
                      })) || [],
                  },
                },
              }}),
            
            // dicipline 
         ...(isEmployee
          ? {
              dsicipline: {
                employee: {
                  rate: mate.rate,
                  label: mate.label,
                  periodCountDiscipline: mate.periodCountDiscipline,
                  includeSum: mate.includeSum && { 
                  totalDays: mate.includeSum.totalDays,
                  onTimeDays: mate.includeSum.onTimeDays,
                  lateDays: mate.includeSum.lateDays,
                  absentDays: mate.includeSum.absentDays,
                  } 
                },
              },
            }
          : {
              dsicipline: {
                admin: {
              organizationLabel:mate.organizationLabel,
              organizationRate:mate.organizationRate,
              periodCountDiscipline:mate.periodCountDiscipline,
              employeeRates:mate.employeeRates
                },
              },
            }),
        isLoading: false,
          }

      globalCache.set(cacheKey, statePayload, 'profile', 5);
      set(statePayload as any);
    } catch (err: unknown) {
      const formattedError = AuthErrorCatch.profile(err);
      const stale = globalCache.getStale<any>(cacheKey);
      set({
        ...(stale || {}),
        error: formattedError.userFriendlyMessage,
        isLoading: false,
      });
    }
  },

  /**
   * تحديث البيانات النصية للملف الشخصي (الاسم، البريد، الجوال، المسمى الوظيفي)
   * وتحديث الكاش تلقائياً عند النجاح
   */
  updateProfile: async (data: ProfileUpdateInput): Promise<boolean> => {
    set({ isUpdating: true, error: '', updateSuccessMessage: null });
    const cacheKey = createSecureCacheKey('user_profile', {});

    try {
      const res = await API.users.updateMyProfile(data);
      const { user, messageSuccessd } = res.data as any;

      if (!user || !res.data) {
        set({ error: 'لم يتم استلام بيانات المستخدم المحدثة', isUpdating: false });
        return false;
      }

      const { profile, dsicipline, role } = get();

      const statePayload: Partial<ProfileState> = {
        fullName: user.fullName ?? get().fullName,
        jobTitle: user.jobTitle ?? get().jobTitle,
        email: user.email ?? get().email,
        phone: user.phone ?? get().phone,
        imageProfile: user.imageProfile ?? get().imageProfile,
        role: user.role ?? role,
        profile,
        dsicipline,
        updateSuccessMessage: messageSuccessd || `تم تحديث بيانات المستخدم "${user.fullName}" بنجاح`,
        isUpdating: false,
        error: '',
      };

      // ✅ إبطال وتحديث الكاش فوراً بالبيانات الجديدة
      globalCache.invalidateTag('profile');
      globalCache.set(cacheKey, statePayload, 'profile', 5);
      set(statePayload as any);

      // ✅ مزامنة التوب بار والجلسة الحالية
      const currentAuthUser = useAuthStore.getState().user;
      if (currentAuthUser) {
        const updatedAuthUser = {
          ...currentAuthUser,
          name: user.fullName || currentAuthUser.name,
          avatar: user.imageProfile || currentAuthUser.avatar,
        };
        useAuthStore.setState({ user: updatedAuthUser });
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(updatedAuthUser));
        }
      }

      return true;
    } catch (err: unknown) {
      const formattedError = AuthErrorCatch.profile(err);
      set({
        error: formattedError.userFriendlyMessage,
        isUpdating: false,
      });
      return false;
    }
  },

  /**
   * رفع الصورة الشخصية (Upload Avatar) عبر multipart/form-data
   * وتحديث الكاش والصورة فوراً
   */
  uploadProfileImage: async (file: File): Promise<boolean> => {
    set({ isUploadingAvatar: true, error: '', updateSuccessMessage: null });
    const cacheKey = createSecureCacheKey('user_profile', {});

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await API.users.uploadAvatar(formData);
      const resData = res.data?.data || (res.data as any);
      const newImagePath = resData?.imageProfile || resData?.user?.imageProfile;
      const successMsg = res.data?.message || 'تم رفع وتحديث الصورة الشخصية بنجاح';

      if (!newImagePath) {
        set({ error: 'تعذر الحصول على رابط الصورة الشخصية الجديد', isUploadingAvatar: false });
        return false;
      }

      const updatedState: Partial<ProfileState> = {
        imageProfile: newImagePath,
        updateSuccessMessage: successMsg,
        isUploadingAvatar: false,
        error: '',
      };

      // ✅ إبطال وتحديث الكاش بالصورة الجديدة
      globalCache.invalidateTag('profile');
      const currentCached = globalCache.get<any>(cacheKey) || {};
      globalCache.set(cacheKey, { ...currentCached, imageProfile: newImagePath }, 'profile', 5);

      set(updatedState as any);

      // ✅ مزامنة التوب بار والجلسة الحالية
      const currentAuthUser = useAuthStore.getState().user;
      if (currentAuthUser) {
        const updatedAuthUser = {
          ...currentAuthUser,
          avatar: newImagePath,
        };
        useAuthStore.setState({ user: updatedAuthUser });
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(updatedAuthUser));
        }
      }

      return true;
    } catch (err: unknown) {
      const formattedError = AuthErrorCatch.profile(err);
      set({
        error: formattedError.userFriendlyMessage,
        isUploadingAvatar: false,
      });
      return false;
    }
  },

  /**
   * تحديث رابط الصورة الشخصية مباشرة (URL/Base64)
   */
  updateAvatarUrl: async (imageUrl: string): Promise<boolean> => {
    set({ isUploadingAvatar: true, error: '', updateSuccessMessage: null });
    const cacheKey = createSecureCacheKey('user_profile', {});

    try {
      const res = await API.users.updateAvatar(imageUrl);
      const resData = res.data?.data || (res.data as any);
      const newImagePath = resData?.imageProfile || imageUrl;
      const successMsg = res.data?.message || 'تم تحديث الصورة الشخصية بنجاح';

      const updatedState: Partial<ProfileState> = {
        imageProfile: newImagePath,
        updateSuccessMessage: successMsg,
        isUploadingAvatar: false,
        error: '',
      };

      // ✅ إبطال وتحديث الكاش
      globalCache.invalidateTag('profile');
      const currentCached = globalCache.get<any>(cacheKey) || {};
      globalCache.set(cacheKey, { ...currentCached, imageProfile: newImagePath }, 'profile', 5);

      set(updatedState as any);
      return true;
    } catch (err: unknown) {
      const formattedError = AuthErrorCatch.profile(err);
      set({
        error: formattedError.userFriendlyMessage,
        isUploadingAvatar: false,
      });
      return false;
    }
  },
}));
